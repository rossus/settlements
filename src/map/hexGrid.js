/**
 * Hexagonal Grid System for Settlements
 * Uses axial coordinate system (q, r)
 *
 * NOTE: This is now a thin wrapper around HexMap and MapGenerator
 * for backward compatibility. Consider using HexMap directly in new code.
 * The Hex class is now defined in hexMap.js
 */

class HexGrid {
    constructor(width, height, hexSize = 30, options = {}) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize;
        this.orientation = 'pointy';

        // Use MapGenerator to create the map
        this.map = MapGenerator.generateRectangularGrid(
            width,
            height,
            hexSize,
            this.orientation,
            options
        );

        // Cache for neighbor-edge relationships
        this.initializeNeighborEdgeMapping();
    }

    /**
     * Initialize the mapping between neighbor directions and hex edges
     * For pointy-top orientation:
     * - Corners are numbered 0-5 clockwise starting from top-right (30°)
     * - Neighbors are: [E, NE, NW, W, SW, SE]
     */
    initializeNeighborEdgeMapping() {
        // Map: which edge (corner pair) corresponds to which neighbor direction
        // This is for pointy-top hexagons where corners start at 30° and go clockwise
        this.neighborToEdge = new Map();

        // Neighbor 0: East (+1, 0) - shares edge 5-0 (right side, vertical edge)
        this.neighborToEdge.set(0, 5);

        // Neighbor 1: Northeast (+1, -1) - shares edge 0-1 (upper-right edge)
        this.neighborToEdge.set(1, 0);

        // Neighbor 2: Northwest (0, -1) - shares edge 1-2 (upper-left edge)
        this.neighborToEdge.set(2, 1);

        // Neighbor 3: West (-1, 0) - shares edge 2-3 (left side, vertical edge)
        this.neighborToEdge.set(3, 2);

        // Neighbor 4: Southwest (-1, +1) - shares edge 3-4 (lower-left edge)
        this.neighborToEdge.set(4, 3);

        // Neighbor 5: Southeast (0, +1) - shares edge 4-5 (lower-right edge)
        this.neighborToEdge.set(5, 4);
    }

    // Delegate to underlying HexMap
    get hexes() {
        return this.map.hexes;
    }

    /**
     * Store a hex in the grid
     */
    setHex(hex) {
        this.map.setHex(hex);
    }

    /**
     * Get a hex from the grid
     */
    getHex(q, r) {
        return this.map.getHex(q, r);
    }

    /**
     * Convert hex coordinates to pixel coordinates
     */
    hexToPixel(hex) {
        return this.map.hexToPixel(hex);
    }

    /**
     * Convert pixel coordinates to hex coordinates
     */
    pixelToHex(x, y) {
        return this.map.pixelToHex(x, y);
    }

    /**
     * Get hexagon corner positions for drawing
     */
    getHexCorners(centerX, centerY) {
        return this.map.getHexCorners(centerX, centerY);
    }

    /**
     * Get all water-land borders in the grid
     */
    getWaterLandBorders() {
        return this.map.getWaterLandBorders();
    }

    /**
     * Check if a hex is water (works with both old and new terrain systems)
     */
    isHexWater(hex) {
        return this.map.isHexWater(hex);
    }

    /**
     * Get neighbors of a hex that exist in the grid
     */
    getNeighbors(hex) {
        return this.map.getExistingNeighbors(hex);
    }

    /**
     * Get all hexes as an array
     */
    getAllHexes() {
        return this.map.getAllHexes();
    }

    /**
     * Get total number of hexes
     */
    size() {
        return this.map.size();
    }
}
