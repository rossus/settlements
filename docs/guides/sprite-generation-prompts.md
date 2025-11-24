# Sprite Generation Prompts for Settlements

Complete prompt guide for generating sprites and textures for the Settlements terrain system.

## Quick Start: Essential 8 Sprites

Start with these for immediate visual variety:

```
Priority 1: Water & Core Vegetation (5 sprites)
├── deep_water.png
├── shallow_water.png
├── grassland.png
├── forest.png
└── desert.png

Priority 2: Additional Vegetation (3 sprites)
├── tundra.png
├── swamp.png
└── none.png (barren)
```

These 8 sprites will give you ~70% visual coverage with minimal work.

---

## Style Guidelines

Before generating, decide on your art style. Here are recommended styles:

### Option A: Hand-Painted (Recommended)
**Look:** Stylized, vibrant, painterly
**Examples:** Civilization VI, Age of Empires IV
**Prompt modifier:** `hand-painted style, painterly, stylized realism`

### Option B: Pixel Art
**Look:** Retro, crisp, nostalgic
**Examples:** Stardew Valley, Into the Breach
**Prompt modifier:** `pixel art, 16-bit style, retro game graphics`

### Option C: Low-Poly 3D Render
**Look:** Modern, clean, geometric
**Examples:** Polytopia, Dorfromantik
**Prompt modifier:** `low-poly 3D render, flat shading, geometric`

**Choose one and stick with it for consistency!**

---

## Base Prompt Template

Use this template for all sprites:

```
top-down view of [TERRAIN DESCRIPTION], hexagonal terrain tile for strategy game,
[STYLE], vibrant colors, seamless edges, isometric perspective,
256x256 pixels, suitable for game use, high detail
```

**For DALL-E 3:** Add `transparent background` at the end
**For Midjourney:** Add `--ar 1:1 --v 6` at the end
**For Stable Diffusion:** Add `(masterpiece:1.2), (best quality:1.2)` and negative prompt

---

## Priority 1: Water Sprites (2 sprites)

These are ALWAYS needed since water overrides everything.

### deep_water.png
```
top-down view of deep ocean water, hexagonal terrain tile for strategy game,
dark blue water with subtle wave patterns, deep sea color (#4a90e2),
hand-painted style, seamless edges, isometric perspective,
occasional white wave crests, calming ocean texture
```

