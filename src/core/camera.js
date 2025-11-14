/**
 * Camera - Viewport management for Settlements
 *
 * This module handles camera position, zoom, and coordinate transformations
 * between screen space and world space.
 */

class Camera {
    constructor(options = {}) {
        // Camera position in world coordinates
        this.x = options.x || 0;
        this.y = options.y || 0;

        // Zoom level (1.0 = normal, >1 = zoomed in, <1 = zoomed out)
        this.zoom = options.zoom || 1;

        // Zoom constraints
        this.minZoom = options.minZoom || 0.3;
        this.maxZoom = options.maxZoom || 3;

        // Canvas dimensions (needed for transformations)
        this.canvasWidth = 0;
        this.canvasHeight = 0;
    }

    /**
     * Update canvas dimensions
     *
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     */
    setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    /**
     * Get camera center position in world coordinates
     *
     * @returns {{x: number, y: number}} Center position
     */
    getCenter() {
        return {
            x: -this.x / this.zoom,
            y: -this.y / this.zoom
        };
    }

    /**
     * Pan the camera by delta amounts
     *
     * @param {number} dx - Delta X in screen pixels
     * @param {number} dy - Delta Y in screen pixels
     */
    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Set camera position directly
     *
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Zoom in/out by a factor
     *
     * @param {number} factor - Zoom multiplier (e.g., 1.1 for zoom in, 0.9 for zoom out)
     * @param {number} screenX - Screen X coordinate to zoom toward (optional)
     * @param {number} screenY - Screen Y coordinate to zoom toward (optional)
     */
    zoomBy(factor, screenX = null, screenY = null) {
        // If no screen coordinates provided, zoom toward center
        if (screenX === null || screenY === null) {
            screenX = this.canvasWidth / 2;
            screenY = this.canvasHeight / 2;
        }

        // Calculate world position before zoom
        const worldXBefore = this.screenToWorld(screenX, screenY).x;
        const worldYBefore = this.screenToWorld(screenX, screenY).y;

        // Update zoom (with clamping)
        const newZoom = this.zoom * factor;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

        // Calculate world position after zoom
        const worldXAfter = this.screenToWorld(screenX, screenY).x;
        const worldYAfter = this.screenToWorld(screenX, screenY).y;

        // Adjust camera position to keep the point under cursor stable
        this.x += (worldXAfter - worldXBefore) * this.zoom;
        this.y += (worldYAfter - worldYBefore) * this.zoom;
    }

    /**
     * Set zoom level directly
     *
     * @param {number} zoom - New zoom level
     */
    setZoom(zoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }

    /**
     * Reset camera to default state
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    /**
     * Convert screen coordinates to world coordinates
     *
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {{x: number, y: number}} World coordinates
     */
    screenToWorld(screenX, screenY) {
        const x = (screenX - this.canvasWidth / 2 - this.x) / this.zoom;
        const y = (screenY - this.canvasHeight / 2 - this.y) / this.zoom;
        return { x, y };
    }

    /**
     * Convert world coordinates to screen coordinates
     *
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {{x: number, y: number}} Screen coordinates
     */
    worldToScreen(worldX, worldY) {
        const x = worldX * this.zoom + this.canvasWidth / 2 + this.x;
        const y = worldY * this.zoom + this.canvasHeight / 2 + this.y;
        return { x, y };
    }

    /**
     * Apply camera transformation to a canvas context
     * Call this before drawing world objects
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    applyTransform(ctx) {
        ctx.translate(this.canvasWidth / 2 + this.x, this.canvasHeight / 2 + this.y);
        ctx.scale(this.zoom, this.zoom);
    }

    /**
     * Get camera viewport bounds in world coordinates
     * Useful for culling objects outside the view
     *
     * @returns {{left: number, right: number, top: number, bottom: number}} Viewport bounds
     */
    getViewBounds() {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.canvasWidth, this.canvasHeight);

        return {
            left: topLeft.x,
            right: bottomRight.x,
            top: topLeft.y,
            bottom: bottomRight.y
        };
    }

    /**
     * Check if a world point is visible in the current viewport
     *
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} margin - Additional margin in world units (optional)
     * @returns {boolean} True if point is visible
     */
    isVisible(worldX, worldY, margin = 0) {
        const bounds = this.getViewBounds();
        return worldX >= bounds.left - margin &&
               worldX <= bounds.right + margin &&
               worldY >= bounds.top - margin &&
               worldY <= bounds.bottom + margin;
    }

    /**
     * Get camera state as a plain object (for serialization)
     *
     * @returns {Object} Camera state
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom
        };
    }

    /**
     * Restore camera state from a plain object
     *
     * @param {Object} state - Camera state object
     */
    setState(state) {
        if (state.x !== undefined) this.x = state.x;
        if (state.y !== undefined) this.y = state.y;
        if (state.zoom !== undefined) this.setZoom(state.zoom);
    }

    /**
     * Smoothly animate camera to a target position
     * Note: This requires being called each frame for animation
     *
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {number} speed - Animation speed (0-1, default 0.1)
     */
    smoothPanTo(targetX, targetY, speed = 0.1) {
        this.x += (targetX - this.x) * speed;
        this.y += (targetY - this.y) * speed;

        // Return true if close enough to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 1; // Within 1 pixel
    }

    /**
     * Smoothly animate camera zoom
     * Note: This requires being called each frame for animation
     *
     * @param {number} targetZoom - Target zoom level
     * @param {number} speed - Animation speed (0-1, default 0.1)
     */
    smoothZoomTo(targetZoom, speed = 0.1) {
        const clampedTarget = Math.max(this.minZoom, Math.min(this.maxZoom, targetZoom));
        this.zoom += (clampedTarget - this.zoom) * speed;

        // Return true if close enough to target
        return Math.abs(clampedTarget - this.zoom) < 0.01;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Camera;
}
