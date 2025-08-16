## Blocks!

In line 125, we initialize a list of blocks. What's in them? Why, the chewy center of the chewy center of the LLM.

The simplicity of this system—layer norm, self-attention, layer norm, feed forward net, that's a wrap—is why the original paper was called "Attention Is All You Need." That causal self-attention mechanism in `self.attn`, scaled up to billions of parameters, is the key to the success of modern LLMs.

One thing I found particularly elegant is the way the residual connections are implemented in the forward pass. Notice that the forward pass simply calls the functions initialized in the constructor. The only novelty they introduce is in _adding_ the output of the residual connection to the input itself.

This saves the model from the effort of reinventing the representation inside the model _ex nihilo_ with each new layer.
