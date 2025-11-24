# Sprite System with Hierarchical Fallback

## Overview

The Settlements sprite system uses a **hierarchical fallback mechanism** that allows you to create sprites for specific terrain combinations while providing generic fallbacks for cases where specific sprites don't exist.

This means you can:
- Create highly specific sprites (e.g., `forest-hot-mountains.png`)
- Provide general fallbacks (e.g., `forest.png` or `mountains.png`)
- Automatically fall back to base colors when no sprites exist

## How It Works

### Priority Order

The system uses **smart priority** based on terrain type:

#### For Water Tiles (deep_water, shallow_water)
Height takes priority since water overrides vegetation:
1. **Height + Climate:** `deep_water-hot.png`
2. **Height only:** `deep_water.png`
3. **Climate only:** `hot.png`
4. **Base color:** Falls back to color defined in `terrainData.json`

#### For Barren Terrain (vegetation: "none")
Height takes priority over barren vegetation:
1. **Full combination:** `none-hot-mountains.png`
2. **Height + Climate:** `mountains-hot.png`
3. **Height only:** `mountains.png`
4. **None + Height:** `none-mountains.png`
5. **None + Climate:** `none-hot.png`
6. **None only:** `none.png`
7. **Climate only:** `hot.png`
8. **Base color:** Falls back to color

#### For Normal Vegetation (forest, grassland, etc.)
Vegetation takes priority:
1. **Full combination:** `forest-hot-mountains.png` (vegetation-climate-height)
2. **Vegetation + Height:** `forest-mountains.png`
3. **Vegetation + Climate:** `forest-hot.png`
4. **Vegetation only:** `forest.png`
5. **Height only:** `mountains.png`
6. **Climate only:** `hot.png`
7. **Base color:** Falls back to color

The system uses the **first sprite it finds** and stops searching.

**Note:** Texture overlays (hills/mountains) are **automatically disabled** when a sprite exists, preventing double-rendering.

### Example Scenarios

#### Scenario 1: Full Coverage
```
assets/sprites/
  ├── forest-hot-mountains.png     ✓ Loaded (priority 1)
  ├── forest-mountains.png          (not checked - already found)
  └── forest.png                    (not checked - already found)
```
Result: Uses `forest-hot-mountains.png`

#### Scenario 2: Partial Coverage
```
assets/sprites/
  ├── forest-mountains.png          ✓ Loaded (priority 2)
  └── forest.png                    (not checked - already found)
```
Result: Uses `forest-mountains.png` for hot forest mountains

#### Scenario 3: General Fallback
```
assets/sprites/
  └── forest.png                    ✓ Loaded (priority 4)
```
Result: Uses `forest.png` for ALL forest tiles (hot, cold, mountains, lowlands, etc.)

#### Scenario 4: No Sprites
```
assets/sprites/
  (empty)
```
Result: Uses base color from `terrainData.json`

## Directory Structure

### Recommended Structure

```
assets/
├── sprites/               # Hex fill sprites (replace entire hex)
│   ├── forest.png         # General forest sprite
│   ├── grassland.png      # General grassland sprite
│   ├── desert.png         # General desert sprite
│   ├── mountains.png      # General mountains sprite
│   ├── deep_water.png     # Deep water sprite
│   ├── shallow_water.png  # Shallow water sprite
│   │
│   ├── forest-mountains.png      # Forest on mountains
│   ├── grassland-hills.png       # Grassland on hills
│   │
│   └── forest-cold-mountains.png # Specific: cold forest on mountains
│
└── textures/              # Overlay textures (drawn on top of base color)
    ├── mountains.png      # Mountain texture overlay
    └── hills.png          # Hills texture overlay
```

### Sprites vs Textures

**Sprites:**
- Replace the hex fill entirely
- Best for terrain that has distinct visual identity
- Examples: forests, water, desert

**Textures:**
- Drawn as repeating pattern on top of base color
- Best for adding detail to existing terrain
- Examples: mountain peaks, rock patterns

## Creating Sprites

### File Naming Convention

Sprite filenames must match the layer IDs from `terrainData.json`:

```javascript
// terrainData.json
{
  "layers": {
    "vegetation": {
      "types": {
        "FOREST": {
          "id": "forest",  // ← Use this in filename
          ...
        }
      }
    },
    "height": {
      "types": {
        "MOUNTAINS": {
          "id": "mountains",  // ← Use this in filename
          ...
        }
      }
    },
    "climate": {
      "types": {
        "HOT": {
          "id": "hot",  // ← Use this in filename
          ...
        }
      }
    }
  }
}
```

Combine IDs with hyphens:
- `{vegetation}.png` → `forest.png`
- `{vegetation}-{height}.png` → `forest-mountains.png`
- `{vegetation}-{climate}-{height}.png` → `forest-hot-mountains.png`

### Image Specifications

**Recommended size:** 256x256 pixels (for a hex size of ~50-60px)

**Format:** PNG with transparency

**Aspect ratio:** Square (will be scaled to fit hex)

**Transparent backgrounds:** Recommended so hexes blend nicely

### Example Strategy

Here's a practical approach to creating sprites:

