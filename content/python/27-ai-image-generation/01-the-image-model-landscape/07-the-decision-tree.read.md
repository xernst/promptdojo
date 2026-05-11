---
xp: 2
estSeconds: 150
concept: image-model-decision-tree
code: |
  # the routing logic for picking an image model.
  # the order matters: specialty rules first, then defaults.

  RULES = [
      ("needs_text_in_image",        "ideogram-3"),
      ("needs_character_consistency", "flux-kontext-pro"),
      ("photoreal_art_directed",     "flux-1.1-pro"),
      ("batch_count_high",           "nano-banana"),
      ("subjective_taste",           "midjourney-v7"),
      ("instruction_heavy",          "gpt-image-1"),
      ("default",                    "imagen-4"),
  ]

  for flag, model in RULES:
      print(f"{flag:32} → {model}")
---

# The decision tree, ordered

You've now seen the six families and the specialty cases. Here's the routing logic in one place — the order matters.

## The rules, in priority order

The reason for priority order: **specialty constraints beat general preferences**. If the brief needs text-in-image, it doesn't matter that you prefer Midjourney — Ideogram is the answer. So the routing function checks the hard constraints first, falls through to taste/style preferences, then defaults.

The order:

1. **Text in image required?** → `ideogram-3`. The specialist.
2. **Character consistency across renders required?** → `flux-kontext-pro`. The other specialist.
3. **Photoreal + art-directed?** → `flux-1.1-pro`. Strongest photoreal output with prompt fidelity.
4. **High batch count (filter-and-pick workflow)?** → `nano-banana`. The batch economics make it obvious.
5. **Subjective / taste-driven, no API constraint?** → `midjourney-v7`. The aesthetic pick.
6. **Instruction-heavy composition (specific placements)?** → `gpt-image-1`. Best instruction-follower.
7. **Default fallthrough** → `imagen-4`. Solid all-arounder, enterprise-friendly.

## The escape hatches

A few real-world overrides that the priority list above doesn't capture:

- **`budget_per_image < 0.02`** — drop to `gpt-image-1-mini` (low quality, $0.005/image) or `imagen-4-fast` ($0.02/image) regardless of other rules. Cost discipline.
- **`latency_ms_max < 2000`** — drop to a Flash-tier model. nano-banana 2 generates faster than Pro at roughly half the cost. Imagen 4 Fast is the other "speed first" pick.
- **`self_hosted = True` AND volume > 50K/month** — run Flux.1 [dev] on a rented H100. The economics flip below ~$0.005/image when you amortize the GPU.

## How this becomes code

The pseudocode for the routing function:

```python
def pick_image_model(task):
    if task.get("budget_per_image", 1.0) < 0.02:
        return "gpt-image-1-mini"
    if task.get("needs_text_in_image"):
        return "ideogram-3"
    if task.get("needs_character_consistency"):
        return "flux-kontext-pro"
    if task.get("photoreal_art_directed"):
        return "flux-1.1-pro"
    if task.get("batch_count", 1) >= 10:
        return "nano-banana"
    if task.get("subjective_taste"):
        return "midjourney-v7"
    if task.get("instruction_heavy"):
        return "gpt-image-1"
    return "imagen-4"
```

That's the spec for the write step. Eight lines of branching, plus the budget escape hatch. Notice the order: budget first (hard floor), then specialty constraints (text, character), then style preferences (photoreal, taste, instruction), then default.

## A note on the "default" pick

`imagen-4` as the fallthrough is a 2026-specific call. A year ago it would have been DALL-E 3. Two years ago it would have been Stable Diffusion. The default rotates as the landscape shifts. The shape of the function — specialty → preference → default — doesn't.

If you're writing this for a long-lived production codebase, leave the rule list as a module-level constant (like the `RULES` tuple in the editor above) so a future maintainer can re-rank without rewriting the function body. That's the same pattern from chapter 26 — keep the registry out of the loop.

## What you'll write

Step 8 asks you to implement `pick_image_model(task)` with the rules above. Step 9 runs it across five tasks and audits a pipeline. Both are pure stdlib, no API calls — just decision logic, exactly like the kind of routing function that sits at the front of a real image-gen feature in production.
