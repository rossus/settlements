# Extending the Terrain System

A practical guide for adding new terrain layers and types to Settlements.

## Table of Contents

- [Understanding the Layered System](#understanding-the-layered-system)
- [Data-Driven Architecture](#data-driven-architecture)
- [How to Add a New Type to an Existing Layer](#how-to-add-a-new-type-to-an-existing-layer)
- [How to Add a New Layer](#how-to-add-a-new-layer)
- [Constraint System Reference](#constraint-system-reference)
- [Testing Your Changes](#testing-your-changes)

---

## Understanding the Layered System

Settlements uses a **layered terrain system** where each hex has multiple independent attributes:

```javascript
{
  height: 'lowlands',      // Height layer
  climate: 'moderate',     // Climate layer
  vegetation: 'grassland'  // Vegetation layer
}
```

The **constraint-based validation system** automatically ensures realistic terrain combinations during generation.

---

## Data-Driven Architecture

**NEW:** Terrain data is now separated from logic!

### File Structure

- **`data/terrainData.json`** - All terrain layer and type definitions (DATA)
- **`src/core/terrainLayers.js`** - Validation and generation logic (CODE)

### Benefits

✅ **Easy Modding** - Change terrain types without touching code
✅ **Multiple Configurations** - Load different terrain sets (fantasy, sci-fi, etc.)
✅ **Balance Testing** - Adjust properties and weights easily
✅ **Clean Separation** - Data vs logic clearly separated

### What Goes Where

**terrainData.js (declarations):**
- Layer definitions
- Type properties (colors, weights, elevation)
- Constraint rules (require/exclude)

**terrainLayers.js (abstract logic):**
- Constraint validation engine
- Random generation algorithms
- Color blending calculations
- Composite type generation

---

## How to Add a New Type to an Existing Layer

### Example: Adding "Jungle" Vegetation Type

**Step 1: Open `data/terrainData.json`**

**Step 2: Add the new type to the appropriate layer**

Find the `vegetation` layer in the `terrainData` object and add your new type:

```javascript
const terrainData = {
  "layers": {
    "height": { /* ... */ },
    "climate": { /* ... */ },
    "vegetation": {
      "name": "Vegetation",
      "types": {
        // ... existing types (NONE, GRASSLAND, FOREST, etc.) ...

        "JUNGLE": {
          "id": "jungle",
          "name": "Jungle",
          "baseColor": "#2d5016",
          "movementCost": 2.5,
          "buildable": false,
          "generationWeight": 15,
          "description": "Dense tropical jungle",
          "constraints": {
            "height": {
              "exclude": ["deep_water", "shallow_water", "mountains"]
            },
            "climate": {
              "require": ["hot"]    // Only in hot climates
            }
          }
        }
      }
    }
  }
};
```

**Step 3: Add debug view color (optional)**

In `src/rendering/mapRenderer.js`, find `renderDebugVegetation()` and add:

```javascript
const VEGETATION_COLORS = {
    // ... existing colors ...
    'jungle': '#2d5016'
};
```

**That's it!** The constraint system automatically integrates your new type. No code changes needed!

---

## How to Add a New Layer

### Example: Adding a "Moisture" Layer

Adding a new layer requires updates to both data and code files. Most changes are in the data file!

### Step 1: Define the Layer in `data/terrainData.json`

Add your new layer to the `terrainData.layers` object:

```javascript
const terrainData = {
  "layers": {
    "height": { /* ... */ },
    "climate": { /* ... */ },
    "vegetation": { /* ... */ },

    // NEW LAYER
    "moisture": {
      "name": "Moisture",
      "types": {
        "ARID": {
          "id": "arid",
          "name": "Arid",
          "baseColor": "#f4e4a6",
          "generationWeight": 20,
          "description": "Dry climate"
          // No constraints for first layer type
        },
        "NORMAL": {
          "id": "normal",
          "name": "Normal",
          "baseColor": "#a8d5a8",
          "generationWeight": 60,
          "description": "Average moisture"
        },
        "WET": {
          "id": "wet",
          "name": "Wet",
          "baseColor": "#7bb8d4",
          "generationWeight": 20,
          "description": "High moisture",
          "constraints": {
            "height": {
              "exclude": ["deep_water", "shallow_water"]
            }
          }
        }
      }
    }
  }
};
```

### Step 2: Update Generation Order in `generateRandomLayers()`

In `src/core/terrainLayers.js`, update the generation method:

```javascript
generateRandomLayers() {
    const layers = {};

    // Generate in order (independent layers first)
    layers.height = this.getWeightedRandomLayer('height');
    layers.climate = this.getWeightedRandomLayer('climate');
    layers.moisture = this.getWeightedRandomLayer('moisture');  // NEW

    // Vegetation last (depends on other layers)
    const validVegetation = this.getValidTypes('vegetation', layers);
    if (validVegetation.length === 0) {
        layers.vegetation = 'none';
    } else {
        layers.vegetation = this.getWeightedRandomType('vegetation', validVegetation);
    }

    return layers;
}
```

### Step 3: Update Constraints in Other Layers

In `data/terrainData.json`, add constraints to existing types that should interact with the new layer:

```javascript
"SWAMP": {
  "id": "swamp",
  "name": "Swamp",
  // ... other properties ...
  "constraints": {
    "height": {
      "require": ["lowlands"]
    },
    "climate": {
      "exclude": ["hot"]
    },
    "moisture": {                    // NEW CONSTRAINT
      "require": ["wet", "normal"]   // Swamps need moisture
    }
  }
}
```

### Step 4: Update Composite Type Generation in `getCompositeType()`

In `src/core/terrainLayers.js`, update the composite type generation:

```javascript
getCompositeType(layers) {
    const heightType = this.layers.height.types[
        Object.keys(this.layers.height.types).find(
            key => this.layers.height.types[key].id === layers.height
        )
    ];
    const climateType = this.layers.climate.types[
        Object.keys(this.layers.climate.types).find(
            key => this.layers.climate.types[key].id === layers.climate
        )
    ];
    const vegetationType = this.layers.vegetation.types[
        Object.keys(this.layers.vegetation.types).find(
            key => this.layers.vegetation.types[key].id === layers.vegetation
        )
    ];
    const moistureType = this.layers.moisture.types[  // NEW
        Object.keys(this.layers.moisture.types).find(
            key => this.layers.moisture.types[key].id === layers.moisture
        )
    ];

    // Generate composite name
    const name = `${climateType.name} ${vegetationType.name} ${heightType.name} (${moistureType.name})`;

    // ... rest of the method
}
```

### Step 5: Add Debug View (Optional)

In `src/rendering/mapRenderer.js`, add a debug rendering method:

```javascript
renderDebugMoisture(ctx, offsetX, offsetY, highlightHex, showGrid) {
    const MOISTURE_COLORS = {
        'arid': '#f4e4a6',
        'normal': '#a8d5a8',
        'wet': '#7bb8d4'
    };

    this.grid.hexes.forEach(hex => {
        const pos = this.grid.hexToPixel(hex);
        const corners = this.grid.getHexCorners(pos.x + offsetX, pos.y + offsetY);

        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        const moistureColor = MOISTURE_COLORS[hex.layers.moisture] || '#888888';
        ctx.fillStyle = moistureColor;
        ctx.fill();

        if (highlightHex && hex.equals(highlightHex)) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}
```

### Step 6: Update UI

In `index.html`, add the debug option:

```html
<select id="debugViewSelect" class="debug-view-select">
    <option value="">Debug: Off</option>
    <option value="landmass">Debug: Landmass</option>
    <option value="heightmap">Debug: Heightmap</option>
    <option value="climate">Debug: Climate</option>
    <option value="vegetation">Debug: Vegetation</option>
    <option value="moisture">Debug: Moisture</option>  <!-- NEW -->
</select>
```

In `src/game.js`, add the case:

```javascript
changeDebugView(view) {
    this.debugView = view || null;
    this.render();

    if (view === 'landmass') {
        this.updateStatus('Debug view: Landmass (water vs land)');
    } else if (view === 'heightmap') {
        this.updateStatus('Debug view: Heightmap (elevation levels)');
    } else if (view === 'climate') {
        this.updateStatus('Debug view: Climate (temperature zones)');
    } else if (view === 'vegetation') {
        this.updateStatus('Debug view: Vegetation (surface types)');
    } else if (view === 'moisture') {  // NEW
        this.updateStatus('Debug view: Moisture (humidity levels)');
    } else {
        this.updateStatus('Debug view disabled');
    }
}
```

In `src/rendering/mapRenderer.js`, update the `render()` method:

```javascript
render(ctx, offsetX, offsetY, highlightHex, showGrid, debugView) {
    if (debugView === 'landmass') {
        this.renderDebugLandmass(ctx, offsetX, offsetY, highlightHex, showGrid);
    } else if (debugView === 'heightmap') {
        this.renderDebugHeightmap(ctx, offsetX, offsetY, highlightHex, showGrid);
    } else if (debugView === 'climate') {
        this.renderDebugClimate(ctx, offsetX, offsetY, highlightHex, showGrid);
    } else if (debugView === 'vegetation') {
        this.renderDebugVegetation(ctx, offsetX, offsetY, highlightHex, showGrid);
    } else if (debugView === 'moisture') {  // NEW
        this.renderDebugMoisture(ctx, offsetX, offsetY, highlightHex, showGrid);
    } else {
        this.renderNormalView(ctx, offsetX, offsetY, highlightHex, showGrid);
    }
}
```

---

## Constraint System Reference

### Constraint Types

**`require`** - Type MUST be one of these values:
```javascript
constraints: {
    climate: {
        require: ['hot', 'moderate']  // Only hot or moderate climates
    }
}
```

**`exclude`** - Type MUST NOT be any of these values:
```javascript
constraints: {
    height: {
        exclude: ['deep_water', 'shallow_water']  // No water
    }
}
```

### Constraint Examples

**Simple requirement:**
```javascript
// Tundra only in cold climates
constraints: {
    climate: {
        require: ['cold']
    }
}
```

**Multiple exclusions:**
```javascript
// Forest not on water or mountains
constraints: {
    height: {
        exclude: ['deep_water', 'shallow_water', 'mountains']
    }
}
```

**Combined constraints:**
```javascript
// Swamp: must be lowlands, not hot
constraints: {
    height: {
        require: ['lowlands']
    },
    climate: {
        exclude: ['hot']
    }
}
```

**No constraints (appears anywhere):**
```javascript
// Barren ground can appear anywhere
NONE: {
    id: 'none',
    name: 'Barren',
    // ... properties ...
    // No constraints property = always valid
}
```

### How Constraints Work

The constraint validation happens automatically:

1. **During generation**: `generateRandomLayers()` calls `getValidTypes()` for each layer
2. **Validation**: `isTypeValid()` checks all constraints against current layer values
3. **Fallback**: If no valid types exist, defaults to sensible value (e.g., 'none' for vegetation)

---

## Testing Your Changes

### Quick Test

Open `index.html` in a browser and:

1. **Reset the map** several times - your new type should appear
2. **Use debug views** - verify your type displays correctly
3. **Check combinations** - verify constraints work (e.g., tundra only in cold areas)

### Console Test

Open browser console and test:

```javascript
// Check if type exists
TerrainLayers.getLayerType('vegetation', 'tundra')

// Test validation
TerrainLayers.isTypeValid('vegetation', 'tundra', {
    height: 'lowlands',
    climate: 'cold'
})  // Should return true

TerrainLayers.isTypeValid('vegetation', 'tundra', {
    height: 'lowlands',
    climate: 'hot'
})  // Should return false (constraint violation)

// Generate test terrain
TerrainLayers.generateRandomLayers()
```

### Verify Generation Distribution

```javascript
// Count how often your type appears
let count = 0;
for (let i = 0; i < 1000; i++) {
    const layers = TerrainLayers.generateRandomLayers();
    if (layers.vegetation === 'tundra') count++;
}
console.log(`Tundra appeared ${count}/1000 times`);
```

---

## Common Patterns

### Pattern 1: Climate-Specific Vegetation

```javascript
CACTUS: {
    id: 'cactus',
    name: 'Cactus',
    constraints: {
        climate: { require: ['hot'] },
        height: { exclude: ['deep_water', 'shallow_water'] }
    }
}
```

### Pattern 2: Elevation-Specific Features

```javascript
SNOW: {
    id: 'snow',
    name: 'Snow',
    constraints: {
        height: { require: ['mountains'] }
    }
}
```

### Pattern 3: Combination Requirements

```javascript
RAINFOREST: {
    id: 'rainforest',
    name: 'Rainforest',
    constraints: {
        climate: { require: ['hot'] },
        height: { require: ['lowlands', 'hills'] }
    }
}
```

---

## Tips

- **Start simple**: Add one type to an existing layer before adding a whole new layer
- **Use sensible weights**: Higher `generationWeight` = appears more often (total doesn't need to equal 100)
- **Test constraints**: Use console to verify your constraints work as expected
- **Check debug views**: Visual feedback is the easiest way to verify correct generation
- **Consider gameplay**: Movement cost and buildable properties affect game balance

---

## Summary

**To add a type:**
1. Add type definition to layer in **`data/terrainData.json`** (DATA FILE)
2. Add debug color in `src/rendering/mapRenderer.js` (optional)
3. Test in browser

**To add a layer:**
1. Define layer in **`data/terrainData.json`** (DATA FILE)
2. Update `generateRandomLayers()` in **`src/core/terrainLayers.js`** (CODE FILE)
3. Update `getCompositeType()` in **`src/core/terrainLayers.js`** (CODE FILE)
4. Add constraints to existing types in **`data/terrainData.json`** (DATA FILE)
5. Add debug view in `src/rendering/mapRenderer.js` (optional)
6. Update UI in `index.html` and `src/game.js` (optional)
7. Test thoroughly

**Key Principle:** Data lives in `terrainData.json`, logic lives in `terrainLayers.js`. The constraint-based system handles validation automatically - you just define the rules!
