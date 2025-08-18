## Optimizations

After dialing in the basic architecture, Karpathy spends much of the 4 hours of lecture slowly speeding up the model's ability to train. Full of tips, technical details, and weird quirks, I found this section exciting to witness. On the right sidebar is one example among many, as we walked through reducing unnecessary precision in the weights and gradually decreasing the time it took to process our batches.

We get a baseline with the CPU, then head to the GPU. First, we use full 32-bit precision, then a fancy tensor-float 32 bit precision that lops off some of the bits in the mantissa (the small values that are less significant). Then, we use a half-precision 16-bit format that lops off even more bits.

And when it's time for what Karpathy calls "the heavy artillery," we compile the PyTorch model with `torch.compile`, which intelligently fuses a bunch of related operations so that they all take place in one operation without any round trips to the GPU's memory. This was pretty spellbinding to see.

Another cool quirk that isn't shown: Karpathy also (in a mischevious tone) mentions that models just tend to like numbers that are exponents of 2, i.e. binary numbers. So we pad out our vocabulary to be a power of 2, make sure all our batch sizes and sequence lengths are the same, and so on. It's kind of silly, and yet profound at the same time.
