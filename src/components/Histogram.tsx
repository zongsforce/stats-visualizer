import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { calculateMean } from '../utils/statistics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistogramProps {
  data: number[];
  bins: number;
  onBinsChange: (bins: number) => void;
  color?: string;
  showMean?: boolean;
}

export function Histogram({ data, bins, onBinsChange, color = '#3f51b5', showMean = false }: HistogramProps) {
  const { chartData, isEmpty } = useMemo(() => {
    if (data.length === 0) {
      return { chartData: null, isEmpty: true };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    
    const binEdges: number[] = [];
    for (let i = 0; i <= bins; i++) {
      binEdges.push(min + i * binWidth);
    }
    
    const binCounts = new Array(bins).fill(0);
    const binLabels: string[] = [];
    
    for (let i = 0; i < bins; i++) {
      const leftEdge = binEdges[i];
      const rightEdge = binEdges[i + 1];
      binLabels.push(`${leftEdge.toFixed(1)}-${rightEdge.toFixed(1)}`);
    }
    
    data.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex === bins) binIndex = bins - 1; // Handle edge case for max value
      binCounts[binIndex]++;
    });

    const datasets = [{
      label: 'Frequency',
      data: binCounts,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4
    }];

    if (showMean) {
      const meanValue = calculateMean(data);
      const meanBinIndex = Math.floor((meanValue - min) / binWidth);
      if (meanBinIndex >= 0 && meanBinIndex < bins) {
        datasets.push({
          label: 'Mean',
          data: binCounts.map((_, index) => index === meanBinIndex ? Math.max(...binCounts) * 1.1 : 0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderRadius: 0
        });
      }
    }

    return {
      chartData: {
        labels: binLabels,
        datasets
      },
      isEmpty: false
    };
  }, [data, bins, color, showMean]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Data Distribution (Histogram)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => `Range: ${context[0].label}`,
          label: (context) => `Frequency: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frequency'
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        title: {
          display: true,
          text: 'Value Range'
        },
        ticks: {
          maxRotation: 45,
          font: {
            size: 10
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (isEmpty) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histogram
          </Typography>
          <Alert severity="info">No data available for histogram</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Histogram
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Number of Bins: {bins}
          </Typography>
          <Slider
            value={bins}
            onChange={(_, newValue) => onBinsChange(newValue as number)}
            min={5}
            max={50}
            step={1}
            valueLabelDisplay="auto"
            aria-label="Number of bins"
            sx={{ mt: 1 }}
          />
        </Box>

        {showMean && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Mean: {calculateMean(data).toFixed(2)}
            </Typography>
          </Box>
        )}

        <Box 
          sx={{ 
            height: { xs: 300, sm: 400 },
            width: '100%',
            position: 'relative'
          }}
        >
          {chartData && (
            <Bar 
              data-testid="histogram-chart"
              data={chartData} 
              options={chartOptions}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}