// Quick test for full-width comma support
const { validateNumericInput, parseNumericInput } = require('./src/utils/validation');

console.log('Testing full-width comma support:');

// Test cases
const testCases = [
  '1,2,3,4,5',           // Regular commas
  '1，2，3，4，5',         // Full-width commas
  '1, 2, 3, 4, 5',       // Regular commas with spaces
  '1， 2， 3， 4， 5',     // Full-width commas with spaces
  '1,2，3,4，5',          // Mixed commas
  '1；2；3；4；5',         // Full-width semicolons
  '1,2\n3,4\n5',         // Mixed with newlines
  '1，2\n3，4\n5'         // Full-width commas with newlines
];

testCases.forEach((testCase, index) => {
  try {
    const validation = validateNumericInput(testCase);
    const parsed = parseNumericInput(testCase);
    console.log(`Test ${index + 1}: "${testCase}"`);
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Parsed: [${parsed.join(', ')}]`);
    console.log('');
  } catch (error) {
    console.log(`Test ${index + 1}: "${testCase}" - ERROR: ${error.message}`);
  }
});