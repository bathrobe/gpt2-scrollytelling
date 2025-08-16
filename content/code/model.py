from huggingface_hub import HfApi, create_repo, upload_file
from torch.distributed import init_process_group, destroy_process_group
from torch.nn.parallel import DistributedDataParallel as DDP
import time
import torch.distributed as dist
from datetime import timedelta
from dataclasses import dataclass
import inspect
import math
import torch
import torch.nn as nn
from torch.nn import functional as F
from torch.optim import optimizer
import os

from hellaswag import render_example, iterate_examples
import tiktoken
enc = tiktoken.get_encoding("gpt2")
# more forgiving timeouts
os.environ["NCCL_TIMEOUT"] = "7200"  # 2hr
os.environ["NCCL_ASYNC_ERROR_HANDLING"] = "0"  # disable async error checking
os.environ["NCCL_BLOCKING_WAIT"] = "1"  # more stable, slightly slower
os.environ["NCCL_DEBUG"] = "WARN"  # reduce debug spam
os.environ["NCCL_IB_DISABLE"] = "1"  # disable infiniband if causing issues
os.environ["NCCL_P2P_DISABLE"] = "1"  # disable p2p if causing issues
# TCP store timeout for distributed init
os.environ["TORCH_DISTRIBUTED_INIT_TIMEOUT"] = "1800"  # 30 minutes
os.environ["TORCH_NCCL_BLOCKING_WAIT"] = "1"
os.environ["TORCH_NCCL_ASYNC_ERROR_HANDLING"] = "0"

# ---------------------------------------------------------------
class CausalSelfAttention(nn.Module):

    def __init__(self, config):
        super().__init__()
        assert config.n_embd % config.n_head == 0
        # key, query, value projections for all heads, but in a batch
        self.c_attn = nn.Linear(config.n_embd, 3 * config.n_embd)
        # output projection
        self.c_proj = nn.Linear(config.n_embd, config.n_embd)
        self.c_proj.NANOGPT_SCALE_INIT = 1 # normalize residual stream
        # regularization
        self.n_head = config.n_head
        self.n_embd = config.n_embd
        # this is a mask, not a bias, but following openai naming conventions
        self.register_buffer("bias", torch.tril(torch.ones(config.block_size, config.block_size))
                                     .view(1, 1, config.block_size, config.block_size))

    def forward(self, x):
        B, T, C = x.size() # batch size, sequence length, embedding dimensionality (n_embd) - size returns tuple of shapes
        # calculate query, key, values for all heads in batch and move head forward to be the batch dim
        # nh is "number of heads", hs is "head size", and C (number of channels) = nh * hs
        # e.g. in GPT-2 (124M), n_head=12, hs=64, so nh*hs=C=768 channels in the Transformer
        qkv = self.c_attn(x)
        q, k, v = qkv.split(self.n_embd, dim=2)
        # these 3 view operations move the heads to the second dimension so they
        # are computed in parallel. this is the internal of pt: first 2 dimensions
        # are auto computed in parallel
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2) # (B, nh, T, hs)

        y = F.scaled_dot_product_attention(q, k, v, is_causal=True) # flash attention

        y = y.transpose(1, 2).contiguous().view(B, T, C) # re-assemble all head outputs side by side
        # output projection
        y = self.c_proj(y)
        return y



class MLP(nn.Module):

    def __init__(self,config):
        super().__init__()
        self.c_fc = nn.Linear(config.n_embd, 4 * config.n_embd)
        # gaussian error linear units
        # a slightly smoother relu
        # transformers seem to prefer smooth activations of sharper ones (like relu)
        self.gelu = nn.GELU(approximate='tanh') # historical quirk to use approximate tanh
        self.c_proj = nn.Linear(4 * config.n_embd, config.n_embd)
        self.c_proj.NANOGPT_SCALE_INIT = 1 # normalize residual stream


    def forward(self, x):
        x = self.c_fc(x)
        x = self.gelu(x)
        x = self.c_proj(x)
        return x

class Block(nn.Module):

    def __init__(self,config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config.n_embd)
        self.mlp = MLP(config)

    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x


