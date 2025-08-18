## Attention

Following the most exciting section of the `Block` to its definition, we see the scariest, most abstract portion of the code, for causal self-attention.

The best way to understand what's happening is to study Karpathy's preceding video, in which he implemented self-attention in less optimized code.

The thing that's unique—and that took me a long time to figure out—is how the weights for each attention head are stacked, then rearranged, to take maximum advantage of the GPU's parallelism.

Probably the hardest thing to understand is the tensor reshaping. The code uses `.view()` and `.transpose()` to move the number of attention heads (`n_head`) into the second dimension. Why? This perfectly sets up the Query and Key tensors for a highly optimized batched matrix multiplication. By shaping them as `(Batch, Heads, Sequence, Features)`, PyTorch can treat each attention head as a separate problem to solve in parallel, massively speeding up the core computation.

The other big optimization is a little easier to understand: instead of multiplying Q, K, and V one line at a time, all those tensors are stacked into one mega tensor on line 38. This is simply faster than three separate matrix multiplications.
