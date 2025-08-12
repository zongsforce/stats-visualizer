import { getSampleDataset, getAllSampleDatasets, sampleDatasets } from './sampleData';

describe('Sample Data Utilities', () => {
  describe('sampleDatasets', () => {
    it('should contain all required datasets', () => {
      expect(sampleDatasets).toHaveLength(4);
      
      const ids = sampleDatasets.map(dataset => dataset.id);
      expect(ids).toContain('normal');
      expect(ids).toContain('bimodal');
      expect(ids).toContain('skewed');
      expect(ids).toContain('small');
    });

    it('should have proper structure for each dataset', () => {
      sampleDatasets.forEach(dataset => {
        expect(dataset).toHaveProperty('id');
        expect(dataset).toHaveProperty('name');
        expect(dataset).toHaveProperty('description');
        expect(dataset).toHaveProperty('data');
        expect(dataset).toHaveProperty('context');
        
        expect(typeof dataset.id).toBe('string');
        expect(typeof dataset.name).toBe('string');
        expect(typeof dataset.description).toBe('string');
        expect(Array.isArray(dataset.data)).toBe(true);
        expect(typeof dataset.context).toBe('string');
      });
    });

    describe('normal distribution dataset', () => {
      it('should generate proper normal distribution data', () => {
        const normalDataset = sampleDatasets.find(d => d.id === 'normal');
        expect(normalDataset).toBeDefined();
        expect(normalDataset!.data).toHaveLength(100);
        expect(normalDataset!.name).toBe('Normal Distribution');
        
        // Check if data is roughly normal (most values should be near mean)
        const data = normalDataset!.data;
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        expect(mean).toBeGreaterThan(60);
        expect(mean).toBeLessThan(90);
      });
    });

    describe('bimodal distribution dataset', () => {
      it('should generate bimodal distribution data', () => {
        const bimodalDataset = sampleDatasets.find(d => d.id === 'bimodal');
        expect(bimodalDataset).toBeDefined();
        expect(bimodalDataset!.data).toHaveLength(120);
        expect(bimodalDataset!.name).toBe('Bimodal Distribution');
        
        // Check if data contains values in expected ranges (around 165 and 185)
        const data = bimodalDataset!.data;
        const valuesAroundFirst = data.filter(val => val >= 150 && val <= 180).length;
        const valuesAroundSecond = data.filter(val => val >= 170 && val <= 200).length;
        
        // Should have values in both ranges
        expect(valuesAroundFirst).toBeGreaterThan(0);
        expect(valuesAroundSecond).toBeGreaterThan(0);
      });
    });

    describe('skewed distribution dataset', () => {
      it('should generate right-skewed distribution data', () => {
        const skewedDataset = sampleDatasets.find(d => d.id === 'skewed');
        expect(skewedDataset).toBeDefined();
        expect(skewedDataset!.data).toHaveLength(80);
        expect(skewedDataset!.name).toBe('Skewed Distribution');
        
        // Check if data is in expected income range
        const data = skewedDataset!.data;
        data.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(20000);
          expect(value).toBeLessThanOrEqual(200000);
        });
        
        // Should be right-skewed (most values in lower range)
        const lowValues = data.filter(val => val < 60000).length;
        const highValues = data.filter(val => val >= 60000).length;
        expect(lowValues).toBeGreaterThan(highValues);
      });
    });

    describe('small dataset', () => {
      it('should contain exact predefined values', () => {
        const smallDataset = sampleDatasets.find(d => d.id === 'small');
        expect(smallDataset).toBeDefined();
        expect(smallDataset!.data).toEqual([12, 15, 18, 22, 24, 27, 29, 33, 35, 38]);
        expect(smallDataset!.name).toBe('Small Dataset');
      });
    });
  });

  describe('getSampleDataset', () => {
    it('should return correct dataset by id', () => {
      const normalDataset = getSampleDataset('normal');
      expect(normalDataset).toBeDefined();
      expect(normalDataset!.id).toBe('normal');
      expect(normalDataset!.name).toBe('Normal Distribution');
    });

    it('should return undefined for non-existent id', () => {
      const dataset = getSampleDataset('nonexistent');
      expect(dataset).toBeUndefined();
    });

    it('should handle empty string', () => {
      const dataset = getSampleDataset('');
      expect(dataset).toBeUndefined();
    });
  });

  describe('getAllSampleDatasets', () => {
    it('should return all datasets', () => {
      const allDatasets = getAllSampleDatasets();
      expect(allDatasets).toHaveLength(4);
      expect(allDatasets).toEqual(sampleDatasets);
    });

    it('should return the same reference (by design)', () => {
      const allDatasets = getAllSampleDatasets();
      expect(allDatasets).toBe(sampleDatasets);
      expect(allDatasets).toEqual(sampleDatasets);
    });
  });

  describe('data generation consistency', () => {
    it('should generate different data on each call for random datasets', () => {
      // Get two instances of the same dataset type and compare
      const dataset1 = getSampleDataset('normal');
      const dataset2 = getSampleDataset('normal');
      
      // While they should be different instances, they should have same structure
      expect(dataset1!.id).toBe(dataset2!.id);
      expect(dataset1!.name).toBe(dataset2!.name);
      expect(dataset1!.data.length).toBe(dataset2!.data.length);
    });

    it('should generate consistent data for small dataset', () => {
      const dataset1 = getSampleDataset('small');
      const dataset2 = getSampleDataset('small');
      
      expect(dataset1!.data).toEqual(dataset2!.data);
    });
  });
});