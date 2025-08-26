// Basic mathematical utility functions

export const mean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const sum = (values: number[]): number => {
  return values.reduce((sum, val) => sum + val, 0);
};

export const variance = (values: number[], sample: boolean = true): number => {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - m, 2));
  const divisor = sample ? values.length - 1 : values.length;
  return sum(squaredDiffs) / divisor;
};

export const standardDeviation = (values: number[], sample: boolean = true): number => {
  return Math.sqrt(variance(values, sample));
};

export const covariance = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  const meanX = mean(x);
  const meanY = mean(y);
  const products = x.map((xi, i) => (xi - meanX) * (y[i] - meanY));
  return sum(products) / (x.length - 1);
};

export const correlation = (x: number[], y: number[]): number => {
  const cov = covariance(x, y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);
  if (stdX === 0 || stdY === 0) return 0;
  return cov / (stdX * stdY);
};

export const factorial = (n: number): number => {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

export const combination = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  
  // Use the more efficient formula: C(n,r) = C(n,n-r)
  if (r > n - r) r = n - r;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
};

export const permutation = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  if (r === 0) return 1;
  
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
};

// Error function approximation for normal distribution
export const erf = (x: number): number => {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

// Standard normal cumulative distribution function
export const normalCDF = (z: number): number => {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
};

// Convert value to z-score
export const zScore = (x: number, mean: number, stdDev: number): number => {
  return (x - mean) / stdDev;
};

// Binomial probability mass function
export const binomialPMF = (k: number, n: number, p: number): number => {
  if (k > n || k < 0 || p < 0 || p > 1) return 0;
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
};

// Poisson probability mass function
export const poissonPMF = (k: number, lambda: number): number => {
  if (k < 0 || lambda < 0) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
};

// Round to specified decimal places
export const round = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};