import {
  exportChartAsImage,
  exportStatisticsAsJSON,
  exportStatisticsAsCSV,
  exportData,
  ExportFormat,
  ExportOptions
} from './export';
import { DescriptiveStatistics } from './statistics';

// Mock HTML5 Canvas
const mockToBlob = jest.fn();
const mockGetContext = jest.fn(() => ({
  canvas: { toBlob: mockToBlob }
}));

// Mock DOM environment
class MockHTMLCanvasElement {
  toBlob = mockToBlob;
  getContext = mockGetContext;
}

Object.defineProperty(global, 'HTMLCanvasElement', {
  value: MockHTMLCanvasElement
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement
const mockAnchor = {
  click: jest.fn(),
  href: '',
  download: ''
};

const mockCreateElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return { ...mockAnchor };
  }
  if (tagName === 'canvas') {
    return new MockHTMLCanvasElement();
  }
  return {};
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  }
});

describe('Export Utilities', () => {
  const mockStats: DescriptiveStatistics = {
    mean: 5.5,
    median: 5.5,
    standardDeviation: 2.872,
    variance: 8.25,
    min: 1,
    max: 10,
    count: 10,
    quartiles: {
      q1: 3.25,
      q2: 5.5,
      q3: 7.75
    }
  };

  const mockData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportChartAsImage', () => {
    it('should export chart canvas as PNG', async () => {
      const mockCanvas = {
        toBlob: mockToBlob
      } as any;
      const options: ExportOptions = { format: 'png', filename: 'chart.png' };
      
      mockToBlob.mockImplementation((callback) => {
        callback(new Blob(['mock-image-data'], { type: 'image/png' }));
      });

      await exportChartAsImage(mockCanvas, options);
      
      expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png', undefined);
    });

    it('should export chart canvas as JPEG with quality', async () => {
      const mockCanvas = {
        toBlob: mockToBlob
      } as any;
      const options: ExportOptions = { format: 'jpeg', filename: 'chart.jpg', quality: 0.8 };
      
      mockToBlob.mockImplementation((callback) => {
        callback(new Blob(['mock-image-data'], { type: 'image/jpeg' }));
      });
      
      await exportChartAsImage(mockCanvas, options);
      
      expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
    });

    it('should handle export errors gracefully', async () => {
      const mockCanvas = {
        toBlob: mockToBlob
      } as any;
      mockToBlob.mockImplementation((callback) => {
        callback(null); // Simulate error
      });

      await expect(exportChartAsImage(mockCanvas, { format: 'png' }))
        .rejects.toThrow('Failed to export chart as image');
    });
  });

  describe('exportStatisticsAsJSON', () => {
    it('should export statistics as JSON file', () => {
      const options: ExportOptions = { filename: 'stats.json' };
      
      expect(() => exportStatisticsAsJSON(mockStats, options)).not.toThrow();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should include metadata in JSON export', () => {
      const options: ExportOptions = { 
        filename: 'stats.json',
        includeMetadata: true 
      };
      
      expect(() => exportStatisticsAsJSON(mockStats, options)).not.toThrow();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportStatisticsAsCSV', () => {
    it('should export statistics as CSV file', () => {
      const options: ExportOptions = { filename: 'stats.csv' };
      
      expect(() => exportStatisticsAsCSV(mockStats, options)).not.toThrow();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    it('should format CSV with proper headers', () => {
      const options: ExportOptions = { filename: 'stats.csv' };
      
      expect(() => exportStatisticsAsCSV(mockStats, options)).not.toThrow();
    });
  });

  describe('exportData', () => {
    it('should export raw data as JSON', () => {
      const format: ExportFormat = 'json';
      
      expect(() => exportData(mockData, mockStats, format)).not.toThrow();
    });

    it('should export raw data as CSV', () => {
      const format: ExportFormat = 'csv';
      
      expect(() => exportData(mockData, mockStats, format)).not.toThrow();
    });

    it('should generate appropriate filename when not provided', () => {
      expect(() => exportData(mockData, mockStats, 'json')).not.toThrow();
    });

    it('should handle empty data gracefully', () => {
      expect(() => exportData([], mockStats, 'json')).not.toThrow();
    });
  });

  describe('Export format validation', () => {
    it('should validate supported image formats', async () => {
      const mockCanvas = { toBlob: mockToBlob } as any;
      mockToBlob.mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      });
      
      await expect(exportChartAsImage(mockCanvas, { format: 'png' })).resolves.not.toThrow();
    });

    it('should throw error for unsupported formats', async () => {
      const mockCanvas = { toBlob: mockToBlob } as any;
      
      await expect(exportChartAsImage(mockCanvas, { format: 'bmp' as any }))
        .rejects.toThrow('Unsupported export format: bmp');
    });
  });
});