@dataclass
class GPTConfig:
    block_size: int = 1024 # max sequence length
    vocab_size: int = 50257 # number of toks: 50k bpe merges, 256 bytes tokens, 1 <eos> token
    # 50257 is ugly. odd. we want powers of 2.
    # 50304 is divisible by 8, 16. better.
    n_layer: int = 12
    n_head: int = 12
    n_embd: int = 768
    bias: bool = True # True: bias in Linears and LayerNorms, like GPT-2. False: a bit better and faster

class GPT(nn.Module):
    def __init__(self,config):
        super().__init__()
        self.config = config

        self.transformer = nn.ModuleDict(dict(
            wte = nn.Embedding(config.vocab_size, config.n_embd),
            wpe = nn.Embedding(config.block_size, config.n_embd),
            h = nn.ModuleList([Block(config) for _ in range(config.n_layer)]), # h stands for hidden
            ln_f = nn.LayerNorm(config.n_embd), # final layer norm
        ))
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False) # final classifier

        # weight sharing
        self.transformer.wte.weight = self.lm_head.weight

        # init params
        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            std = 0.02
            if hasattr(module, 'NANOGPT_SCALE_INIT'):
                std *= (2 * self.config.n_layer) ** -0.5 # 1 over square root of num_layers,
               # keeps residual stream from ballooning
               # it's 2x bc attn and ffn both add to the residual pathway
            torch.nn.init.normal_(module.weight, mean=0.0, std=std)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    @classmethod
    def from_pretrained(cls, model_type, override_args=None):
        assert model_type in {'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl'}
        override_args = override_args or {} # default to empty dict
        # only dropout can be overridden see more notes below
        assert all(k == 'dropout' for k in override_args)
        from transformers import GPT2LMHeadModel
        print("loading weights from pretrained gpt: %s" % model_type)

        # n_layer, n_head and n_embd are determined from model_type
        config_args = {
            'gpt2':         dict(n_layer=12, n_head=12, n_embd=768),  # 124M params
            'gpt2-medium':  dict(n_layer=24, n_head=16, n_embd=1024), # 350M params
            'gpt2-large':   dict(n_layer=36, n_head=20, n_embd=1280), # 774M params
            'gpt2-xl':      dict(n_layer=48, n_head=25, n_embd=1600), # 1558M params
        }[model_type]
        print("forcing vocab_size=50257, block_size=1024, bias=True")
        config_args['vocab_size'] = 50257 # always 50257 for GPT model checkpoints
        config_args['block_size'] = 1024 # always 1024 for GPT model checkpoints
        config_args['bias'] = True # always True for GPT model checkpoints
        # we can override the dropout rate, if desired
        if 'dropout' in override_args:
            print(f"overriding dropout rate to {override_args['dropout']}")
            config_args['dropout'] = override_args['dropout']
        # create a from-scratch initialized minGPT model
        config = GPTConfig(**config_args)
        model = GPT(config)
        sd = model.state_dict()
        sd_keys = sd.keys()
        sd_keys = [k for k in sd_keys if not k.endswith('.attn.bias')] # discard this mask / buffer, not a param

        # init a huggingface/transformers model
        model_hf = GPT2LMHeadModel.from_pretrained(model_type)
        sd_hf = model_hf.state_dict()

        # copy while ensuring all of the parameters are aligned and match in names and shapes
        sd_keys_hf = sd_hf.keys()
        sd_keys_hf = [k for k in sd_keys_hf if not k.endswith('.attn.masked_bias')] # ignore these, just a buffer
        sd_keys_hf = [k for k in sd_keys_hf if not k.endswith('.attn.bias')] # same, just the mask (buffer)
        transposed = ['attn.c_attn.weight', 'attn.c_proj.weight', 'mlp.c_fc.weight', 'mlp.c_proj.weight']
        # basically the openai checkpoints use a "Conv1D" module, but we only want to use a vanilla Linear
        # this means that we have to transpose these weights when we import them
        assert len(sd_keys_hf) == len(sd_keys), f"mismatched keys: {len(sd_keys_hf)} != {len(sd_keys)}"
        for k in sd_keys_hf:
            if any(k.endswith(w) for w in transposed):
                # special treatment for the Conv1D weights we need to transpose
                assert sd_hf[k].shape[::-1] == sd[k].shape
                with torch.no_grad():
                    sd[k].copy_(sd_hf[k].t())
            else:
                # vanilla copy over the other parameters
                assert sd_hf[k].shape == sd[k].shape
                with torch.no_grad():
                    sd[k].copy_(sd_hf[k])

        return model

    def forward(self, idx, targets=None):
        B, T = idx.size()
        assert T <= self.config.block_size, f"Cannot fwd seq of length {T}, block size {self.config.block_size}"

        pos = torch.arange(0, T, dtype=torch.long, device=idx.device) # shape (T)
        pos_emb = self.transformer.wpe(pos) # pos embs of shape (T, n_embd)
        tok_emb = self.transformer.wte(idx) # token embs of shape (B, T, n_embd)
        x = tok_emb + pos_emb

        for block in self.transformer.h:
            x = block(x)

        x = self.transformer.ln_f(x)
        logits = self.lm_head(x) # (B,T, vocab_size)
        loss = None
        if targets is not None:

            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        return logits, loss

    def configure_optimizers(self, weight_decay, learning_rate, device_type): # 2:31:50
        # this weight decay forces info to go across many smaller channels instead of one big one
        # start with all of the candidate parameters (that require grad)
        param_dict = {pn: p for pn, p in self.named_parameters()}
        param_dict = {pn: p for pn, p in param_dict.items() if p.requires_grad}
        # create optim groups. Any parameters that is 2D will be weight decayed, otherwise no.
        # i.e. all weight tensors in matmuls + embeddings decay, all biases and layernorms don't.
        decay_params = [p for n, p in param_dict.items() if p.dim() >= 2] # decay weights and sometimes embs
        nodecay_params = [p for n, p in param_dict.items() if p.dim() < 2] # no decay biases and layernorms
        optim_groups = [
            {'params': decay_params, 'weight_decay': weight_decay},
            {'params': nodecay_params, 'weight_decay': 0.0}
        ]
        num_decay_params = sum(p.numel() for p in decay_params)
        num_nodecay_params = sum(p.numel() for p in nodecay_params)
        if master_process: # this is so if u have gpu clusters it doesn't print 8 times
            print(f"num decayed parameter tensors: {len(decay_params)}, with {num_decay_params:,} parameters")
            print(f"num non-decayed parameter tensors: {len(nodecay_params)}, with {num_nodecay_params:,} parameters")
        # Create AdamW optimizer and use the fused version if it is available
        fused_available = 'fused' in inspect.signature(torch.optim.AdamW).parameters
        use_fused = fused_available and device_type == "cuda"
        if master_process:
            print(f"using fused AdamW: {use_fused}") # fused is a newer performance optimization
        optimizer = torch.optim.AdamW(optim_groups, lr=learning_rate, betas=(0.9, 0.95), eps=1e-8, fused=use_fused)
        return optimizer

