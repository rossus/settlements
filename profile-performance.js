/**
 * Performance profiling for Settlements
 * Add this to browser console to identify bottlenecks
 */

// Profile terrain generation
console.log('=== PROFILING TERRAIN GENERATION ===');
console.time('Total Map Generation');

console.time('1. HexGrid Creation');
const testGrid = new HexGrid(100, 80, 30); // Huge map
console.timeEnd('1. HexGrid Creation');

console.time('2. Terrain Generation');
// This happens inside HexGrid constructor
console.timeEnd('2. Terrain Generation');

console.timeEnd('Total Map Generation');

console.log('\n=== PROFILING RENDERING ===');

// Profile single frame render
if (typeof game !== 'undefined') {
    const canvas = game.canvas;
    const ctx = canvas.getContext('2d');

    // Count visible hexes
    const visibleHexes = game.grid.hexes.filter(hex => {
        const pos = game.grid.hexToPixel(hex);
        const screenX = pos.x + game.camera.x;
        const screenY = pos.y + game.camera.y;

        // Simple bounds check
        return screenX > -100 && screenX < canvas.width + 100 &&
               screenY > -100 && screenY < canvas.height + 100;
    });

    console.log(`Total hexes: ${game.grid.hexes.length}`);
    console.log(`Visible hexes: ${visibleHexes.length}`);
    console.log(`Hidden hexes (waste): ${game.grid.hexes.length - visibleHexes.length}`);

    // Profile render time
    console.time('3. Single Frame Render');
    game.render();
    console.timeEnd('3. Single Frame Render');

    // Estimate FPS
    let frameCount = 0;
    const startTime = performance.now();

    const testRender = () => {
        game.render();
        frameCount++;

        if (frameCount < 60) {
            requestAnimationFrame(testRender);
        } else {
            const elapsed = performance.now() - startTime;
            const fps = (frameCount / elapsed * 1000).toFixed(1);
            console.log(`\n4. Average FPS: ${fps}`);

            if (fps < 30) {
                console.warn('⚠️ PERFORMANCE ISSUE: FPS below 30');
                console.log('\nLikely causes:');
                console.log('- Rendering ALL hexes (including off-screen)');
                console.log('- No viewport culling');
                console.log('- Canvas operations not batched');
            }

            console.log('\n=== RECOMMENDATIONS ===');
            console.log(`Rendering ${game.grid.hexes.length} hexes but only ${visibleHexes.length} are visible!`);
            console.log(`Waste: ${((1 - visibleHexes.length / game.grid.hexes.length) * 100).toFixed(1)}%`);
            console.log('\nOptimizations needed:');
            console.log('1. ✅ Add viewport culling (only render visible hexes)');
            console.log('2. ✅ Batch canvas operations');
            console.log('3. ✅ Cache terrain colors');
            console.log('4. ✅ Use requestAnimationFrame properly');
        }
    };

    console.log('\nRunning 60-frame test...');
    requestAnimationFrame(testRender);
}
