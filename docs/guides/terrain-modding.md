# Terrain Modding Guide

Create custom terrain configurations for Settlements using simple JSON files.

## Quick Start

### Creating a Custom Terrain Pack

1. **Duplicate the base terrain file:**
```bash
cp src/data/terrainData.json src/data/myTerrainPack.json
```

2. **Edit your terrain pack** (any text editor works!)

3. **Load your custom pack** - Edit `src/game.js`:
```javascript
// Change this line in the init() method:
const terrainData = await DataLoader.loadTerrainData('myTerrainPack');
```

That's it! No programming required.

---

## JSON Structure

### Basic Format

```json
{
  "layers": {
    "height": { ... },
    "climate": { ... },
    "vegetation": { ... }
  }
}
```

### Layer Structure

Each layer contains named types:

```json
"layerName": {
  "name": "Display Name",
  "types": {
    "TYPE_KEY": {
      "id": "internal_id",
      "name": "Display Name",
      ... properties ...
    }
  }
}
```

---

## Example: Sci-Fi Terrain Pack

```json
{
  "layers": {
    "height": {
      "name": "Elevation",
      "types": {
        "CRATER": {
          "id": "crater",
          "name": "Impact Crater",
          "elevation": -2,
          "baseColor": "#3d3d3d",
          "walkable": true,
          "buildable": false,
          "isWater": false,
          "generationWeight": 10,
          "description": "Ancient impact crater"
        },
        "PLAINS": {
          "id": "plains",
          "name": "Dust Plains",
          "elevation": 0,
          "baseColor": null,
          "walkable": true,
          "buildable": true,
          "isWater": false,
          "generationWeight": 50,
          "description": "Flat dusty terrain"
        }
      }
    },
    "climate": {
      "name": "Atmosphere",
      "types": {
        "TOXIC": {
          "id": "toxic",
          "name": "Toxic",
          "temperature": 2,
          "colorTint": "#88ff44",
          "generationWeight": 30,
          "description": "Toxic atmosphere"
        },
        "THIN": {
          "id": "thin",
          "name": "Thin",
          "temperature": 1,
          "colorTint": null,
          "generationWeight": 50,
          "description": "Thin atmosphere"
        }
      }
    },
    "vegetation": {
      "name": "Surface Features",
      "types": {
        "BARE": {
          "id": "bare",
          "name": "Bare Rock",
          "baseColor": "#6b6b6b",
          "movementCost": 1,
          "buildable": true,
          "generationWeight": 40,
          "description": "Exposed bedrock"
        },
        "CRYSTALS": {
          "id": "crystals",
          "name": "Crystal Field",
          "baseColor": "#4488ff",
          "movementCost": 2,
          "buildable": false,
          "generationWeight": 15,
          "description": "Alien crystal formations",
          "constraints": {
            "height": {
              "exclude": ["crater"]
            },
            "climate": {
              "require": ["toxic"]
            }
          }
        }
      }
    }
  }
}
```

---

## Property Reference

### Height Layer Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase_with_underscores) |
| `name` | string | Yes | Display name |
| `elevation` | number | Yes | -2 to 2 (affects rendering) |
| `baseColor` | string/null | Yes | Hex color or null to use vegetation color |
| `walkable` | boolean | Yes | Can units move through? |
| `buildable` | boolean | Yes | Can structures be built? |
| `isWater` | boolean | Yes | Is this water terrain? |
| `generationWeight` | number | Yes | Higher = appears more often |
| `description` | string | Yes | Tooltip text |

### Climate Layer Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `temperature` | number | Yes | 0-2 (for game logic) |
| `colorTint` | string/null | Yes | Hex color tint or null |
| `generationWeight` | number | Yes | Generation frequency |
| `description` | string | Yes | Tooltip text |

