/**
 * TerrainLayers - Layered terrain system for Settlements
 *
 * This module implements a multi-layer terrain system where terrain is composed of:
 * - Height layer (elevation): deep water, shallow water, lowlands, hills, mountains
 * - Climate layer (temperature): hot, moderate, cold
 * - Vegetation layer (surface): none, grassland, forest, desert, tundra, swamp
 *
 * This allows for terrain transformation (chop forest, terraform, climate change)
 * and generates much richer terrain variety from simple layer combinations.
 */

const TerrainLayers = {
    /**
     * Height/Elevation layer definitions
     * Determines base terrain type and walkability
     */
    Height: {
        DEEP_WATER: {
            id: 'deep_water',
            name: 'Deep Water',
            elevation: -2,
            baseColor: '#4a90e2',
            walkable: false,
            buildable: false,
            isWater: true,
            generationWeight: 15,
            description: 'Deep water, impassable without boats'
        },
        SHALLOW_WATER: {
            id: 'shallow_water',
            name: 'Shallow Water',
            elevation: -1,
            baseColor: '#7cb9e8',
            walkable: true,
            buildable: false,
            isWater: true,
            generationWeight: 8,
            description: 'Shallow water that can be waded through'
        },
        LOWLANDS: {
            id: 'lowlands',
            name: 'Lowlands',
            elevation: 0,
            baseColor: null, // Uses vegetation color
            walkable: true,
            buildable: true,
            isWater: false,
            generationWeight: 50,
            description: 'Low-lying flat terrain'
        },
        HILLS: {
            id: 'hills',
            name: 'Hills',
            elevation: 1,
            baseColor: null, // Uses vegetation color with tint
            walkable: true,
            buildable: true,
            isWater: false,
            generationWeight: 20,
            description: 'Rolling hills'
        },
        MOUNTAINS: {
            id: 'mountains',
            name: 'Mountains',
            elevation: 2,
            baseColor: '#8b7355',
            walkable: true,
            buildable: false,
            isWater: false,
            generationWeight: 7,
            description: 'Tall mountains'
        }
    },

    /**
     * Climate/Temperature layer definitions
     * Affects color tinting and vegetation types
     */
    Climate: {
        HOT: {
            id: 'hot',
            name: 'Hot',
            temperature: 2,
            colorTint: '#ffaa77', // Warm orange tint
            generationWeight: 25,
            description: 'Hot climate zone'
        },
        MODERATE: {
            id: 'moderate',
            name: 'Moderate',
            temperature: 1,
            colorTint: null, // No tint
            generationWeight: 50,
            description: 'Temperate climate zone'
        },
        COLD: {
            id: 'cold',
            name: 'Cold',
            temperature: 0,
            colorTint: '#aaccff', // Cool blue tint
            generationWeight: 25,
            description: 'Cold climate zone'
        }
    },

    /**
     * Vegetation/Surface layer definitions
     * Determines movement cost and surface appearance
     */
    Vegetation: {
        NONE: {
            id: 'none',
            name: 'Barren',
            baseColor: '#b8a896',
            movementCost: 1,
            buildable: true,
            generationWeight: 5,
            description: 'Barren rocky ground'
        },
        GRASSLAND: {
            id: 'grassland',
            name: 'Grassland',
            baseColor: '#7ec850',
            movementCost: 1,
            buildable: true,
            generationWeight: 40,
            description: 'Open grassland'
        },
        FOREST: {
            id: 'forest',
            name: 'Forest',
            baseColor: '#228b22',
            movementCost: 2,
            buildable: false,
            generationWeight: 25,
            description: 'Dense forest'
        },
        DESERT: {
            id: 'desert',
            name: 'Desert',
            baseColor: '#f4e4a6',
            movementCost: 1.5,
            buildable: true,
            generationWeight: 10,
            description: 'Arid desert'
        },
        TUNDRA: {
            id: 'tundra',
            name: 'Tundra',
            baseColor: '#b8d4e0',
            movementCost: 1.8,
            buildable: true,
            generationWeight: 8,
            description: 'Frozen tundra'
        },
        SWAMP: {
            id: 'swamp',
            name: 'Swamp',
            baseColor: '#4a5d3e',
            movementCost: 2.5,
            buildable: false,
            generationWeight: 12,
            description: 'Marshy swampland'
        }
    },

    /**
     * Get all layer types for a specific layer
     *
     * @param {string} layerName - 'Height', 'Climate', or 'Vegetation'
     * @returns {Array<Object>} Array of layer type definitions
     */
    getLayerTypes(layerName) {
        return Object.values(this[layerName]);
    },

    /**
     * Get layer definition by ID
     *
     * @param {string} layerName - 'Height', 'Climate', or 'Vegetation'
     * @param {string} typeId - Layer type ID
     * @returns {Object|null} Layer definition or null
     */
    getLayerType(layerName, typeId) {
        return Object.values(this[layerName]).find(t => t.id === typeId) || null;
    },

    /**
     * Combine layers into composite terrain properties
     * This is the core method that generates final terrain from layers
     *
     * @param {Object} layers - {height: 'lowlands', climate: 'moderate', vegetation: 'grassland'}
     * @returns {Object} Composite terrain properties
     */
    getCompositeType(layers) {
        const height = this.getLayerType('Height', layers.height);
        const climate = this.getLayerType('Climate', layers.climate);
        const vegetation = this.getLayerType('Vegetation', layers.vegetation);

        if (!height || !climate || !vegetation) {
            console.warn('Invalid layer combination:', layers);
            return this.getDefaultComposite();
        }

        // Water tiles override everything
        if (height.isWater) {
            return {
                id: height.id,
                name: height.name,
                color: height.baseColor,
                walkable: height.walkable,
                buildable: height.buildable,
                isWater: true,
                movementCost: height.walkable ? 3 : Infinity,
                layers: layers,
                description: height.description
            };
        }

        // Land tiles: composite vegetation + climate + height
        const baseColor = vegetation.baseColor;
        const finalColor = this.blendColors(baseColor, climate.colorTint, height.elevation);
        const movementCost = vegetation.movementCost + (height.elevation * 0.5);

        return {
            id: `${height.id}_${climate.id}_${vegetation.id}`,
            name: `${climate.name !== 'Moderate' ? climate.name + ' ' : ''}${vegetation.name}${height.elevation > 0 ? ' (' + height.name + ')' : ''}`,
            color: finalColor,
            walkable: height.walkable,
            buildable: height.buildable && vegetation.buildable,
            isWater: false,
            movementCost: movementCost,
            layers: layers,
            description: `${height.description}, ${climate.description.toLowerCase()}, ${vegetation.description.toLowerCase()}`
        };
    },

    /**
     * Blend base color with climate tint and height adjustment
     *
     * @param {string} baseColor - Base hex color
     * @param {string|null} tint - Climate tint color or null
     * @param {number} elevation - Height elevation (-2 to 2)
     * @returns {string} Blended hex color
     */
    blendColors(baseColor, tint, elevation) {
        if (!baseColor) return '#cccccc';

        // Parse base color
        const base = this.hexToRgb(baseColor);
        if (!base) return baseColor;

        let r = base.r, g = base.g, b = base.b;

        // Apply climate tint (blend 20%)
        if (tint) {
            const tintRgb = this.hexToRgb(tint);
            if (tintRgb) {
                r = Math.round(r * 0.8 + tintRgb.r * 0.2);
                g = Math.round(g * 0.8 + tintRgb.g * 0.2);
                b = Math.round(b * 0.8 + tintRgb.b * 0.2);
            }
        }

        // Apply elevation adjustment (lighten hills/mountains)
        if (elevation > 0) {
            const lighten = elevation * 15;
            r = Math.min(255, r + lighten);
            g = Math.min(255, g + lighten);
            b = Math.min(255, b + lighten);
        }

        return this.rgbToHex(r, g, b);
    },

    /**
     * Convert hex color to RGB
     *
     * @param {string} hex - Hex color string
     * @returns {{r: number, g: number, b: number}|null} RGB object or null
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to hex color
     *
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color string
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    /**
     * Get default composite terrain (for errors)
     *
     * @returns {Object} Default terrain properties
     */
    getDefaultComposite() {
        return {
            id: 'default',
            name: 'Unknown',
            color: '#cccccc',
            walkable: true,
            buildable: true,
            isWater: false,
            movementCost: 1,
            layers: { height: 'lowlands', climate: 'moderate', vegetation: 'grassland' },
            description: 'Unknown terrain'
        };
    },

    /**
     * Get weighted random layer type for generation
     *
     * @param {string} layerName - 'Height', 'Climate', or 'Vegetation'
     * @returns {string} Random layer type ID
     */
    getWeightedRandomLayer(layerName) {
        const types = Object.values(this[layerName]);
        const totalWeight = types.reduce((sum, t) => sum + (t.generationWeight || 0), 0);

        let random = Math.random() * totalWeight;

        for (const type of types) {
            random -= (type.generationWeight || 0);
            if (random <= 0) {
                return type.id;
            }
        }

        return types[0]?.id || 'lowlands';
    },

    /**
     * Get valid vegetation types for a given height and climate
     *
     * @param {string} heightId - Height layer ID
     * @param {string} climateId - Climate layer ID
     * @returns {Array<string>} Array of valid vegetation IDs
     */
    getValidVegetation(heightId, climateId) {
        // Water tiles have no vegetation
        if (heightId === 'deep_water' || heightId === 'shallow_water') {
            return ['none'];
        }

        // Mountains: very limited vegetation
        if (heightId === 'mountains') {
            if (climateId === 'hot') {
                return ['none']; // Hot mountains are barren
            } else if (climateId === 'moderate') {
                return ['none', 'grassland']; // Sparse alpine meadows
            } else if (climateId === 'cold') {
                return ['none', 'tundra']; // Snow and tundra
            }
        }

        // Hills: no swamps (swamps need lowlands)
        if (heightId === 'hills') {
            if (climateId === 'hot') {
                return ['none', 'desert', 'grassland'];
            } else if (climateId === 'moderate') {
                return ['none', 'grassland', 'forest'];
            } else if (climateId === 'cold') {
                return ['none', 'tundra', 'grassland'];
            }
        }

        // Lowlands: most diverse
        if (heightId === 'lowlands') {
            if (climateId === 'hot') {
                return ['none', 'desert', 'grassland', 'forest']; // Hot jungles/forests
            } else if (climateId === 'moderate') {
                return ['none', 'grassland', 'forest', 'swamp'];
            } else if (climateId === 'cold') {
                return ['none', 'tundra', 'grassland', 'swamp']; // Frozen marshes
            }
        }

        // Default fallback
        return ['none', 'grassland'];
    },

    /**
     * Check if a layer combination is valid
     *
     * @param {Object} layers - {height, climate, vegetation}
     * @returns {boolean} True if combination is valid
     */
    isValidCombination(layers) {
        const validVegetation = this.getValidVegetation(layers.height, layers.climate);
        return validVegetation.includes(layers.vegetation);
    },

    /**
     * Generate random layers for a hex (ensuring valid combinations)
     *
     * @returns {Object} Random valid layer combination
     */
    generateRandomLayers() {
        // First, randomly select height and climate
        const height = this.getWeightedRandomLayer('Height');
        const climate = this.getWeightedRandomLayer('Climate');

        // Then select vegetation from valid options
        const validVegetation = this.getValidVegetation(height, climate);

        // Weight the valid vegetation types based on their generation weights
        const vegetationTypes = validVegetation.map(id =>
            this.getLayerType('Vegetation', id)
        ).filter(t => t !== null);

        const totalWeight = vegetationTypes.reduce((sum, t) => sum + (t.generationWeight || 0), 0);
        let random = Math.random() * totalWeight;

        let vegetation = validVegetation[0]; // Default
        for (const type of vegetationTypes) {
            random -= (type.generationWeight || 0);
            if (random <= 0) {
                vegetation = type.id;
                break;
            }
        }

        return {
            height: height,
            climate: climate,
            vegetation: vegetation
        };
    },

    /**
     * Check if terrain should draw border (for sand borders)
     *
     * @param {Object} terrain1 - First terrain composite
     * @param {Object} terrain2 - Second terrain composite
     * @returns {boolean} True if border should be drawn
     */
    shouldDrawBorder(terrain1, terrain2) {
        const isType1Water = terrain1.isWater;
        const isType2Water = terrain2.isWater;

        // Draw border if one is water and the other is land
        return (isType1Water && !isType2Water) || (!isType1Water && isType2Water);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerrainLayers;
}
