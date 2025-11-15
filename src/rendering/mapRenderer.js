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
     * @param {string} debugView - Debug view mode: null, 'landmass', or 'heightmap'
     */
    render(ctx, offsetX = 0, offsetY = 0, highlightHex = null, showGrid = true, debugView = null) {
        // Debug views render differently
        if (debugView === 'landmass') {
            this.renderDebugLandmass(ctx, offsetX, offsetY, highlightHex, showGrid);
            return;
        } else if (debugView === 'heightmap') {
            this.renderDebugHeightmap(ctx, offsetX, offsetY, highlightHex, showGrid);
            return;
        } else if (debugView === 'climate') {
            this.renderDebugClimate(ctx, offsetX, offsetY, highlightHex, showGrid);
            return;
        } else if (debugView === 'vegetation') {
            this.renderDebugVegetation(ctx, offsetX, offsetY, highlightHex, showGrid);
            return;
        }

        // Normal rendering
        // First pass: draw all hexagon fills
        this.renderHexagonFills(ctx, offsetX, offsetY, highlightHex);

        // Second pass: draw terrain textures (hills, mountains)
        this.renderTerrainTextures(ctx, offsetX, offsetY);

        // Third pass: draw sand borders between water and land
        this.renderSandBorders(ctx, offsetX, offsetY);

        // Fourth pass: draw grid lines on top of sand borders
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
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
     * Render terrain textures (hills and mountains)
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     */
    renderTerrainTextures(ctx, offsetX, offsetY) {
        this.grid.hexes.forEach(hex => {
            // Only render textures for layered terrain with elevation
            if (!hex.isLayered || !hex.layers) return;

            const heightLayer = hex.layers.height;

            // Skip if not hills or mountains
            if (heightLayer !== 'hills' && heightLayer !== 'mountains') return;

            const pixel = this.grid.hexToPixel(hex);
            const centerX = pixel.x + offsetX;
            const centerY = pixel.y + offsetY;
            const corners = this.grid.getHexCorners(centerX, centerY);

            if (heightLayer === 'hills') {
                this.drawHillTexture(ctx, centerX, centerY, corners);
            } else if (heightLayer === 'mountains') {
                this.drawMountainTexture(ctx, centerX, centerY, corners);
            }
        });
    }

    /**
     * Draw hill texture (upward half-circles for rolling hills)
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {Array} corners - Hex corner positions
     */
    drawHillTexture(ctx, centerX, centerY, corners) {
        const hexRadius = this.grid.hexSize;

        ctx.save();

        // Clip to hex shape
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // Draw upward half-circles (rolling hills)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1.5;

        const arcRadius = hexRadius * 0.35;
        const spacing = hexRadius * 0.5;

        // Draw two rows of half-circles
        const rows = [
            { y: centerY - hexRadius * 0.3, count: 3, offset: 0 },
            { y: centerY + hexRadius * 0.3, count: 3, offset: spacing * 0.5 }
        ];

        rows.forEach(row => {
            for (let i = 0; i < row.count; i++) {
                const x = centerX - spacing * (row.count - 1) / 2 + i * spacing + row.offset;

                ctx.beginPath();
                // Draw upward arc (bottom half of circle)
                ctx.arc(x, row.y, arcRadius, 0, Math.PI, true);
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    /**
     * Draw mountain texture (triangular peaks)
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {Array} corners - Hex corner positions
     */
    drawMountainTexture(ctx, centerX, centerY, corners) {
        const hexRadius = this.grid.hexSize;

        ctx.save();

        // Clip to hex shape
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // Draw multiple small triangular peaks
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'miter';

        const peakSize = hexRadius * 0.4;
        const positions = [
            { x: 0, y: -peakSize * 0.3 },
            { x: -peakSize * 0.6, y: peakSize * 0.4 },
            { x: peakSize * 0.6, y: peakSize * 0.4 }
        ];

        positions.forEach(pos => {
            ctx.beginPath();
            ctx.moveTo(centerX + pos.x, centerY + pos.y + peakSize * 0.5);
            ctx.lineTo(centerX + pos.x - peakSize * 0.4, centerY + pos.y + peakSize * 0.5);
            ctx.lineTo(centerX + pos.x, centerY + pos.y - peakSize * 0.5);
            ctx.lineTo(centerX + pos.x + peakSize * 0.4, centerY + pos.y + peakSize * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
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
     * Render debug view: Landmass (water vs land)
     * Shows all water in blue, all land in pale yellow-brown
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Hex} highlightHex - Hex to highlight (optional)
     * @param {boolean} showGrid - Whether to show grid lines
     */
    renderDebugLandmass(ctx, offsetX, offsetY, highlightHex, showGrid) {
        const WATER_COLOR = '#3498db';  // Blue
        const LAND_COLOR = '#d4c4a0';   // Pale yellow-brown

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

            // Fill with water or land color
            const isWater = this.grid.isHexWater(hex);
            ctx.fillStyle = isWater ? WATER_COLOR : LAND_COLOR;
            ctx.fill();

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
        });

        // Draw grid lines if enabled
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
        }
    }

    /**
     * Render debug view: Heightmap (elevation levels)
     * Colors tiles based on their height layer
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Hex} highlightHex - Hex to highlight (optional)
     * @param {boolean} showGrid - Whether to show grid lines
     */
    renderDebugHeightmap(ctx, offsetX, offsetY, highlightHex, showGrid) {
        // Height colors (from low to high elevation)
        const HEIGHT_COLORS = {
            'deep_water': '#1a5490',      // Dark blue (-2)
            'shallow_water': '#3498db',   // Light blue (-1)
            'lowlands': '#2ecc71',        // Green (0)
            'hills': '#f39c12',           // Orange (+1)
            'mountains': '#e74c3c'        // Red (+2)
        };

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

            // Get height layer and color
            let heightColor = '#888888'; // Default gray
            if (hex.isLayered && hex.layers && hex.layers.height) {
                heightColor = HEIGHT_COLORS[hex.layers.height] || heightColor;
            } else {
                // Old system fallback - approximate from terrain type
                const isWater = this.grid.isHexWater(hex);
                heightColor = isWater ? HEIGHT_COLORS['deep_water'] : HEIGHT_COLORS['lowlands'];
            }

            ctx.fillStyle = heightColor;
            ctx.fill();

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
        });

        // Draw grid lines if enabled
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
        }
    }

    /**
     * Render debug view: Climate (temperature zones)
     * Colors tiles based on their climate layer
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Hex} highlightHex - Hex to highlight (optional)
     * @param {boolean} showGrid - Whether to show grid lines
     */
    renderDebugClimate(ctx, offsetX, offsetY, highlightHex, showGrid) {
        // Climate colors
        const CLIMATE_COLORS = {
            'hot': '#e67e22',       // Orange
            'moderate': '#95a5a6',  // Gray
            'cold': '#3498db'       // Blue
        };

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

            // Get climate layer and color
            let climateColor = '#888888'; // Default gray
            if (hex.isLayered && hex.layers && hex.layers.climate) {
                climateColor = CLIMATE_COLORS[hex.layers.climate] || climateColor;
            } else {
                // Old system - all moderate
                climateColor = CLIMATE_COLORS['moderate'];
            }

            ctx.fillStyle = climateColor;
            ctx.fill();

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
        });

        // Draw grid lines if enabled
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
        }
    }

    /**
     * Render debug view: Vegetation (surface types)
     * Colors tiles based on their vegetation layer
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Hex} highlightHex - Hex to highlight (optional)
     * @param {boolean} showGrid - Whether to show grid lines
     */
    renderDebugVegetation(ctx, offsetX, offsetY, highlightHex, showGrid) {
        // Vegetation colors (from TerrainLayers)
        const VEGETATION_COLORS = {
            'none': '#b8a896',      // Barren
            'grassland': '#7ec850', // Green
            'forest': '#228b22',    // Dark green
            'desert': '#f4e4a6',    // Sandy
            'tundra': '#b8d4e0',    // Icy
            'swamp': '#4a5d3e'      // Dark murky
        };

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

            // Get vegetation layer and color
            let vegetationColor = '#888888'; // Default gray
            if (hex.isLayered && hex.layers && hex.layers.vegetation) {
                vegetationColor = VEGETATION_COLORS[hex.layers.vegetation] || vegetationColor;
            } else {
                // Old system - approximate from terrain type
                const terrainType = hex.type;
                if (terrainType === 'grass' || terrainType === 'plains') {
                    vegetationColor = VEGETATION_COLORS['grassland'];
                } else if (terrainType === 'forest') {
                    vegetationColor = VEGETATION_COLORS['forest'];
                } else if (terrainType === 'desert') {
                    vegetationColor = VEGETATION_COLORS['desert'];
                } else if (terrainType === 'tundra') {
                    vegetationColor = VEGETATION_COLORS['tundra'];
                } else if (terrainType === 'swamp') {
                    vegetationColor = VEGETATION_COLORS['swamp'];
                } else {
                    vegetationColor = VEGETATION_COLORS['none'];
                }
            }

            ctx.fillStyle = vegetationColor;
            ctx.fill();

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
        });

        // Draw grid lines if enabled
        if (showGrid) {
            this.renderGridLines(ctx, offsetX, offsetY);
        }
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
