/**
 * Data Loader - Asynchronously loads JSON data files
 * Enables easy modding with standard JSON format
 */

const DataLoader = {
    /**
     * Load JSON data file
     * @param {string} path - Path to JSON file
     * @returns {Promise<Object>} Parsed JSON data
     */
    async loadJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`DataLoader error: ${error.message}`);
            throw error;
        }
    },

    /**
     * Load terrain data configuration
     * @param {string} configName - Name of config (default: 'terrainData')
     * @returns {Promise<Object>} Terrain data
     */
    async loadTerrainData(configName = 'terrainData') {
        const path = `src/data/${configName}.json`;
        console.log(`Loading terrain data from: ${path}`);
        return await this.loadJSON(path);
    },

    /**
     * Load multiple data files in parallel
     * @param {Array<string>} paths - Array of file paths
     * @returns {Promise<Array>} Array of loaded data
     */
    async loadMultiple(paths) {
        return await Promise.all(paths.map(path => this.loadJSON(path)));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
