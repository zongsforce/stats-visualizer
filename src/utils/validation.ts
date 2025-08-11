export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface DataCleaningOptions {
  removeNaN?: boolean;
  removeInfinite?: boolean;
  removeOutliers?: boolean;
  outlierMethod?: 'iqr' | 'zscore';
  zscoreThreshold?: number;
}

export function validateNumericInput(input: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };
  
  if (!input || input.trim() === '') {
    result.isValid = false;
    result.errors.push('Input cannot be empty');
    return result;
  }
  
  // Split by various delimiters and clean
  const values = input
    .split(/[,;\s\n\t]+/)
    .map(val => val.trim())
    .filter(val => val.length > 0);
  
  for (const value of values) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      result.isValid = false;
      result.errors.push(`Invalid number: ${value}`);
    }
  }
  
  return result;
}

export function parseNumericInput(input: string): number[] {
  const validation = validateNumericInput(input);
  
  if (!validation.isValid) {
    throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
  }
  
  // Split by various delimiters and parse
  return input
    .split(/[,;\s\n\t]+/)
    .map(val => val.trim())
    .filter(val => val.length > 0)
    .map(val => parseFloat(val));
}

export function cleanDataset(data: number[], options: DataCleaningOptions = {}): number[] {
  const {
    removeNaN = true,
    removeInfinite = true,
    removeOutliers = false,
    outlierMethod = 'iqr',
    zscoreThreshold = 3
  } = options;
  
  let cleaned = [...data];
  
  // Remove NaN values
  if (removeNaN) {
    cleaned = cleaned.filter(val => !isNaN(val));
  }
  
  // Remove infinite values
  if (removeInfinite) {
    cleaned = cleaned.filter(val => isFinite(val));
  }
  
  // Remove outliers
  if (removeOutliers && cleaned.length > 0) {
    if (outlierMethod === 'iqr') {
      cleaned = removeOutliersIQR(cleaned);
    } else if (outlierMethod === 'zscore') {
      cleaned = removeOutliersZScore(cleaned, zscoreThreshold);
    }
  }
  
  return cleaned;
}

function removeOutliersIQR(data: number[]): number[] {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return data.filter(val => val >= lowerBound && val <= upperBound);
}

function removeOutliersZScore(data: number[], threshold: number): number[] {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  return data.filter(val => {
    const zscore = Math.abs((val - mean) / stdDev);
    return zscore <= threshold;
  });
}