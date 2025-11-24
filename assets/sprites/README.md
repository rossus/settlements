# Sprites Directory

This directory contains sprite images for terrain rendering.

## Hierarchical Sprite Fallback

The sprite system uses **hierarchical fallback** - it tries to load the most specific sprite first, then falls back to more general ones.

### Priority Order

For a hex with `vegetation: "forest"`, `climate: "hot"`, `height: "mountains"`:

1. `forest-hot-mountains.png` (most specific)
2. `forest-mountains.png`
3. `forest-hot.png`
4. `forest.png`
5. `mountains.png`
6. `hot.png`
7. Base color (if no sprites exist)

### File Naming Convention

Sprite filenames must match layer IDs from `data/terrainData.json`:

**Format:** `{vegetation}-{climate}-{height}.png`

**Examples:**
- `forest.png` - General forest sprite (all forests)
- `forest-mountains.png` - Forest on mountains
- `forest-hot-mountains.png` - Hot forest on mountains
- `grassland-hills.png` - Grassland on hills
- `desert.png` - General desert sprite

### Layer IDs Reference

From `data/terrainData.json`:

**Vegetation:**
- `none` - Barren
- `grassland` - Grassland
- `forest` - Forest
- `desert` - Desert
- `tundra` - Tundra
- `swamp` - Swamp

**Climate:**
- `hot` - Hot
- `moderate` - Moderate/Temperate
- `cold` - Cold

**Height:**
- `deep_water` - Deep Water
- `shallow_water` - Shallow Water
- `lowlands` - Lowlands (flat)
- `hills` - Hills
- `mountains` - Mountains

### Recommended Starting Set (5 sprites)

Create these first for basic visual variety:
```
forest.png
grassland.png
desert.png
deep_water.png
shallow_water.png
```

### Enhanced Set (15 sprites)

Add height variations:
```
forest.png
forest-hills.png
forest-mountains.png
grassland.png
grassland-hills.png
grassland-mountains.png
desert.png
desert-hills.png
deep_water.png
shallow_water.png
tundra.png
swamp.png
```

### Full Set (50+ sprites)

Add climate variations for maximum visual variety:
```
forest.png
forest-hot.png
forest-cold.png
forest-hills.png
forest-hot-hills.png
forest-cold-hills.png
forest-mountains.png
forest-hot-mountains.png
forest-cold-mountains.png
... (and so on for all combinations)
```

## Image Specifications

- **Format:** PNG with transparency
- **Recommended size:** 256x256 pixels
- **Aspect ratio:** Square
- **Transparency:** Recommended for blending

## Testing

1. Place sprite files in this directory
2. Refresh the game
3. Check browser console for:
   - ✓ Success: `Loaded sprite: assets/sprites/forest.png`
   - ✗ Failed: `Failed to load sprite: assets/sprites/forest.png`

## Documentation

See `docs/guides/sprite-system.md` for complete documentation.
