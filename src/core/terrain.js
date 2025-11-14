/**
 * Terrain - Terrain type system for Settlements
 *
 * This module defines all terrain types, their properties, colors, and behaviors.
 * Centralized terrain management makes it easy to add new types or modify existing ones.
 */

const Terrain = {
    /**
     * Terrain type definitions
     * Each terrain type has properties that can be used for game logic
     */
    Types: {
        GRASS: {
            id: 'grass',
            name: 'Grass',
            color: '#7ec850',
            walkable: true,
            buildable: true,
            isWater: false,
            movementCost: 1,
            generationWeight: 40,
            description: 'Open grassland suitable for settlements'
        },
        FOREST: {
            id: 'forest',
            name: 'Forest',
            color: '#228b22',
            walkable: true,
            buildable: false,
            isWater: false,
            movementCost: 2,
            generationWeight: 25,
            description: 'Dense forest that slows movement'
        },
        WATER: {
            id: 'water',
            name: 'Water',
            color: '#4a90e2',
            walkable: false,
            buildable: false,
            isWater: true,
            movementCost: Infinity,
            generationWeight: 15,
            description: 'Deep water, impassable without boats'
        },
        SHALLOW_WATER: {
            id: 'shallow_water',
            name: 'Shallow Water',
            color: '#7cb9e8',
            walkable: true,
            buildable: false,
            isWater: true,
            movementCost: 3,
            generationWeight: 8,
            description: 'Shallow water that can be waded through slowly'
        },
        MOUNTAIN: {
            id: 'mountain',
            name: 'Mountain',
            color: '#8b7355',
            walkable: true,
            buildable: false,
            isWater: false,
            movementCost: 3,
            generationWeight: 10,
            description: 'Rocky mountains that are difficult to traverse'
        },
        DESERT: {
            id: 'desert',
            name: 'Desert',
            color: '#f4e4a6',
            walkable: true,
            buildable: true,
            isWater: false,
            movementCost: 1.5,
            generationWeight: 10,
            description: 'Arid desert with limited resources'
        },
        SWAMP: {
            id: 'swamp',
            name: 'Swamp',
            color: '#4a5d3e',
            walkable: true,
            buildable: false,
            isWater: false,
            movementCost: 2.5,
            generationWeight: 5,
            description: 'Marshy swampland that is difficult to traverse'
        },
        TUNDRA: {
            id: 'tundra',
            name: 'Tundra',
            color: '#b8d4e0',
            walkable: true,
            buildable: true,
            isWater: false,
            movementCost: 1.8,
            generationWeight: 8,
            description: 'Frozen tundra with permafrost'
  }
    },

    /**
     * Special terrain colors
     */
    Colors: {
        SAND_BORDER: '#daa520', // Gold/sand color for water-land borders
        DEFAULT: '#cccccc'      // Fallback color for unknown terrain
    },

    /**
     * Get all terrain type IDs
     *
     * @returns {Array<string>} Array of terrain type IDs
     */
    getAllTypes() {
        return Object.values(this.Types).map(t => t.id);
    },

    /**
     * Get terrain definition by ID
     *
     * @param {string} typeId - Terrain type ID
     * @returns {Object|null} Terrain definition or null if not found
     */
    getType(typeId) {
        return Object.values(this.Types).find(t => t.id === typeId) || null;
    },

    /**
     * Get terrain color by type ID
     *
     * @param {string} typeId - Terrain type ID
     * @returns {string} Hex color code
     */
    getColor(typeId) {
        const type = this.getType(typeId);
        return type ? type.color : this.Colors.DEFAULT;
    },

    /**
     * Check if terrain is water
     *
     * @param {string} typeId - Terrain type ID
     * @returns {boolean} True if terrain is water
     */
    isWater(typeId) {
        const type = this.getType(typeId);
        return type ? type.isWater : false;
    },

    /**
     * Check if terrain is walkable
     *
     * @param {string} typeId - Terrain type ID
     * @returns {boolean} True if units can walk on this terrain
     */
    isWalkable(typeId) {
        const type = this.getType(typeId);
        return type ? type.walkable : false;
    },

    /**
     * Check if terrain is buildable
     *
     * @param {string} typeId - Terrain type ID
     * @returns {boolean} True if buildings can be placed on this terrain
     */
    isBuildable(typeId) {
        const type = this.getType(typeId);
        return type ? type.buildable : false;
    },

    /**
     * Get movement cost for terrain
     *
     * @param {string} typeId - Terrain type ID
     * @returns {number} Movement cost multiplier
     */
    getMovementCost(typeId) {
        const type = this.getType(typeId);
        return type ? type.movementCost : Infinity;
    },

    /**
     * Get random terrain type for map generation
     *
     * @param {Array<string>} types - Optional array of type IDs to choose from
     * @returns {string} Random terrain type ID
     */
    getRandomType(types = null) {
        const availableTypes = types || this.getAllTypes();
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    },

    /**
     * Get weighted random terrain type
     * Automatically uses generationWeight from terrain type definitions
     *
     * @returns {string} Random terrain type ID based on weights
     */
    getWeightedRandomType() {
        // Build weights from terrain type definitions
        const terrainTypes = Object.values(this.Types);
        const totalWeight = terrainTypes.reduce((sum, t) => sum + (t.generationWeight || 0), 0);

        let random = Math.random() * totalWeight;

        for (const type of terrainTypes) {
            random -= (type.generationWeight || 0);
            if (random <= 0) {
                return type.id;
            }
        }

        // Fallback to first terrain type
        return terrainTypes[0]?.id || 'grass';
    },

    /**
     * Validate terrain type
     *
     * @param {string} typeId - Terrain type ID to validate
     * @returns {boolean} True if valid terrain type
     */
    isValidType(typeId) {
        return this.getType(typeId) !== null;
    },

    /**
     * Get terrain info string for display
     *
     * @param {string} typeId - Terrain type ID
     * @returns {string} Formatted terrain info
     */
    getInfo(typeId) {
        const type = this.getType(typeId);
        if (!type) return 'Unknown terrain';

        return `${type.name} - ${type.description}`;
    },

    /**
     * Get all land terrain types (non-water)
     *
     * @returns {Array<string>} Array of land terrain type IDs
     */
    getLandTypes() {
        return Object.values(this.Types)
            .filter(t => !t.isWater)
            .map(t => t.id);
    },

    /**
     * Get all water terrain types
     *
     * @returns {Array<string>} Array of water terrain type IDs
     */
    getWaterTypes() {
        return Object.values(this.Types)
            .filter(t => t.isWater)
            .map(t => t.id);
    },

    /**
     * Check if two terrain types should have a border between them
     * Currently used for sand borders between water and land
     *
     * @param {string} type1 - First terrain type ID
     * @param {string} type2 - Second terrain type ID
     * @returns {boolean} True if border should be drawn
     */
    shouldDrawBorder(type1, type2) {
        const isType1Water = this.isWater(type1);
        const isType2Water = this.isWater(type2);

        // Draw border if one is water and the other is land
        return (isType1Water && !isType2Water) || (!isType1Water && isType2Water);
    },

    /**
     * Get border color between two terrain types
     *
     * @param {string} type1 - First terrain type ID
     * @param {string} type2 - Second terrain type ID
     * @returns {string|null} Hex color code or null if no border
     */
    getBorderColor(type1, type2) {
        if (this.shouldDrawBorder(type1, type2)) {
            return this.Colors.SAND_BORDER;
        }
        return null;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Terrain;
}
