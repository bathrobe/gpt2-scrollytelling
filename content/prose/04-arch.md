## Architecture

Throughout this blog post, we'll be plucking out sections of [my reproduction of Karpathy's training script](https://github.com/bathrobe/my-gpt2/blob/main/gpt2.py). I don't intend to give a full tutorial, but instead want to point out especially weird, challenging, or interesting parts of the code.

And the first, here on lines 122-128: the chewy center of a large language model.

The story goes like this: a string of text is tokenized and those tokens become a collection of learned embeddings (`wte`.) Fascinatingly, in GPT-2 information about where these embeddings are in the input sequence is passed on via _totally learned_ weights added to the embeddings (`wpe`).

In earlier transformers, these position encodings were hardcoded in (for me) very hard to understand sinusoidal patterns. In later models, these position encodings "rotate" the embeddings, which is also confusing. But wholly learned weights that figure out how to encode positional information? Weird and cool.

The other cool thing is that Karpathy reuses the same embeddings in the final classifier head of the model as are used to embed the tokens (`wte`). This is represented by a red dashed line connecting the `wte` and `lm_head` embeddings. This means the model only learns a single understanding of how its vocabulary of tokens maps to the high dimensional space in which the next token is predicted. A single translator, from the world of humankind's language to the private, incomprehensible language of the machine.
