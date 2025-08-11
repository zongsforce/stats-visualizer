import { renderHook, act } from '@testing-library/react';
import { useStatsState } from './useStatsState';

describe('useStatsState Hook', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useStatsState());
    
    expect(result.current.data).toEqual([]);
    expect(result.current.statistics).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update data and calculate statistics', () => {
    const { result } = renderHook(() => useStatsState());
    const testData = [1, 2, 3, 4, 5];
    
    act(() => {
      result.current.setData(testData);
    });
    
    expect(result.current.data).toEqual(testData);
    expect(result.current.statistics).toHaveProperty('mean');
    expect(result.current.statistics?.mean).toBe(3);
  });

  it('should handle loading state during async operations', async () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error states', () => {
    const { result } = renderHook(() => useStatsState());
    const testError = 'Test error message';
    
    act(() => {
      result.current.setError(testError);
    });
    
    expect(result.current.error).toBe(testError);
  });

  it('should clear error when new data is set', () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
    
    act(() => {
      result.current.setData([1, 2, 3]);
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should update visualization parameters', () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setVisualizationParams({
        bins: 10,
        bandwidth: 0.8
      });
    });
    
    expect(result.current.visualizationParams.bins).toBe(10);
    expect(result.current.visualizationParams.bandwidth).toBe(0.8);
  });

  it('should recalculate statistics when parameters change', () => {
    const { result } = renderHook(() => useStatsState());
    const testData = [1, 2, 3, 4, 5, 100]; // Include outlier
    
    act(() => {
      result.current.setData(testData);
    });
    
    const originalStats = result.current.statistics;
    
    act(() => {
      result.current.setVisualizationParams({
        removeOutliers: true
      });
    });
    
    // Statistics should be different after outlier removal
    expect(result.current.statistics).not.toEqual(originalStats);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setData([1, 2, 3]);
      result.current.setError('Test error');
      result.current.setLoading(true);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.data).toEqual([]);
    expect(result.current.statistics).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle empty dataset gracefully', () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setData([]);
    });
    
    expect(result.current.statistics).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should validate data before setting', () => {
    const { result } = renderHook(() => useStatsState());
    
    act(() => {
      result.current.setData([1, 2, NaN, 4, 5]);
    });
    
    expect(result.current.error).toContain('Invalid numeric values detected');
  });
});