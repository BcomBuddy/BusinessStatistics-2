// Sample datasets for all modules

export const regressionSampleData = [
  { x: 2, y: 4 },
  { x: 4, y: 5 },
  { x: 6, y: 7 },
  { x: 8, y: 8 },
  { x: 10, y: 11 }
];

export const indexNumbersSampleData = [
  { item: 'A', p0: 10, q0: 100, p1: 12, q1: 105 },
  { item: 'B', p0: 20, q0: 80, p1: 25, q1: 85 },
  { item: 'C', p0: 15, q0: 120, p1: 18, q1: 115 },
  { item: 'D', p0: 30, q0: 60, p1: 35, q1: 65 },
  { item: 'E', p0: 25, q0: 90, p1: 28, q1: 95 }
];

export const timeSeriesSampleData = [
  { period: 'Q1-2021', value: 120 },
  { period: 'Q2-2021', value: 135 },
  { period: 'Q3-2021', value: 148 },
  { period: 'Q4-2021', value: 162 },
  { period: 'Q1-2022', value: 125 },
  { period: 'Q2-2022', value: 142 },
  { period: 'Q3-2022', value: 155 },
  { period: 'Q4-2022', value: 168 },
  { period: 'Q1-2023', value: 130 },
  { period: 'Q2-2023', value: 148 },
  { period: 'Q3-2023', value: 162 },
  { period: 'Q4-2023', value: 175 }
];

export const probabilitySampleData = {
  factory: {
    A: { prior: 0.3, likelihood: 0.02 },
    B: { prior: 0.5, likelihood: 0.03 },
    C: { prior: 0.2, likelihood: 0.05 }
  }
};

export const distributionsSampleData = {
  binomial: { n: 12, p: 0.3 },
  poisson: { lambda: 3.2 },
  normal: { mean: 50, stdDev: 10 },
  normalFitting: [
    { class: '30-35', frequency: 5 },
    { class: '35-40', frequency: 12 },
    { class: '40-45', frequency: 18 },
    { class: '45-50', frequency: 25 },
    { class: '50-55', frequency: 22 },
    { class: '55-60', frequency: 15 },
    { class: '60-65', frequency: 8 }
  ]
};