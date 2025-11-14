/**
 * HexMap - Pure data storage for hexagonal grids
 *
 * This module handles storing hexes and providing query operations.
 * No generation logic, no rendering - just data.
 */

/**
 * Hex - Represents a single hexagon in the grid
 */
class Hex {
    constructor(q, r, type = 'grass') {
        this.q = q; // column (axial coordinate)
        this.r = r; // row (axial coordinate)
        this.type = type; // terrain type
        this.data = {}; // additional data storage
    }

    /**
     * Get the third cube coordinate (s = -q - r)
     */
    get s() {
        return -this.q - this.r;
    }

    /**
     * Check if two hexes are equal
     */
    equals(other) {
        return HexMath.equals(this.q, this.r, other.q, other.r);
    }

    /**
     * Get neighboring hexes coordinates
     */
    static getNeighborDirections() {
        return HexMath.getNeighborDirections();
    }

    /**
     * Get all neighbor coordinates
     */
    getNeighbors() {
        const neighbors = HexMath.getNeighbors(this.q, this.r);
        return neighbors.map(n => new Hex(n.q, n.r));
    }

    /**
     * Calculate distance to another hex
     */
    distanceTo(other) {
        return HexMath.distance(this.q, this.r, other.q, other.r);
    }
}

class HexMap {
    constructor(width, height, hexSize = 30, orientation = 'pointy') {
        this.width = width; // map width in hexagons
        this.height = height; // map height in hexagons
        this.hexSize = hexSize; // size of each hexagon
        this.orientation = orientation; // pointy or flat top
        this.hexes = new Map(); // storage for hexes (key: "q,r")
    }

    /**
     * Store a hex in the grid
     *
     * @param {Hex} hex - Hex to store
     */
    setHex(hex) {
        const key = `${hex.q},${hex.r}`;
        this.hexes.set(key, hex);
    }

    /**
     * Get a hex from the grid
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @returns {Hex|undefined} Hex at coordinates or undefined
     */
    getHex(q, r) {
        const key = `${q},${r}`;
        return this.hexes.get(key);
    }

    /**
     * Remove a hex from the grid
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @returns {boolean} True if hex was removed
     */
    removeHex(q, r) {
        const key = `${q},${r}`;
        return this.hexes.delete(key);
    }

    /**
     * Check if hex exists at coordinates
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @returns {boolean} True if hex exists
     */
    hasHex(q, r) {
        const key = `${q},${r}`;
        return this.hexes.has(key);
    }

    /**
     * Clear all hexes from the map
     */
    clear() {
        this.hexes.clear();
    }

    /**
     * Get total number of hexes
     *
     * @returns {number} Number of hexes in map
     */
    size() {
        return this.hexes.size;
    }

    /**
     * Get all hexes as an array
     *
     * @returns {Array<Hex>} Array of all hexes
     */
    getAllHexes() {
        return Array.from(this.hexes.values());
    }

    /**
     * Get all hexes matching a condition
     *
     * @param {Function} predicate - Function that returns true for matching hexes
     * @returns {Array<Hex>} Array of matching hexes
     */
    findHexes(predicate) {
        return this.getAllHexes().filter(predicate);
    }

    /**
     * Get all hexes of a specific terrain type
     *
     * @param {string} terrainType - Terrain type ID
     * @returns {Array<Hex>} Array of hexes with that terrain
     */
    getHexesByTerrain(terrainType) {
        return this.findHexes(hex => hex.type === terrainType);
    }

    /**
     * Convert hex coordinates to pixel coordinates
     *
     * @param {Hex} hex - Hex to convert
     * @returns {{x: number, y: number}} Pixel coordinates
     */
    hexToPixel(hex) {
        return HexMath.hexToPixel(hex.q, hex.r, this.hexSize, this.orientation);
    }

    /**
     * Convert pixel coordinates to hex coordinates
     *
     * @param {number} x - Pixel x coordinate
     * @param {number} y - Pixel y coordinate
     * @returns {{q: number, r: number}} Hex coordinates
     */
    pixelToHex(x, y) {
        return HexMath.pixelToHex(x, y, this.hexSize, this.orientation);
    }

    /**
     * Get hexagon corner positions for a given center point
     *
     * @param {number} centerX - Center X in pixels
     * @param {number} centerY - Center Y in pixels
     * @returns {Array<{x: number, y: number}>} Array of 6 corner positions
     */
    getHexCorners(centerX, centerY) {
        return HexMath.getHexCorners(centerX, centerY, this.hexSize, this.orientation);
    }

