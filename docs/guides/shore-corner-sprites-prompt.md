# ChatGPT Prompt for Shore Corner Sprites

Use this prompt with ChatGPT (with image upload) to generate corner variants of your shore sprite.

---

## Prompt to Use with ChatGPT

```
I'm creating shore sprites for a hexagonal strategy game. I have a base shore sprite
that represents a straight beach border between water and land. I need you to help me
create corner/angle variants of this sprite.

[ATTACH YOUR shore.png IMAGE HERE]

Context:
- This is a top-down view beach/shore border for a hexagonal grid game
- The sprite shows: top half = land side (dry sand/beach), bottom half = water side (wet sand/foam)
- Currently, this sprite is stretched along hex edges, which works but looks distorted at corners
- I need corner sprites for better visual quality at hexagon vertices

I need you to create TWO corner variants:

1. NARROW ANGLE CORNER (60-90 degrees)
   - When two shore edges meet at an acute/narrow angle
   - Imagine two hexagon edges meeting at a pointy peninsula or narrow inlet
   - The sprite should show beach sand curving inward at a sharp angle
   - Dimensions: 128x128 pixels
   - Top-left to bottom-right orientation (can be rotated in code)

2. WIDE ANGLE CORNER (120-150 degrees)
   - When two shore edges meet at an obtuse/wide angle
   - Imagine two hexagon edges meeting at a rounded bay or wide beach
   - The sprite should show beach sand curving outward at a gentle angle
   - Dimensions: 128x128 pixels
   - Top-left to bottom-right orientation (can be rotated in code)

Technical Requirements:
- Match the EXACT color palette, style, and texture from my base shore sprite
- Seamless edges so corners blend perfectly with straight shore segments
- PNG format with transparency
- Top side = land, bottom side = water (same convention as base sprite)
- Hand-painted style matching the original

Visual Design:
- Narrow corner: Sharp, pointed transition (like a cape or peninsula tip)
- Wide corner: Smooth, rounded transition (like a bay or beach curve)
- Both should look natural when placed at hexagon corners

Please generate:
1. Narrow angle corner sprite (128x128, PNG)
2. Wide angle corner sprite (128x128, PNG)
3. Brief description of how you adapted the original sprite style

Make sure the colors, texture detail, and artistic style perfectly match my original
shore sprite so they blend seamlessly when used together.
```

---

## What You'll Get Back

ChatGPT will generate:
1. **narrow-corner.png** (128x128) - For acute angles
2. **wide-corner.png** (128x128) - For obtuse angles

Both will match your original sprite's style.

---

## Alternative: More Specific Angle Variants

If you want more control, use this expanded prompt:

```
I need FOUR corner sprites for different angle ranges:

1. SHARP CORNER (60-75 degrees)
   - Very acute angle
   - Pointy peninsula or narrow inlet
   - File: shore-corner-60.png

2. MODERATE CORNER (75-105 degrees)
   - Medium angle, close to 90 degrees
   - Standard corner
   - File: shore-corner-90.png

3. WIDE CORNER (105-135 degrees)
   - Obtuse angle
   - Gentle bay curve
   - File: shore-corner-120.png

4. VERY WIDE CORNER (135-165 degrees)
   - Nearly straight, slight curve
   - Shallow bay or beach
   - File: shore-corner-150.png

All 128x128 pixels, PNG format, matching my base sprite style.
```

---

## How to Use with ChatGPT

### Step 1: Prepare Your Image
1. Open your `shore.png` in an image viewer
2. Take a screenshot or have the file ready

### Step 2: Start ChatGPT Conversation
1. Go to ChatGPT (Plus required for image upload)
2. Click the image upload button (📎)
3. Upload your `shore.png`

### Step 3: Send the Prompt
1. Copy the prompt above
2. Paste into ChatGPT
3. Send

### Step 4: Review and Download
1. ChatGPT will generate 2-4 corner sprites
2. Review them - check if style matches
3. Download each sprite
4. Save to `assets/sprites/corners/`

### Step 5: Iterate if Needed
If the style doesn't match perfectly, say:
```
The corners look good but the sand texture is too smooth/rough/light/dark.
Can you adjust to better match the original? The original has [describe specific features].
```

---

## Visual Reference for ChatGPT

To help ChatGPT understand, you can also describe your sprite like this:

**Add to prompt if needed:**
```
Visual description of my shore sprite:
- Color: Golden sand (#f4e4a6) transitioning to [describe your water color]
- Texture: [smooth/grainy/detailed/painted]
- Top edge: [dry sand/grass edge/beach details]
- Bottom edge: [wet sand/wave foam/water transition]
- Style: [hand-painted/pixel art/realistic/stylized]
- Details: [small pebbles/shells/foam patterns/etc.]
```

---

## Expected Results

### Narrow Corner (60-90°)
```
     Land
      /\
     /  \
    / ▓▓ \     ← Sharp sand curve
   / ▓▓▓▓ \
  /  ▓▓▓▓  \
Water      Water
```

### Wide Corner (120-150°)
```
     Land
    ______
   /      \
  / ▓▓▓▓▓▓ \   ← Gentle sand curve
 / ▓▓▓▓▓▓▓▓ \
/            \
Water        Water
```

---

## After Getting Corner Sprites

Once you have the corner sprites, I'll need to:

1. **Implement corner detection** in rendering code
2. **Determine angle at each hex corner** (count water/land neighbors)
3. **Select appropriate corner sprite** based on angle
4. **Rotate sprite** to match corner orientation
5. **Blend with straight edge sprites**

This will require code changes to detect hexagon corners where shore edges meet.

---

## Quick Test After Generation

Before implementing in code, test visually:

1. Open image editor (Photoshop/GIMP)
2. Create test layout:
   ```
   [straight] -> [corner] -> [straight]
   ```
3. Check if:
   - Colors match perfectly
   - Edges align seamlessly
   - Style is consistent
   - Corners look natural

If corners don't blend well, adjust in image editor or regenerate with ChatGPT.

---

## Fallback: Manual Creation

If ChatGPT results aren't perfect, you can manually create corners:

### In Photoshop/GIMP:

1. Open `shore.png`
2. Create 128x128 canvas
3. Copy sections of shore sprite
4. Use **Warp/Distort** tool to curve the shore
5. For narrow corner: curve inward sharply
6. For wide corner: curve outward gently
7. Clone stamp to fill in gaps
8. Match textures and colors
9. Save as PNG with transparency

### Using AI Image Editors:

Alternatively, use AI tools like:
- **Photoshop Generative Fill** - Expand/curve shore naturally
- **DALL-E Outpainting** - Extend shore at an angle
- **Stable Diffusion Inpainting** - Fill in corner regions

---

## Summary

**Simple approach:** 2 corner sprites (narrow + wide)
**Advanced approach:** 4 corner sprites (60°, 90°, 120°, 150°)

**Prompt structure:**
1. Context (hexagonal game, shore borders)
2. Attach base sprite image
3. Describe what you need (corner variants)
4. Specify angles and dimensions
5. Request style matching

**Key point:** Upload your actual shore sprite image so ChatGPT can match the style exactly!
