/**
 * Main game controller for Settlements
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.grid = null;
        this.inputController = null;

        // Canvas dimensions (will be set to window size)
        this.canvasWidth = 0;
        this.canvasHeight = 0;

        // World size presets
        this.worldSizes = {
            tiny: { width: 20, height: 15, name: 'Tiny' },
            small: { width: 35, height: 25, name: 'Small' },
            medium: { width: 50, height: 40, name: 'Medium' },
            large: { width: 75, height: 60, name: 'Large' },
            huge: { width: 100, height: 80, name: 'Huge' }
        };

        // Grid settings (rectangular grid)
        this.currentWorldSize = 'medium';
        this.gridWidth = this.worldSizes[this.currentWorldSize].width;
        this.gridHeight = this.worldSizes[this.currentWorldSize].height;
        this.hexSize = 30;

        // Camera/viewport
        this.camera = new Camera({
            zoom: 1,
            minZoom: 0.3,
            maxZoom: 3
        });

        // Display settings
        this.showGrid = true;
        this.debugView = null; // null, 'landmass', or 'heightmap'
        this.useLOD = true; // Level of Detail optimization (on by default)

        // Will be initialized asynchronously
        this.initialized = false;
    }

    /**
     * Initialize the game asynchronously
     * Loads terrain data from JSON before creating the map
     */
    async init() {
        try {
            this.updateStatus('Loading terrain data...');

            // Load terrain configuration
            const terrainData = await DataLoader.loadTerrainData();

            // Initialize terrain system with loaded data
            TerrainLayers.init(terrainData);

            // Load sprites/textures (non-blocking, fallback to colors if failed)
            this.updateStatus('Loading sprites...');
            await AssetLoader.loadTerrainSprites(terrainData);

            this.updateStatus('Initializing game...');

            // Set canvas size to window size
            this.updateCanvasSize();

            // Create rectangular hex grid
            this.grid = new HexGrid(this.gridWidth, this.gridHeight, this.hexSize);

            // Create renderer
            this.renderer = new MapRenderer(this.grid);

            // Create input controller
            this.inputController = new InputController(this.canvas, this.camera, this.grid, {
                onHexHover: (data) => this.handleHexHover(data),
                onHexClick: (data) => this.handleHexClick(data),
                onCameraMove: () => this.render(),
                onCameraZoom: () => this.render(),
                onResize: () => this.handleResize()
            });

            // Setup UI event listeners (buttons, dropdowns)
            this.setupUIListeners();

            // Initial render
            this.render();

            const sizeName = this.worldSizes[this.currentWorldSize].name;
            this.updateStatus(`Game initialized - ${sizeName} world (${this.gridWidth}x${this.gridHeight}). Drag to pan, scroll to zoom.`);

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.updateStatus(`Error: ${error.message}. Check console for details.`);
            throw error;
        }
    }

    /**
     * Update canvas size to match window dimensions
     */
    updateCanvasSize() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.camera.setCanvasSize(this.canvasWidth, this.canvasHeight);
    }


    /**
     * Setup UI event listeners (buttons, dropdowns, etc.)
     * Canvas input is handled by InputController
     */
    setupUIListeners() {
        // World size dropdown
        document.getElementById('worldSize').addEventListener('change', (e) => this.changeWorldSize(e.target.value));

        // Toggle grid button
        document.getElementById('toggleGridBtn').addEventListener('click', () => this.toggleGrid());

        // Toggle LOD button
        document.getElementById('toggleLODBtn').addEventListener('click', () => this.toggleLOD());

        // Debug view selector
        document.getElementById('debugViewSelect').addEventListener('change', (e) => this.changeDebugView(e.target.value));

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    /**
     * Handle hex hover event from InputController
     */
    handleHexHover(data) {
        if (data.hex) {
            const terrainInfo = this.getTerrainDisplayName(data.hex);
            this.updateInfo(`Hex: (${data.hex.q}, ${data.hex.r}) - ${terrainInfo} | Zoom: ${data.zoom.toFixed(2)}x`);
        } else {
            this.updateInfo(`Zoom: ${data.zoom.toFixed(2)}x - Drag to pan, scroll to zoom`);
        }
        this.render();
    }

    /**
     * Handle hex click event from InputController
     */
    handleHexClick(data) {
        const terrainInfo = this.getTerrainDisplayName(data.hex);
        this.updateStatus(`Clicked hex: (${data.hex.q}, ${data.hex.r}) - ${terrainInfo}`);
        console.log('Clicked hex:', data.hex);
    }

    /**
     * Get display name for terrain
     */
    getTerrainDisplayName(hex) {
        return hex.terrainComposite.name;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.updateCanvasSize();
        this.render();
    }

    /**
     * Reset the game
     */
    reset() {
        // Regenerate the grid with new random terrain
        this.grid = new HexGrid(this.gridWidth, this.gridHeight, this.hexSize);
        this.renderer.setGrid(this.grid);
        this.inputController.setGrid(this.grid);
        // Camera position and zoom are preserved
        this.render();
        const sizeName = this.worldSizes[this.currentWorldSize].name;
        this.updateStatus(`Map reset successfully (${sizeName}: ${this.gridWidth}x${this.gridHeight})`);
    }

    /**
     * Change world size
     */
    changeWorldSize(size) {
        if (!this.worldSizes[size]) return;

        this.currentWorldSize = size;
        this.gridWidth = this.worldSizes[size].width;
        this.gridHeight = this.worldSizes[size].height;

        // Regenerate grid with new size
        this.grid = new HexGrid(this.gridWidth, this.gridHeight, this.hexSize);
        this.renderer.setGrid(this.grid);
        this.inputController.setGrid(this.grid);

        // Reset camera to center on new map
        this.camera.reset();

        this.render();
        const sizeName = this.worldSizes[size].name;
        this.updateStatus(`World size changed to ${sizeName} (${this.gridWidth}x${this.gridHeight})`);
    }

    /**
     * Toggle grid visibility
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        const btn = document.getElementById('toggleGridBtn');
        btn.textContent = this.showGrid ? 'Hide Grid' : 'Show Grid';
        this.render();
        this.updateStatus(`Grid ${this.showGrid ? 'shown' : 'hidden'}`);
    }

    /**
     * Toggle Level of Detail (LOD) optimization
     */
    toggleLOD() {
        this.useLOD = !this.useLOD;
        const btn = document.getElementById('toggleLODBtn');
        btn.textContent = this.useLOD ? 'LOD: On' : 'LOD: Off';
        this.render();
        this.updateStatus(`Level of Detail ${this.useLOD ? 'enabled (optimized)' : 'disabled (full detail)'}`);
    }

    /**
     * Change debug view mode
     */
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
        } else {
            this.updateStatus('Debug view disabled');
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Save context state
        this.ctx.save();

        // Apply camera transformation
        this.camera.applyTransform(this.ctx);

        // Get hovered hex from input controller
        const hoveredHex = this.inputController ? this.inputController.getHoveredHex() : null;

        // Pass camera to renderer for viewport culling
        // offsetX/offsetY stay 0,0 since canvas is already transformed
        this.renderer.setCamera(this.camera, this.canvasWidth, this.canvasHeight);
        this.renderer.setLOD(this.useLOD);
        this.renderer.render(this.ctx, 0, 0, hoveredHex, this.showGrid, this.debugView);

        // Restore context state
        this.ctx.restore();
    }

    /**
     * Update info display
     */
    updateInfo(message) {
        document.getElementById('info').textContent = message;
    }

    /**
     * Update status display
     */
    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        game = new Game();
        window.game = game; // Make accessible for debugging

        // Initialize asynchronously (loads JSON data)
        await game.init();

        console.log('Settlements game initialized');
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});
