# Reference Images — Model Library

This folder is your personal library for **reference images you want to turn into Three.js procedural models**. Drop images here and any AI agent (Claude Code, Codex, OpenCode, or Arena's Agent Mode) can read them directly by path.

> The `img2threejs` pipeline never copies mesh files — it **rebuilds the object in code** from your reference. Better reference = better reconstruction. This folder keeps your source images organized and versioned alongside your specs.

## Folder Structure

```
references/
├── README.md        — this file
├── objects/         — general hard-surface objects (furniture, gadgets, tools, etc)
├── characters/      — people, creatures, stylized characters
├── cs2/             — Counter-Strike 2 skins / weapons for exact-projection path
├── weapons/         — non-CS2 weapons, knives, props
└── props/           — game props, collectibles, dioramas, small objects
```

Add your own subfolders freely (e.g. `vehicles/`, `client-x/`). The pipeline doesn't enforce structure — it's for you.

### What to put where?

- **objects/**: coffee machine, headphones, chair — anything hard-surface
- **characters/**: use for anatomy-aware track (head-units, landmarks). One clear front view minimum; add side/back if you have them.
- **cs2/**: put `front.jpg` + `back.jpg` or full inspect screenshots for patterned finish projection
- **weapons/** / **props/**: self-explanatory

## Supported Formats

`.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp` — all work. 
Prefer **high-res, well-lit, single-object, uncluttered background** (see `grimoire/intake/validation_rubric.md` for admission criteria).

Tips for best results:
- Center the object, fill ~60-80% of frame
- Avoid heavy filters, motion blur, extreme perspective
- Keep the original — the pipeline's `de-light` step (`forge/stage1_intake/delight_albedo.py`) needs real pixels to extract albedo
- For patterned skins (Doppler/Fade/etc) save both sides — projection fidelity requires it

## How Agents Reference Images Here

Any image you drop in this folder can be referenced by relative path from repo root:

```bash
# 1. Quick probe — metadata only, no vision scoring
python3 forge/stage1_intake/probe_image.py references/objects/my-chair.jpg

# 2. Admission check — rejects tiny / empty / duplicate / undecodable
python3 forge/stage1_intake/check_reference_admission.py references/objects/my-chair.jpg

# 3. Detail inventory — enumerates identity-defining small details
python3 forge/stage1_intake/build_detail_inventory.py references/objects/my-chair.jpg --mode grid-3x3 --out-dir references/objects/ --out references/objects/my-chair-details.json

# 4. Pre-spec assessment — quality contract + local spec search (BM25)
python3 forge/stage2_spec/new_pre_spec_assessment.py "My Chair" --image references/objects/my-chair.jpg --out assessment.json

# 5. Full sculpt spec
python3 forge/stage2_spec/new_sculpt_spec.py "My Chair" --image references/objects/my-chair.jpg --assessment assessment.json --out object-sculpt-spec.json

# 6. Then follow SKILL.md build loop: blockout -> structural -> form -> material -> lighting -> interaction
```

### CS2 example (knife with projection-first fidelity):

```bash
python3 forge/stage1_intake/check_reference_admission.py references/cs2/karambit-doppler-front.jpg
python3 forge/stage1_intake/check_reference_admission.py references/cs2/karambit-doppler-back.jpg
# Build cs2-intake.json per docs, then:
python3 forge/stage2_spec/new_pre_spec_assessment.py "Karambit Doppler" --image references/cs2/karambit-doppler-front.jpg --cs2 --out assessment.json
```

### Prompting an AI agent:

Just mention the path:

> "Build a Three.js model from `references/objects/sony-headphones.jpg` — I want a hero prop, moderate complexity, with explodable parts."

The agent's vision tools will read `references/objects/sony-headphones.jpg` directly. No upload needed.

## Naming Tips

- Use kebab-case: `bmx-endurance-bike.jpg`, `glock-ghost-protocol.jpg`, `doraemon-house-front.jpg`
- Add view suffix for multi-view: `-front`, `-back`, `-side`, `-detail`, `-top`
- Keep metadata alongside: e.g. `my-chair.jpg` + `my-chair-notes.md` or `my-chair-details.json`

## Git & Size

- This folder **is tracked by git** (unlike `assets/*` and `cs2_textures/`). 
- Try to keep individual images <10 MB. If you have huge raw photos, consider committing a compressed version and keeping the raw locally.
- If you add 100+ MB of references, consider Git LFS — or add a `references/.gitignore` to exclude raw dumps and only commit curated picks.

### Example `.gitignore` inside references (optional):

If you want to ignore raw dumps but keep curated:

```
# inside references/.gitignore
raw/
*.cr2
*.nef
```

We ship with `.gitkeep` files so empty subfolders are preserved.

## Workflow: From Reference to Showcase

1. Drop `references/objects/my-object.jpg`
2. Run the intake loop (probe → admission → detail inventory → pre-spec assessment)
3. Generate `object-sculpt-spec.json`
4. Build passes via `forge/stage3_build/generate_threejs_factory.py`
5. Vision-review each pass with `forge/stage4_review/make_comparison_sheet.py` + `append_review.py`
6. Your final factory lives in `src/createMyObjectModel.ts` — animation-ready, no mesh files

See `SKILL.md` for the full quality-gated loop and `grimoire/intake/image_analysis.md` for the observation protocol.

---
Happy sculpting! Put your first image in `objects/` and tell the agent: *"Build this: references/objects/your-image.jpg"*
