/**
 * MapRenderer - Rendering engine for hexagonal maps
 *
 * This module handles all rendering operations for the hex grid.
 * Separated from game logic and data storage for clean architecture.
 */

class MapRenderer {
    constructor(hexGrid) {
        this.grid = hexGrid;

        // Viewport culling cache
        this.visibleHexesCache = null;
        this.lastCameraX = null;
        this.lastCameraY = null;
        this.lastCameraZoom = null;
        this.lastCanvasWidth = null;
        this.lastCanvasHeight = null;

        // Level of Detail setting (default: true)
        this.useLOD = true;
    }

    /**
     * Set camera for viewport culling
     * @param {Camera} camera - Camera object
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    setCamera(camera, canvasWidth, canvasHeight) {
        this.camera = camera;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    /**
     * Set Level of Detail (LOD) optimization
     * @param {boolean} enabled - Whether to use LOD optimizations
     */
    setLOD(enabled) {
        this.useLOD = enabled;
    }

    /**
     * Get only hexes visible in current viewport (with caching)
     * HUGE performance boost for large maps!
     *
     * @returns {Array} Only visible hexes
     */
    getVisibleHexes() {
        if (!this.camera) {
            // Fallback if camera not set - return all hexes as array
            return Array.from(this.grid.hexes.values());
        }

        const hexSize = this.grid.hexSize;
        const zoom = this.camera.zoom;

        // Only recalculate if camera moved more than 2 hexes worth
        const moveThreshold = hexSize * zoom * 2;
        const cameraMovedSignificantly =
            this.lastCameraX === null ||
            Math.abs(this.camera.x - this.lastCameraX) > moveThreshold ||
            Math.abs(this.camera.y - this.lastCameraY) > moveThreshold ||
            Math.abs(this.lastCameraZoom - this.camera.zoom) > 0.01 ||
            this.lastCanvasWidth !== this.canvasWidth ||
            this.lastCanvasHeight !== this.canvasHeight;

        // Use cache if camera hasn't moved much
        if (!cameraMovedSignificantly && this.visibleHexesCache) {
            // Using cached result - no recalculation needed!
            return this.visibleHexesCache;
        }

        // Get viewport bounds from camera (correctly handles center-based transform)
        const bounds = this.camera.getViewBounds();

        // Add margin in world space (2 hexes worth)
        const margin = hexSize * 2;
        const minX = bounds.left - margin;
        const maxX = bounds.right + margin;
        const minY = bounds.top - margin;
        const maxY = bounds.bottom + margin;

        // Filter hexes efficiently (avoid Array.from overhead)
        this.visibleHexesCache = [];
        for (const hex of this.grid.hexes.values()) {
            const pixel = this.grid.hexToPixel(hex);

            // Check if hex is within viewport (in world space)
            if (pixel.x >= minX && pixel.x <= maxX &&
                pixel.y >= minY && pixel.y <= maxY) {
                this.visibleHexesCache.push(hex);
            }
        }

        // Update cache state
        this.lastCameraX = this.camera.x;
        this.lastCameraY = this.camera.y;
        this.lastCameraZoom = this.camera.zoom;
        this.lastCanvasWidth = this.canvasWidth;
        this.lastCanvasHeight = this.canvasHeight;

        // Debug logging (comment out after testing)
        const totalHexes = this.grid.hexes.size; // Map.size, not array.length
        const visibleCount = this.visibleHexesCache.length;
        const culledPercent = ((1 - visibleCount / totalHexes) * 100).toFixed(1);
        console.log(`Viewport Culling [RECALC]: ${visibleCount}/${totalHexes} hexes (${culledPercent}% culled)`);

        return this.visibleHexesCache;
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
        // Get only visible hexes (HUGE performance boost!)
        const visibleHexes = this.getVisibleHexes();

        // Store for use in rendering methods
        this.currentVisibleHexes = visibleHexes;
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

        // Normal rendering with optional Level of Detail (LOD)
        const zoom = this.camera ? this.camera.zoom : 1;

        // First pass: draw all hexagon fills (always)
        this.renderHexagonFills(ctx, offsetX, offsetY, highlightHex);

        // Second pass: draw terrain textures (hills, mountains)
        // Skip when LOD enabled and zoomed out
        if (!this.useLOD || zoom >= 0.5) {
            this.renderTerrainTextures(ctx, offsetX, offsetY);
        }

        // Third pass: draw sand borders between water and land
        // Skip when LOD enabled and zoomed out
        if (!this.useLOD || zoom >= 0.5) {
            this.renderSandBorders(ctx, offsetX, offsetY);
        }

        // Fourth pass: draw grid lines on top
        // Skip when LOD enabled and zoomed way out
        if (showGrid && (!this.useLOD || zoom >= 0.4)) {
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
        // Use only visible hexes for performance!
        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        const zoom = this.camera ? this.camera.zoom : 1;

        // LOD: Use simplified rendering when LOD enabled and zoomed way out
        const useSimplified = this.useLOD && zoom < 0.4;
        const hexSize = this.grid.hexSize;

        hexes.forEach(hex => {
            const pixel = this.grid.hexToPixel(hex);
            const centerX = pixel.x + offsetX;
            const centerY = pixel.y + offsetY;

            // Check for sprite or texture
            const sprite = this.getTerrainSprite(hex);
            const texture = this.getTerrainTexture(hex);

            // Calculate corners (needed for both rendering and highlighting)
            const corners = this.grid.getHexCorners(centerX, centerY);

            if (useSimplified) {
                // Draw simple square when zoomed way out (much faster)
                // Make squares slightly larger to overlap and avoid gaps
                const rectSize = hexSize * 1.8;
                ctx.fillStyle = this.getTerrainColor(hex);
                ctx.fillRect(centerX - rectSize * 0.5, centerY - rectSize * 0.5, rectSize, rectSize);
            } else {
                // Draw detailed hexagon
                ctx.beginPath();
                ctx.moveTo(corners[0].x, corners[0].y);
                for (let i = 1; i < corners.length; i++) {
                    ctx.lineTo(corners[i].x, corners[i].y);
                }
                ctx.closePath();

                if (sprite) {
                    // Use sprite - clip to hex shape and draw image
                    ctx.save();
                    ctx.clip();
                    // Calculate sprite bounds to fit hex
                    const radius = hexSize * 1.15; // Slightly larger to cover hex
                    ctx.drawImage(sprite, centerX - radius, centerY - radius, radius * 2, radius * 2);
                    ctx.restore();
                } else {
                    // Use color fill
                    ctx.fillStyle = this.getTerrainColor(hex);
                    ctx.fill();

                    // Apply texture overlay if available
                    if (texture) {
                        ctx.save();
                        // Recreate path for clipping (previous path was consumed by fill)
                        ctx.beginPath();
                        ctx.moveTo(corners[0].x, corners[0].y);
                        for (let i = 1; i < corners.length; i++) {
                            ctx.lineTo(corners[i].x, corners[i].y);
                        }
                        ctx.closePath();
                        ctx.clip();

                        const pattern = ctx.createPattern(texture, 'repeat');
                        if (pattern) {
                            ctx.fillStyle = pattern;
                            ctx.fill();
                        }
                        ctx.restore();
                    }
                }
            }

            // Highlight if this is the hovered hex
            if (highlightHex && hex.equals(highlightHex)) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                if (useSimplified) {
                    const rectSize = hexSize * 1.8;
                    ctx.fillRect(centerX - rectSize * 0.5, centerY - rectSize * 0.5, rectSize, rectSize);
                } else {
                    // Reuse hex path for highlighting
                    ctx.beginPath();
                    ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < corners.length; i++) {
                        ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
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
        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
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
        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
            const heightLayer = hex.layers.height;

            // Skip if not hills or mountains
            if (heightLayer !== 'hills' && heightLayer !== 'mountains') return;

            // Skip texture overlay only if the ACTUALLY USED sprite includes height info
            // Check if the sprite path that was loaded contains the height layer name
            const usedSpritePath = hex._usedSpritePath;
            if (usedSpritePath && usedSpritePath.includes(heightLayer)) {
                // This sprite includes height info, so don't draw overlay
                return;
            }

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
        // Only calculate borders for VISIBLE hexes!
        const visibleHexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());

        const borders = [];
        const processedBorders = new Set();
        const directions = HexMath.getNeighborDirections();

        // Check borders only for visible hexes
        visibleHexes.forEach(hex => {
            const hex1IsWater = this.grid.isHexWater(hex);

            // Check all neighbors
            for (let neighborIdx = 0; neighborIdx < 6; neighborIdx++) {
                const dir = directions[neighborIdx];
                const neighborQ = hex.q + dir.q;
                const neighborR = hex.r + dir.r;
                const neighbor = this.grid.getHex(neighborQ, neighborR);

                if (!neighbor) continue; // Edge of map

                const hex2IsWater = this.grid.isHexWater(neighbor);

                // Only create border if one is water and one is land
                if (hex1IsWater !== hex2IsWater) {
                    // Create unique key to avoid duplicates
                    const key = hex1IsWater
                        ? `${hex.q},${hex.r}-${neighbor.q},${neighbor.r}`
                        : `${neighbor.q},${neighbor.r}-${hex.q},${hex.r}`;

                    if (!processedBorders.has(key)) {
                        processedBorders.add(key);
                        borders.push({
                            hex1: hex,
                            hex2: neighbor,
                            neighborIdx: neighborIdx,
                            neighborDirection: dir
                        });
                    }
                }
            }
        });

        // Check if shore sprite is available
        const shoreSprite = AssetLoader.getImage(TerrainLayers.shoreSprite);

        if (shoreSprite) {
            // Render using sprite-based shore rendering
            this.renderShoreBordersWithSprite(ctx, offsetX, offsetY, borders, shoreSprite);
        } else {
            // Fallback to colored lines if no sprite
            this.renderBorders(ctx, offsetX, offsetY, borders, {
                strokeStyle: Terrain.Colors.SAND_BORDER,
                lineWidth: 6,
                lineCap: 'round'
            });
        }
    }

    /**
     * Render shore borders using sprites with corner detection
     * 1. Detects corners where shore edges meet
     * 2. Draws tiled edge sprites along borders
     * 3. Draws corner sprites at detected corners
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {Array} borders - Border data
     * @param {HTMLImageElement} sprite - Shore sprite image
     */
    renderShoreBordersWithSprite(ctx, offsetX, offsetY, borders, sprite) {
        // Load corner sprites
        const narrowCorner = AssetLoader.getImage(TerrainLayers.shoreCornerNarrow);
        const wideCorner = AssetLoader.getImage(TerrainLayers.shoreCornerWide);

        // Analyze sprite bounds to get visual dimensions (trimmed transparency)
        const spriteBounds = AssetLoader.getSpriteBounds(TerrainLayers.shoreSprite);
        const narrowBounds = narrowCorner ? AssetLoader.getSpriteBounds(TerrainLayers.shoreCornerNarrow) : null;
        const wideBounds = wideCorner ? AssetLoader.getSpriteBounds(TerrainLayers.shoreCornerWide) : null;

        console.log(`Shore rendering: ${borders.length} borders, sprite: ${sprite ? sprite.width + 'x' + sprite.height : 'null'}`);
        console.log(`Corners loaded: narrow=${!!narrowCorner}, wide=${!!wideCorner}`);
        if (spriteBounds) {
            console.log(`Shore sprite visual size: ${spriteBounds.visualWidth}x${spriteBounds.visualHeight}`);
        }

        // Build edge data with vertices and orientation
        const edges = [];
        const vertexMap = new Map(); // Map vertex key -> array of edges meeting at that vertex

        borders.forEach(border => {
            const sharedEdge = this.calculateSharedEdge(border.hex1, border.hex2, offsetX, offsetY);
            if (!sharedEdge) return;

            const { corner1, corner2 } = sharedEdge;

            // Determine which hex is water and which is land
            const hex1IsWater = this.grid.isHexWater(border.hex1);
            const hex2IsWater = this.grid.isHexWater(border.hex2);

            // Calculate edge properties
            const edgeLength = Math.sqrt(
                Math.pow(corner2.x - corner1.x, 2) +
                Math.pow(corner2.y - corner1.y, 2)
            );

            const edgeAngle = Math.atan2(
                corner2.y - corner1.y,
                corner2.x - corner1.x
            );

            const midX = (corner1.x + corner2.x) / 2;
            const midY = (corner1.y + corner2.y) / 2;

            // Calculate hex centers to determine orientation
            const hex1Pixel = this.grid.hexToPixel(border.hex1);
            const hex2Pixel = this.grid.hexToPixel(border.hex2);
            const hex1CenterX = hex1Pixel.x + offsetX;
            const hex1CenterY = hex1Pixel.y + offsetY;
            const hex2CenterX = hex2Pixel.x + offsetX;
            const hex2CenterY = hex2Pixel.y + offsetY;

            // Determine land side of the edge
            const landCenterX = hex1IsWater ? hex2CenterX : hex1CenterX;
            const landCenterY = hex1IsWater ? hex2CenterY : hex1CenterY;

            const edgeData = {
                corner1,
                corner2,
                edgeLength,
                edgeAngle,
                midX,
                midY,
                landCenterX,
                landCenterY,
                hex1IsWater,
                hex2IsWater
            };

            edges.push(edgeData);

            // Register this edge at both vertices
            const v1Key = `${corner1.x.toFixed(2)},${corner1.y.toFixed(2)}`;
            const v2Key = `${corner2.x.toFixed(2)},${corner2.y.toFixed(2)}`;

            if (!vertexMap.has(v1Key)) vertexMap.set(v1Key, []);
            if (!vertexMap.has(v2Key)) vertexMap.set(v2Key, []);

            vertexMap.get(v1Key).push({ edge: edgeData, isStart: true });
            vertexMap.get(v2Key).push({ edge: edgeData, isStart: false });
        });

        // Step 1: Draw all edges (tiled, not stretched)
        console.log(`Drawing ${edges.length} shore edges...`);

        // Calculate average scaled height of shore sprites for corner calibration
        let totalScaledHeight = 0;
        let edgeCount = 0;

        edges.forEach(edge => {
            const scaledHeight = this.drawTiledShoreEdge(ctx, edge, sprite, spriteBounds);
            if (scaledHeight) {
                totalScaledHeight += scaledHeight;
                edgeCount++;
            }
        });

        const avgShoreHeight = edgeCount > 0 ? totalScaledHeight / edgeCount : 50;
        console.log(`Average shore sprite height: ${avgShoreHeight.toFixed(1)}px`);

        // Step 2: Draw corners where 2+ edges meet
        if (narrowCorner && wideCorner) {
            let cornerCount = 0;
            vertexMap.forEach((edgeRefs, vertexKey) => {
                if (edgeRefs.length >= 2) {
                    cornerCount++;
                    const [x, y] = vertexKey.split(',').map(parseFloat);
                    this.drawShoreCorner(ctx, x, y, edgeRefs, narrowCorner, wideCorner, narrowBounds, wideBounds, avgShoreHeight);
                }
            });
            console.log(`Drew ${cornerCount} shore corners`);
        } else {
            console.log('Corner sprites not available, skipping corners');
        }
    }

    /**
     * Draw a tiled shore edge sprite along a border
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} edge - Edge data
     * @param {HTMLImageElement} sprite - Shore sprite image
     * @param {Object} spriteBounds - Visual bounds of sprite (trimmed transparency)
     * @returns {number} The scaled height of the sprite for corner calibration
     */
    drawTiledShoreEdge(ctx, edge, sprite, spriteBounds) {
        const { corner1, corner2, edgeLength, edgeAngle, midX, midY, landCenterX, landCenterY } = edge;

        // Determine orientation - which direction faces land
        const toLandX = landCenterX - midX;
        const toLandY = landCenterY - midY;

        const perpAngle = edgeAngle + Math.PI / 2;
        const perpX = Math.cos(perpAngle);
        const perpY = Math.sin(perpAngle);

        const dotProduct = toLandX * perpX + toLandY * perpY;
        const needsFlip = dotProduct > 0;

        // Use visual bounds if available, otherwise fall back to full sprite
        const visualHeight = spriteBounds ? spriteBounds.visualHeight : sprite.height;
        const visualWidth = spriteBounds ? spriteBounds.visualWidth : sprite.width;

        // Natural aspect ratio
        const aspectRatio = visualWidth / visualHeight;

        // Target height for initial sizing
        const targetHeight = 50;
        const naturalScaledWidth = targetHeight * aspectRatio;

        // Calculate how many tiles we need based on natural width
        const numTiles = Math.max(1, Math.ceil(edgeLength / naturalScaledWidth));

        // Scale proportionally to fit edge exactly - both width AND height
        const scaledTileWidth = edgeLength / numTiles;
        const scaledTileHeight = scaledTileWidth / aspectRatio; // Maintain aspect ratio!

        ctx.save();

        // Move to start of edge
        ctx.translate(corner1.x, corner1.y);
        ctx.rotate(edgeAngle);

        if (needsFlip) {
            // Flip vertically to orient land side correctly
            ctx.scale(1, -1);
        }

        // Draw tiles along the edge with proportional scaling
        for (let i = 0; i < numTiles; i++) {
            const x = i * scaledTileWidth;
            ctx.drawImage(
                sprite,
                x,
                -scaledTileHeight / 2,
                scaledTileWidth,
                scaledTileHeight  // Both dimensions scaled proportionally
            );
        }

        ctx.restore();

        // Return scaled height for corner calibration
        return scaledTileHeight;
    }

    /**
     * Draw a corner sprite where shore edges meet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Corner x position
     * @param {number} y - Corner y position
     * @param {Array} edgeRefs - References to edges meeting at this corner
     * @param {HTMLImageElement} narrowCorner - Narrow corner sprite
     * @param {HTMLImageElement} wideCorner - Wide corner sprite
     * @param {Object} narrowBounds - Narrow corner bounds
     * @param {Object} wideBounds - Wide corner bounds
     * @param {number} actualShoreHeight - Actual scaled height of shore sprites
     */
    drawShoreCorner(ctx, x, y, edgeRefs, narrowCorner, wideCorner, narrowBounds, wideBounds, actualShoreHeight) {
        if (edgeRefs.length < 2) return;

        // Calculate the average land direction from all edges meeting here
        let landDirX = 0;
        let landDirY = 0;

        edgeRefs.forEach(ref => {
            const { edge } = ref;
            const { midX, midY, landCenterX, landCenterY } = edge;
            const toLandX = landCenterX - midX;
            const toLandY = landCenterY - midY;
            const len = Math.sqrt(toLandX * toLandX + toLandY * toLandY);
            landDirX += toLandX / len;
            landDirY += toLandY / len;
        });

        const avgLandAngle = Math.atan2(landDirY, landDirX);

        // Calculate the angle between edges to determine corner type
        const angles = edgeRefs.map(ref => ref.edge.edgeAngle);
        let maxAngleDiff = 0;

        for (let i = 0; i < angles.length; i++) {
            for (let j = i + 1; j < angles.length; j++) {
                let diff = Math.abs(angles[i] - angles[j]);
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                maxAngleDiff = Math.max(maxAngleDiff, diff);
            }
        }

        // Choose corner sprite based on angle
        // Narrow corner for acute angles (< 100 degrees), wide for obtuse
        const useNarrow = maxAngleDiff < (100 * Math.PI / 180);
        const cornerSprite = useNarrow ? narrowCorner : wideCorner;
        const cornerBounds = useNarrow ? narrowBounds : wideBounds;

        // AUTO-CALIBRATE: Match corner size to ACTUAL shore sprite height
        const cornerVisualSize = cornerBounds ? Math.max(cornerBounds.visualWidth, cornerBounds.visualHeight) : cornerSprite.width;

        // Scale corner to match the actual scaled height of shore sprites
        const scaleFactor = actualShoreHeight / cornerVisualSize;
        const scaledCornerSize = cornerVisualSize * scaleFactor;

        console.log(`Corner: visual=${cornerVisualSize.toFixed(0)}px, scaled=${scaledCornerSize.toFixed(0)}px (matched to shore height ${actualShoreHeight.toFixed(0)}px)`);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(avgLandAngle - Math.PI / 2); // Rotate to point land side correctly
        ctx.drawImage(
            cornerSprite,
            -scaledCornerSize / 2,
            -scaledCornerSize / 2,
            scaledCornerSize,
            scaledCornerSize
        );
        ctx.restore();
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

        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
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

        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
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
            const heightColor = HEIGHT_COLORS[hex.layers.height] || '#888888';

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
        // Climate colors for land
        const CLIMATE_COLORS = {
            'hot': '#e67e22',       // Orange
            'moderate': '#27ae60',  // Green
            'cold': '#95a5a6'       // Gray
        };

        // Climate colors for water (slightly different shades)
        const CLIMATE_COLORS_WATER = {
            'hot': '#d35400',       // Darker orange (warm water)
            'moderate': '#1e8449',  // Dark green (normal water)
            'cold': '#2874a6'       // Dark blue (cold water)
        };

        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
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

            // Check if water
            const isWater = this.grid.isHexWater(hex);

            // Get climate layer and color
            const colorPalette = isWater ? CLIMATE_COLORS_WATER : CLIMATE_COLORS;
            const climateColor = colorPalette[hex.layers.climate] || '#888888';

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

        const WATER_COLOR = '#3498db'; // Blue for water

        const hexes = this.currentVisibleHexes || Array.from(this.grid.hexes.values());
        hexes.forEach(hex => {
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

            // Check if water - if so, show blue
            const isWater = this.grid.isHexWater(hex);
            if (isWater) {
                ctx.fillStyle = WATER_COLOR;
                ctx.fill();
            } else {
                // Get vegetation layer and color for land tiles
                const vegetationColor = VEGETATION_COLORS[hex.layers.vegetation] || '#888888';

                ctx.fillStyle = vegetationColor;
                ctx.fill();
            }

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
     * Get terrain color for a hex
     *
     * @param {Hex} hex - Hex to get color for
     * @returns {string} Hex color code
     */
    getTerrainColor(hex) {
        return hex.terrainComposite.color;
    }

    /**
     * Get sprite for a hex's terrain using hierarchical fallback
     * Tries multiple paths from most specific to least specific:
     * 1. vegetation-climate-height (e.g., forest-hot-mountains.png)
     * 2. vegetation-height (e.g., forest-mountains.png)
     * 3. vegetation-climate (e.g., forest-hot.png)
     * 4. vegetation only (e.g., forest.png)
     * 5. height only (e.g., mountains.png)
     * 6. climate only (e.g., hot.png)
     *
     * @param {Hex} hex - The hex
     * @returns {HTMLImageElement|null} Sprite image or null
     */
    getTerrainSprite(hex) {
        if (!hex.layers) return null;

        // Get hierarchical sprite paths
        const paths = TerrainLayers.getSpritePaths(hex.layers);

        // Try each path in order until we find a loaded sprite
        for (const path of paths) {
            const sprite = AssetLoader.getImage(path);
            if (sprite) {
                // Cache which sprite path was used for this hex
                hex._usedSpritePath = path;
                return sprite;
            }
        }

        hex._usedSpritePath = null;
        return null; // No sprite available, use color
    }

    /**
     * Get texture overlay for a hex's terrain using hierarchical fallback
     * Same priority order as sprites
     *
     * @param {Hex} hex - The hex
     * @returns {HTMLImageElement|null} Texture image or null
     */
    getTerrainTexture(hex) {
        if (!hex.layers) return null;

        // Get hierarchical texture paths
        const paths = TerrainLayers.getTexturePaths(hex.layers);

        // Try each path in order until we find a loaded texture
        for (const path of paths) {
            const texture = AssetLoader.getImage(path);
            if (texture) return texture;
        }

        return null; // No texture available
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
