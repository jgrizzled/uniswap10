// calc rounded weights
// https://github.com/lequant40/portfolio_allocation_js/blob/920f2c0b0b5baed26adac1c362ff3d29fbe8727a/lib/stats/simplex.js#L698
const roundedWeights = (x, r) => {
  var k = r;
  var xPartsWithIndexes = new Array(x.length);
  for (var i = 0; i < x.length; ++i) {
    var rx = r * x[i];
    var integerPart = Math.floor(rx);
    var fractionalPart = rx - integerPart;
    k -= integerPart;
    xPartsWithIndexes[i] = [integerPart, fractionalPart, i];
  }
  xPartsWithIndexes.sort(function(a, b) {
    if (b[1] < a[1]) {
      return -1;
    } else if (b[1] > a[1]) {
      return 1;
    } else {
      return b[0] - a[0];
    }
  });
  var xr = new Array(x.length);
  for (var i = 0; i < k; ++i) {
    var index = xPartsWithIndexes[i][2];
    xr[index] = (xPartsWithIndexes[i][0] + 1) / r;
  }
  for (var i = k; i < xPartsWithIndexes.length; ++i) {
    var index = xPartsWithIndexes[i][2];
    xr[index] = xPartsWithIndexes[i][0] / r;
  }
  return xr;
};

module.exports = roundedWeights;
