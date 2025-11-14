/**
 * MapRenderer - Rendering engine for hexagonal maps
 *
 * This module handles all rendering operations for the hex grid.
 * Separated from game logic and data storage for clean architecture.
 */

class MapRenderer {
    constructor(hexGrid) {
        this.grid = hexGrid;
    }

    /**
     * Main render method - orchestrates all rendering passes
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset for rendering
     * @param {number} offsetY - Y offset for rendering
     * @param {Hex} highlightHex - Hex to highlight (optional)
     * @param {boolean} showGrid - Whether to show grid lines
     * @param {string} highlightTerrainType - Terrain type to highlight (null if disabled)
     */
    render(ctx, offsetX = 0, offsetY = 0, highlightHex = null, showGrid = true, highlightTerrainType = null) {
        // First pass: draw all hexagon fills
        this.renderHexagonFills(ctx, offsetX, offsetY, highlightHex);

        // Second pass: draw sand borders between water and land
        this.renderSandBorders(ctx, offsetX, offsetY);

        // Third pass: draw grid lines on top of sand borders
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
        }

        // Fourth pass: draw terrain type highlighting if enabled
        if (highlightTerrainType) {
            this.renderTerrainHighlight(ctx, offsetX, offsetY, highlightTerrainType);
        }
    }

    /**
     * Render all hexagon fills (terrain colors and highlights)
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Hex} highlightHex - Hex to highlight (optional)
     */
    renderHexagonFills(ctx, offsetX, offsetY, highlightHex) {
        this.grid.hexes.forEach(hex => {
            const pixel = this.grid.hexToPixel(hex);
            const centerX = pixel.x + offsetX;
            const centerY = pixel.y + offsetY;
            const corners = this.grid.getHexCorners(centerX, centerY);

            // Draw hexagon shape
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < corners.length; i++) {
                ctx.lineTo(corners[i].x, corners[i].y);
            }
            ctx.closePath();

            // Fill with terrain color (supports both old and new systems)
            ctx.fillStyle = this.getTerrainColor(hex);
            ctx.fill();

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
        });
    }

    /**
     * Render grid lines on all hexagons
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     */
    renderGridLines(ctx, offsetX, offsetY) {
        this.grid.hexes.forEach(hex => {
            const pixel = this.grid.hexToPixel(hex);
            const centerX = pixel.x + offsetX;
            const centerY = pixel.y + offsetY;
            const corners = this.grid.getHexCorners(centerX, centerY);

            // Draw hexagon outline
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < corners.length; i++) {
                ctx.lineTo(corners[i].x, corners[i].y);
            }
            ctx.closePath();

            // Draw border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    /**
     * Render sand borders between water and land tiles
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     */
    renderSandBorders(ctx, offsetX, offsetY) {
        // Get all water-land borders
        const borders = this.grid.getWaterLandBorders();

        // Render using generic border renderer
        this.renderBorders(ctx, offsetX, offsetY, borders, {
            strokeStyle: Terrain.Colors.SAND_BORDER,
            lineWidth: 6,
            lineCap: 'round'
        });
    }

    /**
     * Render terrain type highlighting - draws red borders around all hexes of a specific terrain type
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {string} terrainType - Terrain type to highlight
     */
    renderTerrainHighlight(ctx, offsetX, offsetY, terrainType) {
        // Get all borders for this terrain type
        const borders = this.getBordersForTerrain(terrainType);

        // Render using generic border renderer
        this.renderBorders(ctx, offsetX, offsetY, borders, {
            strokeStyle: '#e74c3c',
            lineWidth: 4,
            lineCap: 'round'
        });
    }

    /**
     * Get all borders for a specific terrain type
     * Returns borders where the hex is the target type and neighbor is different or doesn't exist
     *
     * @param {string} terrainType - Terrain type to get borders for
     * @returns {Array<{hex1: Hex, hex2: Hex|null, neighborDirection: {q, r}}>} Border data
     */
    getBordersForTerrain(terrainType) {
        const borders = [];
        const neighborDirections = HexMath.getNeighborDirections();

        // For each hex of the target terrain type
        this.grid.hexes.forEach(hex => {
            if (hex.type === terrainType) {
                // Check all 6 neighbors
                for (let i = 0; i < 6; i++) {
                    const dir = neighborDirections[i];
                    const neighborQ = hex.q + dir.q;
                    const neighborR = hex.r + dir.r;
                    const neighbor = this.grid.getHex(neighborQ, neighborR);

                    // Add border if:
                    // 1. No neighbor exists (map edge), OR
                    // 2. Neighbor is different terrain type
                    if (!neighbor || neighbor.type !== terrainType) {
                        borders.push({
                            hex1: hex,
                            hex2: neighbor,        // null for map edges
                            neighborDirection: dir // direction vector to (missing) neighbor
                        });
                    }
                }
            }
        });

        return borders;
    }

    /**
     * Generic border renderer - draws borders between hex pairs using geometric calculation
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Array<{hex1: Hex, hex2: Hex|null, neighborDirection: {q, r}}>} borders - Border data
     * @param {Object} style - Style object {strokeStyle, lineWidth, lineCap}
     */
    renderBorders(ctx, offsetX, offsetY, borders, style) {
        borders.forEach(border => {
            let sharedEdge;

            if (border.hex2) {
                // Border between two hexes - use geometric calculation (robust, works always)
                sharedEdge = this.calculateSharedEdge(border.hex1, border.hex2, offsetX, offsetY);
            } else {
                // Map edge - create virtual neighbor and use geometric calculation
                // This avoids the neighbor-direction-to-edge-index mapping problem
                const virtualNeighbor = new Hex(
                    border.hex1.q + border.neighborDirection.q,
                    border.hex1.r + border.neighborDirection.r,
                    'virtual'
                );
                sharedEdge = this.calculateSharedEdge(border.hex1, virtualNeighbor, offsetX, offsetY);
            }

            if (sharedEdge) {
                // Draw border with provided style
                ctx.beginPath();
                ctx.moveTo(sharedEdge.corner1.x, sharedEdge.corner1.y);
                ctx.lineTo(sharedEdge.corner2.x, sharedEdge.corner2.y);
                ctx.strokeStyle = style.strokeStyle;
                ctx.lineWidth = style.lineWidth;
                ctx.lineCap = style.lineCap || 'butt';
                ctx.stroke();
            }
        });
    }

    /**
     * Calculate the shared edge between two neighboring hexes
     * Returns {corner1, corner2} in world coordinates
     *
     * @param {Hex} hex1 - First hex
     * @param {Hex} hex2 - Second hex (neighbor)
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @returns {{corner1: {x, y}, corner2: {x, y}}|null} Shared edge corners or null
     */
    calculateSharedEdge(hex1, hex2, offsetX, offsetY) {
        const pixel1 = this.grid.hexToPixel(hex1);
        const centerX1 = pixel1.x + offsetX;
        const centerY1 = pixel1.y + offsetY;
        const corners1 = this.grid.getHexCorners(centerX1, centerY1);

        const pixel2 = this.grid.hexToPixel(hex2);
        const centerX2 = pixel2.x + offsetX;
        const centerY2 = pixel2.y + offsetY;
        const corners2 = this.grid.getHexCorners(centerX2, centerY2);

        // Find the two corners that are shared (very close to each other)
        const threshold = 1; // pixels
        const sharedCorners = [];

        for (let i = 0; i < corners1.length; i++) {
            for (let j = 0; j < corners2.length; j++) {
                const dx = corners1[i].x - corners2[j].x;
                const dy = corners1[i].y - corners2[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < threshold) {
                    // Add only if not already added
                    const alreadyAdded = sharedCorners.some(c =>
                        Math.abs(c.x - corners1[i].x) < threshold &&
                        Math.abs(c.y - corners1[i].y) < threshold
                    );
                    if (!alreadyAdded) {
                        sharedCorners.push({x: corners1[i].x, y: corners1[i].y});
                    }
                }
            }
        }

        if (sharedCorners.length === 2) {
            return {
                corner1: sharedCorners[0],
                corner2: sharedCorners[1]
            };
        }

        // Fallback: shouldn't happen for proper neighbors
        return null;
    }

    /**
     * Get the two corners that form a specific edge
     * (Kept for compatibility, may be used in future)
     *
     * @param {Array} corners - Array of 6 corner positions
     * @param {number} edgeIndex - Edge index (0-5)
     * @returns {{corner1: {x, y}, corner2: {x, y}}} Edge corners
     */
    getEdgeCorners(corners, edgeIndex) {
        return {
            corner1: corners[edgeIndex],
            corner2: corners[(edgeIndex + 1) % 6]
        };
    }

    /**
     * Get terrain color for a hex (supports both old and new terrain systems)
     *
     * @param {Hex} hex - Hex to get color for
     * @returns {string} Hex color code
     */
    getTerrainColor(hex) {
        if (hex.isLayered) {
            // New layered system
            const composite = hex.terrainComposite;
            return composite ? composite.color : Terrain.Colors.DEFAULT;
        } else {
            // Old flat system
            return Terrain.getColor(hex.type);
        }
    }

    /**
     * Set the grid to render
     * Useful if you want to switch between multiple grids
     *
     * @param {HexGrid} hexGrid - The hex grid to render
     */
    setGrid(hexGrid) {
        this.grid = hexGrid;
    }

    /**
     * Clear the canvas
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    clear(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapRenderer;
}
