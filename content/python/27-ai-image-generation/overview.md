## The model didn't fail — the workflow did

Every founder who's tried to ship an image-heavy product in 2026 has the same story. They picked one model, wrote one prompt, generated one image, hated it, and concluded "AI image stuff isn't there yet." It is there. They just ran the wrong tool against the wrong task with the wrong prompt and no pipeline.

This chapter is the production view. Six image-model families, the eight knobs that turn a "make me a photo of a girl" prompt into a usable asset, and the pipeline that takes the one idea you had at 9am and ships a hundred polished, platform-correct files by lunch. Real pricing. Real model names. Real failure modes.

## Why it matters

- **Image work is the second budget line in any AI product after the LLM call.** Picking nano-banana over Midjourney at scale is the difference between a $30 batch and a $3 batch.
- **The model landscape forked.** "AI image gen" used to mean DALL-E. In 2026 it means six families optimized for six different jobs (photorealism, instruction-following, text-in-image, character consistency, speed, taste). Picking the wrong one wastes hours.
- **Most of the quality is in the prompt and the pipeline, not the model.** The same Flux Pro call generates slop and award-shortlist work depending on the eight knobs in lesson 02.

## What AI specifically gets wrong

- **Picking Midjourney for everything.** Midjourney wins on taste, loses on text-in-image, character consistency across renders, and API-volume economics. If your job is a product page hero image, fine. If your job is a hundred banner variants with the same product, you're holding the wrong tool.
- **Treating "a girl with red hair" as a prompt.** That's a wish. A prompt names subject, composition, lighting, style, camera, lens, palette, and negatives. Eight knobs. Skip them and the model fills in the average of the training data, which is slop.
- **Generating one image and editing forever.** The 2026 workflow is generate-many, filter, upscale. nano-banana at ~$0.039/image lets you generate 50 candidates and pick 3 for less than one Midjourney render. Generating one image is the most expensive way to use these tools.
- **Forgetting that Anthropic's Claude is input-only for images.** Claude can read images. Claude cannot generate them. Don't waste two days wiring an image-gen route to the Anthropic API.

## What you'll be able to do at the end

By the end of this chapter you'll have:

- Picked the right model family for any image task — product, social, illustration, document, character-consistent — using a decision function you wrote, not vibes.
- Written prompts that hit the eight knobs and scored a prompt's completeness with a function you wrote.
- Estimated the cost of a batch across nano-banana, Flux Pro, Midjourney, and DALL-E at real 2026 rates.
- Planned a full shoot — brief in, model + count + total cost + output formats out — for any creative ask.

The difference between "I can use ChatGPT to make a picture" and "I can ship image assets at production volume on a budget" is this chapter. After it, the part of your stack where images live stops being a black box.
