import { useState, useCallback, useEffect } from 'react';
import { DescriptiveStatistics, calculateDescriptiveStats } from '../utils/statistics';
import { cleanDataset, DataCleaningOptions } from '../utils/validation';

export interface VisualizationParams {
  bins?: number;
  bandwidth?: number;
  removeOutliers?: boolean;
  outlierMethod?: 'iqr' | 'zscore';
}

export interface StatsState {
  data: number[];
  statistics: DescriptiveStatistics | null;
  isLoading: boolean;
  error: string | null;
  visualizationParams: VisualizationParams;
}

export interface StatsStateActions {
  setData: (data: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setVisualizationParams: (params: Partial<VisualizationParams>) => void;
  reset: () => void;
}

const initialState: StatsState = {
  data: [],
  statistics: null,
  isLoading: false,
  error: null,
  visualizationParams: {
    bins: 10,
    bandwidth: 0.5,
    removeOutliers: false,
    outlierMethod: 'iqr'
  }
};

export function useStatsState(): StatsState & StatsStateActions {
  const [state, setState] = useState<StatsState>(initialState);

  const setData = useCallback((data: number[]) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    
    try {
      // Validate data
      const hasInvalidValues = data.some(val => isNaN(val) || !isFinite(val));
      if (hasInvalidValues) {
        throw new Error('Invalid numeric values detected');
      }
      
      if (data.length === 0) {
        setState(prev => ({
          ...prev,
          data: [],
          statistics: null,
          isLoading: false,
          error: null
        }));
        return;
      }

      // Clean data based on visualization params
      const cleaningOptions: DataCleaningOptions = {
        removeOutliers: state.visualizationParams.removeOutliers,
        outlierMethod: state.visualizationParams.outlierMethod
      };
      
      const cleanedData = cleanDataset(data, cleaningOptions);
      const statistics = calculateDescriptiveStats(cleanedData);

      setState(prev => ({
        ...prev,
        data: cleanedData,
        statistics,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false
      }));
    }
  }, [state.visualizationParams]);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setVisualizationParams = useCallback((params: Partial<VisualizationParams>) => {
    setState(prev => ({
      ...prev,
      visualizationParams: { ...prev.visualizationParams, ...params }
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Recalculate statistics when visualization parameters change
  useEffect(() => {
    if (state.data.length > 0) {
      try {
        const cleaningOptions: DataCleaningOptions = {
          removeOutliers: state.visualizationParams.removeOutliers,
          outlierMethod: state.visualizationParams.outlierMethod
        };
        
        const cleanedData = cleanDataset(state.data, cleaningOptions);
        if (cleanedData.length > 0) {
          const statistics = calculateDescriptiveStats(cleanedData);
          setState(prev => ({ ...prev, statistics }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error recalculating statistics'
        }));
      }
    }
  }, [state.visualizationParams, state.data]);

  return {
    ...state,
    setData,
    setLoading,
    setError,
    setVisualizationParams,
    reset
  };
}