#### Level 1: Core Terrain (5-10 sprites)
Start with the most common terrains:
```
assets/sprites/
  ├── grassland.png
  ├── forest.png
  ├── desert.png
  ├── deep_water.png
  └── shallow_water.png
```

This gives you basic visual variety with minimal work.

#### Level 2: Height Variations (10-20 sprites)
Add height-specific versions:
```
assets/sprites/
  ├── grassland-hills.png
  ├── grassland-mountains.png
  ├── forest-hills.png
  ├── forest-mountains.png
  └── ...
```

This makes mountains/hills look distinct from lowlands.

#### Level 3: Climate Variations (20-50 sprites)
Add climate-specific versions for key combinations:
```
assets/sprites/
  ├── forest-cold.png           # Snow-covered forest
  ├── grassland-hot.png          # Savanna-like grassland
  ├── forest-cold-mountains.png  # Alpine forest
  └── ...
```

This adds seasonal/regional variety.

## Code Integration

### Automatic Detection

The sprite system is **fully automatic** - no code changes needed!

Simply place sprite files in `assets/sprites/` with the correct naming convention, and they'll be used automatically.

### Configuration

You can configure sprite directories in code:

```javascript
// In TerrainLayers.getSpritePaths()
const paths = TerrainLayers.getSpritePaths(
    hex.layers,
    'assets/sprites/',  // Base directory
    '.png'              // File extension
);
```

### Legacy Support

The system also supports the old method of defining sprites in `terrainData.json`:

```json
{
  "layers": {
    "vegetation": {
      "types": {
        "GRASSLAND": {
          "id": "grassland",
          "sprite": "assets/sprites/custom-grassland.png"
        }
      }
    }
  }
}
```

This still works and takes priority over hierarchical lookup if the sprite exists.

## Performance Considerations

### Preloading

All sprite paths are attempted to load at game initialization. Failed loads are silently ignored.

### Caching

Once a sprite loads successfully, it's cached. The hierarchical lookup only happens once per unique layer combination.

### Optimization Tips

1. **Use fewer, more general sprites** rather than many specific ones
   - `forest.png` handles all forests (3 climates × 3 heights = 9 combinations)
   - 9 specific sprites handle only their exact combinations

2. **Prioritize common combinations**
   - Lowlands are more common than mountains
   - Moderate climate is more common than hot/cold
   - Focus on `vegetation-lowlands` before `vegetation-climate-mountains`

3. **Use textures for details**
   - Mountains/hills can use texture overlays instead of separate sprites
   - Reduces sprite count while maintaining visual variety

## Examples

### Example 1: Minimal Sprite Set

If you only have time to create 5 sprites:

```
assets/sprites/
  ├── forest.png         # Handles all forests
  ├── grassland.png      # Handles all grasslands
  ├── desert.png         # Handles all deserts
  ├── deep_water.png     # Handles all deep water
  └── shallow_water.png  # Handles all shallow water
```

This gives you basic visual variety with minimal effort.

### Example 2: Enhanced with Height

Add 6 more sprites for height variations:

```
assets/sprites/
  ├── forest.png
  ├── forest-hills.png
  ├── forest-mountains.png
  ├── grassland.png
  ├── grassland-hills.png
  └── grassland-mountains.png
```

Now forests and grasslands look different at different elevations.

### Example 3: Full Coverage

For maximum visual variety, create specific sprites for each important combination:

```
assets/sprites/
  ├── forest.png
  ├── forest-hot.png
  ├── forest-cold.png           # Snowy forest
  ├── forest-mountains.png
  ├── forest-cold-mountains.png # Alpine forest
  └── ... (50+ sprites)
```

## Testing Your Sprites

1. Place sprite files in `assets/sprites/`
2. Start the game (or refresh if already running)
3. Look for console messages:
   - `✓ Loaded sprite: assets/sprites/forest.png` (success)
   - `✗ Failed to load sprite: assets/sprites/forest.png (will fallback to baseColor)` (missing)
4. Generate maps and verify visuals

### Debug Checklist

If sprites aren't showing:
- ✅ Check filename matches layer IDs (case-sensitive!)
- ✅ Check file extension is `.png`
- ✅ Check file path is `assets/sprites/` relative to `index.html`
- ✅ Check browser console for loading errors
- ✅ Verify image file isn't corrupted (open in image viewer)

## Advanced: Custom Directories

You can create variant sprite sets by using different directories:

```javascript
// In your code
const winterPaths = TerrainLayers.getSpritePaths(
    hex.layers,
    'assets/sprites/winter/',  // Winter themed sprites
    '.png'
);

const summerPaths = TerrainLayers.getSpritePaths(
    hex.layers,
    'assets/sprites/summer/',  // Summer themed sprites
    '.png'
);
```

This allows seasonal variations or different art styles without changing terrain data.

## Summary

The hierarchical sprite fallback system provides:
- ✅ Maximum flexibility (specific or general sprites)
- ✅ Minimal effort (start with 5 sprites, add more over time)
- ✅ Automatic fallback (no broken visuals)
- ✅ No code changes needed (just add sprite files)
- ✅ Performance optimized (caching and preloading)

Start simple with general sprites and add specific ones where needed!
