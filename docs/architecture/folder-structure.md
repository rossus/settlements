# Folder Structure - Final Organization

## Overview

After completing the refactoring, the project has been reorganized into a clean, modular folder structure that follows industry best practices. **NEW:** Terrain data has been separated from logic into dedicated data files.

## Complete Directory Tree

```
Settlements/

   index.html                  # Entry point
   style.css                   # Styles
   README.md                   # Main documentation

   data/                       # Data files (JSON)
      terrainData.json         # Terrain layer and type definitions

   src/                        # All source code

      core/                    # Foundation modules (no dependencies)
         hexMath.js           # Pure mathematical functions
         terrainLayers.js     # Terrain logic (validation, generation)
         camera.js            # Viewport management

      data/                    # Data loaders
         dataLoader.js        # Async JSON file loader

      map/                     # Map data and generation
         hexMap.js            # Data storage (Hex + HexMap classes)
         mapGenerator.js      # Terrain generation algorithms
         hexGrid.js           # Backward-compatible wrapper

      rendering/               # Rendering system
         mapRenderer.js       # Canvas rendering engine

      input/                   # Input handling
         inputController.js   # Mouse/keyboard events

      game.js                  # Main game orchestrator

   docs/                       # Documentation
       guides/                 # User/developer guides
          extending-terrain.md  # How to extend terrain system
          code-reusability.md   # Reusing code elsewhere
          git-workflow.md       # Version control guide
          auto-versioning.md    # Automatic versioning
       architecture/           # Technical documentation
          folder-structure.md   # This file
```

## Folder Organization Principles

### 1. **src/** - Source Code
All JavaScript source files are organized by functionality.

#### **src/core/** - Foundation Modules
Independent, reusable utilities with no dependencies on other project modules.

| File | Purpose | Dependencies |
|------|---------|--------------|
| hexMath.js | Pure math functions | None |
| terrainLayers.js | Terrain validation and generation logic | data/terrainData |
| camera.js | Viewport management | None |

**Characteristics:**
- Minimal dependencies on other project modules
- Can be reused in other projects (with data files)
- Pure functions and self-contained classes

#### **data/** - Data Files (JSON)
**NEW:** Terrain data in JSON format for easy modding.

| File | Purpose | Dependencies |
|------|---------|--------------|
| terrainData.json | All terrain layer/type definitions | None |

**Characteristics:**
- Pure data, no logic
- JSON format - human-readable and standard
- Easy to modify without touching code
- Enables modding and multiple terrain configurations
- Loaded asynchronously via DataLoader

#### **src/data/** - Data Loaders
Utilities for loading external data files.

| File | Purpose | Dependencies |
|------|---------|--------------|
| dataLoader.js | Async JSON file loader | None |

**Characteristics:**
- Handles async data loading
- Provides error handling for missing files
- Supports loading multiple data files

#### **src/map/** - Map System
Map data structures and terrain generation.

| File | Purpose | Dependencies |
|------|---------|--------------|
| hexMap.js | Hex class + HexMap storage | core/hexMath, core/terrainLayers |
| mapGenerator.js | Generation algorithms | hexMap, core/hexMath, core/terrainLayers |
| hexGrid.js | Wrapper for compatibility | hexMap, mapGenerator |

**Characteristics:**
- Depends on core modules
- Handles all map-related logic
- Separates data from generation

#### **src/rendering/** - Rendering System
Canvas rendering and visual effects.

| File | Purpose | Dependencies |
|------|---------|--------------|
| mapRenderer.js | Rendering engine | map/hexGrid |

**Characteristics:**
- Depends on map module for data
- No data storage, pure rendering
- Could be swapped for WebGL renderer

#### **src/input/** - Input Handling
User input processing and event management.

| File | Purpose | Dependencies |
|------|---------|--------------|
| inputController.js | Mouse/keyboard events | core/camera, map/hexGrid |

**Characteristics:**
- Converts input to game events
- Uses callbacks for communication
- No direct rendering or data manipulation

#### **src/game.js** - Main Orchestrator
Top-level game controller that wires everything together.

**Dependencies:** All modules
**Characteristics:**
- Initializes all modules
- Wires callbacks
- Handles UI controls
- Minimal logic, mostly orchestration

---

### 2. **docs/** - Documentation
All project documentation organized by category.

#### **docs/guides/** - User/Developer Guides

