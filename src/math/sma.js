// calc Simple Moving Average of series
const calcSMA = (series, period) => {
  let sma = [];
  for (let i = period - 1; i < series.length; i++) {
    const SMAwindow = series.slice(i - period + 1, i + 1);
    const avg =
      SMAwindow.reduce((sum, el) => {
        if (isNaN(el) || !isFinite(el)) return sum;
        return sum + el;
      }, 0) / SMAwindow.length;
    sma.push(avg);
  }
  return sma;
};

module.exports = calcSMA;
