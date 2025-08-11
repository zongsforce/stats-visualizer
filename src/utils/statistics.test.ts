import { 
  calculateStandardDeviation,
  calculateMean,
  calculateMedian,
  calculateVariance,
  calculateQuartiles,
  calculateDescriptiveStats,
  StatisticsOptions
} from './statistics';

describe('Statistical Utilities', () => {
  const sampleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const singleValue = [5];
  const identicalValues = [3, 3, 3, 3];
  const emptyData: number[] = [];

  describe('calculateMean', () => {
    it('should calculate mean for normal data', () => {
      expect(calculateMean(sampleData)).toBe(5.5);
    });

    it('should handle single value', () => {
      expect(calculateMean(singleValue)).toBe(5);
    });

    it('should handle identical values', () => {
      expect(calculateMean(identicalValues)).toBe(3);
    });

    it('should throw error for empty array', () => {
      expect(() => calculateMean(emptyData)).toThrow('Cannot calculate mean of empty dataset');
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate population standard deviation', () => {
      const options: StatisticsOptions = { type: 'population' };
      expect(calculateStandardDeviation(sampleData, options)).toBeCloseTo(2.872, 3);
    });

    it('should calculate sample standard deviation', () => {
      const options: StatisticsOptions = { type: 'sample' };
      expect(calculateStandardDeviation(sampleData, options)).toBeCloseTo(3.028, 3);
    });

    it('should handle single value', () => {
      expect(calculateStandardDeviation(singleValue)).toBe(0);
    });

    it('should handle identical values', () => {
      expect(calculateStandardDeviation(identicalValues)).toBe(0);
    });

    it('should throw error for empty array', () => {
      expect(() => calculateStandardDeviation(emptyData)).toThrow();
    });
  });

  describe('calculateMedian', () => {
    it('should calculate median for odd length array', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate median for even length array', () => {
      expect(calculateMedian(sampleData)).toBe(5.5);
    });

    it('should handle single value', () => {
      expect(calculateMedian(singleValue)).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => calculateMedian(emptyData)).toThrow();
    });
  });

  describe('calculateVariance', () => {
    it('should calculate population variance', () => {
      const options: StatisticsOptions = { type: 'population' };
      expect(calculateVariance(sampleData, options)).toBeCloseTo(8.25, 2);
    });

    it('should calculate sample variance', () => {
      const options: StatisticsOptions = { type: 'sample' };
      expect(calculateVariance(sampleData, options)).toBeCloseTo(9.167, 3);
    });
  });

  describe('calculateQuartiles', () => {
    it('should calculate quartiles correctly', () => {
      const quartiles = calculateQuartiles(sampleData);
      expect(quartiles.q1).toBeCloseTo(2.75, 2);
      expect(quartiles.q2).toBe(5.5);
      expect(quartiles.q3).toBeCloseTo(8.25, 2);
    });
  });

  describe('calculateDescriptiveStats', () => {
    it('should return complete statistical summary', () => {
      const stats = calculateDescriptiveStats(sampleData);
      expect(stats).toHaveProperty('mean');
      expect(stats).toHaveProperty('median');
      expect(stats).toHaveProperty('standardDeviation');
      expect(stats).toHaveProperty('variance');
      expect(stats).toHaveProperty('min');
      expect(stats).toHaveProperty('max');
      expect(stats).toHaveProperty('quartiles');
      expect(stats).toHaveProperty('count');
    });
  });
});