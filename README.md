# Settlements

A hexagonal grid-based strategy game built with vanilla JavaScript and HTML5 Canvas.

## Features

- **Hexagonal grid system** using axial coordinates
- **Multiple terrain types**: Grass, Forest, Water, Mountain, Desert
- **Interactive camera**: Pan (drag) and zoom (scroll)
- **Procedural generation**: Weighted random terrain distribution
- **Visual effects**: Sand borders between water and land
- **Flexible world sizes**: Tiny, Small, Medium, Large, Huge
- **Debug mode**: Inspect hex coordinates and terrain types

## Quick Start

1. **Open `index.html` in a web browser**
2. **Interact with the map:**
   - Drag to pan the camera
   - Scroll to zoom in/out
   - Hover to see hex information
   - Click to select a hex

## Project Structure

```
Settlements/
├── index.html              # Main HTML file
├── style.css              # Styles
├── README.md              # This file
│
├── src/                   # Source code
│   ├── core/              # Core utilities
│   │   ├── hexMath.js     # Hexagonal grid mathematics
│   │   ├── terrain.js     # Terrain type definitions
│   │   └── camera.js      # Viewport management
│   │
│   ├── map/               # Map data & generation
│   │   ├── hexMap.js      # Data storage (Hex class + HexMap)
│   │   ├── mapGenerator.js # Terrain generation algorithms
│   │   └── hexGrid.js     # Backward-compatible wrapper
│   │
│   ├── rendering/         # Rendering system
│   │   └── mapRenderer.js # Canvas rendering engine
│   │
│   ├── input/             # Input handling
│   │   └── inputController.js # Mouse/keyboard events
│   │
│   └── game.js            # Main game orchestrator
│
└── docs/                  # Documentation
    ├── REFACTORING_COMPLETE.md
    ├── REFACTORING_STEP4.md
    └── REFACTORING_STEP5.md
```

## Architecture

```
┌─────────────────────────┐
│       game.js           │  Orchestrates all modules
└─────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│HexGrid │ │Render│ │Camera│ │Input │
└────────┘ └──────┘ └──────┘ └──────┘
    │
    ▼
┌────────┐
│ HexMap │  Data storage
└────────┘
    ▲
    │
┌──────────┐
│Generator │  Terrain generation
└──────────┘
```

## Modules

### Core (src/core/)
- **hexMath.js** - Pure math functions for hexagonal grids
- **terrain.js** - Terrain definitions and properties
- **camera.js** - Viewport management

### Map (src/map/)
- **hexMap.js** - Data storage with Hex class
- **mapGenerator.js** - Terrain generation algorithms
- **hexGrid.js** - Backward-compatible wrapper

### Rendering & Input
- **mapRenderer.js** - Canvas rendering engine
- **inputController.js** - Mouse/keyboard events

### Game
- **game.js** - Main orchestrator

## Controls

- **Left Mouse Drag**: Pan the camera
- **Mouse Wheel**: Zoom in/out (toward cursor)
- **Hover**: Highlight hex and show info
- **Click**: Select hex
- **World Size Dropdown**: Change map size
- **Toggle Grid**: Show/hide grid lines
- **Debug Mode**: Show hex coordinates
- **Reset Map**: Generate new terrain

## World Sizes

| Size | Dimensions | Hex Count |
|------|------------|-----------|
| Tiny | 20 × 15 | 300 |
| Small | 35 × 25 | 875 |
| Medium | 50 × 40 | 2,000 |
| Large | 75 × 60 | 4,500 |
| Huge | 100 × 80 | 8,000 |

## Terrain Types

| Terrain | Color | Distribution | Walkable |
|---------|-------|--------------|----------|
| Grass | Green | 40% | ✓ |
| Forest | Dark Green | 25% | ✓ |
| Water | Blue | 15% | ✗ |
| Mountain | Gray | 10% | ✓ |
| Desert | Yellow | 10% | ✓ |

## Design Patterns

- **Single Responsibility**: Each module has one purpose
- **Dependency Injection**: Dependencies passed to constructors
- **Observer Pattern**: Callbacks for events
- **Factory Pattern**: MapGenerator creates maps
- **Facade Pattern**: HexGrid simplifies subsystems

## Future Enhancements

### Procedural Generation
- Perlin noise for natural terrain
- Rivers and biomes
- Height maps

### Gameplay
- Units and buildings
- Pathfinding
- Combat system
- Resource management

### Technical
- Save/load (serialization ready!)
- WebGL rendering
- Touch controls
- Multiplayer

## Browser Compatibility

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Documentation

See `docs/` for detailed documentation:
- **`CODE_REUSABILITY.md`** - How to reuse code in other projects ← NEW!
- **`GIT_WORKFLOW.md`** - Git workflow and versioning guide ← NEW!
- **`FOLDER_STRUCTURE.md`** - Project organization explained ← NEW!
- `REFACTORING_COMPLETE.md` - Complete refactoring overview
- `REFACTORING_STEP4.md` - MapRenderer extraction
- `REFACTORING_STEP5.md` - HexMap & MapGenerator extraction

See `examples/` for code reuse demonstrations:
- `reuse-hexmath.html` - Using hexMath in a different game

## License

Open source - free for educational purposes.

---

**Built with vanilla JavaScript - no frameworks required!** 🎮🗺️
