/**
 * Quick Performance Test
 * Paste this into browser console (F12) while game is running
 */

console.log('=== PERFORMANCE TEST ===\n');

// Test 1: Check viewport culling
console.log('1. Viewport Culling Status:');
if (!game || !game.renderer) {
    console.error('❌ Game not found! Make sure game is running.');
} else if (typeof game.renderer.getVisibleHexes !== 'function') {
    console.error('❌ Viewport culling NOT implemented!');
} else {
    console.log('✓ Viewport culling is implemented');

    // Force a render to populate cache
    game.render();

    if (game.renderer.currentVisibleHexes) {
        const total = game.grid.hexes.length;
        const visible = game.renderer.currentVisibleHexes.length;
        const culled = ((1 - visible / total) * 100).toFixed(1);

        console.log(`  Total hexes: ${total}`);
        console.log(`  Visible hexes: ${visible}`);
        console.log(`  Culling efficiency: ${culled}%`);

        if (culled < 30) {
            console.warn('  ⚠ Low culling efficiency - zoom out or pan around');
        } else {
            console.log('  ✓ Good culling efficiency!');
        }
    }
}

console.log('\n2. Render Performance Test (60 frames):');

// Test 2: Measure render performance
const times = [];
let frameCount = 0;

function testFrame() {
    const start = performance.now();
    game.render();
    const end = performance.now();
    times.push(end - start);

    frameCount++;
    if (frameCount < 60) {
        requestAnimationFrame(testFrame);
    } else {
        // Calculate stats
        const avg = times.reduce((a, b) => a + b) / 60;
        const min = Math.min(...times);
        const max = Math.max(...times);
        const fps = 1000 / avg;

        console.log(`  Average frame time: ${avg.toFixed(2)}ms`);
        console.log(`  Min/Max: ${min.toFixed(2)}ms / ${max.toFixed(2)}ms`);
        console.log(`  Average FPS: ${fps.toFixed(1)}`);

        const slowFrames = times.filter(t => t > 16).length;
        if (slowFrames > 0) {
            console.log(`  ⚠ ${slowFrames}/60 frames were slow (>16ms)`);
        }

        console.log('\n=== RESULT ===');
        if (fps >= 60) {
            console.log('✓✓✓ EXCELLENT! 60+ FPS, very smooth!');
        } else if (fps >= 30) {
            console.log('✓✓ GOOD! 30-60 FPS, playable.');
        } else if (fps >= 20) {
            console.log('✓ OK. 20-30 FPS, slight lag.');
        } else {
            console.log('❌ POOR. <20 FPS, significant lag.');
            console.log('\nPossible issues:');
            console.log('- Viewport culling may not be working correctly');
            console.log('- Check console for "Viewport Culling" logs');
            console.log('- Try a smaller map size');
        }
    }
}

console.log('  Testing...');
requestAnimationFrame(testFrame);
