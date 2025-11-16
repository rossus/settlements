/**
 * TerrainLayers - Constraint-based layered terrain system for Settlements
 *
 * This module implements a data-driven multi-layer terrain system where:
 * - Each layer type declares its own constraints about compatible combinations
 * - Generic validation engine handles all constraint checking
 * - Adding new layers or types requires minimal code changes
 *
 * Architecture:
 * - Layers are defined in the `layers` object with their types
 * - Each type can have `constraints` that specify required/excluded other layers
 * - Validation is automatic based on constraints
 */

const TerrainLayers = {
    /**
     * Layer definitions with constraint-based validation
     */
    layers: {
        /**
         * Height/Elevation layer
         * Determines base terrain type and walkability
         */
        height: {
            name: 'Height',
            types: {
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
            }
        },

        /**
         * Climate/Temperature layer
         * Affects color tinting
         */
        climate: {
            name: 'Climate',
            types: {
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
            }
        },

        /**
         * Vegetation/Surface layer
         * Determines movement cost and surface appearance
         * Uses constraints to define valid combinations
         */
        vegetation: {
            name: 'Vegetation',
            types: {
                NONE: {
                    id: 'none',
                    name: 'Barren',
                    baseColor: '#b8a896',
                    movementCost: 1,
                    buildable: true,
                    generationWeight: 5,
                    description: 'Barren rocky ground'
                    // No constraints - can appear anywhere (including water)
                },
                GRASSLAND: {
                    id: 'grassland',
                    name: 'Grassland',
                    baseColor: '#7ec850',
                    movementCost: 1,
                    buildable: true,
                    generationWeight: 40,
                    description: 'Open grassland',
                    constraints: {
                        height: {
                            // Grasslands can appear almost anywhere except water
                            exclude: ['deep_water', 'shallow_water']
                        }
                    }
                },
                FOREST: {
                    id: 'forest',
                    name: 'Forest',
                    baseColor: '#228b22',
                    movementCost: 2,
                    buildable: false,
                    generationWeight: 25,
                    description: 'Dense forest',
                    constraints: {
                        height: {
                            // Forests don't grow in water or on mountains
                            exclude: ['deep_water', 'shallow_water', 'mountains']
                        }
                    }
                },
                DESERT: {
                    id: 'desert',
                    name: 'Desert',
                    baseColor: '#f4e4a6',
                    movementCost: 1.5,
                    buildable: true,
                    generationWeight: 10,
                    description: 'Arid desert',
                    constraints: {
                        height: {
                            // Deserts on flat land
                            exclude: ['deep_water', 'shallow_water', 'mountains']
                        },
                        climate: {
                            // Deserts need hot or moderate climate
                            require: ['hot', 'moderate']
                        }
                    }
                },
                TUNDRA: {
                    id: 'tundra',
                    name: 'Tundra',
                    baseColor: '#b8d4e0',
                    movementCost: 1.8,
                    buildable: true,
                    generationWeight: 8,
                    description: 'Frozen tundra',
                    constraints: {
                        height: {
                            // Tundra on land only
                            exclude: ['deep_water', 'shallow_water']
                        },
                        climate: {
                            // Tundra needs cold climate
                            require: ['cold']
                        }
                    }
                },
                SWAMP: {
                    id: 'swamp',
                    name: 'Swamp',
                    baseColor: '#4a5d3e',
                    movementCost: 2.5,
                    buildable: false,
                    generationWeight: 12,
                    description: 'Marshy swampland',
                    constraints: {
                        height: {
                            // Swamps only in lowlands
                            require: ['lowlands']
                        },
                        climate: {
                            // No hot swamps
                            exclude: ['hot']
                        }
                    }
                }
            }
        }
    },

    /**
     * Generic constraint validator
     * Checks if a layer type is valid given the current layer selections
     *
     * @param {string} layerName - Layer to validate (e.g., 'vegetation')
     * @param {string} typeId - Type ID to validate (e.g., 'forest')
     * @param {Object} currentLayers - Currently selected layers {height: 'lowlands', climate: 'hot', ...}
     * @returns {boolean} True if valid
     */
    isTypeValid(layerName, typeId, currentLayers) {
        const type = this.getLayerType(layerName, typeId);
        if (!type || !type.constraints) return true; // No constraints = always valid

        // Check each constraint
        for (const [constraintLayer, rules] of Object.entries(type.constraints)) {
            const currentValue = currentLayers[constraintLayer];
            if (!currentValue) continue; // No current value to check against

            // Check 'require' constraint - must be one of these values
            if (rules.require && !rules.require.includes(currentValue)) {
                return false;
            }

            // Check 'exclude' constraint - must NOT be one of these values
            if (rules.exclude && rules.exclude.includes(currentValue)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Get all valid types for a layer given current selections
     * This replaces all hardcoded validation logic!
     *
     * @param {string} layerName - Layer to get valid types for
     * @param {Object} currentLayers - Currently selected layers
     * @returns {Array<string>} Array of valid type IDs
     */
    getValidTypes(layerName, currentLayers) {
        const layer = this.layers[layerName];
        if (!layer) return [];

        const validTypes = [];
        for (const type of Object.values(layer.types)) {
            if (this.isTypeValid(layerName, type.id, currentLayers)) {
                validTypes.push(type.id);
            }
        }

        return validTypes;
    },

    /**
     * Get weighted random type from a list of valid type IDs
     *
     * @param {string} layerName - Layer name
     * @param {Array<string>} validTypeIds - Array of valid type IDs
     * @returns {string} Random type ID
     */
    getWeightedRandomType(layerName, validTypeIds) {
        const layer = this.layers[layerName];
        const validTypes = validTypeIds
            .map(id => Object.values(layer.types).find(t => t.id === id))
            .filter(t => t !== undefined);

        if (validTypes.length === 0) {
            console.warn(`No valid types for layer ${layerName}`);
            return validTypeIds[0];
        }

        const totalWeight = validTypes.reduce((sum, t) => sum + (t.generationWeight || 0), 0);
        let random = Math.random() * totalWeight;

        for (const type of validTypes) {
            random -= (type.generationWeight || 0);
            if (random <= 0) {
                return type.id;
            }
        }

        return validTypes[0]?.id || validTypeIds[0];
    },

    /**
     * Get weighted random layer type (all types)
     *
     * @param {string} layerName - Layer name
     * @returns {string} Random type ID
     */
    getWeightedRandomLayer(layerName) {
        const layer = this.layers[layerName];
        const types = Object.values(layer.types);
        const totalWeight = types.reduce((sum, t) => sum + (t.generationWeight || 0), 0);

        let random = Math.random() * totalWeight;
        for (const type of types) {
            random -= (type.generationWeight || 0);
            if (random <= 0) {
                return type.id;
            }
        }

        return types[0]?.id;
    },

    /**
     * Generate random layers with automatic constraint validation
     * This method is now completely generic!
     *
     * @returns {Object} Random valid layer combination
     */
    generateRandomLayers() {
        const layers = {};

        // Generate layers in order (some may depend on others)
        // Height first (no dependencies)
        layers.height = this.getWeightedRandomLayer('height');

        // Climate (no dependencies on height)
        layers.climate = this.getWeightedRandomLayer('climate');

        // Vegetation last (may depend on height and climate via constraints)
        const validVegetation = this.getValidTypes('vegetation', layers);

        // If no valid vegetation (e.g., water tiles), default to 'none'
        if (validVegetation.length === 0) {
            layers.vegetation = 'none';
        } else {
            layers.vegetation = this.getWeightedRandomType('vegetation', validVegetation);
        }

        return layers;
    },

    /**
     * Check if a layer combination is valid
     *
     * @param {Object} layers - Layer combination to check
     * @returns {boolean} True if valid
     */
    isValidCombination(layers) {
        // Check each layer against the others
        for (const [layerName, typeId] of Object.entries(layers)) {
            if (!this.isTypeValid(layerName, typeId, layers)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Get layer definition by ID
     *
     * @param {string} layerName - Layer name
     * @param {string} typeId - Type ID
     * @returns {Object|null} Type definition or null
     */
    getLayerType(layerName, typeId) {
        const layer = this.layers[layerName];
        if (!layer) return null;

        return Object.values(layer.types).find(t => t.id === typeId) || null;
    },

    /**
     * Get all layer names
     *
     * @returns {Array<string>} Array of layer names
     */
    getLayerNames() {
        return Object.keys(this.layers);
    },

    /**
     * Get all types for a layer
     *
     * @param {string} layerName - Layer name
     * @returns {Array<Object>} Array of type definitions
     */
    getLayerTypes(layerName) {
        const layer = this.layers[layerName];
        return layer ? Object.values(layer.types) : [];
    },

    /**
     * Combine layers into composite terrain properties
     *
     * @param {Object} layers - {height: 'lowlands', climate: 'moderate', vegetation: 'grassland'}
     * @returns {Object} Composite terrain properties
     */
    getCompositeType(layers) {
        const height = this.getLayerType('height', layers.height);
        const climate = this.getLayerType('climate', layers.climate);
        const vegetation = this.getLayerType('vegetation', layers.vegetation);

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
