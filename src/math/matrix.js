// generate ixj 0-value 2d array
const newMatrix = (i, j) =>
  Array(i)
    .fill([])
    .map(x => Array(j).fill(0));

// transpose 2D array
const transpose = m => m[0].map((x, i) => m.map(x => x[i]));

module.exports = { newMatrix, transpose };
