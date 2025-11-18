# Settlements Assets

This folder contains optional sprites and textures for terrain rendering.

## Folder Structure

```
assets/
├── sprites/     # Full hex replacement images
│   ├── deep_water.png
│   ├── grassland.png
│   └── ...
└── textures/    # Overlay patterns (tiled on base color)
    ├── mountains.png
    └── ...
```

## How to Use

### 1. Add Your Images

Place your sprite/texture images in the appropriate folder:
- **Sprites** (`sprites/`): Full hex images that completely replace the base color
- **Textures** (`textures/`): Tileable patterns overlaid on the base color

### 2. Update terrain JSON

Edit `data/terrainData.json` and add sprite/texture paths to terrain types:

```json
{
  "GRASSLAND": {
    "id": "grassland",
    "baseColor": "#7ec850",
    "sprite": "assets/sprites/grassland.png",
    ...
  },
  "MOUNTAINS": {
    "id": "mountains",
    "baseColor": "#8b7355",
    "texture": "assets/textures/mountains.png",
    ...
  }
}
```

### 3. Optional: Shore Sprites

Add a shore sprite at the root level:

```json
{
  "shoreSprite": "assets/sprites/shore.png",
  "layers": {
    ...
  }
}
```

## Image Specifications

### Sprites
- **Recommended size**: 64x64 to 128x128 pixels
- **Format**: PNG with transparency
- **Shape**: Hexagonal or circular (will be clipped to hex shape)
- **Purpose**: Complete hex replacement

### Textures
- **Recommended size**: 32x32 to 64x64 pixels (tileable)
- **Format**: PNG with transparency
- **Purpose**: Pattern overlay on base color

## Fallback Behavior

- If a sprite/texture path is `null` or the file fails to load, the system automatically falls back to `baseColor`
- No errors thrown - seamless fallback
- Check browser console for load success/failure messages

## Example Workflow

1. Create a 64x64 PNG sprite for grassland
2. Save it as `assets/sprites/grassland.png`
3. Update `data/terrainData.json`:
   ```json
   "GRASSLAND": {
     "sprite": "assets/sprites/grassland.png",
     ...
   }
   ```
4. Refresh the game - sprite loads automatically!

## Tips

- **Performance**: Smaller images load faster
- **Consistency**: Keep all sprites the same size for uniform look
- **Transparency**: Use alpha channel for smooth hex edges
- **Testing**: Set sprite to `null` to quickly revert to base colors
