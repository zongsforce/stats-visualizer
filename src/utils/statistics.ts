export interface StatisticsOptions {
  type?: 'population' | 'sample';
}

export interface Quartiles {
  q1: number;
  q2: number;
  q3: number;
}

export interface DescriptiveStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  min: number;
  max: number;
  count: number;
  quartiles: Quartiles;
  outliers?: number[];
}

export function calculateMean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate mean of empty dataset');
  }
  
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

export function calculateMedian(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate median of empty dataset');
  }
  
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculateVariance(data: number[], options: StatisticsOptions = {}): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate variance of empty dataset');
  }
  
  const mean = calculateMean(data);
  const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
  const sum = squaredDifferences.reduce((acc, val) => acc + val, 0);
  
  const divisor = options.type === 'sample' ? data.length - 1 : data.length;
  return sum / divisor;
}

export function calculateStandardDeviation(data: number[], options: StatisticsOptions = {}): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate standard deviation of empty dataset');
  }
  
  if (data.length === 1) {
    return 0;
  }
  
  const variance = calculateVariance(data, options);
  return Math.sqrt(variance);
}

export function calculateCoefficientOfVariation(data: number[], options: StatisticsOptions = {}): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate coefficient of variation of empty dataset');
  }
  
  const mean = calculateMean(data);
  
  if (mean === 0) {
    throw new Error('Cannot calculate coefficient of variation when mean is zero');
  }
  
  const standardDeviation = calculateStandardDeviation(data, options);
  return (standardDeviation / Math.abs(mean)) * 100;
}

export function calculateQuartiles(data: number[]): Quartiles {
  if (data.length === 0) {
    throw new Error('Cannot calculate quartiles of empty dataset');
  }
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  // Calculate Q1, Q2 (median), Q3
  const q1Index = (n + 1) / 4;
  const q2Index = (n + 1) / 2;
  const q3Index = 3 * (n + 1) / 4;
  
  const interpolate = (index: number): number => {
    const lower = Math.floor(index) - 1;
    const upper = Math.ceil(index) - 1;
    const fraction = index - Math.floor(index);
    
    if (lower < 0) return sorted[0];
    if (upper >= n) return sorted[n - 1];
    if (lower === upper) return sorted[lower];
    
    return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
  };
  
  return {
    q1: interpolate(q1Index),
    q2: interpolate(q2Index),
    q3: interpolate(q3Index)
  };
}

export function calculateDescriptiveStats(data: number[], options: StatisticsOptions = {}): DescriptiveStatistics {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics of empty dataset');
  }
  
  const mean = calculateMean(data);
  const median = calculateMedian(data);
  const standardDeviation = calculateStandardDeviation(data, options);
  const coefficientOfVariation = calculateCoefficientOfVariation(data, options);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const count = data.length;
  const quartiles = calculateQuartiles(data);
  
  return {
    mean,
    median,
    standardDeviation,
    coefficientOfVariation,
    min,
    max,
    count,
    quartiles
  };
}