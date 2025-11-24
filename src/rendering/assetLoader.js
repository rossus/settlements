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

    // Cache of sprite bounds (trimmed transparency)
    spriteBounds: new Map(),

    /**
     * Load a single image
     * @param {string} path - Path to image file
     * @param {boolean} forceReload - Force reload even if cached
     * @returns {Promise<HTMLImageElement|null>} Loaded image or null if failed
     */
    async loadImage(path, forceReload = false) {
        if (!path) return null;

        // Return cached image if already loaded (unless force reload)
        if (!forceReload && this.images.has(path)) {
            return this.images.get(path);
        }

        // If force reload, remove from cache
        if (forceReload) {
            this.images.delete(path);
            this.loadingPromises.delete(path);
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
                console.log(`✓ Loaded sprite: ${path}${forceReload ? ' (force reload)' : ''}`);
                resolve(img);
            };

            img.onerror = () => {
                this.loadingPromises.delete(path);
                console.warn(`✗ Failed to load sprite: ${path} (will fallback to baseColor)`);
                resolve(null); // Resolve with null instead of rejecting
            };

            // Add cache-busting parameter if force reload
            const cacheBustUrl = forceReload ? `${path}?_cb=${Date.now()}` : path;
            img.src = cacheBustUrl;
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
     * Find and load the first available image from a list of paths
     * Tries paths in order and returns the first one that loads successfully
     *
     * @param {Array<string>} paths - Array of image paths in priority order
     * @returns {Promise<{image: HTMLImageElement|null, path: string|null}>} First loaded image and its path, or null if all fail
     */
    async findFirstAvailableImage(paths) {
        if (!paths || paths.length === 0) {
            return { image: null, path: null };
        }

        // Check if any are already loaded in cache
        for (const path of paths) {
            if (this.isLoaded(path)) {
                return { image: this.getImage(path), path: path };
            }
        }

        // Try loading each path in order until one succeeds
        for (const path of paths) {
            const image = await this.loadImage(path);
            if (image) {
                return { image, path };
            }
        }

        // All paths failed
        return { image: null, path: null };
    },

    /**
     * Preload sprites for all possible layer combinations
     * Optimistically tries to load sprites in priority order
     *
     * @param {Array<Object>} hexes - Array of hex objects with layers property
     * @param {string} baseDir - Base directory for sprites
     * @returns {Promise<void>}
     */
    async preloadSpritesForHexes(hexes, baseDir = 'assets/sprites/') {
        const allPaths = new Set();

        // Collect all possible sprite paths from all hexes
        hexes.forEach(hex => {
            if (hex.layers) {
                const paths = TerrainLayers.getSpritePaths(hex.layers, baseDir);
                paths.forEach(path => allPaths.add(path));
            }
        });

        // Try to load all paths (failures will be silently handled)
        const pathArray = Array.from(allPaths);
        if (pathArray.length > 0) {
            console.log(`Preloading ${pathArray.length} potential sprite(s)...`);
            await this.loadImages(pathArray);
        }
    },

    /**
     * Analyze sprite to find non-transparent bounds
     * Returns the actual visual dimensions after trimming transparency
     *
     * @param {HTMLImageElement} image - The sprite image
     * @returns {Object} {x, y, width, height, visualWidth, visualHeight}
     */
    analyzeSpriteTransparency(image) {
        // Create temporary canvas for pixel analysis
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        // Draw image
        ctx.drawImage(image, 0, 0);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        // Scan for non-transparent pixels
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const alpha = pixels[i + 3];

                // If pixel is not fully transparent
                if (alpha > 10) { // Small threshold to ignore near-transparent pixels
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        // Calculate bounds
        const bounds = {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            visualWidth: maxX - minX + 1,
            visualHeight: maxY - minY + 1,
            fullWidth: image.width,
            fullHeight: image.height
        };

        return bounds;
    },

    /**
     * Get cached bounds for a sprite, or analyze if not cached
     * @param {string} path - Path to sprite
     * @returns {Object|null} Bounds object or null if sprite not loaded
     */
    getSpriteBounds(path) {
        if (!path) return null;

        // Return cached bounds
        if (this.spriteBounds.has(path)) {
            return this.spriteBounds.get(path);
        }

        // Get image
        const image = this.images.get(path);
        if (!image) return null;

        // Analyze and cache
        const bounds = this.analyzeSpriteTransparency(image);
        this.spriteBounds.set(path, bounds);

        console.log(`Sprite bounds for ${path}: visual ${bounds.visualWidth}x${bounds.visualHeight} (full ${bounds.fullWidth}x${bounds.fullHeight})`);

        return bounds;
    },

    /**
     * Force reload specific images (clears from cache and reloads)
     * @param {Array<string>} paths - Array of image paths to reload
     * @returns {Promise<void>}
     */
    async reloadImages(paths) {
        const uniquePaths = [...new Set(paths)].filter(p => p);
        console.log(`Force reloading ${uniquePaths.length} image(s)...`);
        const promises = uniquePaths.map(path => this.loadImage(path, true));
        await Promise.all(promises);

        // Clear bounds cache for reloaded images
        uniquePaths.forEach(path => this.spriteBounds.delete(path));
    },

    /**
     * Clear all cached images
     */
    clear() {
        this.images.clear();
        this.loadingPromises.clear();
        this.spriteBounds.clear();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetLoader;
}
