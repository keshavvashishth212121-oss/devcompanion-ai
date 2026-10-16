const test = require('node:test');
const assert = require('node:assert');
const { addNumbers } = require('../src/buggy_code.js');

test('addNumbers returns the sum of two numbers', () => {
  assert.strictEqual(addNumbers(2, 3), 5, 'expected 2+3=5');
  assert.strictEqual(addNumbers(0, 0), 0, 'expected 0+0=0');
  assert.strictEqual(addNumbers(-1, 1), 0, 'expected -1+1=0');
  assert.strictEqual(addNumbers(100, 200), 300, 'expected 100+200=300');
});