**Color guide:** Dark blue (#4a90e2)
**DALL-E tip:** "deep navy blue ocean, darker than shallow water"
**Midjourney:** Add `--s 400` for more stylization

### shallow_water.png
```
top-down view of shallow coastal water, hexagonal terrain tile for strategy game,
light blue clear water, visible sandy bottom, brighter than deep water (#7cb9e8),
hand-painted style, seamless edges, gentle ripples,
turquoise coastal water, inviting and clear
```

**Color guide:** Light blue (#7cb9e8)
**DALL-E tip:** "turquoise shallow water, you can see the sandy bottom"
**Contrast:** Should be noticeably lighter than deep_water

---

## Priority 2: Base Vegetation (6 sprites)

These are your fallback sprites - every terrain type will use these if no specific sprite exists.

### grassland.png
```
top-down view of lush grassland, hexagonal terrain tile for strategy game,
vibrant green grass (#7ec850), rolling meadow with wildflowers,
hand-painted style, seamless edges, healthy grass texture,
few small yellow flowers scattered, pastoral and peaceful
```

**Color guide:** Vibrant green (#7ec850)
**Variations:** Add small details (flowers, grass patches) but keep mostly green
**DALL-E tip:** "bright healthy grass, like a well-maintained field"

### forest.png
```
top-down view of dense forest canopy, hexagonal terrain tile for strategy game,
dark green tree tops (#228b22), mixed deciduous and coniferous trees,
hand-painted style, seamless edges, thick foliage,
varied tree crown shapes, dappled shadows, lush woodland
```

**Color guide:** Dark green (#228b22)
**Key detail:** Should look MUCH darker than grassland
**DALL-E tip:** "bird's eye view of tree canopy, cannot see ground through leaves"

### desert.png
```
top-down view of sandy desert terrain, hexagonal terrain tile for strategy game,
golden sand dunes (#f4e4a6), subtle ripple patterns from wind,
hand-painted style, warm yellow tones, seamless edges,
few small rocks, dry and arid, sun-baked landscape
```

**Color guide:** Light yellow (#f4e4a6)
**Variations:** Small rocks or cacti sparingly
**DALL-E tip:** "golden sand with gentle dune curves, warm desert feeling"

### tundra.png
```
top-down view of frozen tundra landscape, hexagonal terrain tile for strategy game,
pale blue-white ground (#b8d4e0), sparse low vegetation, permafrost,
hand-painted style, cold color palette, patches of snow,
small shrubs poking through ice, desolate arctic terrain
```

**Color guide:** Pale blue (#b8d4e0)
**Key detail:** Mix of white snow and brownish frozen ground
**DALL-E tip:** "arctic tundra, mostly frozen with sparse vegetation"

### swamp.png
```
top-down view of murky swampland, hexagonal terrain tile for strategy game,
dark green-brown murky water (#4a5d3e), muddy wetland with reeds,
hand-painted style, stagnant water, moss and algae,
cattails and marsh grass, foggy and mysterious atmosphere
```

**Color guide:** Dark muddy green (#4a5d3e)
**Key detail:** Should look wet and uninviting
**DALL-E tip:** "marshy wetland with standing water and reeds"

### none.png (Barren)
```
top-down view of barren rocky ground, hexagonal terrain tile for strategy game,
light brown-gray rock and dirt (#b8a896), scattered stones and gravel,
hand-painted style, lifeless terrain, no vegetation,
cracked dry earth, small boulders, inhospitable landscape
```

**Color guide:** Light tan/gray (#b8a896)
**Key detail:** Rocky, no green at all
**DALL-E tip:** "dry rocky terrain with no plants, like a moonscape"

---

## Priority 3: Height-Only Sprites (3 sprites)

These provide fallback for any terrain on these heights.

### mountains.png
```
top-down view of towering mountain peaks, hexagonal terrain tile for strategy game,
gray rocky mountains with snow-capped peaks (#8b7355 base with white snow),
hand-painted style, dramatic elevation, sharp ridges,
jagged rocky surfaces, high altitude terrain, majestic and imposing
```

**Color guide:** Brown-gray (#8b7355) with white peaks
**Key detail:** Should look TALL - use shadows to show elevation
**DALL-E tip:** "steep mountain peaks viewed from above, snow on top"

### hills.png
```
top-down view of rolling hills, hexagonal terrain tile for strategy game,
gentle elevated terrain, subtle brown-green color showing elevation,
hand-painted style, soft curves, grassy hills,
rounded slopes, pastoral highland, inviting elevation
```

**Color guide:** Lighter/more brown than lowlands
**Key detail:** Gentle slopes, not dramatic like mountains
**DALL-E tip:** "gently rolling hills from above, soft elevation changes"

### lowlands.png
```
top-down view of flat lowland terrain, hexagonal terrain tile for strategy game,
level ground, neutral earth tones, mix of grass and dirt,
hand-painted style, completely flat, no elevation features,
simple ground texture, basic terrain base
```

**Color guide:** Neutral brown/tan
**Usage note:** Rarely needed since vegetation sprites will override this

---

## Priority 4: Key Vegetation + Height Combos (9 sprites)

These provide specific visuals for important combinations.

### forest-hills.png
```
top-down view of forest on rolling hills, hexagonal terrain tile for strategy game,
dark green tree canopy with visible elevation contours, trees on slopes,
hand-painted style, hilly forest terrain, varied tree heights,
shadows showing elevation, woodland highland
```

**Combination:** Forest + elevated terrain
**Key difference from forest.png:** Show elevation with shadows/contours

### forest-mountains.png
```
top-down view of mountain forest, hexagonal terrain tile for strategy game,
mixed coniferous trees on steep rocky slopes, trees between gray rocks,
hand-painted style, alpine forest, sparse tree coverage,
rocky outcrops visible between trees, treeline environment
```

**Combination:** Forest + high elevation
**Key difference:** Sparser trees, more rocks visible, steeper terrain

### grassland-hills.png
```
top-down view of grassy hills, hexagonal terrain tile for strategy game,
bright green grass on rolling slopes, gentle elevation visible,
hand-painted style, pastoral highland meadow, curved hillsides,
vibrant grass with elevation contours, inviting grassy slopes
```

**Combination:** Grassland + gentle elevation
**Key difference from grassland.png:** Show hill curves with shading

### grassland-mountains.png
```
top-down view of mountain meadow, hexagonal terrain tile for strategy game,
grass growing between rocky outcrops, alpine meadow on steep slopes,
hand-painted style, high altitude grassland, mix of grass and rock,
scattered boulders, hardy mountain grass
```

**Combination:** Grassland + high elevation
**Key difference:** Rocky with grass patches, not full coverage

### desert-hills.png
```
top-down view of desert hills, hexagonal terrain tile for strategy game,
golden sand dunes with visible elevation, rolling sandy hills,
hand-painted style, dune ridges and valleys, dimensional sand,
dramatic dune shadows, elevated desert terrain
```

**Combination:** Desert + elevation
**Key difference from desert.png:** Dramatic dune shapes, strong shadows

### desert-mountains.png
```
top-down view of rocky desert mountains, hexagonal terrain tile for strategy game,
barren rocky peaks with golden sand patches, arid mountain terrain,
hand-painted style, harsh desert mountains, no vegetation,
sun-bleached rock formations, dramatic desert elevation
```

**Combination:** Desert + high mountains
**Key difference:** Rocky outcrops with sand between, very harsh

### tundra-hills.png
```
top-down view of frozen hills, hexagonal terrain tile for strategy game,
icy elevated terrain with snow drifts, rolling frozen hills,
hand-painted style, arctic highland, wind-swept snow,
visible elevation through snow patterns, cold and desolate
```

**Combination:** Tundra + gentle elevation

### tundra-mountains.png
```
top-down view of arctic mountain peaks, hexagonal terrain tile for strategy game,
snow-covered jagged peaks, harsh arctic mountains, pure white and gray,
hand-painted style, extreme cold environment, glacial terrain,
dramatic ice and rock, inhospitable frozen peaks
```

**Combination:** Tundra + mountains
**Key detail:** Almost pure white with gray rock showing through

### swamp-lowlands.png
```
(Note: Swamp only appears on lowlands by constraint, so swamp.png already covers this)
```

---

## Priority 5: Key Vegetation + Climate Combos (8 sprites)

These show seasonal/regional variations.

### forest-cold.png
```
top-down view of winter forest, hexagonal terrain tile for strategy game,
dark green coniferous trees with snow on branches, cold forest,
hand-painted style, snowy woodland, white snow on tree canopy,
evergreen trees in winter, cold blue tones, frosted forest
```

**Combination:** Forest + cold climate
**Key difference from forest.png:** Snow on trees, bluer tone
**Color shift:** Add cold blue tint (#aaccff influence)

### forest-hot.png
```
top-down view of tropical forest, hexagonal terrain tile for strategy game,
bright vibrant green jungle canopy, lush tropical rainforest,
hand-painted style, dense tropical vegetation, rich green,
warm color palette, humid jungle atmosphere
```

**Combination:** Forest + hot climate
**Key difference from forest.png:** Brighter, more yellowy-green
**Color shift:** Add warm orange tint (#ffaa77 influence)

### grassland-cold.png
```
top-down view of cold grassland, hexagonal terrain tile for strategy game,
pale yellow-green grass with frost patches, cold climate meadow,
hand-painted style, winter grass, some brown dead grass,
cold blue-green tones, sparse snow patches
```

**Combination:** Grassland + cold climate
**Color shift:** Desaturated, blue-tinted, some brown

### grassland-hot.png
```
top-down view of savanna grassland, hexagonal terrain tile for strategy game,
golden-yellow dry grass, warm climate plains, African savanna style,
hand-painted style, sun-baked grass, warm golden tones,
dry season grassland, sparse acacia trees optional
```

**Combination:** Grassland + hot climate
**Key difference:** More yellow/golden, looks drier
**Color shift:** Warm orange tint, less vibrant

### desert-cold.png
```
top-down view of cold desert, hexagonal terrain tile for strategy game,
pale gray-tan sand with patches of frost, cold arid terrain,
hand-painted style, frigid desert, cool color palette,
rocky cold desert, minimal sand, harsh environment
```

**Combination:** Desert + cold climate
**Key difference:** Grayer, less golden, some frost

### desert-hot.png
```
top-down view of scorching hot desert, hexagonal terrain tile for strategy game,
bright golden sand with heat shimmer effect, intense sun,
hand-painted style, extremely hot desert, vibrant yellow-orange,
sun-baked dunes, harsh sunlight, most inhospitable
```

**Combination:** Desert + hot climate
**Key difference:** Brighter, more saturated yellow/orange

### tundra-cold.png
```
(Note: Tundra already implies cold, so tundra.png covers this)
```

### swamp-cold.png
```
top-down view of frozen swamp, hexagonal terrain tile for strategy game,
partially frozen murky water with ice patches, cold wetland,
hand-painted style, icy marsh, dark green water with ice,
frozen reeds and cattails, cold swamp atmosphere
```

**Combination:** Swamp + cold climate
**Key difference from swamp.png:** Ice patches, frosted vegetation

---

## Priority 6: Specific Triple Combos (12 sprites)

Only create these if you want maximum visual variety. These are the most specific.

### forest-cold-mountains.png
```
top-down view of alpine winter forest, hexagonal terrain tile for strategy game,
snow-covered coniferous trees on steep rocky mountain slopes,
hand-painted style, alpine treeline environment, sparse trees,
heavy snow, rocky outcrops, high altitude cold forest,
dramatic elevation, harsh mountain climate
```

**Combination:** Cold forest on mountains = Alpine treeline
**Visual:** Sparse trees, lots of snow, rocky peaks visible

### forest-hot-lowlands.png
```
top-down view of tropical rainforest floor, hexagonal terrain tile for strategy game,
dense vibrant green jungle canopy on flat terrain, lush tropical vegetation,
hand-painted style, humid lowland rainforest, rich biodiversity,
thick foliage, warm humid atmosphere, jungle floor
```

**Combination:** Hot forest on flat land = Tropical rainforest

### grassland-hot-lowlands.png
```
top-down view of savanna plains, hexagonal terrain tile for strategy game,
golden-yellow dry grass on flat terrain, African savanna,
hand-painted style, sun-baked flatland, warm golden tones,
dry season plains, scattered small trees, expansive feel
```

**Combination:** Hot grassland on flat land = Savanna

### grassland-cold-mountains.png
```
top-down view of alpine meadow on peaks, hexagonal terrain tile for strategy game,
pale grass on rocky mountain terrain, high altitude meadow,
hand-painted style, cold mountain grassland, sparse vegetation,
rocky with grass patches, cold climate, thin air feel
```

**Combination:** Cold grassland on mountains = Alpine meadow

### desert-hot-lowlands.png
```
top-down view of scorching desert plains, hexagonal terrain tile for strategy game,
flat golden sand dunes, intense heat visible, classic hot desert,
hand-painted style, sun-baked flatland, vibrant warm colors,
rippling sand patterns, heat shimmer effect, extreme heat
```

**Combination:** Hot desert on flat land = Classic Sahara-style desert

### desert-cold-mountains.png
```
top-down view of cold mountain desert, hexagonal terrain tile for strategy game,
gray-tan rocky peaks with frost and sparse sand, frigid desert mountains,
hand-painted style, high altitude cold desert, minimal vegetation,
rocky outcrops with frozen sand, Himalayan desert style
```

**Combination:** Cold desert on mountains = High altitude desert

---

## Texture Overlays (Optional)

Textures are drawn as repeating patterns on top of base colors. They should be **seamless/tileable**.

### mountains-texture.png
```
seamless tileable texture of mountain peaks, gray rocky surface with snow,
triangular peak pattern, hand-painted style, transparent background,
suitable for overlay on colored base, high contrast,
sharp jagged rock texture, 256x256 seamless tile
```

**Usage:** Overlays on any mountains terrain
**Key requirement:** MUST tile seamlessly (edges match when repeated)

### hills-texture.png
```
seamless tileable texture of gentle hills, soft rolling elevation pattern,
subtle curves, hand-painted style, transparent background or light overlay,
soft shadows showing gentle slopes, 256x256 seamless tile,
rounded hill contours, pastoral feel
```

**Usage:** Overlays on any hills terrain
**Key requirement:** Subtle - shouldn't overpower base color

---

## Generation Tips by AI Tool

### For DALL-E 3 (ChatGPT Plus)

**Session approach:**
```
1. Start conversation: "I'm creating hexagonal terrain sprites for a strategy
   game. I'll need consistent style across all sprites. Hand-painted, top-down
   view, 256x256 pixels. Let's start with deep water."

2. Generate first sprite with prompt above

3. For subsequent sprites: "Now create [terrain type] in the same style as
   the previous sprite, maintaining consistent lighting and color saturation"
```

**Consistency trick:** Reference previous generations
**Iteration:** Easy - just say "make it darker/lighter/more green"

### For Midjourney

**Master prompt structure:**
```
[base prompt] --ar 1:1 --v 6 --s 400 --sref [first sprite URL]
```

**First sprite:** Generate without `--sref`
**All subsequent:** Use first sprite as style reference

**Upscaling:** Use `--uplight` for subtle upscale without over-processing

### For Stable Diffusion

**Positive prompt template:**
```
[base prompt], (masterpiece:1.2), (best quality:1.2), (detailed:1.1)
```

**Negative prompt (always include):**
```
blurry, low quality, 3d render, photograph, text, watermark, signature,
perspective view, angled view, diagonal, cropped, out of frame
```

**Model recommendations:**
- DreamShaper XL - Good for game art
- SDXL Base 1.0 - General purpose
- Train LoRA on your first 10 sprites for consistency

**Batch generation:**
```python
# Generate all base vegetation with same seed for consistency
base_seed = 123456
for terrain in ["grassland", "forest", "desert", "tundra", "swamp"]:
    generate(prompt=f"[prompt with {terrain}]", seed=base_seed + i)
```

---

## Post-Processing Checklist

After generation, process each sprite:

1. **Resize to 256x256** (if not already)
2. **Remove background** (if not transparent)
   - Use magic wand tool
   - Or AI background removal (remove.bg)
3. **Adjust levels** for consistent brightness
4. **Color correction** to match terrainData.json colors:
   - grassland → #7ec850
   - forest → #228b22
   - desert → #f4e4a6
   - etc.
5. **Save as PNG** with transparency
6. **Test in game** - generate map and verify visuals

---

## Testing Your Sprites

1. Place sprites in `assets/sprites/`
2. Refresh game
3. Generate new map (click "Reset Map")
4. Check console for:
   - ✓ Success: `Loaded sprite: assets/sprites/forest.png`
   - ✗ Failed: `Failed to load sprite: ...`
5. Zoom out to test LOD rendering
6. Hover hexes to verify highlighting works

---

## Recommended Generation Order

### Phase 1: Immediate Visual Variety (1-2 hours)
```
1. deep_water.png
2. shallow_water.png
3. grassland.png
4. forest.png
5. desert.png
```
**Result:** Basic game looks good

### Phase 2: Complete Base Coverage (2-3 hours)
```
6. tundra.png
7. swamp.png
8. none.png
```
**Result:** All vegetation types covered

### Phase 3: Height Variations (3-4 hours)
```
9. mountains.png
10. forest-mountains.png
11. grassland-mountains.png
12. forest-hills.png
13. grassland-hills.png
14. desert-hills.png
```
**Result:** Mountains/hills look distinct

### Phase 4: Climate Variations (4-6 hours)
```
15. forest-cold.png
16. forest-hot.png
17. grassland-cold.png
18. grassland-hot.png
19. desert-hot.png
20. tundra-mountains.png
```
**Result:** Seasonal/regional variety

### Phase 5: Specific Combos (6-10 hours)
```
21-32. All triple combinations
```
**Result:** Maximum visual variety

---

## Troubleshooting

### "Sprites don't look consistent"
- Use style reference (Midjourney `--sref`)
- Generate all in one session with same seed
- Post-process with same color grading

### "Can't get hexagonal shape"
- Don't worry! The clipping mask in code handles this
- Just make square sprites, they'll be clipped to hex

### "Colors don't match terrainData.json"
- Post-process in Photoshop/GIMP
- Use Color Balance or Hue/Saturation adjustment
- Target colors are in terrainData.json

### "Sprites have white borders"
- Remove background with transparency
- Or use "multiply" blend mode in post-processing

### "Textures don't tile seamlessly"
- Use GIMP: Filters → Map → Make Seamless
- Or Photoshop: Filter → Other → Offset (50%, 50%), fix seam, undo offset

---

## Example Generation Session (DALL-E)

Here's a real conversation flow:

**You:**
```
I'm creating hexagonal terrain sprites for a strategy game called Settlements.
I need a consistent hand-painted art style, top-down view, suitable for 256x256
pixel sprites. Let's start with the first sprite.

Create: top-down view of deep ocean water, hexagonal terrain tile for strategy game,
dark blue water with subtle wave patterns, deep sea color, hand-painted style,
seamless edges, isometric perspective, occasional white wave crests,
calming ocean texture, transparent background
```

**DALL-E:** [Generates deep_water.png]

**You:**
```
Perfect! That's exactly the style I want. Now create shallow coastal water
in the same art style, but make it much lighter blue (turquoise), with
visible sandy bottom showing through. Keep the same hand-painted style,
lighting, and level of detail.
```

**DALL-E:** [Generates shallow_water.png]

**You:**
```
Excellent! Now let's do grassland. Same art style as the water tiles.
Create: top-down view of lush grassland, vibrant green grass, rolling meadow
with a few small wildflowers, same hand-painted style, seamless edges,
healthy grass texture. Transparent background.
```

And continue this pattern for all sprites...

---

## Summary

**Minimum viable sprites:** 5 (water + core vegetation)
**Recommended starting set:** 8 sprites
**Full coverage:** 15-20 sprites
**Maximum variety:** 40+ sprites

**Time investment:**
- Phase 1: 1-2 hours → Game looks good
- Phase 2: +2 hours → Complete coverage
- Phase 3: +4 hours → Great variety
- Phase 4+: +10 hours → Stunning visuals

Start with Phase 1, test in game, then expand!
