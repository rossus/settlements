# Textures Directory

This directory contains texture overlays for terrain rendering.

## Sprites vs Textures

**Sprites** (in `assets/sprites/`):
- Replace the hex fill entirely
- Best for terrain with distinct visual identity
- Examples: forests, water, desert

**Textures** (this directory):
- Drawn as **repeating pattern** on top of base color
- Best for adding detail to existing terrain
- Examples: mountain peaks, rock patterns, grass texture

## Hierarchical Texture Fallback

Same as sprites - textures support hierarchical fallback:

### Priority Order

For a hex with `vegetation: "forest"`, `climate: "hot"`, `height: "mountains"`:

1. `forest-hot-mountains.png`
2. `forest-mountains.png`
3. `forest-hot.png`
4. `forest.png`
5. `mountains.png`
6. `hot.png`
7. No texture (solid color)

### File Naming Convention

Same as sprites - use layer IDs from `data/terrainData.json`:

**Format:** `{vegetation}-{climate}-{height}.png`

**Examples:**
- `mountains.png` - Mountain peaks texture (all mountains)
- `hills.png` - Hills texture (all hills)
- `forest-mountains.png` - Forest-specific mountain texture

## Common Texture Use Cases

### Height Textures

Add visual detail to elevation:
```
hills.png         # Rolling hill texture
mountains.png     # Mountain peaks texture
```

These will overlay on the base vegetation color.

### Vegetation Textures

Add subtle detail to vegetation:
```
forest.png        # Tree canopy pattern
grassland.png     # Grass blade pattern
```

## Image Specifications

- **Format:** PNG with transparency
- **Recommended size:** 128x128 or 256x256 pixels
- **Tiling:** Must tile seamlessly (repeating pattern)
- **Transparency:** Use alpha channel for blending

### Creating Seamless Textures

Textures are drawn as repeating patterns using `ctx.createPattern(texture, 'repeat')`.

Ensure edges tile seamlessly:
1. Create texture in image editor
2. Use "Offset" filter (50% horizontal, 50% vertical)
3. Fix visible seam in center
4. Undo offset - texture now tiles seamlessly

## Testing

1. Place texture files in this directory
2. Refresh the game
3. Textures appear as patterns overlaid on base colors
4. Zoom in to see pattern detail

## Documentation

See `docs/guides/sprite-system.md` for complete documentation.