| File | Purpose |
|------|---------|
| extending-terrain.md | How to add layers and terrain types |
| code-reusability.md | Reusing code in other projects |
| git-workflow.md | Version control workflow |
| auto-versioning.md | Automatic versioning system |

#### **docs/architecture/** - Technical Documentation

| File | Purpose |
|------|---------|
| folder-structure.md | Project organization (this file) |

---

## Dependency Graph

```
game.js (orchestrator)
   ├─→ data/dataLoader.js (async JSON loader)
   │      └─→ data/terrainData.json  [NEW]
   ├─→ map/hexGrid.js (wrapper)
   │      ├─→ map/hexMap.js (data)
   │      │      ├─→ core/hexMath.js
   │      │      └─→ core/terrainLayers.js
   │      │             └─→ loaded from data/terrainData.json  [NEW]
   │      └─→ map/mapGenerator.js (generation)
   │             ├─→ map/hexMap.js
   │             ├─→ core/hexMath.js
   │             └─→ core/terrainLayers.js
   │                    └─→ loaded from data/terrainData.json  [NEW]
   ├─→ rendering/mapRenderer.js
   │      └─→ map/hexGrid.js
   ├─→ input/inputController.js
   │      ├─→ core/camera.js
   │      └─→ map/hexGrid.js
   └─→ core/camera.js
```

## Loading Order (index.html)

The script tags must respect dependencies:

```html
<!-- 1. Core (no dependencies) -->
<script src="src/core/hexMath.js"></script>
<script src="src/core/camera.js"></script>

<!-- 2. Data loader (async JSON loading) -->
<script src="src/data/dataLoader.js"></script>

<!-- 3. Core with data dependencies (initialized async with JSON data) -->
<script src="src/core/terrainLayers.js"></script>

<!-- 4. Map data (depends on core) -->
<script src="src/map/hexMap.js"></script>
<script src="src/map/mapGenerator.js"></script>

<!-- 5. Map wrapper (depends on hexMap, mapGenerator) -->
<script src="src/map/hexGrid.js"></script>

<!-- 6. Rendering & Input (depends on map, camera) -->
<script src="src/rendering/mapRenderer.js"></script>
<script src="src/input/inputController.js"></script>

<!-- 7. Game (depends on everything) -->
<script src="src/game.js"></script>
```

## Benefits of This Structure

### 1. **Clear Separation**
Each folder has a single, clear purpose:
- `core/` → Utilities and logic
- `data/` → Data declarations (no logic)
- `map/` → Data & generation
- `rendering/` → Drawing
- `input/` → User interaction
- `game.js` → Orchestration

### 2. **Easy Navigation**
Developers can quickly find code:
- Need to fix rendering? → `src/rendering/`
- Need to change terrain? → `data/terrainData.json`
- Need to change terrain logic? → `src/core/terrainLayers.js`
- Need to add input? → `src/input/inputController.js`

### 3. **Modular Testing**
Each folder can be tested independently:
```javascript
// Test core
import { HexMath } from './src/core/hexMath.js';

// Test map
import { HexMap } from './src/map/hexMap.js';
import { MapGenerator } from './src/map/mapGenerator.js';
```

### 4. **Reusability**
Core modules can be copied to other projects:
```bash
cp -r src/core/ ../other-project/src/
cp -r src/data/ ../other-project/src/
cp -r data/ ../other-project/
```

### 5. **Scalability**
Easy to add new modules:
```
src/
   core/
   data/
   map/
   rendering/
   input/
   units/          ← NEW
      unit.js
      unitManager.js
   pathfinding/    ← NEW
      aStar.js
   game.js
```

### 6. **Build Tool Ready**
Structure works well with bundlers (webpack, rollup, etc.):
```javascript
// Entry point
import Game from './src/game.js';

// Bundler automatically includes dependencies
```

### 7. **Easy Modding**
**NEW:** Data separation enables modding:
```bash
# Create alternate terrain configuration
cp data/terrainData.json data/terrainData_fantasy.json
# Edit terrainData_fantasy.json with custom terrain types
# Load different config by changing DataLoader parameter in game.js
```

## Code Organization Rules

### **Rule 1: Unidirectional Dependencies**
- Data modules NEVER depend on anything
- Core modules NEVER depend on map/rendering/input
- Map modules NEVER depend on rendering/input
- Higher-level modules depend on lower-level modules

