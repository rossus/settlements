/**
 * AssetLoader - Loads and manages image assets (sprites, textures)
 *
 * Handles async loading of images with fallback to base colors
 * when sprites are not provided or fail to load.
 */

const AssetLoader = {
    // Cache of loaded images
    images: new Map(),

    // Track loading state
    loadingPromises: new Map(),

    /**
     * Load a single image
     * @param {string} path - Path to image file
     * @returns {Promise<HTMLImageElement|null>} Loaded image or null if failed
     */
    async loadImage(path) {
        if (!path) return null;

        // Return cached image if already loaded
        if (this.images.has(path)) {
            return this.images.get(path);
        }

        // Return existing promise if currently loading
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path);
        }

        // Create new loading promise
        const promise = new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                this.images.set(path, img);
                this.loadingPromises.delete(path);
                console.log(`✓ Loaded sprite: ${path}`);
                resolve(img);
            };

            img.onerror = () => {
                this.loadingPromises.delete(path);
                console.warn(`✗ Failed to load sprite: ${path} (will fallback to baseColor)`);
                resolve(null); // Resolve with null instead of rejecting
            };

            img.src = path;
        });

        this.loadingPromises.set(path, promise);
        return promise;
    },

    /**
     * Load multiple images in parallel
     * @param {Array<string>} paths - Array of image paths
     * @returns {Promise<void>}
     */
    async loadImages(paths) {
        const uniquePaths = [...new Set(paths)].filter(p => p); // Remove duplicates and null/undefined
        const promises = uniquePaths.map(path => this.loadImage(path));
        await Promise.all(promises);
    },

    /**
     * Load all terrain sprites from terrain data
     * @param {Object} terrainData - Terrain data object (from JSON)
     * @returns {Promise<void>}
     */
    async loadTerrainSprites(terrainData) {
        const spritePaths = [];

        // Collect all sprite and texture paths from terrain data
        if (terrainData.layers) {
            for (const layer of Object.values(terrainData.layers)) {
                if (layer.types) {
                    for (const type of Object.values(layer.types)) {
                        if (type.sprite) spritePaths.push(type.sprite);
                        if (type.texture) spritePaths.push(type.texture);
                    }
                }
            }
        }

        // Also load shore sprite if defined
        if (terrainData.shoreSprite) {
            spritePaths.push(terrainData.shoreSprite);
        }

        if (spritePaths.length === 0) {
            console.log('No sprites to load (all terrain using base colors)');
            return;
        }

        console.log(`Loading ${spritePaths.length} terrain sprite(s)...`);
        await this.loadImages(spritePaths);
        const loadedCount = spritePaths.filter(p => this.isLoaded(p)).length;
        console.log(`Sprites loaded: ${loadedCount}/${spritePaths.length} successful`);
    },

    /**
     * Get a loaded image (returns null if not loaded or failed)
     * @param {string} path - Path to image
     * @returns {HTMLImageElement|null} Loaded image or null
     */
    getImage(path) {
        if (!path) return null;
        return this.images.get(path) || null;
    },

    /**
     * Check if an image is loaded successfully
     * @param {string} path - Path to image
     * @returns {boolean} True if loaded
     */
    isLoaded(path) {
        return this.images.has(path);
    },

    /**
     * Clear all cached images
     */
    clear() {
        this.images.clear();
        this.loadingPromises.clear();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetLoader;
}