# --- setting up DDP (distributed data parallels)
# torchrun command sets the env variables RANK, LOCAL_RANK and WORLD_SIZE

ddp = int(os.environ.get('RANK', -1))
if ddp != -1:
    assert torch.cuda.is_available()
    # Retry DDP initialization with exponential backoff
    max_retries = 5
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                if int(os.environ['RANK']) == 0:
                    print(f"DDP init attempt {attempt + 1}/{max_retries}")
                time.sleep(2 ** attempt)  # exponential backoff: 2, 4, 8, 16 seconds
            init_process_group(backend='nccl', timeout=timedelta(seconds=1800))
            break
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Failed to initialize DDP after {max_retries} attempts: {e}")
                raise e
            else:
                print(f"DDP init attempt {attempt + 1} failed: {e}, retrying...")
                if dist.is_initialized():
                    dist.destroy_process_group()

    ddp_rank = int(os.environ['RANK'])
    ddp_local_rank = int(os.environ['LOCAL_RANK'])
    ddp_world_size = int(os.environ['WORLD_SIZE'])
    device = f"cuda:{ddp_local_rank}"
    torch.cuda.set_device(device)
    master_process = ddp_rank == 0
else:
    ddp_rank = 0
    ddp_local_rank = 0
    ddp_world_size = 1
    master_process = True
    device = "cpu"
    if torch.cuda.is_available():
        device = "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = "mps"
    print(f"using device: {device}")
