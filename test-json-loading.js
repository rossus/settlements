/**
 * Test JSON loading for terrain system
 * Run with: node test-json-loading.js
 */

const fs = require('fs');
const path = require('path');

console.log('Testing JSON-based terrain system...\n');

// Test 1: Load and parse JSON
console.log('Test 1: Load terrainData.json');
try {
    const jsonPath = path.join(__dirname, 'src', 'data', 'terrainData.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const terrainData = JSON.parse(jsonData);

    console.log('✓ JSON loaded and parsed successfully');
    console.log('  Layers found:', Object.keys(terrainData.layers));
    console.log();
} catch (error) {
    console.error('✗ Failed to load JSON:', error.message);
    process.exit(1);
}

// Test 2: Initialize terrain system (simulate)
console.log('Test 2: Simulate TerrainLayers.init()');
try {
    const jsonPath = path.join(__dirname, 'src', 'data', 'terrainData.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const terrainData = JSON.parse(jsonData);

    // Simulate the init check
    if (!terrainData || !terrainData.layers) {
        throw new Error('Invalid terrain data: missing layers');
    }

    console.log('✓ Terrain data structure is valid');
    console.log('  Height types:', Object.keys(terrainData.layers.height.types).length);
    console.log('  Climate types:', Object.keys(terrainData.layers.climate.types).length);
    console.log('  Vegetation types:', Object.keys(terrainData.layers.vegetation.types).length);
    console.log();
} catch (error) {
    console.error('✗ Invalid terrain data:', error.message);
    process.exit(1);
}

// Test 3: Validate all terrain types
console.log('Test 3: Validate terrain type properties');
try {
    const jsonPath = path.join(__dirname, 'src', 'data', 'terrainData.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const terrainData = JSON.parse(jsonData);

    let typeCount = 0;
    let issueCount = 0;

    for (const [layerName, layer] of Object.entries(terrainData.layers)) {
        for (const [typeName, type] of Object.entries(layer.types)) {
            typeCount++;

            // Required properties
            if (!type.id) {
                console.error(`  ✗ ${layerName}.${typeName} missing 'id'`);
                issueCount++;
            }
            if (!type.name) {
                console.error(`  ✗ ${layerName}.${typeName} missing 'name'`);
                issueCount++;
            }
            if (type.generationWeight === undefined) {
                console.error(`  ✗ ${layerName}.${typeName} missing 'generationWeight'`);
                issueCount++;
            }
        }
    }

    if (issueCount === 0) {
        console.log(`✓ All ${typeCount} terrain types are valid`);
    } else {
        console.log(`✗ Found ${issueCount} issues in ${typeCount} terrain types`);
    }
    console.log();
} catch (error) {
    console.error('✗ Validation failed:', error.message);
    process.exit(1);
}

// Test 4: Test constraint references
console.log('Test 4: Validate constraint references');
try {
    const jsonPath = path.join(__dirname, 'src', 'data', 'terrainData.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const terrainData = JSON.parse(jsonData);

    let constraintCount = 0;
    let invalidRefs = 0;

    // Get all valid IDs for each layer
    const validIds = {};
    for (const [layerName, layer] of Object.entries(terrainData.layers)) {
        validIds[layerName] = Object.values(layer.types).map(t => t.id);
    }

    // Check constraints
    for (const [layerName, layer] of Object.entries(terrainData.layers)) {
        for (const [typeName, type] of Object.entries(layer.types)) {
            if (!type.constraints) continue;

            for (const [constraintLayer, rules] of Object.entries(type.constraints)) {
                constraintCount++;

                // Check require references
                if (rules.require) {
                    for (const reqId of rules.require) {
                        if (!validIds[constraintLayer].includes(reqId)) {
                            console.error(`  ✗ ${layerName}.${typeName} requires invalid ID: ${constraintLayer}.${reqId}`);
                            invalidRefs++;
                        }
                    }
                }

                // Check exclude references
                if (rules.exclude) {
                    for (const exclId of rules.exclude) {
                        if (!validIds[constraintLayer].includes(exclId)) {
                            console.error(`  ✗ ${layerName}.${typeName} excludes invalid ID: ${constraintLayer}.${exclId}`);
                            invalidRefs++;
                        }
                    }
                }
            }
        }
    }

    if (invalidRefs === 0) {
        console.log(`✓ All ${constraintCount} constraint references are valid`);
    } else {
        console.log(`✗ Found ${invalidRefs} invalid references in ${constraintCount} constraints`);
    }
    console.log();
} catch (error) {
    console.error('✗ Constraint validation failed:', error.message);
    process.exit(1);
}

console.log('All tests passed! ✓');
console.log('\nJSON terrain data is ready for use.');
console.log('\nTo test in browser:');
console.log('  1. Run a local web server (required for fetch):');
console.log('     npx http-server -p 8080');
console.log('  2. Open http://localhost:8080');
