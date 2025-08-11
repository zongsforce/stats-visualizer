import {
  validateNumericInput,
  parseNumericInput,
  cleanDataset,
  ValidationResult,
  DataCleaningOptions
} from './validation';

describe('Input Validation', () => {
  describe('validateNumericInput', () => {
    it('should validate valid numeric strings', () => {
      const result = validateNumericInput('1,2,3,4,5');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate space-separated numbers', () => {
      const result = validateNumericInput('1 2 3 4 5');
      expect(result.isValid).toBe(true);
    });

    it('should validate newline-separated numbers', () => {
      const result = validateNumericInput('1\n2\n3\n4\n5');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-numeric values', () => {
      const result = validateNumericInput('1,abc,3');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid number: abc');
    });

    it('should reject empty input', () => {
      const result = validateNumericInput('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input cannot be empty');
    });

    it('should handle mixed delimiters', () => {
      const result = validateNumericInput('1, 2; 3\n4\t5');
      expect(result.isValid).toBe(true);
    });
  });

  describe('parseNumericInput', () => {
    it('should parse comma-separated values', () => {
      const result = parseNumericInput('1,2,3,4,5');
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle floating point numbers', () => {
      const result = parseNumericInput('1.5, 2.7, 3.14');
      expect(result).toEqual([1.5, 2.7, 3.14]);
    });

    it('should handle negative numbers', () => {
      const result = parseNumericInput('-1, -2.5, 3');
      expect(result).toEqual([-1, -2.5, 3]);
    });

    it('should trim whitespace', () => {
      const result = parseNumericInput('  1  ,  2  ,  3  ');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should throw error for invalid input', () => {
      expect(() => parseNumericInput('1,abc,3')).toThrow();
    });
  });

  describe('cleanDataset', () => {
    const messyData = [1, 2, NaN, 3, Infinity, 4, -Infinity, 5];
    
    it('should remove NaN values by default', () => {
      const result = cleanDataset(messyData);
      expect(result).not.toContain(NaN);
    });

    it('should remove infinite values by default', () => {
      const result = cleanDataset(messyData);
      expect(result).not.toContain(Infinity);
      expect(result).not.toContain(-Infinity);
    });

    it('should detect and remove outliers when enabled', () => {
      const options: DataCleaningOptions = { removeOutliers: true, outlierMethod: 'iqr' };
      const dataWithOutliers = [1, 2, 3, 4, 5, 100]; // 100 is an outlier
      const result = cleanDataset(dataWithOutliers, options);
      expect(result).not.toContain(100);
    });

    it('should preserve original data when no cleaning needed', () => {
      const cleanData = [1, 2, 3, 4, 5];
      const result = cleanDataset(cleanData);
      expect(result).toEqual(cleanData);
    });
  });
});