torch.set_float32_matmul_precision('high')
torch.manual_seed(1337)
if torch.cuda.is_available():
    torch.manual_seed(1337)

# -----------------------------------------------------------------------------
# helper function for HellaSwag eval
# takes tokens, mask, and logits, returns the index of the completion with the lowest loss

def get_most_likely_row(tokens, mask, logits):
    # evaluate the autoregressive loss at all positions
    shift_logits = (logits[..., :-1, :]).contiguous()
    shift_tokens = (tokens[..., 1:]).contiguous()
    flat_shift_logits = shift_logits.view(-1, shift_logits.size(-1))
    flat_shift_tokens = shift_tokens.view(-1)
    shift_losses = F.cross_entropy(flat_shift_logits, flat_shift_tokens, reduction='none')
    shift_losses = shift_losses.view(tokens.size(0), -1)
    # now get the average loss just for the completion region (where mask == 1), in each row
    shift_mask = (mask[..., 1:]).contiguous() # we must shift mask, so we start at the last prompt token
    masked_shift_losses = shift_losses * shift_mask
    # sum and divide by the number of 1s in the mask
    sum_loss = masked_shift_losses.sum(dim=1)
    avg_loss = sum_loss / shift_mask.sum(dim=1)
    # now we have a loss for each of the 4 completions
    # the one with the lowest loss should be the most likely
    pred_norm = avg_loss.argmin().item()
    return pred_norm


torch.manual_seed(1337)
if torch.cuda.is_available():
    torch.cuda.manual_seed(1337)

# --- gradient accumulation 2:36:00 ---
total_batch_size = 524288 # ~0.5M tokens per gpt-3 small in its paper

B = 64
T = 1024
assert total_batch_size % (B * T * ddp_world_size) == 0 # make sure total batch size is divisible by B*T * world_size (number of total gpus)
grad_accum_steps = total_batch_size // (B * T * ddp_world_size)
if master_process:
    print(f"total desired batch size: {total_batch_size}")
    print(f"=> calculated grad accum steps: {grad_accum_steps}")



# -------------------------------
# dataloader

# -----------------------------------------------------------------------------
import numpy as np
import tiktoken

def load_tokens(filename):
    try:
        npt = np.load(filename)
        # npt = npt.astype(np.int32)  # Convert uint16 to int32 for torch compatibility
        ptt = torch.tensor(npt, dtype=torch.long)
        return ptt
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        # Try to peek at the file content
        with open(filename, 'rb') as f:
            header = f.read(16)
            print(f"File header (first 16 bytes): {header}")
        raise e

class DataLoaderLite:
    def __init__(self, B, T, process_rank, num_processes, split):
        self.B = B
        self.T = T
        self.process_rank = process_rank
        self.num_processes = num_processes
        assert split in {'train', 'val'}

        # get the shard filenames
        data_root = "../data/edu_fineweb10B"
        shards = os.listdir(data_root)
        shards = [s for s in shards if split in s]
        shards = sorted(shards)
        shards = [os.path.join(data_root, s) for s in shards]
        self.shards = shards
        assert len(shards) > 0, f"no shards found for split {split}"
        if master_process:
            print(f"found {len(shards)} shards for split {split}")

        # state, init at shard zero
        self.current_shard = 0
        self.tokens = load_tokens(self.shards[self.current_shard])
        self.current_position = self.B * self.T * self.process_rank
        self.reset()

    def reset(self):
        self.current_shard = 0
        self.tokens = load_tokens(self.shards[self.current_shard])
        self.current_position = self.B * self.T * self.process_rank

    def next_batch(self):
            B, T = self.B, self.T
            buf = self.tokens[self.current_position : self.current_position+B*T+1]
            x = (buf[:-1]).view(B, T) # inputs
            y = (buf[1:]).view(B, T) # targets
            # advance the position in the tensor
            self.current_position += B * T * self.num_processes
            # if loading the next batch would be out of bounds, advance to next shard
            if self.current_position + (B * T * self.num_processes + 1) > len(self.tokens):
                self.current_shard = (self.current_shard + 1) % len(self.shards)
                self.tokens = load_tokens(self.shards[self.current_shard])
                self.current_position = B * T * self.process_rank
            return x, y


