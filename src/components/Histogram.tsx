import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { chartData, binRanges, isEmpty } = useMemo(() => {
    if (data.length === 0) {
      return { chartData: null, binRanges: [], isEmpty: true };
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
    const binRanges: string[] = [];
    
    for (let i = 0; i < bins; i++) {
      const leftEdge = binEdges[i];
      const rightEdge = binEdges[i + 1];
      const binCenter = leftEdge + (binWidth / 2);
      
      // Store range for tooltips
      binRanges.push(`${leftEdge.toFixed(1)}-${rightEdge.toFixed(1)}`);
      
      // Format center value for display
      const formattedValue = Math.abs(binCenter - Math.round(binCenter)) < 0.1 
        ? Math.round(binCenter).toString()
        : binCenter.toFixed(1);
      binLabels.push(formattedValue);
    }
    
    data.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex === bins) binIndex = bins - 1; // Handle edge case for max value
      binCounts[binIndex]++;
    });

    const datasets = [{
      label: t('histogram.frequency'),
      data: binCounts,
      backgroundColor: color,
      borderColor: '#2c3e50',
      borderWidth: 1,
      borderRadius: 0
    }];

    // Mean will be displayed as a vertical line annotation instead of a bar

    return {
      chartData: {
        labels: binLabels,
        datasets
      },
      binRanges,
      isEmpty: false
    };
  }, [data, bins, color, t]);

  const meanValue = showMean ? calculateMean(data) : null;

  // Custom plugin to draw mean line  
  const meanLinePlugin = useMemo(() => ({
    id: 'meanLine',
    afterDraw: (chart: any) => {
      if (!showMean || !meanValue || data.length === 0) return;
      
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      
      // Get data range
      const min = Math.min(...data);
      const max = Math.max(...data);
      
      // Calculate mean position as a fraction of the total data range
      const meanPosition = (meanValue - min) / (max - min);
      
      // Map to pixel position within the chart area
      const chartWidth = chartArea.right - chartArea.left;
      const meanPixelX = chartArea.left + (meanPosition * chartWidth);
      
      // Draw the mean line with subtle styling
      ctx.save();
      ctx.strokeStyle = '#d32f2f'; // Deeper red, less glaring
      ctx.lineWidth = 2; // Thinner line
      ctx.setLineDash([6, 3]); // Shorter dashes
      ctx.globalAlpha = 0.8; // Slight transparency
      ctx.beginPath();
      ctx.moveTo(meanPixelX, chartArea.top);
      ctx.lineTo(meanPixelX, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    }
  }), [showMean, meanValue, data]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    datasets: {
      bar: {
        categoryPercentage: 1.0,
        barPercentage: 1.0
      }
    },
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
        text: t('histogram.dataDistribution'),
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return t('histogram.range', { range: binRanges?.[index] || context[0].label });
          },
          label: (context) => `${t('histogram.frequency')}: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('histogram.frequency')
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        title: {
          display: true,
          text: t('histogram.value')
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
            {t('histogram.title')}
          </Typography>
          <Alert severity="info">{t('histogram.noDataAvailable')}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('histogram.title')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            {t('histogram.numberOfBins', { count: bins })}
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
              {t('histogram.mean', { value: calculateMean(data).toFixed(2) })}
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
              plugins={[meanLinePlugin]}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}