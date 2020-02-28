// financial timeseries helpers

const calcReturns = priceSeries => {
  const returns = [];
  for (let i = 1; i < priceSeries.length; i++) {
    const curr = priceSeries[i];
    const prev = priceSeries[i - 1];
    const r = (curr - prev) / prev;
    returns.push(r);
  }
  return returns;
};

const calcTotalReturns = returnsSeries => {
  const totalReturns = [1 + returnsSeries[0]];
  for (let i = 1; i < returnsSeries.length; i++) {
    const prev = totalReturns[i - 1];
    totalReturns[i] = prev + prev * returnsSeries[i];
  }
  return totalReturns;
};

module.exports = { calcReturns, calcTotalReturns };