train_loader = DataLoaderLite(B=B, T=T, process_rank=ddp_rank, num_processes=ddp_world_size, split="train")
val_loader = DataLoaderLite(B=B, T=T, process_rank=ddp_rank, num_processes=ddp_world_size, split="val")


# -------------------------------
# run the training loop



num_return_sequences = 5
max_length = 30

# model = GPT.from_pretrained('gpt2')
# overriding the ugly vocab size number with a power of 2 number here
# when doing distributed training, WORLD_SIZE models get created now
# they all have the same seed so they're all identical (2:59)
model = GPT(GPTConfig(vocab_size=50304))
model.to(device)
use_compile = False # torch.compile interferes with HellaSwag eval and Generation. TODO fix
if use_compile:
    model = torch.compile(model)
if ddp:
    model = DDP(model, device_ids=[ddp_local_rank])
raw_model = model.module if ddp else model # this contains the configure optimizers func we wanna call
# -- logging --
# create the log directory we will write checkpoints to and log to
log_dir = "log"
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, f"log.txt")
with open(log_file, "w") as f: # open for writing to clear the file
    pass

# --- cosine decay lr ----
max_lr = 6e-4 # gpt-3 small LR per their paper (gpt-2 doesn't specify)
min_lr = max_lr * 0.1
warmup_steps = 715 # these two hps map to the gpt-3 schedule, adapted for fineweb10b
max_steps = 19073
def get_lr(it):
    # 1) linear warmup for warmup_iters steps
    if it < warmup_steps:
        return max_lr * (it+1) / warmup_steps
    # 2) if it > lr_decay_iters, return min lr
    if it > max_steps:
        return min_lr
    # 3) in between, use cosine decay down to min learning rate
    decay_ratio = (it - warmup_steps) / (max_steps - warmup_steps)
    assert 0 <= decay_ratio <= 1
    coeff = 0.5 * (1.0 + math.cos(math.pi * decay_ratio))
    return min_lr + coeff * (max_lr - min_lr)
# --- cosine decay lr end ----


device_type = 'cuda' if 'cuda' in device else 'cpu'

# checkpoint loading logic
initial_iter = 0
if os.path.exists(log_dir):
    checkpoints = [f for f in os.listdir(log_dir) if f.startswith('model_')]
    if checkpoints:
        latest = max(checkpoints, key=lambda x: int(x.split('_')[1].split('.')[0]))
        checkpoint_path = os.path.join(log_dir, latest)
        checkpoint = torch.load(checkpoint_path, map_location=device)
        raw_model.load_state_dict(checkpoint['model'])
        initial_iter = checkpoint['step'] + 1
        if master_process:
            print(f"resuming from step {initial_iter}")

optimizer = raw_model.configure_optimizers(weight_decay=0.1, learning_rate=6e-4, device_type=device_type)

# load optimizer state if checkpoint exists
if initial_iter > 0:
    try:
        if 'optimizer' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer'])
        if 'rng_state' in checkpoint:
            rng_state = checkpoint['rng_state']
            if not isinstance(rng_state, torch.ByteTensor):
                if master_process:
                    print(f"Warning: Converting RNG state from {type(rng_state)} to ByteTensor")
                # Convert to uint8 tensor then to ByteTensor
                if isinstance(rng_state, torch.Tensor):
                    rng_state = rng_state.to(torch.uint8)
            torch.set_rng_state(rng_state)
        if checkpoint.get('cuda_rng_state') is not None:
            cuda_rng_state = checkpoint['cuda_rng_state']
            if not isinstance(cuda_rng_state, torch.ByteTensor):
                if master_process:
                    print(f"Warning: Converting CUDA RNG state from {type(cuda_rng_state)} to ByteTensor")
                # Convert to uint8 tensor
                if isinstance(cuda_rng_state, torch.Tensor):
                    cuda_rng_state = cuda_rng_state.to(torch.uint8)
            torch.cuda.set_rng_state(cuda_rng_state)
        if 'loader_position' in checkpoint:
            train_loader.current_position = checkpoint['loader_position']
        if 'loader_shard' in checkpoint:
            train_loader.current_shard = checkpoint['loader_shard']
            train_loader.tokens = load_tokens(train_loader.shards[train_loader.current_shard])
        # reset lr scheduler
        for param_group in optimizer.param_groups:
            param_group['lr'] = get_lr(initial_iter)
        if master_process:
            print(f"Successfully loaded checkpoint from step {initial_iter}")
    except Exception as e:
        if master_process:
            print(f"Warning: Failed to load some checkpoint data: {e}")
            print("Continuing with partial checkpoint restore...")

