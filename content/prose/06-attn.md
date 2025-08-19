## Attention

Following the most exciting section of the `Block` to its definition, we see the scariest, most abstract portion of the architecture, for causal self-attention.

The best way to understand what's happening is to study Karpathy's preceding video, in which he implemented self-attention in less optimized code. And if by chance that feels too far in the deep end for you, I made an [annotated bibliography of self-taught ML from total scratch](https://transformers.joeholmes.dev), with a lot of time spent on transformers.

The thing that's unique—and that took me a long time to figure out—is how the weights for each attention head are stacked, then rearranged, to take maximum advantage of the GPU's parallelism.

The hardest part to grok is the tensor reshaping. In the forward pass, the code uses `.view()` and `.transpose()` to move the number of attention heads (`n_head`) into the second dimension. Why? This sets up the Query and Key tensors for a highly optimized batched matrix multiplication. By shaping them as `(Batch, Heads, Sequence, Features)`, PyTorch can treat each attention head as a separate problem to solve in parallel, massively speeding up the core computation. This is thanks to the miracle of broadcasting.

The other big optimization is a little easier to understand: instead of multiplying Q, K, and V one line at a time, all those tensors are stacked into one mega tensor on line 38. This is simply faster than three separate matrix multiplications.
