/**
 * HexMath - Pure hexagon coordinate mathematics
 *
 * This module contains all pure mathematical functions for working with hexagonal grids.
 * No state, no rendering, just math.
 *
 * Coordinate System: Axial (q, r) for pointy-top hexagons
 * - q: column coordinate
 * - r: row coordinate
 * - s: calculated as -q - r (cube coordinate)
 */

const HexMath = {
    /**
     * Hex orientations
     */
    Orientation: {
        POINTY: 'pointy',
        FLAT: 'flat'
    },

    /**
     * Get neighbor direction offsets for axial coordinates
     * Order: [East, Northeast, Northwest, West, Southwest, Southeast]
     *
     * @returns {Array<{q: number, r: number}>} Array of direction offsets
     */
    getNeighborDirections() {
        return [
            { q: +1, r: 0 },  // East
            { q: +1, r: -1 }, // Northeast
            { q: 0, r: -1 },  // Northwest
            { q: -1, r: 0 },  // West
            { q: -1, r: +1 }, // Southwest
            { q: 0, r: +1 }   // Southeast
        ];
    },

    /**
     * Get neighbor coordinates for a given hex
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @returns {Array<{q: number, r: number}>} Array of neighbor coordinates
     */
    getNeighbors(q, r) {
        const directions = this.getNeighborDirections();
        return directions.map(dir => ({
            q: q + dir.q,
            r: r + dir.r
        }));
    },

    /**
     * Convert hex axial coordinates to pixel coordinates
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @param {number} size - Hex size (distance from center to corner)
     * @param {string} orientation - 'pointy' or 'flat'
     * @returns {{x: number, y: number}} Pixel coordinates
     */
    hexToPixel(q, r, size, orientation = 'pointy') {
        let x, y;

        if (orientation === 'pointy') {
            x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
            y = size * (3 / 2 * r);
        } else {
            // Flat-top orientation
            x = size * (3 / 2 * q);
            y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
        }

        return { x, y };
    },

    /**
     * Convert pixel coordinates to hex axial coordinates
     *
     * @param {number} x - Pixel x coordinate
     * @param {number} y - Pixel y coordinate
     * @param {number} size - Hex size (distance from center to corner)
     * @param {string} orientation - 'pointy' or 'flat'
     * @returns {{q: number, r: number}} Hex coordinates (rounded)
     */
    pixelToHex(x, y, size, orientation = 'pointy') {
        let q, r;

        if (orientation === 'pointy') {
            q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / size;
            r = (2 / 3 * y) / size;
        } else {
            // Flat-top orientation
            q = (2 / 3 * x) / size;
            r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
        }

        return this.roundHex(q, r);
    },

    /**
     * Round fractional hex coordinates to nearest hex
     * Uses cube coordinate system for accurate rounding
     *
     * @param {number} q - Fractional q coordinate
     * @param {number} r - Fractional r coordinate
     * @returns {{q: number, r: number}} Rounded hex coordinates
     */
    roundHex(q, r) {
        const s = -q - r;

        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        // Recalculate the coordinate with the largest rounding error
        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return { q: rq, r: rr };
    },

    /**
     * Get the corner positions for a hexagon
     *
     * @param {number} centerX - Center X in pixels
     * @param {number} centerY - Center Y in pixels
     * @param {number} size - Hex size (distance from center to corner)
     * @param {string} orientation - 'pointy' or 'flat'
     * @returns {Array<{x: number, y: number}>} Array of 6 corner positions
     */
    getHexCorners(centerX, centerY, size, orientation = 'pointy') {
        const corners = [];
        const startAngle = orientation === 'pointy' ? 30 : 0;

        for (let i = 0; i < 6; i++) {
            const angleRad = (Math.PI / 180) * (60 * i + startAngle);
            corners.push({
                x: centerX + size * Math.cos(angleRad),
                y: centerY + size * Math.sin(angleRad)
            });
        }

        return corners;
    },

    /**
     * Calculate distance between two hexes (in hex units)
     *
     * @param {number} q1 - First hex q coordinate
     * @param {number} r1 - First hex r coordinate
     * @param {number} q2 - Second hex q coordinate
     * @param {number} r2 - Second hex r coordinate
     * @returns {number} Distance in hex units
     */
    distance(q1, r1, q2, r2) {
        const s1 = -q1 - r1;
        const s2 = -q2 - r2;
        return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(s1 - s2)) / 2;
    },

    /**
     * Convert offset coordinates to axial coordinates
     * Useful for rectangular grid initialization
     *
     * @param {number} col - Column in offset system
     * @param {number} row - Row in offset system
     * @param {string} orientation - 'pointy' or 'flat'
     * @returns {{q: number, r: number}} Axial coordinates
     */
    offsetToAxial(col, row, orientation = 'pointy') {
        if (orientation === 'pointy') {
            // Odd-row offset (shoves odd rows right)
            const q = col - Math.floor(row / 2);
            const r = row;
            return { q, r };
        } else {
            // Odd-column offset (shoves odd columns down)
            const q = col;
            const r = row - Math.floor(col / 2);
            return { q, r };
        }
    },

    /**
     * Convert axial coordinates to offset coordinates
     *
     * @param {number} q - Hex q coordinate
     * @param {number} r - Hex r coordinate
     * @param {string} orientation - 'pointy' or 'flat'
     * @returns {{col: number, row: number}} Offset coordinates
     */
    axialToOffset(q, r, orientation = 'pointy') {
        if (orientation === 'pointy') {
            const col = q + Math.floor(r / 2);
            const row = r;
            return { col, row };
        } else {
            const col = q;
            const row = r + Math.floor(q / 2);
            return { col, row };
        }
    },

    /**
     * Check if two hexes are equal
     *
     * @param {number} q1 - First hex q coordinate
     * @param {number} r1 - First hex r coordinate
     * @param {number} q2 - Second hex q coordinate
     * @param {number} r2 - Second hex r coordinate
     * @returns {boolean} True if hexes are equal
     */
    equals(q1, r1, q2, r2) {
        return q1 === q2 && r1 === r2;
    },

    /**
     * Get a line of hexes between two hexes
     * Useful for line of sight, pathfinding visualization, etc.
     *
     * @param {number} q1 - Start hex q coordinate
     * @param {number} r1 - Start hex r coordinate
     * @param {number} q2 - End hex q coordinate
     * @param {number} r2 - End hex r coordinate
     * @returns {Array<{q: number, r: number}>} Array of hex coordinates forming a line
     */
    hexLine(q1, r1, q2, r2) {
        const distance = this.distance(q1, r1, q2, r2);
        const results = [];

        for (let i = 0; i <= distance; i++) {
            const t = distance === 0 ? 0 : i / distance;
            const q = q1 * (1 - t) + q2 * t;
            const r = r1 * (1 - t) + r2 * t;
            results.push(this.roundHex(q, r));
        }

        return results;
    },

    /**
     * Get all hexes in a ring around a center hex
     *
     * @param {number} centerQ - Center hex q coordinate
     * @param {number} centerR - Center hex r coordinate
     * @param {number} radius - Ring radius (1 = immediate neighbors)
     * @returns {Array<{q: number, r: number}>} Array of hex coordinates in the ring
     */
    hexRing(centerQ, centerR, radius) {
        if (radius === 0) {
            return [{ q: centerQ, r: centerR }];
        }

        const results = [];
        const directions = this.getNeighborDirections();

        // Start at a hex 'radius' steps away
        let q = centerQ + directions[4].q * radius; // Southwest
        let r = centerR + directions[4].r * radius;

        // Walk around the ring
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < radius; j++) {
                results.push({ q, r });
                q += directions[i].q;
                r += directions[i].r;
            }
        }

        return results;
    },

    /**
     * Get all hexes within a radius (filled circle)
     *
     * @param {number} centerQ - Center hex q coordinate
     * @param {number} centerR - Center hex r coordinate
     * @param {number} radius - Circle radius
     * @returns {Array<{q: number, r: number}>} Array of hex coordinates
     */
    hexRange(centerQ, centerR, radius) {
        const results = [];

        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                results.push({ q: centerQ + q, r: centerR + r });
            }
        }

        return results;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HexMath;
}
