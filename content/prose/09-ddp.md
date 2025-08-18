## DDP Is Tricky

DDP is a distributed training technique that allows us to train models on multiple GPUs or machines. However, it can be tricky to get right.

While until now we'd been running the code as a Python script, we now need to run a special terminal command, `torchrun`, to initialize the multi-process environment. For ex:

```
torchrun --nproc_per_node=x main.py
```

One of the biggest changes we make in our code to hook our training up to multiple GPUs at once is in the DataLoaderLite. We grab batches of data and add each to a different GPU's 'rank'. Note the use of `master_process` to ensure only one of the processes prints logs and other one-person jobs.

The other one is in the training loop,where we use the `dist` module in PyTorch to reduce all the loss values across all GPUs. This is done using the `all_reduce` function, which sums up the values across all GPUs and then divides by the number of GPUs to get the average loss.
