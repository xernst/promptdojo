---
xp: 1
estSeconds: 180
concept: format-and-platform-output
---

# Format and platform — the stage everyone skips

The final stage of the pipeline is the one nobody respects. The image came out of the model. It looks great. Ship it.

You can do that. You will pay for it in three places:

1. **Page load time.** A 1024x1024 PNG is 1-2MB. The same image as a 1024x1024 WebP at quality 85 is 80-200KB. On mobile, that's 1-2 seconds vs. 100-200ms. Conversion rates move on that gap.
2. **Privacy leaks.** AI-generated images sometimes include the prompt in EXIF. Ship one to your competitor and they have your prompt.
3. **Accessibility.** No alt text means screen readers say "image" and move on. Anyone using a screen reader gets nothing from your gorgeous hero shot.

## The four format jobs

Every image that leaves your pipeline does four things at stage 6:

### 1. Convert to platform format

The 2026 defaults:

- **WebP** for web. Universal support, 25-35% smaller than JPG at equivalent quality.
- **AVIF** for cutting-edge web. 50% smaller than JPG. Support is now ubiquitous (Chrome, Firefox, Safari all support it).
- **JPG** as fallback when you need maximum compatibility (email clients, older platforms).
- **PNG** only if you need transparency. Almost never for photographs.

The pseudocode shape:

```python
# pseudocode — using Pillow stdlib
# from PIL import Image
# img = Image.open(input_path)
# img.save(output_path, format="WEBP", quality=85)
# img.save(avif_path, format="AVIF", quality=80)
```

### 2. Resize per channel

You generated at 1024x1024. The actual destinations are:

| Channel | Target size |
|---|---|
| Instagram square | 1080×1080 |
| Instagram story | 1080×1920 |
| TikTok 9:16 | 1080×1920 |
| Twitter / X post | 1200×675 |
| LinkedIn post | 1200×627 |
| Email header | 600×300 |
| Web hero | 1920×1080 (with 2x retina at 3840×2160) |
| Thumbnail | 400×400 |

Generating once and resizing six times beats generating six times. The image-model bill is the expensive line; resize is essentially free with `Pillow`.

### 3. Strip EXIF metadata

Every generated image potentially contains: prompt text, model name, generation timestamp, sometimes a "made with X" tag. Strip them unless you have a reason to keep them.

The exception: C2PA content credentials. As of 2026, OpenAI, Google, and most major providers attach C2PA signatures to generated images. These are designed to be preserved — they let downstream viewers verify "this is AI-generated, this is the provenance." Strip EXIF but not C2PA, if you care about content authentication.

### 4. Generate alt text

For every image going to a website, generate descriptive alt text. The pseudocode:

```python
# pseudocode — vision model call for alt text
# resp = vision_client.describe(image, prompt="One-sentence alt text for a screen reader. Describe what's visually present.")
# alt = resp.text
```

Cost: ~$0.001 per image. Quality: 80-90% as good as a human writer for descriptive alt text. Strongly recommended for any production web pipeline.

## The platform routing function

The dispatch shape, in pseudocode:

```python
PLATFORM_CONFIGS = {
    "instagram_square":  {"size": (1080, 1080), "format": "JPEG", "quality": 90},
    "instagram_story":   {"size": (1080, 1920), "format": "JPEG", "quality": 90},
    "tiktok":            {"size": (1080, 1920), "format": "JPEG", "quality": 90},
    "twitter":           {"size": (1200, 675),  "format": "JPEG", "quality": 85},
    "web_hero":          {"size": (1920, 1080), "format": "WEBP", "quality": 85},
    "web_hero_retina":   {"size": (3840, 2160), "format": "WEBP", "quality": 80},
    "thumbnail":         {"size": (400, 400),   "format": "WEBP", "quality": 75},
    "email_header":      {"size": (600, 300),   "format": "JPEG", "quality": 80},
}

def format_for_platform(img, platform):
    cfg = PLATFORM_CONFIGS[platform]
    # resize, convert format, strip EXIF, return
    ...
```

The next step has you fill in this exact dispatch. After that, you'll write the cost function that estimates the API spend across nano-banana / Flux Pro / Midjourney / DALL-E for a given batch — the function you'd actually call before kicking off a job to make sure it fits your budget.

## What this means for your workflow

Stop thinking of stage 6 as "save the file." Think of it as "the image now has to go through six platforms, each with different requirements, and the original 1024 PNG is the wrong shape for every single one."

Generate once. Format six times. Strip metadata. Add alt text. Then ship.
