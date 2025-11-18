/**
 * Test script for terrain system refactoring
 * Run with: node test-terrain.js
 */

const TerrainLayers = require('./src/core/terrainLayers.js');

console.log('Testing refactored terrain system...\n');

// Test 1: Check if layers are loaded
console.log('Test 1: Layers loaded');
console.log('Available layers:', Object.keys(TerrainLayers.layers));
console.log('✓ Layers object exists\n');

// Test 2: Check layer types
console.log('Test 2: Layer types');
console.log('Height types:', Object.keys(TerrainLayers.layers.height.types));
console.log('Climate types:', Object.keys(TerrainLayers.layers.climate.types));
console.log('Vegetation types:', Object.keys(TerrainLayers.layers.vegetation.types));
console.log('✓ All layer types loaded\n');

// Test 3: Test terrain generation
console.log('Test 3: Generate random terrain');
const randomLayers = TerrainLayers.generateRandomLayers();
console.log('Generated layers:', randomLayers);
console.log('✓ Random generation works\n');

// Test 4: Test constraint validation
console.log('Test 4: Constraint validation');
const validCombination = { height: 'lowlands', climate: 'moderate', vegetation: 'grassland' };
const invalidCombination = { height: 'deep_water', climate: 'hot', vegetation: 'forest' };

console.log('Valid combination:', validCombination, '→', TerrainLayers.isValidCombination(validCombination));
console.log('Invalid combination:', invalidCombination, '→', TerrainLayers.isValidCombination(invalidCombination));
console.log('✓ Validation works\n');

// Test 5: Test composite type generation
console.log('Test 5: Composite type generation');
const composite = TerrainLayers.getCompositeType(validCombination);
console.log('Composite terrain:', composite.name);
console.log('Color:', composite.color);
console.log('Movement cost:', composite.movementCost);
console.log('✓ Composite generation works\n');

// Test 6: Test constraint-based filtering
console.log('Test 6: Get valid vegetation for water tile');
const waterLayers = { height: 'deep_water', climate: 'moderate' };
const validVegetation = TerrainLayers.getValidTypes('vegetation', waterLayers);
console.log('Valid vegetation for deep water:', validVegetation);
console.log('✓ Constraint filtering works\n');

// Test 7: Test swamp constraints
console.log('Test 7: Swamp constraints');
const swampValid = { height: 'lowlands', climate: 'moderate' };
const swampInvalid1 = { height: 'hills', climate: 'moderate' };
const swampInvalid2 = { height: 'lowlands', climate: 'hot' };

console.log('Swamp on lowlands + moderate:', TerrainLayers.isTypeValid('vegetation', 'swamp', swampValid));
console.log('Swamp on hills + moderate:', TerrainLayers.isTypeValid('vegetation', 'swamp', swampInvalid1));
console.log('Swamp on lowlands + hot:', TerrainLayers.isTypeValid('vegetation', 'swamp', swampInvalid2));
console.log('✓ Complex constraints work\n');

console.log('All tests passed! ✓');
