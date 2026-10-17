function addNumbers(a, b) {
  // BUG: Should be a + b, not a - b
  return a + b;
}

module.exports = { addNumbers };