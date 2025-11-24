# Shore Sprites Guide

Complete guide for creating and using shore sprites in Settlements.

## What Are Shore Sprites?

Shore sprites are **thin horizontal strips** drawn along the borders between water and land hexes. They create beach/coastline effects.

**Not tile sprites** - They're edge decorations that:
- Are rotated to match edge direction
- Are stretched to fit edge length
- Appear between water and land tiles

---

## Quick Setup

### 1. Create Shore Sprite

**Recommended dimensions:** 512x32 pixels (16:1 aspect ratio)
- Width: 512px (will be stretched to fit edge length)
- Height: 32px (determines border thickness)
- Format: PNG with transparency

### 2. Save Sprite

Place in: `assets/sprites/shore.png`

### 3. Configure

Edit `data/terrainData.json`:
```json
{
  "shoreSprite": "assets/sprites/shore.png",
  ...
}
```

### 4. Test

Refresh game → shores should use your sprite instead of colored lines!

---

## AI Generation Prompts

### Recommended: Simple Sand Strip

**DALL-E 3:**
```
A thin horizontal strip of sandy beach shoreline, top-down view,
512x32 pixels, golden sand (#f4e4a6) beach border between water and land,
hand-painted style, seamless left and right edges for tiling,
decorative beach border for strategy game, transparent background,
centered horizontally
```

**Midjourney:**
```
thin horizontal beach shoreline strip, top-down view, 512x32 pixels,
golden sand border, seamless tileable left-right edges,
hand-painted game border decoration, beach coastline --ar 16:1 --v 6
```

### Advanced: Sand with Foam

**DALL-E 3:**
```
A thin horizontal beach border strip, top-down view, 512x32 pixels,
golden sand on top half, white foam/waves on bottom half,
water meets land transition, hand-painted style,
seamless left-right edges, transparent background
```

**Midjourney:**
```
thin horizontal beach border, sand and wave foam, 512x32 pixels,
water meets shore transition, top-down view,
hand-painted style, seamless edges --ar 16:1 --v 6
```

### Decorative: Pebbles and Details

**DALL-E 3:**
```
Detailed beach shoreline strip, top-down view, 512x32 pixels,
golden sand with small pebbles and tiny shells,
decorative coastal border, hand-painted game art style,
seamless left-right tiling, transparent background
```

---

## Sprite Design Guidelines

### Dimensions

**Width:** 256-512px recommended
- 256px: Minimal, faster to load
- 512px: High detail, better quality when zoomed

**Height:** 16-48px recommended
- 16px: Thin, subtle border
- 32px: Standard, good visibility
- 48px: Thick, prominent border

**Aspect Ratio:** Wide horizontal strip (8:1 to 16:1)

### Layout

```
┌────────────────────────────────────────────────┐
│ Transparent/Water Side (8px)                   │
├────────────────────────────────────────────────┤
│ Main Beach/Sand Content (16px)                 │
├────────────────────────────────────────────────┤
│ Transparent/Land Side (8px)                    │
└────────────────────────────────────────────────┘
     512px width × 32px height
```

### Seamless Edges

**Critical:** Left and right edges must match perfectly!

The sprite will be:
1. Rotated to match edge angle (any angle)
2. Stretched horizontally to fit edge length
3. Repeated along coastlines

**Test seamless tiling:**
- Place two copies side-by-side
- Check for visible seam
- Adjust edge pixels to match

### Color Guidelines

**Golden Sand:** #f4e4a6 (default sand color)
**Variations:**
- Light sand: #fef4d4
- Dark sand: #d4c896
- Rocky beach: #b8a896

**Contrast:** Should be visible against both water and land colors

### Transparency

**Top edge (water side):** Gradual fade to transparent
**Bottom edge (land side):** Gradual fade to transparent
**Center:** Opaque sand/beach content

This creates smooth blending with terrain.

---

## Visual Styles

### Style 1: Minimal Sand Strip
```
Simple golden sand, no details
Best for: Clean, minimalist look
```

**Prompt addition:** `simple golden sand strip, no extra details, clean minimal`

### Style 2: Wave Foam
```
White foam where water meets sand
Best for: Dynamic, active coastlines
```

**Prompt addition:** `white wave foam on water edge, gentle waves lapping shore`

### Style 3: Pebble Beach
```
Small stones and pebbles in sand
Best for: Rocky, natural coastlines
```

**Prompt addition:** `small pebbles and stones scattered in sand, rocky beach`

### Style 4: Tropical Beach
```
Bright white sand with palm shadows
Best for: Tropical, paradise feel
```

**Prompt addition:** `bright white tropical sand, occasional palm tree shadows`

### Style 5: Nordic Rocky Shore
```
Dark rocky coast with minimal sand
Best for: Cold, harsh climates
```

**Prompt addition:** `dark rocks and boulders, minimal sand, nordic coastline`

---

## Technical Details

### How Sprites Are Rendered

For each water/land border:

1. **Calculate shared edge** between hexes (two corner points)
2. **Calculate edge length:** Distance between corners
3. **Calculate edge angle:** Rotation needed
4. **Calculate midpoint:** Center of edge
5. **Draw sprite:**
   - Translate canvas to midpoint
   - Rotate canvas to edge angle
   - Draw sprite stretched to edge length
   - Maintain aspect ratio for height

### Stretching Behavior

```javascript
// Sprite is stretched horizontally to fit edge length
const edgeLength = calculateDistance(corner1, corner2);
const spriteHeight = sprite.height * (edgeLength / sprite.width);

ctx.drawImage(sprite,
    -edgeLength / 2,    // Centered horizontally
    -spriteHeight / 2,  // Centered vertically
    edgeLength,         // Stretched to edge
    spriteHeight        // Scaled proportionally
);
```

