## Blocks!

In line 125, we initialize a list of blocks. What's in them? Why, the chewy center of the chewy center of the LLM.

The simplicity of this system—self-attention, feed forward, rinse and repeat—is why the original paper was called "Attention Is All You Need." That causal self-attention mechanism in `self.attn`, scaled up to billions of parameters, is by far and away the most complex component of the model, and yet is simpler than many of the competitors of its time. Despite this simplicity, it ended up being the one true architecture for the breakthroughs we've witnessed in the past few years.

One thing I found particularly elegant is the way the residual connections are implemented in the forward pass. Notice that the forward pass simply calls the functions initialized in the constructor. The only novelty they introduce is in _adding_ the output of each mechanism to the input itself. That simple `x +` represents such an valuable idea, as it saves the model from the effort of reinventing the representation inside the model all by itself in each new layer.

Though it concerns a totally different architecture, my introduction to residual connections was in [Serena Yeung's course on CNNs and ResNet](https://www.youtube.com/watch?v=DAOcjicFr1Y). I found the explanation super clear and nice.