    /**
     * Get neighbors of a hex that exist in the map
     *
     * @param {Hex} hex - Hex to get neighbors for
     * @returns {Array<Hex>} Array of neighbor hexes that exist
     */
    getExistingNeighbors(hex) {
        const neighborCoords = HexMath.getNeighbors(hex.q, hex.r);
        return neighborCoords
            .map(n => this.getHex(n.q, n.r))
            .filter(n => n !== undefined);
    }

    /**
     * Get all borders between two terrain types
     *
     * @param {Function} shouldDrawBorder - Function(type1, type2) that returns true if border should be drawn
     * @returns {Array<{hex1: Hex, hex2: Hex, neighborIdx: number, neighborDirection: number}>} Border data
     */
    getBorders(shouldDrawBorder) {
        const borders = [];
        const processedBorders = new Set();
        const directions = HexMath.getNeighborDirections();

        this.hexes.forEach(hex => {
            // Check all neighbors
            for (let neighborIdx = 0; neighborIdx < 6; neighborIdx++) {
                const dir = directions[neighborIdx];
                const neighborQ = hex.q + dir.q;
                const neighborR = hex.r + dir.r;
                const neighbor = this.getHex(neighborQ, neighborR);

                // Check if border should be drawn
                if (neighbor && shouldDrawBorder(hex.type, neighbor.type)) {
                    // Create unique border ID (sorted to avoid duplicates)
                    const id1 = `${hex.q},${hex.r}`;
                    const id2 = `${neighborQ},${neighborR}`;
                    const borderId = id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;

                    // Only add if we haven't processed this border yet
                    if (!processedBorders.has(borderId)) {
                        processedBorders.add(borderId);

                        borders.push({
                            hex1: hex,
                            hex2: neighbor,
                            neighborIdx: neighborIdx,
                            neighborDirection: neighborIdx
                        });
                    }
                }
            }
        });

        return borders;
    }

    /**
     * Get all water-land borders (convenience method)
     *
     * @returns {Array<{hex1: Hex, hex2: Hex, neighborIdx: number, neighborDirection: number}>} Border data
     */
    getWaterLandBorders() {
        return this.getBorders((type1, type2) => Terrain.shouldDrawBorder(type1, type2));
    }

    /**
     * Get hexes in a specific region (rectangle)
     *
     * @param {number} minQ - Minimum q coordinate
     * @param {number} maxQ - Maximum q coordinate
     * @param {number} minR - Minimum r coordinate
     * @param {number} maxR - Maximum r coordinate
     * @returns {Array<Hex>} Hexes in region
     */
    getHexesInRegion(minQ, maxQ, minR, maxR) {
        return this.findHexes(hex =>
            hex.q >= minQ && hex.q <= maxQ &&
            hex.r >= minR && hex.r <= maxR
        );
    }

    /**
     * Get hexes within a radius of a center hex
     *
     * @param {Hex} centerHex - Center hex
     * @param {number} radius - Radius in hex units
     * @returns {Array<Hex>} Hexes within radius
     */
    getHexesInRadius(centerHex, radius) {
        const hexCoords = HexMath.hexRange(centerHex.q, centerHex.r, radius);
        return hexCoords
            .map(coord => this.getHex(coord.q, coord.r))
            .filter(hex => hex !== undefined);
    }

    /**
     * Get the bounds of the map
     *
     * @returns {{minQ: number, maxQ: number, minR: number, maxR: number}} Map bounds
     */
    getBounds() {
        let minQ = Infinity, maxQ = -Infinity;
        let minR = Infinity, maxR = -Infinity;

        this.hexes.forEach(hex => {
            minQ = Math.min(minQ, hex.q);
            maxQ = Math.max(maxQ, hex.q);
            minR = Math.min(minR, hex.r);
            maxR = Math.max(maxR, hex.r);
        });

        return { minQ, maxQ, minR, maxR };
    }

    /**
     * Serialize map to JSON
     *
     * @returns {Object} Serialized map data
     */
    toJSON() {
        const hexArray = this.getAllHexes().map(hex => ({
            q: hex.q,
            r: hex.r,
            type: hex.type,
            data: hex.data
        }));

        return {
            width: this.width,
            height: this.height,
            hexSize: this.hexSize,
            orientation: this.orientation,
            hexes: hexArray
        };
    }

    /**
     * Load map from JSON
     *
     * @param {Object} json - Serialized map data
     * @returns {HexMap} New map loaded from data
     */
    static fromJSON(json) {
        const map = new HexMap(json.width, json.height, json.hexSize, json.orientation);

        json.hexes.forEach(hexData => {
            const hex = new Hex(hexData.q, hexData.r, hexData.type);
            hex.data = hexData.data || {};
            map.setHex(hex);
        });

        return map;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HexMap;
}
