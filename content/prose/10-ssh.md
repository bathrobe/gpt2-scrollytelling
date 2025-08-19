## How to Accidentally Spend $150 on 8 A100s

As you'll know if you spend any time reading news about AI, training models on lots of GPUs is very expensive. No one but the extraordinarily wealthy owns the high end GPUs used for training. Mortals rent from the cloud, and I chose to use Prime Intellect, an aggregator of GPU cloud servers that picks out the cheapest ones available.

But by no means was the process cheap! This is mostly because I kept screwing up. SSHing into remote servers for long processes like the training (which took about 3 hours) is something I didn't have much experience in. I learned some valuable stuff—use `tmux` to keep processes running even if you disconnect chief among them! I also wrote some checkpointing code that saved the model checkpoints and reloaded them whenever it crashed.

All told though, this was one of those confidence boosting activities that made a simpler, saner project—fine-tuning a small OS LLM with RL someday—feel a lot more approachable. If you know what you're doing you will not spend as much as I did.