**Result:** Sprite always fits perfectly along edge, regardless of edge length or angle.

### Performance

- One sprite draw call per water/land border
- Sprites are cached (loaded once)
- Viewport culling applies (only visible shores rendered)
- No performance difference from colored lines

---

## Examples & Use Cases

### Example 1: Archipelago Map
```
Many small islands = many coastlines
Use: Thin (16px) subtle sand sprite
Why: Lots of borders, keep it light
```

### Example 2: Continental Map
```
Large landmasses = long coastlines
Use: Standard (32px) detailed sprite with foam
Why: Fewer borders, can be more detailed
```

### Example 3: Ocean World
```
Mostly water, few land areas
Use: Thick (48px) prominent beach sprite
Why: Emphasize rare land areas
```

---

## Testing Your Shore Sprite

### Step 1: Visual Check
1. Place `shore.png` in `assets/sprites/`
2. Update `terrainData.json` with sprite path
3. Refresh browser
4. Generate map with "Reset Map"
5. Find water/land borders
6. Verify sprite appears correctly

### Step 2: Check All Angles
Shore sprites must look good at any angle:
- Horizontal edges (east-west)
- Vertical edges (north-south)
- Diagonal edges (northeast, northwest, etc.)

Zoom in and check each edge type.

### Step 3: Check Seamless Tiling
Look at long straight coastlines:
- Should appear as continuous line
- No visible breaks or seams
- Consistent thickness

### Step 4: Check Colors
- Visible against dark water (#4a90e2)
- Visible against light land colors
- Doesn't clash with terrain sprites

---

## Troubleshooting

### Sprite Not Showing

**Check console for errors:**
```
✓ Success: "Loaded sprite: assets/sprites/shore.png"
✗ Failed: "Failed to load sprite: assets/sprites/shore.png"
```

**Common issues:**
1. ❌ Wrong file path in terrainData.json
2. ❌ File named incorrectly (case-sensitive!)
3. ❌ File not in `assets/sprites/` directory
4. ❌ PNG corrupted or invalid format

### Sprite Looks Stretched/Distorted

**Issue:** Aspect ratio is wrong

**Solutions:**
- Use wider sprite (512x32 instead of 256x32)
- Adjust height to be proportional (1:8 to 1:16 ratio)
- Check sprite dimensions match what you intended

### Sprite Has Visible Seams

**Issue:** Edges don't tile seamlessly

**Solutions:**
- Use GIMP: Filters → Map → Make Seamless
- Manually edit edges to match
- Generate new sprite with "seamless tileable" in prompt

### Sprite Too Thick/Thin

**Issue:** Height doesn't match desired thickness

**Solutions:**
- Adjust sprite height (16px = thin, 48px = thick)
- Regenerate sprite with different dimensions
- Use image editor to resize height only

### Sprite Wrong Color

**Issue:** Doesn't match terrain palette

**Solutions:**
- Use golden sand (#f4e4a6) as base
- Post-process in Photoshop/GIMP with color adjustment
- Regenerate with specific color in prompt

---

## Advanced: Multiple Shore Types

Currently, only one shore sprite is supported. Future enhancement could add:

### Shore Variants by Climate
```
assets/sprites/shore-hot.png    (tropical beach)
assets/sprites/shore-cold.png   (icy shore)
assets/sprites/shore.png        (default)
```

### Shore Variants by Depth
```
assets/sprites/shore-deep.png   (deep water border)
assets/sprites/shore-shallow.png (shallow water border)
```

This would require code changes to detect which variant to use.

---

## Comparison: Sprite vs No Sprite

### Without Shore Sprite (Current Default)
- Solid colored line (#f4e4a6 sand color)
- 6px thick
- Rounded ends
- Simple but functional

### With Shore Sprite
- Detailed beach texture
- Variable thickness based on sprite
- Can include foam, pebbles, shadows
- Much more visually appealing

**Recommendation:** Always use a shore sprite for better visuals!

---

## Quick Reference

**File Location:** `assets/sprites/shore.png`

**Configuration:** `data/terrainData.json` → `"shoreSprite": "assets/sprites/shore.png"`

**Dimensions:** 512x32 pixels recommended

**Format:** PNG with transparency

**Color:** Golden sand #f4e4a6

**Testing:** Generate map with water/land borders

**Fallback:** Colored lines if sprite missing

---

## Example Workflow

### Complete Shore Sprite Creation (30 minutes)

**1. Generate Base Sprite (10 min)**
- Use DALL-E 3 or Midjourney with prompt above
- Download 512x32 PNG

**2. Post-Process (10 min)**
- Open in Photoshop/GIMP
- Adjust colors to match terrain palette
- Add transparency to edges
- Test seamless tiling (offset 50%)
- Save as PNG

**3. Integrate (5 min)**
- Place in `assets/sprites/shore.png`
- Update `terrainData.json`
- Refresh browser

**4. Test & Iterate (5 min)**
- Generate map
- Check all angles
- Adjust thickness/color if needed
- Regenerate or edit as needed

**Done!** Your coastlines now have beautiful beach borders.

---

## Summary

**Shore sprites** are thin horizontal strips (512x32) drawn along water/land borders. They're automatically rotated and stretched to fit each edge.

**Key points:**
- ✅ Wide horizontal strip (16:1 aspect ratio)
- ✅ Seamless left-right edges
- ✅ Golden sand color (#f4e4a6)
- ✅ Transparent top/bottom edges
- ✅ PNG format
- ✅ Placed in `assets/sprites/`

**Benefits:**
- Much better visuals than colored lines
- No performance cost
- Easy to update (just replace PNG)
- Works at any zoom level

Start with a simple golden sand strip, then add details (foam, pebbles) as desired!
