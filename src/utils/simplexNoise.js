/**
 * Simplex Noise Implementation
 *
 * A fast, seeded 2D noise generator for procedural terrain generation.
 * Based on Ken Perlin's Simplex Noise algorithm.
 *
 * Usage:
 *   const noise = new SimplexNoise(seed);
 *   const value = noise.noise2D(x, y);  // Returns value between -1 and 1
 *   const octaves = noise.octaveNoise(x, y, 4, 0.5);  // Multi-octave noise
 */

class SimplexNoise {
    constructor(seed = 0) {
        this.seed = seed;
        this.perm = this.buildPermutationTable(seed);
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    }

    /**
     * Build permutation table from seed
     * Creates deterministic pseudo-random permutation for consistent results
     */
    buildPermutationTable(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Seeded Fisher-Yates shuffle
        let random = this.seededRandom(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate for wrapping
        const perm = new Array(512);
        for (let i = 0; i < 512; i++) {
            perm[i] = p[i & 255];
        }

        return perm;
    }

    /**
     * Seeded random number generator
     * Returns a function that generates deterministic random numbers
     */
    seededRandom(seed) {
        let state = seed;
        return function() {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }

    /**
     * Dot product for gradient
     */
    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    /**
     * 2D Simplex Noise
     * Returns value between -1 and 1
     *
     * @param {number} xin - X coordinate
     * @param {number} yin - Y coordinate
     * @returns {number} Noise value [-1, 1]
     */
    noise2D(xin, yin) {
        let n0, n1, n2; // Noise contributions from the three corners

        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin) * this.F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * this.G2;

        // Unskew the cell origin back to (x,y) space
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0; // The x,y distances from the cell origin
        const y0 = yin - Y0;

        // Determine which simplex we are in
        let i1, j1; // Offsets for second (middle) corner of simplex
        if (x0 > y0) {
            i1 = 1; j1 = 0; // Lower triangle, XY order: (0,0)->(1,0)->(1,1)
        } else {
            i1 = 0; j1 = 1; // Upper triangle, YX order: (0,0)->(0,1)->(1,1)
        }

        // Offsets for middle corner in (x,y) unskewed coords
        const x1 = x0 - i1 + this.G2;
        const y1 = y0 - j1 + this.G2;
        const x2 = x0 - 1.0 + 2.0 * this.G2;
        const y2 = y0 - 1.0 + 2.0 * this.G2;

        // Work out the hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        // Add contributions from each corner to get the final noise value
        // The result is scaled to return values in the interval [-1, 1]
        return 70.0 * (n0 + n1 + n2);
    }

    /**
     * Multi-octave Simplex Noise (Fractal Brownian Motion)
     * Combines multiple frequencies for natural-looking terrain
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of noise layers (default: 4)
     * @param {number} persistence - Amplitude decrease per octave (default: 0.5)
     * @param {number} frequency - Base frequency (default: 1)
     * @returns {number} Noise value [-1, 1]
     */
    octaveNoise(x, y, octaves = 4, persistence = 0.5, frequency = 1) {
        let total = 0;
        let amplitude = 1;
        let maxValue = 0; // Used for normalizing result to [-1, 1]

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }

    /**
     * Normalized noise - returns value between 0 and 1
     * Useful for direct threshold comparisons
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Noise value [0, 1]
     */
    noise01(x, y) {
        return (this.noise2D(x, y) + 1) * 0.5;
    }

    /**
     * Multi-octave normalized noise
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of noise layers
     * @param {number} persistence - Amplitude decrease per octave
     * @param {number} frequency - Base frequency
     * @returns {number} Noise value [0, 1]
     */
    octaveNoise01(x, y, octaves = 4, persistence = 0.5, frequency = 1) {
        return (this.octaveNoise(x, y, octaves, persistence, frequency) + 1) * 0.5;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimplexNoise;
}