for step in range(initial_iter, max_steps):
    t0 = time.time()
    last_step = (step == max_steps - 1)
    # occasionally find out the val loss
    if step % 500 == 0 or last_step:
        model.eval()
        val_loader.reset()
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.empty_cache()
        with torch.no_grad():
            val_loss_accum = 0.0
            val_loss_steps = 20
            for _ in range(val_loss_steps):
                x, y = val_loader.next_batch()
                x, y = x.to(device), y.to(device)
                with torch.autocast(device_type=device_type, dtype=torch.bfloat16):
                    logits, loss = model(x,y)
                loss = loss / val_loss_steps
                val_loss_accum += loss.detach()
        if ddp:
            dist.all_reduce(val_loss_accum, op=dist.ReduceOp.AVG)
        if master_process:
            val_loss_val = val_loss_accum.item()
            print(f"step {step}, val loss: {val_loss_val:.4f}")
            # Check for potential overfitting every eval
            if step > 500 and hasattr('prev_train_loss', '__self__'):
                train_val_gap = val_loss_val - prev_train_loss
                if train_val_gap > 1.5:
                    print(f"Warning: Large train/val gap ({train_val_gap:.3f}) - possible overfitting")
            with open(log_file, "a") as f:
                f.write(f"{step} val {val_loss_val:.4f}\n")
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    if step > 0 and (step % 1000 == 0 or last_step):
        checkpoint_path = os.path.join(log_dir, f"model_{step:05d}.pt")
        # ensure RNG states are ByteTensors for compatibility
        rng_state = torch.get_rng_state()
        cuda_rng_state = torch.cuda.get_rng_state() if torch.cuda.is_available() else None

        checkpoint = {
            'model': raw_model.state_dict(),
            'config': raw_model.config,
            'step': step,
            'val_loss': val_loss_accum.item(),
            'optimizer': optimizer.state_dict(),
            'rng_state': rng_state.byte() if not isinstance(rng_state, torch.ByteTensor) else rng_state,
            'cuda_rng_state': cuda_rng_state.byte() if cuda_rng_state is not None and not isinstance(cuda_rng_state, torch.ByteTensor) else cuda_rng_state,
            'loader_position': train_loader.current_position,
            'loader_shard': train_loader.current_shard,
        }
        torch.save(checkpoint, checkpoint_path)

    # once in a while evaluate hellaswag
    if (step % 500 == 0 or last_step) and (not use_compile):
        num_correct_norm = 0
        num_total = 0
        for i, example in enumerate(iterate_examples("val")):
            # only process examples where i % ddp_world_size == ddp_rank
            if i % ddp_world_size != ddp_rank:
                continue
            # render the example into tokens and labels
            _, tokens, mask, label = render_example(example)
            tokens = tokens.to(device)
            mask = mask.to(device)
            # get the logits
            with torch.no_grad():
                with torch.autocast(device_type=device_type, dtype=torch.bfloat16):
                    logits, loss = model(tokens)
                pred_norm = get_most_likely_row(tokens, mask, logits)
            num_total += 1
            num_correct_norm += int(pred_norm == label)
        # reduce the stats across all processes
        if ddp:
            num_total = torch.tensor(num_total, dtype=torch.long, device=device)
            num_correct_norm = torch.tensor(num_correct_norm, dtype=torch.long, device=device)
            dist.all_reduce(num_total, op=dist.ReduceOp.SUM)
            dist.all_reduce(num_correct_norm, op=dist.ReduceOp.SUM)
            num_total = num_total.item()
            num_correct_norm = num_correct_norm.item()
        acc_norm = num_correct_norm / num_total
        if master_process:
            print(f"HellaSwag accuracy: {num_correct_norm}/{num_total}={acc_norm:.4f}")
            with open(log_file, "a") as f:
                f.write(f"{step} hella {acc_norm:.4f}\n")
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    if ((step > 0 and step % 500 == 0) or last_step) and (not use_compile):
        model.eval()
        num_return_sequences = 4
        max_length = 32
        tokens = enc.encode("Hello, I'm a language model,")
        tokens = torch.tensor(tokens, dtype=torch.long)
        tokens = tokens.unsqueeze(0).repeat(num_return_sequences, 1)
        xgen = tokens.to(device)
        sample_rng = torch.Generator(device=device)
        sample_rng.manual_seed(42 + ddp_rank)
        # in training loop
        while xgen.size(1) < max_length:
            # forward the model to get the logits
            with torch.no_grad():
                with torch.autocast(device_type=device_type, dtype=torch.bfloat16):
                    logits, loss = model(xgen) # (B, T, vocab_size)
                # take the logits at the last position
                logits = logits[:, -1, :] # (B, vocab_size)
                # get the probabilities
                probs = F.softmax(logits, dim=-1)
                # do top-k sampling of 50 (huggingface pipeline default)
                # topk_probs here becomes (5, 50), topk_indices is (5, 50)
                topk_probs, topk_indices = torch.topk(probs, 50, dim=-1)
                # select a token from the top-k probabilities
                # note: multinomial does not demand the input to sum to 1
                ix = torch.multinomial(topk_probs, 1, generator=sample_rng) # (B, 1)
                # gather the corresponding indices
                xcol = torch.gather(topk_indices, -1, ix) # (B, 1)
                # append to the sequence
                xgen = torch.cat((xgen, xcol), dim=1)
        # print the generated text
        for i in range(num_return_sequences):
            tokens = xgen[i, :max_length].tolist()
            decoded = enc.decode(tokens)
            print(f"rank {ddp_rank} sample {i}: {decoded}")
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    model.train()
    optimizer.zero_grad()
    loss_accum = 0.0
    # gradient accumulation 2:39:23
    for micro_step in range(grad_accum_steps):
        x, y = train_loader.next_batch()
        x, y = x.to(device), y.to(device)
        if ddp:
            model.require_backward_grad_sync = (micro_step == grad_accum_steps - 1) # should only share grads on last step
        with torch.autocast(device_type=device_type, dtype=torch.bfloat16): # bfloat only possible with ampere gpus
            logits, loss = model(x,y)
        loss = loss / grad_accum_steps # 2:44, otherwise losses sum over the accumulated passes
        loss_accum += loss.detach()
        loss.backward()
    if ddp:
        dist.all_reduce(loss_accum, op=dist.ReduceOp.AVG) # average the loss across all gpus
    # final gradient clipping after accumulation
    # 2:18:00
    norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    # lr scheduler is cosine decay (2:22)
    lr = get_lr(step)
    for param_group in optimizer.param_groups: # pt treats params as groups in optimization;
    #there's only one item in this group fyi
        param_group['lr'] = lr
    optimizer.step()
    torch.cuda.synchronize() # this awaits for all kernels to finish
    t1 = time.time()
    dt = (t1 - t0)*1000
    tokens_processed = train_loader.B * train_loader.T * grad_accum_steps * ddp_world_size
    tokens_per_sec = tokens_processed / (t1 - t0)
    # keep an eye on gradient norms, signal of problems if anomalies
    if master_process:
        train_loss = loss_accum.item()
        print(f"step {step}, loss: {train_loss:.6f}, lr: {lr:.4e}, norm: {norm:.4f}, dt: {dt:.2f}ms, tok/sec: {tokens_per_sec:.2f}")
        # Store for overfitting detection
        prev_train_loss = train_loss
        with open(log_file, "a") as f:
            f.write(f"{step} train {train_loss:.6f}\n")

if ddp:
    destroy_process_group()

# only master saves & uploads
if master_process:
    # create repo (once)

    # save the raw model (not ddp wrapper)
    torch.save(raw_model.state_dict(), 'model.pt')
    api = HfApi()
    api.upload_file(
        path_or_fileobj="model.pt",
        path_in_repo="model.pt",
        repo_id="bathrobe/my-gpt2"
    )
    print("model uploaded to hf")
