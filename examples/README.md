# Examples - Code Reuse Demonstrations

This folder contains examples showing how to reuse Settlements code in other projects.

## Examples

### reuse-hexmath.html
A simple hex puzzle game demonstrating how to reuse `src/core/hexMath.js` in a completely different project.

**What it shows:**
- ✅ Copy hexMath.js and use it immediately
- ✅ No modifications needed
- ✅ Works in any hex-based project
- ✅ Same coordinate system, different game

**To run:**
```bash
# Open in browser
open reuse-hexmath.html
# or double-click the file
```

**What it uses from HexMath:**
- `offsetToAxial()` - Create grid
- `hexToPixel()` - Position hexes
- `getHexCorners()` - Draw hexagons
- `pixelToHex()` - Click detection
- `distance()` - Calculate distance

**Result:** Full hex grid game in ~100 lines!

## Learn More

See `docs/CODE_REUSABILITY.md` for complete guide on:
- What's reusable now
- How to make libraries
- Converting to ES6 modules
- Publishing to npm
- Best practices
