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
        this.debugMode = false;
        this.highlightTerrainType = null;

        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
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

        // Populate terrain type selector from Terrain.Types
        this.populateTerrainSelector();

        // Setup UI event listeners (buttons, dropdowns)
        this.setupUIListeners();

        // Initial render
        this.render();

        const sizeName = this.worldSizes[this.currentWorldSize].name;
        this.updateStatus(`Game initialized - ${sizeName} world (${this.gridWidth}x${this.gridHeight}). Drag to pan, scroll to zoom.`);
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
     * Populate terrain type selector from Terrain.Types
     * This makes the selector automatically update when new terrain types are added
     */
    populateTerrainSelector() {
        const select = document.getElementById('terrainTypeSelect');

        // Get all terrain types and sort alphabetically by name
        const terrainTypes = Object.values(Terrain.Types).sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        // Add option for each terrain type
        terrainTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            select.appendChild(option);
        });
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

        // Debug button
        document.getElementById('debugBtn').addEventListener('click', () => this.toggleDebug());

        // Terrain type selector
        document.getElementById('terrainTypeSelect').addEventListener('change', (e) => this.selectTerrainType(e.target.value));

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    /**
     * Handle hex hover event from InputController
     */
    handleHexHover(data) {
        if (data.hex) {
            this.updateInfo(`Hex: (${data.hex.q}, ${data.hex.r}) - ${data.hex.type} | Zoom: ${data.zoom.toFixed(2)}x`);
        } else {
            this.updateInfo(`Zoom: ${data.zoom.toFixed(2)}x - Drag to pan, scroll to zoom`);
        }
        this.render();
    }

    /**
     * Handle hex click event from InputController
     */
    handleHexClick(data) {
        this.updateStatus(`Clicked hex: (${data.hex.q}, ${data.hex.r}) - ${data.hex.type}`);
        console.log('Clicked hex:', data.hex);
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
     * Toggle debug mode
     */
    toggleDebug() {
        this.debugMode = !this.debugMode;
        const btn = document.getElementById('debugBtn');
        const terrainSelect = document.getElementById('terrainTypeSelect');

        btn.textContent = this.debugMode ? 'Debug Mode: On' : 'Debug Mode: Off';

        // Show/hide terrain type selector
        if (this.debugMode) {
            terrainSelect.style.display = 'inline-block';
            this.updateStatus('Debug mode enabled - Select terrain type to highlight');
        } else {
            terrainSelect.style.display = 'none';
            terrainSelect.value = ''; // Reset selection
            this.highlightTerrainType = null;
            this.updateStatus('Debug mode disabled');
        }

        this.render();
    }

    /**
     * Select terrain type to highlight
     */
    selectTerrainType(terrainType) {
        this.highlightTerrainType = terrainType || null;
        this.render();

        if (terrainType) {
            this.updateStatus(`Highlighting ${terrainType} tiles`);
        } else {
            this.updateStatus('No terrain type selected');
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

        // Render grid at origin (camera transform handles positioning)
        this.renderer.render(this.ctx, 0, 0, hoveredHex, this.showGrid, this.highlightTerrainType);

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
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    window.game = game; // Make accessible for debugging
    console.log('Settlements game initialized');
});