### **Rule 2: Single Responsibility**
- Each file has ONE clear purpose
- Each folder groups related responsibilities

### **Rule 3: Explicit Dependencies**
- All dependencies are clear from folder structure
- No circular dependencies

### **Rule 4: DRY (Don't Repeat Yourself)**
- Shared code goes in core/
- Shared data goes in data/
- Module-specific code stays in its folder

### **Rule 5: Data/Logic Separation**
**NEW:** Keep data separate from implementation:
- Data files (JSON) → `data/`
- Data loaders → `src/data/`
- Implementation logic → `src/core/` or other folders

## Migration from Flat Structure

### What Changed

**Before:**
```
Settlements/
   hexMath.js
   terrainLayers.js         # Data + Logic mixed
   camera.js
   hexMap.js
   mapGenerator.js
   hexGrid.js
   mapRenderer.js
   inputController.js
   game.js
   index.html
   style.css
```

**After:**
```
Settlements/
   data/
      terrainData.json       # JSON data files
   src/
      core/
         terrainLayers.js    # Logic only
      data/
         dataLoader.js       # Async data loader
      map/
      rendering/
      input/
      game.js
   docs/
      guides/
      architecture/
   index.html
   style.css
   README.md
```

### Update Required
Only `index.html` needed updating - script paths changed from:
```html
<script src="hexMath.js"></script>
<script src="terrainLayers.js"></script>
```
To:
```html
<script src="src/core/hexMath.js"></script>
<script src="src/data/dataLoader.js"></script>
<script src="src/core/terrainLayers.js"></script>
<!-- terrainData.json loaded asynchronously by game.js -->
```

## Adding New Features

### Example: Adding Units

1. **Create folder:**
```bash
mkdir src/units
```

2. **Create files:**
```
src/units/
   unit.js          # Unit class
   unitManager.js   # Manages all units
   unitRenderer.js  # Renders units
```

3. **Add to index.html:**
```html
<!-- After map system -->
<script src="src/units/unit.js"></script>
<script src="src/units/unitManager.js"></script>
<script src="src/units/unitRenderer.js"></script>
```

4. **Wire in game.js:**
```javascript
this.unitManager = new UnitManager(this.grid);
this.unitRenderer = new UnitRenderer(this.unitManager);
```

### Example: Adding Custom Terrain Set

**NEW:** Creating alternate terrain configurations:

1. **Duplicate data file:**
```bash
cp data/terrainData.json data/terrainData_scifi.json
```

2. **Modify terrain types:**
```json
// In terrainData_scifi.json
{
  "layers": {
    "vegetation": {
      "types": {
        "WASTELAND": {
          "id": "wasteland",
          "name": "Wasteland",
          "baseColor": "#8b7355"
        }
      }
    }
  }
}
```

3. **Update game.js to load different config:**
```javascript
// In src/game.js init() method
const terrainData = await DataLoader.loadTerrainData('terrainData_scifi');
```

### Example: Adding Pathfinding

1. **Create file:**
```bash
touch src/core/pathfinding.js
```

2. **Implement:**
```javascript
// src/core/pathfinding.js
class Pathfinding {
    static findPath(start, goal, grid) {
        // A* algorithm
    }
}
```

3. **Add to index.html:**
```html
<!-- In core section -->
<script src="src/core/pathfinding.js"></script>
```

4. **Use anywhere:**
```javascript
const path = Pathfinding.findPath(startHex, goalHex, this.grid);
```

## Best Practices

### DO:
✓ Keep modules small and focused
✓ Respect dependency hierarchy
✓ Put shared utilities in core/
✓ Put shared data in data/
✓ Group related files in same folder
✓ Update documentation when adding folders
✓ Separate data from logic

### DON'T:
✗ Create circular dependencies
✗ Mix concerns (rendering + data)
✗ Mix data with logic in same file
✗ Put everything in root
✗ Skip folder organization for "just one file"
✗ Duplicate code across folders

## Conclusion

This folder structure provides:
- **Clear organization** - Easy to navigate
- **Modular design** - Easy to test and reuse
- **Scalable architecture** - Easy to extend
- **Professional quality** - Follows industry standards
- **Data/Logic separation** - Easy modding and configuration

The structure supports growth from simple hex grid to full strategy game without major reorganization.

---

**Folder structure last updated:** 2025-11-17 (Added data/ folder for terrain data separation)
