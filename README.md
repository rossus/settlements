# Settlements

A hexagonal grid-based strategy game built with vanilla JavaScript and HTML5 Canvas.

## Features

- **Hexagonal grid system** using axial coordinates
- **Layered terrain system**: Independent height, climate, and vegetation layers
- **Constraint-based generation**: Realistic terrain combinations (no mountain swamps, water vegetation, etc.)
- **Interactive camera**: Pan (drag) and zoom (scroll)
- **Procedural generation**: Weighted random terrain with validation
- **Visual effects**: Coastline borders, terrain textures (hills, mountains, forests, etc.)
- **Flexible world sizes**: Tiny, Small, Medium, Large, Huge
- **Debug views**: Landmass, heightmap, climate, and vegetation visualization modes

## Quick Start

### One-Click Launcher

**Windows:** Double-click `START.bat`
**Linux/Mac:** Run `./START.sh`

The launcher will start a web server and open the game automatically!

*(Requires [Node.js](https://nodejs.org/) - see [RUNNING.md](RUNNING.md) for details)*

### Interact with the Map

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
│   │   ├── terrainLayers.js # Layered terrain system with constraints
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
    ├── README.md          # Documentation index
    ├── guides/            # User/developer guides
    ├── architecture/      # Technical docs
    └── history/           # Refactoring history
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
- **terrainLayers.js** - Layered terrain system with constraint-based validation
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
- **Debug Views**: Landmass, Heightmap, Climate, Vegetation
- **Reset Map**: Generate new terrain

## World Sizes

| Size | Dimensions | Hex Count |
|------|------------|-----------|
| Tiny | 20 × 15 | 300 |
| Small | 35 × 25 | 875 |
| Medium | 50 × 40 | 2,000 |
| Large | 75 × 60 | 4,500 |
| Huge | 100 × 80 | 8,000 |

## Terrain System

Settlements uses a **layered terrain system** where each hex has three independent layers:

### Height Layer
- **Deep Water** - Ocean depths (blue)
- **Shallow Water** - Coastal waters (light blue)
- **Lowlands** - Flat plains (low elevation)
- **Hills** - Rolling terrain with upward arc texture
- **Mountains** - High peaks with triangular texture (red in heightmap)

### Climate Layer
- **Hot** - Tropical/desert climates (orange)
- **Moderate** - Temperate zones (green)
- **Cold** - Polar/tundra regions (gray/blue)

### Vegetation Layer
- **None/Barren** - Rocky or sandy ground (tan)
- **Grassland** - Open fields (green)
- **Forest** - Dense woodland with tree texture (dark green)
- **Swamp** - Wetlands (dark green-brown, lowlands only)
- **Desert** - Arid sands (yellow, hot/moderate climates only)

### Constraint System
The terrain generator uses a **constraint-based validation system** to ensure realistic combinations:
- Water cannot have vegetation (except "none")
- Swamps only appear in lowlands with moderate/cold climates
- Deserts only appear in hot/moderate climates on non-water terrain
- Mountains have limited vegetation options based on climate

## Design Patterns

- **Single Responsibility**: Each module has one purpose
- **Dependency Injection**: Dependencies passed to constructors
- **Observer Pattern**: Callbacks for events
- **Factory Pattern**: MapGenerator creates maps
- **Facade Pattern**: HexGrid simplifies subsystems

## Future Enhancements

### Procedural Generation
- Perlin noise for natural continent generation
- River systems flowing from high to low elevation
- Moisture-based biome refinement
- Erosion simulation

### Gameplay
- Units and buildings
- Pathfinding (A* algorithm)
- Combat system
- Resource management
- Settlement founding and growth

### Technical
- Save/load system (serialization ready!)
- WebGL rendering option
- Touch controls for mobile
- Multiplayer support

## Browser Compatibility

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Automatic Versioning

This project uses **automatic semantic versioning** via GitHub Actions:

- ✅ Every `feat:` commit → version bump (0.1.0 → 0.2.0)
- ✅ Every `fix:` commit → patch bump (0.2.0 → 0.2.1)
- ✅ Auto-updates `package.json` and `CHANGELOG.md`
- ✅ Auto-creates git tags (`v0.x.x`)

**Example:**
```bash
git commit -m "feat: add Perlin noise generation"
git push origin main
# Automatically becomes v0.2.0!
```

See [`docs/guides/auto-versioning.md`](docs/guides/auto-versioning.md) for complete guide.

## Documentation

**📖 Complete documentation index:** [`docs/README.md`](docs/README.md)

### Quick Links

**Guides:**
- [Extending Terrain System](docs/guides/extending-terrain.md) - Add new layers and terrain types
- [Auto Versioning](docs/guides/auto-versioning.md) - Automatic semantic versioning
- [Code Reusability](docs/guides/code-reusability.md) - Reusing code in other projects
- [Git Workflow](docs/guides/git-workflow.md) - Version control and collaboration

**Architecture:**
- [Folder Structure](docs/architecture/folder-structure.md) - Project organization

**Examples:**
- [`examples/reuse-hexmath.html`](examples/reuse-hexmath.html) - Using hexMath in another game
- [Examples README](examples/README.md) - All code reuse examples

## License

Open source - free for educational purposes.

---

**Built with vanilla JavaScript - no frameworks required!** 🎮🗺️
