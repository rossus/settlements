# Refactoring Plan for Settlements

## Current Structure Analysis

### Current Files & Responsibilities

**hexGrid.js** - Currently handles TOO MANY responsibilities:
- ✓ Hex data structure (Hex class)
- ✓ Grid storage (Map of hexes)
- ✓ Coordinate conversions (hex ↔ pixel)
- ✓ Neighbor calculations
- ✓ Edge calculations
- ✓ Map generation (terrain assignment)
- ✓ Terrain colors
- ✓ Water/land detection
- ✓ Border detection
- ✓ Rendering (tiles, borders, grid lines, debug)
- ✓ Hexagon geometry (corners, edges)

**game.js** - Game orchestration + Input handling:
- ✓ Game state management
- ✓ Canvas management
- ✓ Camera state (position, zoom)
- ✓ Mouse input handling (click, drag, wheel, hover)
- ✓ UI button handlers
- ✓ World size presets
- ✓ Rendering orchestration
- ✓ Display settings (grid, debug)

## Proposed Refactored Structure

### 1. **HexMath.js** - Pure Coordinate Mathematics
**Responsibilities:**
- Hex coordinate system (axial, cube, offset)
- Coordinate conversions (pixel ↔ hex)
- Neighbor direction calculations
- Distance calculations
- Hexagon geometry (corner positions, angles)
- Edge identification

**Why separate?**
- Pure math functions, no state
- Reusable across different hex grid systems
- Easy to test
- Can be used by both generator and renderer

### 2. **Terrain.js** - Terrain Type System
**Responsibilities:**
- Terrain type definitions
- Terrain colors
- Terrain properties (walkable, buildable, etc.)
- Terrain rules and logic

**Why separate?**
- Terrain system might grow complex (biomes, resources, etc.)
- Easy to add new terrain types
- Colors and properties in one place

### 3. **MapGenerator.js** - Map Creation Logic
**Responsibilities:**
- Grid initialization algorithms
- Terrain distribution (random, noise-based, biome-based)
- Map size handling
- Different generation algorithms (random, Perlin noise, etc.)

**Why separate?**
- Generation logic independent from storage
- Easy to add new generation algorithms
- Can generate maps without rendering them
- Useful for procedural generation experiments

### 4. **HexMap.js** - Map Data Storage
**Responsibilities:**
- Grid storage (Map of hexes)
- Hex CRUD operations (get, set, delete)
- Hex queries (neighbors, borders, regions)
- Map metadata (width, height, size)

**Why separate?**
- Pure data structure
- No rendering logic
- Easy to serialize/deserialize
- Can be used for game logic without rendering

### 5. **MapRenderer.js** - Rendering Engine
**Responsibilities:**
- Drawing hexagon fills
- Drawing sand borders
- Drawing grid lines
- Drawing debug info
- Rendering optimization (culling, caching)

**Why separate?**
- Rendering logic changes independently
- Can add multiple render modes
- Performance optimizations isolated
- Could support different renderers (Canvas, WebGL)

### 6. **Camera.js** - Viewport Management
**Responsibilities:**
- Camera position (x, y)
- Zoom level
- Screen ↔ world coordinate conversion
- Camera constraints (bounds, zoom limits)
- Camera animations (smooth pan, zoom)

**Why separate?**
- Camera logic can be complex
- Reusable across different games
- Easy to add camera features (smooth follow, shake, etc.)

### 7. **InputController.js** - Input Management
**Responsibilities:**
- Mouse event handling (move, click, drag, wheel)
- Keyboard event handling
- Touch event handling (for mobile)
- Input state tracking
- Gesture recognition (pan, pinch-to-zoom)

**Why separate?**
- Input handling can grow complex
- Easy to add new input methods
- Can remap controls easily
- Testable in isolation

### 8. **Game.js** - Main Orchestrator
**Responsibilities:**
- Initialize all subsystems
- Game loop / render loop
- Coordinate between subsystems
- UI state management
- Game settings

**Why keep?**
- Single entry point
- Manages lifecycle
- Minimal logic, mostly coordination

## Proposed File Structure

```
Settlements/
├── index.html
├── style.css
│
├── core/
│   ├── HexMath.js          # Pure hex coordinate math
│   ├── Hex.js              # Hex data class
│   └── HexMap.js           # Map data storage
│
├── terrain/
│   ├── Terrain.js          # Terrain type system
│   └── TerrainGenerator.js # Terrain assignment algorithms
│
├── generation/
│   └── MapGenerator.js     # Map generation logic
│
├── rendering/
│   ├── Camera.js           # Camera/viewport
│   └── MapRenderer.js      # Rendering engine
│
├── input/
│   └── InputController.js  # Input handling
│
└── Game.js                 # Main orchestrator
```

## Benefits of This Refactoring

### 1. **Single Responsibility Principle**
Each class has ONE clear purpose

### 2. **Testability**
Each module can be tested in isolation

### 3. **Extensibility**
Easy to add:
- New terrain types
- New generation algorithms
- New rendering modes
- New input methods

### 4. **Maintainability**
- Changes isolated to specific modules
- Bugs easier to track down
- Code easier to understand

### 5. **Reusability**
- HexMath can be used in other projects
- Camera can be used in other games
- Renderer could support multiple backends

### 6. **Performance**
- Renderer can optimize without affecting logic
- Can add spatial partitioning to HexMap
- Can cache rendering calculations

## Migration Strategy

### Phase 1: Extract Math & Geometry
1. Create HexMath.js
2. Move coordinate functions
3. Update references

### Phase 2: Separate Terrain
1. Create Terrain.js
2. Move terrain definitions and colors
3. Update references

### Phase 3: Split Generation & Storage
1. Create HexMap.js (data only)
2. Create MapGenerator.js
3. Update HexGrid references

### Phase 4: Extract Rendering
1. Create Camera.js
2. Create MapRenderer.js
3. Move all drawing code
4. Update Game.js

### Phase 5: Extract Input
1. Create InputController.js
2. Move all event handlers
3. Update Game.js

### Phase 6: Clean Up
1. Update imports
2. Remove old files
3. Test everything
4. Update documentation

## What NOT to Separate (Keep Simple)

- **Hex class** - Keep as simple data class
- **Game class** - Keep as orchestrator (but simplify)
- **UI elements** - HTML/CSS can stay as is

## Questions to Consider

1. Should we add a **WorldConfig** class for world settings?
2. Should we add a **RenderSettings** class for render options?
3. Do we want to support **save/load** maps? (needs serialization)
4. Do we want **multiple layers** (terrain, objects, units)?
5. Should we add a **TileSelector** for clicking hexes?

## Immediate Next Steps

Which modules should we extract first? I recommend:

1. **HexMath.js** - Easy, no dependencies, pure functions
2. **Terrain.js** - Simple, clear benefits
3. **Camera.js** - Cleaner Game.js immediately

Would you like me to start with any of these?
