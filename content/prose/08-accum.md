## Gradient Accumulation

For a long section after the first speed-ups, Karpathy investigates a variety of ways we can be totally sure we're reproducing GPT-2 accurately. Because there's not as much information about 2's hyperparameters, Karpathy sometimes gets GPT-3's hyperparameters instead.

This leads to some tricky new concepts such as _gradient accumulation_. Why must the gradients be accumulated? GPT-3's batch size was a positively gargantuan number (if memory serves, something like 500k examples per batch), and since there's no way we could fit all that in memory for one pass, we loop through a bunch of passes until we collect as many gradients as we would've if we had the tens of thousands of GPUs OpenAI did when training GPT-3. That is, we "accumulate" gradients until a single optimizer step is done on a massive amount of data.

I found out how useful this is when I screwed it up and was somehow updating weights after only an OOM less training examples. The result: ghastly, horrifying overfitting (2.5 train loss, 5ish val loss—very very bad.)

These reproduction challenges were pretty painstaking and didn't quite light my fire, so we're going to move on to figuring out DDP, distributed data parallelism: a crucial part of training on multiple GPUs at once.
