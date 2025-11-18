# Quick Performance Fix

If you're seeing ~50 FPS instead of 100+, try these:

## Immediate Fixes

### 1. Hard Refresh the Browser
```
Windows/Linux: Ctrl + F5
Mac: Cmd + Shift + R
```

The old code might be cached!

### 2. Check Console for "Viewport Culling" Message

Open Console (F12) and look for:
```
Viewport Culling: XXX/YYYY hexes (ZZ% culled)
```

If you DON'T see this message, viewport culling isn't working.

### 3. Try Smaller Map

Change world size to "Small" or "Medium" and test again.

### 4. Zoom In

Scroll to zoom in. Fewer hexes visible = faster rendering.

## Manual Performance Test

Paste in console (F12):

```javascript
// Check if culling is active
console.log('=== DIAGNOSTICS ===');
console.log('Total hexes:', game.grid.hexes.length);
console.log('Visible hexes:', game.renderer.currentVisibleHexes?.length || 'NOT SET');
console.log('Camera:', game.camera.x.toFixed(0), game.camera.y.toFixed(0), 'Zoom:', game.camera.zoom.toFixed(2));

// Test render performance
let times = [];
for (let i = 0; i < 60; i++) {
    const start = performance.now();
    game.render();
    times.push(performance.now() - start);
}
const avg = times.reduce((a,b) => a + b) / 60;
console.log('\n=== RESULTS ===');
console.log('Avg frame time:', avg.toFixed(2) + 'ms');
console.log('FPS:', (1000 / avg).toFixed(1));

// Calculate efficiency
if (game.renderer.currentVisibleHexes) {
    const efficiency = ((1 - game.renderer.currentVisibleHexes.length / game.grid.hexes.length) * 100).toFixed(1);
    console.log('Culling efficiency:', efficiency + '%');

    if (efficiency < 30) {
        console.warn('⚠ Low efficiency - try zooming in or using smaller map');
    }
}
```

## Expected Results

**Good:**
```
Total hexes: 8000
Visible hexes: 400
Culling efficiency: 95%
Avg frame time: 3-5ms
FPS: 200-300
```

**Bad:**
```
Total hexes: 8000
Visible hexes: NOT SET  ← Culling not working!
Avg frame time: 40-50ms
FPS: 20-25
```

## If Culling Still Not Working

The changes might not have loaded. Try:

1. **Close browser completely**
2. **Delete browser cache** (Ctrl+Shift+Delete)
3. **Restart START.bat**
4. **Check console immediately**

## Report Back

Tell me what you see for:
- Total hexes: ?
- Visible hexes: ?
- Culling efficiency: ?
- FPS: ?