### Vegetation Layer Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `baseColor` | string | Yes | Hex color (e.g. "#ff0000") |
| `movementCost` | number | Yes | Movement speed multiplier |
| `buildable` | boolean | Yes | Can build here? |
| `generationWeight` | number | Yes | Generation frequency |
| `description` | string | Yes | Tooltip text |
| `constraints` | object | No | Constraint rules (see below) |

---

## Constraints

Control which terrain types can appear together:

### `require` - Must Match

Type will ONLY appear when another layer has one of these values:

```json
"constraints": {
  "climate": {
    "require": ["hot", "moderate"]
  }
}
```
*This terrain only appears in hot or moderate climates*

### `exclude` - Must NOT Match

Type will NOT appear when another layer has these values:

```json
"constraints": {
  "height": {
    "exclude": ["deep_water", "shallow_water"]
  }
}
```
*This terrain won't appear on water tiles*

### Combined Constraints

```json
"constraints": {
  "height": {
    "require": ["lowlands"]
  },
  "climate": {
    "exclude": ["hot"]
  }
}
```
*Must be lowlands AND must not be hot*

---

## Tips for Modding

### Color Selection

- Use hex colors: `#RRGGBB`
- Online color pickers make this easy
- Use `null` for colors to inherit from other layers

### Generation Weights

- Total doesn't need to equal 100
- Higher weight = appears more frequently
- Rare features: 5-10
- Common features: 30-50
- Very common: 50+

### Testing Your Pack

1. Load the game
2. Open browser console (F12)
3. Check for errors
4. Reset map multiple times to verify distribution

### Balancing

- Start with a copy of default terrain
- Change one thing at a time
- Test frequently
- Movement costs affect gameplay significantly

---

## Example Terrain Packs

### Fantasy Pack

```json
{
  "layers": {
    "vegetation": {
      "types": {
        "ENCHANTED_FOREST": {
          "id": "enchanted_forest",
          "name": "Enchanted Forest",
          "baseColor": "#9966ff",
          "movementCost": 1.5,
          "buildable": false,
          "generationWeight": 12,
          "description": "Magical forest glowing with ethereal light"
        }
      }
    }
  }
}
```

### Post-Apocalyptic Pack

```json
{
  "layers": {
    "vegetation": {
      "types": {
        "WASTELAND": {
          "id": "wasteland",
          "name": "Wasteland",
          "baseColor": "#8b7355",
          "movementCost": 1.2,
          "buildable": true,
          "generationWeight": 35,
          "description": "Barren wasteland"
        },
        "RADIOACTIVE_ZONE": {
          "id": "radioactive",
          "name": "Radioactive Zone",
          "baseColor": "#88ff44",
          "movementCost": 3,
          "buildable": false,
          "generationWeight": 8,
          "description": "Highly radioactive area"
        }
      }
    }
  }
}
```

---

## Troubleshooting

### Game won't load

- Check browser console (F12) for errors
- Validate JSON syntax: https://jsonlint.com/
- Ensure all required properties are present

### Terrain not appearing

- Check `generationWeight` (too low?)
- Verify constraints aren't too restrictive
- Check layer IDs match in constraints

### Colors look wrong

- Ensure hex colors start with `#`
- Use 6-digit hex: `#RRGGBB`
- Test colors online first

---

## Sharing Your Terrain Pack

1. **Name your file** descriptively: `terrain_scifi.json`
2. **Test thoroughly** - reset map many times
3. **Document changes** - create a README
4. **Share!** - GitHub, forums, etc.

---

## Advanced: Multiple Configs at Runtime

Create a config selector (future feature):

```javascript
// In game.js
const configName = this.selectedConfig || 'terrainData';
const terrainData = await DataLoader.loadTerrainData(configName);
```

This allows users to switch terrain packs without editing code!

---

## Summary

**To create a mod:**
1. Copy `src/data/terrainData.json`
2. Edit in any text editor
3. Update `game.js` to load your file
4. Test and share!

**No programming knowledge required!**

JSON is human-readable and easy to edit. Just follow the examples and have fun creating new worlds!
