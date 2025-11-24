/**
 * MapGenerator - Terrain generation algorithms for hexagonal maps
 *
 * This module handles generating terrain for hex maps.
 * No rendering, no data storage - just generation algorithms.
 */

class MapGenerator {
    /**
     * Generate a rectangular grid of random terrain
     *
     * @param {number} width - Width in hexagons
     * @param {number} height - Height in hexagons
     * @param {number} hexSize - Size of each hexagon
     * @param {string} orientation - 'pointy' or 'flat'
     * @param {Object} options - Generation options
     * @returns {HexMap} Populated hex map
     */
    static generateRectangularGrid(width, height, hexSize = 30, orientation = 'pointy', options = {}) {
        const map = new HexMap(width, height, hexSize, orientation);

        // Extract options
        const seed = options.seed || Math.random();
        const algorithm = options.algorithm || 'random';

        // Choose generation algorithm
        switch (algorithm) {
            case 'random':
                this.fillRandom(map, width, height, orientation);
                break;
            case 'perlin':
                this.fillPerlinNoise(map, width, height, orientation, options);
                break;
            case 'continents':
                this.fillContinents(map, width, height, orientation, seed);
                break;
            default:
                this.fillRandom(map, width, height, orientation);
        }

        return map;
    }

    /**
     * Fill map with random layered terrain
     * Generates height, climate, and vegetation layers independently
     *
     * @param {HexMap} map - Map to fill
     * @param {number} width - Width in hexagons
     * @param {number} height - Height in hexagons
     * @param {string} orientation - Hexagon orientation
     */
    static fillRandom(map, width, height, orientation) {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                // Convert offset coordinates to axial coordinates
                const axial = HexMath.offsetToAxial(col, row, orientation);

                // Generate random layers
                const layers = TerrainLayers.generateRandomLayers();
                const hex = new Hex(axial.q, axial.r, layers);

                map.setHex(hex);
            }
        }
    }

    /**
     * Fill map using Simplex noise for natural-looking terrain
     * Creates natural landmasses, climate zones, and coherent vegetation patterns
     *
     * @param {HexMap} map - Map to fill
     * @param {number} width - Width in hexagons
     * @param {number} height - Height in hexagons
     * @param {string} orientation - Hexagon orientation
     * @param {Object} options - Generation options
     */
    static fillPerlinNoise(map, width, height, orientation, options = {}) {
        // Default configuration
        const config = {
            seed: options.seed || Math.floor(Math.random() * 1000000),
            heightFrequency: options.heightFrequency || 0.08,
            climateFrequency: options.climateFrequency || 0.12,
            moistureFrequency: options.moistureFrequency || 0.25,
            octaves: options.octaves || 3,
            persistence: options.persistence || 0.5,

            // Height thresholds (controls water/land balance)
            deepWaterThreshold: options.deepWaterThreshold || 0.3,
            shallowWaterThreshold: options.shallowWaterThreshold || 0.45,
            lowlandsThreshold: options.lowlandsThreshold || 0.7,
            hillsThreshold: options.hillsThreshold || 0.85,

            // Island mode (force edges to water)
            islandMode: options.islandMode || false,

            // Latitude-based climate
            useLatitude: options.useLatitude !== false  // Default true
        };

        console.log(`Generating terrain with Simplex noise (seed: ${config.seed})`);

        // Initialize noise generator
        const noise = new SimplexNoise(config.seed);

        // Generate noise maps for entire grid
        const heightMap = this.generateHeightNoiseMap(noise, width, height, config);
        const climateMap = this.generateClimateNoiseMap(noise, width, height, config);
        const moistureMap = this.generateMoistureNoiseMap(noise, width, height, config);

        // Fill map using noise-driven generation
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                // Convert offset coordinates to axial
                const axial = HexMath.offsetToAxial(col, row, orientation);

                // Get noise values for this position
                const heightValue = heightMap[row][col];
                const climateValue = climateMap[row][col];
                const moistureValue = moistureMap[row][col];

                // Determine layers from noise values
                const height = this.heightFromNoise(heightValue, config);
                const climate = this.climateFromNoise(climateValue, row, height, config);

                // Get valid vegetation types given height and climate constraints
                const layers = { height, climate };
                const validVegetation = TerrainLayers.getValidTypes('vegetation', layers);

                // Select vegetation based on moisture and constraints
                const vegetation = this.selectVegetation(validVegetation, moistureValue, height, climate);
                layers.vegetation = vegetation;

                // Create and store hex
                const hex = new Hex(axial.q, axial.r, layers);
                map.setHex(hex);
            }
        }

        console.log('Terrain generation complete');
    }

    /**
     * Fill map with continent-like landmasses
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to fill
     * @param {number} width - Width in hexagons
     * @param {number} height - Height in hexagons
     * @param {string} orientation - Hexagon orientation
     * @param {number} seed - Random seed
     */
    static fillContinents(map, width, height, orientation, seed) {
        // TODO: Implement continent generation
        // For now, fall back to random
        console.log('Continent generation not yet implemented, using random');
        this.fillRandom(map, width, height, orientation);
    }

    /**
     * Generate terrain using cellular automata
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to fill
     * @param {number} iterations - Number of smoothing iterations
     */
    static smoothTerrain(map, iterations = 3) {
        // TODO: Implement cellular automata smoothing
        // This would make terrain more clustered and natural-looking
        console.log('Terrain smoothing not yet implemented');
    }

    /**
     * Generate rivers on the map
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to modify
     * @param {number} riverCount - Number of rivers to generate
     */
    static generateRivers(map, riverCount = 3) {
        // TODO: Implement river generation
        // Rivers would flow from high to low elevation
        console.log('River generation not yet implemented');
    }

    /**
     * Apply biomes based on temperature and moisture
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to modify
     * @param {Object} biomeConfig - Biome configuration
     */
    static applyBiomes(map, biomeConfig = {}) {
        // TODO: Implement biome system
        // Different terrain types based on temperature/moisture gradients
        console.log('Biome system not yet implemented');
    }

    /**
     * Generate height map for the terrain
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to modify
     * @returns {Map<string, number>} Height values for each hex
     */
    static generateHeightMap(map) {
        // TODO: Implement height map generation
        // This could use Perlin noise or diamond-square algorithm
        console.log('Height map generation not yet implemented');
        return new Map();
    }

    /**
     * Place resources on the map
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to modify
     * @param {Object} resourceConfig - Resource placement configuration
     */
    static placeResources(map, resourceConfig = {}) {
        // TODO: Implement resource placement
        // Strategic resources like iron, gold, etc.
        console.log('Resource placement not yet implemented');
    }

    /**
     * Find good starting positions for players
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to analyze
     * @param {number} playerCount - Number of players
     * @returns {Array<{q: number, r: number}>} Starting positions
     */
    static findStartingPositions(map, playerCount) {
        // TODO: Implement starting position finder
        // Should find balanced positions with good resources
        console.log('Starting position finder not yet implemented');
        return [];
    }

    /**
     * Validate that the generated map is playable
     * (Placeholder for future implementation)
     *
     * @param {HexMap} map - Map to validate
     * @returns {Object} Validation results
     */
    static validateMap(map) {
        // TODO: Implement map validation
        // Check for isolated land masses, resource distribution, etc.
        console.log('Map validation not yet implemented');
        return {
            valid: true,
            warnings: [],
            errors: []
        };
    }

    // ============================================================================
    // PERLIN NOISE HELPER METHODS
    // ============================================================================

    /**
     * Generate height noise map for entire grid
     * Uses low frequency for large landmasses
     *
     * @param {SimplexNoise} noise - Noise generator
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @param {Object} config - Configuration
     * @returns {Array<Array<number>>} 2D array of noise values [0, 1]
     */
    static generateHeightNoiseMap(noise, width, height, config) {
        const map = [];

        for (let row = 0; row < height; row++) {
            map[row] = [];
            for (let col = 0; col < width; col++) {
                // Sample noise at this position
                let value = noise.octaveNoise01(
                    col * config.heightFrequency,
                    row * config.heightFrequency,
                    config.octaves,
                    config.persistence
                );

                // Island mode: fade to water at edges
                if (config.islandMode) {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const distX = (col - centerX) / centerX;
                    const distY = (row - centerY) / centerY;
                    const distFromCenter = Math.sqrt(distX * distX + distY * distY);

                    // Fade using smooth curve
                    const fadeFactor = Math.max(0, 1 - distFromCenter);
                    value *= fadeFactor * fadeFactor;
                }

                map[row][col] = value;
            }
        }

        return map;
    }

    /**
     * Generate climate noise map for entire grid
     * Uses medium frequency for climate zones
     *
     * @param {SimplexNoise} noise - Noise generator
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @param {Object} config - Configuration
     * @returns {Array<Array<number>>} 2D array of noise values [0, 1]
     */
    static generateClimateNoiseMap(noise, width, height, config) {
        const map = [];

        for (let row = 0; row < height; row++) {
            map[row] = [];
            for (let col = 0; col < width; col++) {
                // Sample noise at this position
                let value = noise.octaveNoise01(
                    col * config.climateFrequency + 1000,  // Offset to decorrelate from height
                    row * config.climateFrequency + 1000,
                    config.octaves,
                    config.persistence
                );

                // Optional: Blend with latitude-based temperature
                if (config.useLatitude) {
                    // Distance from equator (middle)
                    const distFromEquator = Math.abs(row - height / 2) / (height / 2);

                    // Latitude influence: hot at center, cold at edges
                    const latitudeTemp = 1.0 - (distFromEquator * 0.7);  // 0.7 = influence factor

                    // Blend noise with latitude (60% noise, 40% latitude)
                    value = value * 0.6 + latitudeTemp * 0.4;
                }

                map[row][col] = value;
            }
        }

        return map;
    }

    /**
     * Generate moisture noise map for entire grid
     * Uses higher frequency for local variation
     *
     * @param {SimplexNoise} noise - Noise generator
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     * @param {Object} config - Configuration
     * @returns {Array<Array<number>>} 2D array of noise values [0, 1]
     */
    static generateMoistureNoiseMap(noise, width, height, config) {
        const map = [];

        for (let row = 0; row < height; row++) {
            map[row] = [];
            for (let col = 0; col < width; col++) {
                // Sample noise at this position
                const value = noise.octaveNoise01(
                    col * config.moistureFrequency + 2000,  // Offset to decorrelate
                    row * config.moistureFrequency + 2000,
                    config.octaves,
                    config.persistence
                );

                map[row][col] = value;
            }
        }

        return map;
    }

    /**
     * Map noise value to height type using thresholds
     *
     * @param {number} noiseValue - Noise value [0, 1]
     * @param {Object} config - Configuration with thresholds
     * @returns {string} Height type ID
     */
    static heightFromNoise(noiseValue, config) {
        if (noiseValue < config.deepWaterThreshold) {
            return 'deep_water';
        } else if (noiseValue < config.shallowWaterThreshold) {
            return 'shallow_water';
        } else if (noiseValue < config.lowlandsThreshold) {
            return 'lowlands';
        } else if (noiseValue < config.hillsThreshold) {
            return 'hills';
        } else {
            return 'mountains';
        }
    }

    /**
     * Map noise value to climate type
     * Optionally considers latitude-based temperature
     *
     * @param {number} noiseValue - Climate noise value [0, 1]
     * @param {number} row - Row position (for latitude)
     * @param {number} height - Grid height (for latitude)
     * @param {Object} config - Configuration
     * @returns {string} Climate type ID
     */
    static climateFromNoise(noiseValue, row, height, config) {
        // Map noise to climate thresholds
        if (noiseValue < 0.33) {
            return 'cold';
        } else if (noiseValue < 0.66) {
            return 'moderate';
        } else {
            return 'hot';
        }
    }

    /**
     * Select vegetation from valid types based on moisture and climate
     * Respects terrain constraints
     *
     * @param {Array<string>} validTypes - Valid vegetation types
     * @param {number} moistureValue - Moisture noise [0, 1]
     * @param {string} height - Height type
     * @param {string} climate - Climate type
     * @returns {string} Selected vegetation type ID
     */
    static selectVegetation(validTypes, moistureValue, height, climate) {
        if (validTypes.length === 0) {
            return 'none';
        }

        // If only one valid type, use it
        if (validTypes.length === 1) {
            return validTypes[0];
        }

        // Filter valid types based on moisture preferences
        // This creates natural distribution of vegetation

        // Water tiles: no vegetation
        if (height === 'deep_water' || height === 'shallow_water') {
            return 'none';
        }

        // Define moisture preferences for each vegetation type
        const moisturePreferences = {
            'desert': 0.2,      // Very dry
            'none': 0.3,        // Dry
            'grassland': 0.5,   // Moderate
            'tundra': 0.6,      // Cool and moderate
            'forest': 0.7,      // Moist
            'swamp': 0.9        // Very wet
        };

        // Find the vegetation type whose preference is closest to moisture value
        let bestType = validTypes[0];
        let bestDiff = 999;

        for (const type of validTypes) {
            const preference = moisturePreferences[type] || 0.5;
            const diff = Math.abs(preference - moistureValue);

            if (diff < bestDiff) {
                bestDiff = diff;
                bestType = type;
            }
        }

        return bestType;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapGenerator;
}
