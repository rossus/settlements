/**
 * InputController - Handles all user input for the game
 *
 * This module manages mouse and keyboard input, converting
 * screen interactions into game events.
 */

class InputController {
    constructor(canvas, camera, grid, callbacks = {}) {
        this.canvas = canvas;
        this.camera = camera;
        this.grid = grid;

        // Callbacks for game events
        this.callbacks = {
            onHexHover: callbacks.onHexHover || (() => {}),
            onHexClick: callbacks.onHexClick || (() => {}),
            onCameraMove: callbacks.onCameraMove || (() => {}),
            onCameraZoom: callbacks.onCameraZoom || (() => {}),
            onResize: callbacks.onResize || (() => {})
        };

        // Input state
        this.isDragging = false;
        this.wasDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        this.hoveredHex = null;

        // Bind event handlers
        this.boundHandlers = {
            mouseMove: (e) => this.handleMouseMove(e),
            mouseDown: (e) => this.handleMouseDown(e),
            mouseUp: (e) => this.handleMouseUp(e),
            mouseLeave: (e) => this.handleMouseLeave(e),
            click: (e) => this.handleClick(e),
            wheel: (e) => this.handleWheel(e),
            resize: () => this.handleResize()
        };

        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', this.boundHandlers.mouseMove);
        this.canvas.addEventListener('mousedown', this.boundHandlers.mouseDown);
        this.canvas.addEventListener('mouseup', this.boundHandlers.mouseUp);
        this.canvas.addEventListener('mouseleave', this.boundHandlers.mouseLeave);
        this.canvas.addEventListener('click', this.boundHandlers.click);
        this.canvas.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });

        // Window events
        window.addEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * Remove all event listeners (cleanup)
     */
    cleanup() {
        this.canvas.removeEventListener('mousemove', this.boundHandlers.mouseMove);
        this.canvas.removeEventListener('mousedown', this.boundHandlers.mouseDown);
        this.canvas.removeEventListener('mouseup', this.boundHandlers.mouseUp);
        this.canvas.removeEventListener('mouseleave', this.boundHandlers.mouseLeave);
        this.canvas.removeEventListener('click', this.boundHandlers.click);
        this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
        window.removeEventListener('resize', this.boundHandlers.resize);
    }

    /**
     * Get mouse position relative to canvas
     */
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Convert screen position to hex coordinates
     */
    screenToHex(screenX, screenY) {
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        const hexCoords = this.grid.pixelToHex(worldPos.x, worldPos.y);
        return this.grid.getHex(hexCoords.q, hexCoords.r);
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(e) {
        const mousePos = this.getMousePosition(e);

        // Handle dragging
        if (this.isDragging) {
            const dx = mousePos.x - this.lastMousePos.x;
            const dy = mousePos.y - this.lastMousePos.y;

            this.camera.pan(dx, dy);
            this.lastMousePos = mousePos;

            this.callbacks.onCameraMove({
                offsetX: this.camera.x,
                offsetY: this.camera.y,
                delta: { dx, dy }
            });
            return;
        }

        // Store last mouse position
        this.lastMousePos = mousePos;

        // Update hovered hex
        const hex = this.screenToHex(mousePos.x, mousePos.y);

        if (hex !== this.hoveredHex) {
            this.hoveredHex = hex;
            this.callbacks.onHexHover({
                hex: hex,
                screenPos: mousePos,
                zoom: this.camera.zoom
            });
        }
    }

    /**
     * Handle mouse down (start dragging)
     */
    handleMouseDown(e) {
        if (e.button === 0) { // Left mouse button
            this.isDragging = true;
            this.wasDragging = false;

            const mousePos = this.getMousePosition(e);
            this.dragStart = mousePos;
            this.lastMousePos = mousePos;

            this.canvas.style.cursor = 'grabbing';
        }
    }

    /**
     * Handle mouse up (stop dragging)
     */
    handleMouseUp(e) {
        if (e.button === 0) { // Left mouse button
            const mousePos = this.getMousePosition(e);

            // Check if we actually dragged (moved more than a few pixels)
            const distance = Math.sqrt(
                Math.pow(mousePos.x - this.dragStart.x, 2) +
                Math.pow(mousePos.y - this.dragStart.y, 2)
            );

            this.wasDragging = distance > 5; // Consider it a drag if moved more than 5 pixels
            this.isDragging = false;
            this.canvas.style.cursor = 'crosshair';
        }
    }

    /**
     * Handle mouse leaving canvas (stop dragging)
     */
    handleMouseLeave(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
    }

    /**
     * Handle mouse click
     */
    handleClick(e) {
        // Only trigger click if we weren't dragging
        if (this.hoveredHex && !this.wasDragging) {
            const mousePos = this.getMousePosition(e);

            this.callbacks.onHexClick({
                hex: this.hoveredHex,
                screenPos: mousePos,
                button: e.button
            });
        }
    }

    /**
     * Handle mouse wheel (zoom)
     */
    handleWheel(e) {
        e.preventDefault();

        const mousePos = this.getMousePosition(e);

        // Zoom toward mouse position
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const oldZoom = this.camera.zoom;
        this.camera.zoomBy(zoomFactor, mousePos.x, mousePos.y);
        const newZoom = this.camera.zoom;

        this.callbacks.onCameraZoom({
            zoom: newZoom,
            oldZoom: oldZoom,
            zoomFactor: zoomFactor,
            mousePos: mousePos
        });

        // Update hovered hex after zoom
        const hex = this.screenToHex(mousePos.x, mousePos.y);
        if (hex !== this.hoveredHex) {
            this.hoveredHex = hex;
            this.callbacks.onHexHover({
                hex: hex,
                screenPos: mousePos,
                zoom: newZoom
            });
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.callbacks.onResize({
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Update the grid reference (e.g., after map regeneration)
     */
    setGrid(grid) {
        this.grid = grid;
        this.hoveredHex = null;
    }

    /**
     * Update the camera reference
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Get the currently hovered hex
     */
    getHoveredHex() {
        return this.hoveredHex;
    }

    /**
     * Clear the hovered hex
     */
    clearHoveredHex() {
        this.hoveredHex = null;
    }

    /**
     * Check if currently dragging
     */
    isCurrentlyDragging() {
        return this.isDragging;
    }

    /**
     * Update callbacks
     */
    setCallbacks(callbacks) {
        this.callbacks = {
            onHexHover: callbacks.onHexHover || this.callbacks.onHexHover,
            onHexClick: callbacks.onHexClick || this.callbacks.onHexClick,
            onCameraMove: callbacks.onCameraMove || this.callbacks.onCameraMove,
            onCameraZoom: callbacks.onCameraZoom || this.callbacks.onCameraZoom,
            onResize: callbacks.onResize || this.callbacks.onResize
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputController;
}
