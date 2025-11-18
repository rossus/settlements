/**
 * Viewport Culling - Only render visible hexes
 * Huge performance boost for large maps!
 */

class ViewportCuller {
    /**
     * Get only hexes visible in current viewport
     * @param {Array} allHexes - All hexes in the grid
     * @param {Function} hexToPixel - Function to convert hex to pixel coords
     * @param {number} offsetX - Camera X offset
     * @param {number} offsetY - Camera Y offset
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {number} hexSize - Hex size
     * @returns {Array} Only visible hexes
     */
    static getVisibleHexes(allHexes, hexToPixel, offsetX, offsetY, canvasWidth, canvasHeight, hexSize) {
        // Add margin to include hexes partially visible
        const margin = hexSize * 2;

        return allHexes.filter(hex => {
            const pixel = hexToPixel(hex);
            const screenX = pixel.x + offsetX;
            const screenY = pixel.y + offsetY;

            // Check if hex is within viewport bounds (with margin)
            return screenX > -margin &&
                   screenX < canvasWidth + margin &&
                   screenY > -margin &&
                   screenY < canvasHeight + margin;
        });
    }

    /**
     * Get visible hexes with caching for better performance
     * Cache is invalidated when camera moves significantly
     */
    static createCachedCuller() {
        let cache = null;
        let lastOffsetX = null;
        let lastOffsetY = null;
        let lastZoom = null;

        return {
            getVisibleHexes(allHexes, hexToPixel, offsetX, offsetY, canvasWidth, canvasHeight, hexSize, zoom) {
                // Check if camera moved significantly (invalidate cache)
                const moved = lastOffsetX === null ||
                              Math.abs(offsetX - lastOffsetX) > hexSize ||
                              Math.abs(offsetY - lastOffsetY) > hexSize ||
                              lastZoom !== zoom;

                if (moved || cache === null) {
                    // Recalculate visible hexes
                    cache = ViewportCuller.getVisibleHexes(
                        allHexes, hexToPixel, offsetX, offsetY,
                        canvasWidth, canvasHeight, hexSize
                    );

                    lastOffsetX = offsetX;
                    lastOffsetY = offsetY;
                    lastZoom = zoom;
                }

                return cache;
            },

            invalidate() {
                cache = null;
            }
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViewportCuller;
}
