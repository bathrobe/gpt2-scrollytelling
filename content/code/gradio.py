import torch, gradio as gr
from transformers import pipeline

pipe = pipeline(
    "text-generation",
    model="bathrobe/my-gpt-2",  # your repo id
    device=0 if torch.cuda.is_available() else -1,
    truncation=True,
    pad_token_id=50256,
)

def generate(prompt, max_length=100):
    out = pipe(prompt, max_length=max_length, num_return_sequences=1, truncation=True)
    return out[0]["generated_text"]

prompt_tb = gr.Textbox(
    label="prompt", placeholder="type a prompt…",
    lines=1, max_lines=1, container=False, elem_id="prompt_tb"
)
maxlen = gr.Slider(10, 200, value=100, label="max length", container=False, elem_id="maxlen")
output_tb = gr.Textbox(
    label="output",
    lines=4, max_lines=4, container=False, autoscroll=True, elem_id="output_tb"
)

css = """
/* kill extra chrome + compress vertical rhythm */
#prompt_tb, #maxlen, #output_tb { margin: 6px 0 !important; }
#output_tb textarea { min-height: 120px !important; max-height: 120px !important; }
.gradio-container { padding: 0 !important; }      /* trims outer padding */
"""

gr.Interface(
    fn=generate,
    inputs=[prompt_tb, maxlen],
    outputs=output_tb,
    title="Joe's GPT-2",
    allow_flagging="never",
    theme=gr.themes.Soft(spacing_size="sm", radius_size="sm", text_size="sm"),
    css=css,
).launch()
