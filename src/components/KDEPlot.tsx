import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler
} from 'chart.js';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import { calculateKDE, KernelType, estimateOptimalBandwidth } from '../utils/kde';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KDEPlotProps {
  data: number[];
  bandwidth: number;
  onBandwidthChange: (bandwidth: number) => void;
  kernel?: KernelType;
  onKernelChange?: (kernel: KernelType) => void;
  fill?: boolean;
}

export function KDEPlot({ 
  data, 
  bandwidth, 
  onBandwidthChange, 
  kernel = 'gaussian',
  onKernelChange,
  fill = false 
}: KDEPlotProps) {
  const { t } = useTranslation();
  const { chartData, isEmpty, optimalBandwidth } = useMemo(() => {
    if (data.length === 0) {
      return { chartData: null, isEmpty: true, optimalBandwidth: 0.5 };
    }

    if (data.length < 2) {
      return { chartData: null, isEmpty: true, optimalBandwidth: 0.5 };
    }

    const optimalBw = estimateOptimalBandwidth(data);
    const { x, y } = calculateKDE(data, bandwidth, 100, kernel);
    
    return {
      chartData: {
        datasets: [{
          label: t('kde.density'),
          data: x.map((xVal, i) => ({ x: xVal, y: y[i] })),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: fill ? 'rgba(75, 192, 192, 0.2)' : 'transparent',
          borderWidth: 2,
          fill: fill,
          tension: 0.4, // Makes the curve smooth
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      isEmpty: false,
      optimalBandwidth: optimalBw
    };
  }, [data, bandwidth, kernel, fill, t]);

  const chartOptions: ChartOptions<'line'> = {
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
        text: t('kde.kernelDensityEstimation'),
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => `${t('histogram.value')}: ${context[0].label}`,
          label: (context) => t('kde.densityValue', { value: Number(context.parsed.y).toFixed(4) })
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('kde.probabilityDensity')
        },
        ticks: {
          callback: function(value) {
            return Number(value).toFixed(3);
          }
        }
      },
      x: {
        type: 'linear',
        title: {
          display: true,
          text: t('histogram.value')
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function(value: any) {
            return typeof value === 'number' ? value.toFixed(1) : value;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  if (isEmpty) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('kde.title')}
          </Typography>
          <Alert severity="info">
            {data.length === 0 
              ? t('kde.noDataAvailable')
              : t('kde.insufficientData')
            }
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('kde.title')}
          </Typography>
          <Chip 
            label={t('kde.optimal', { value: optimalBandwidth.toFixed(3) })}
            size="small"
            variant="outlined"
            color={Math.abs(bandwidth - optimalBandwidth) < 0.1 ? 'success' : 'default'}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            {t('kde.bandwidth', { value: bandwidth.toFixed(2) })}
          </Typography>
          <Slider
            value={bandwidth}
            onChange={(_, newValue) => onBandwidthChange(newValue as number)}
            min={0.1}
            max={2.0}
            step={0.1}
            valueLabelDisplay="auto"
            aria-label="Bandwidth"
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('kde.kernel')}</InputLabel>
            <Select
              value={kernel}
              label={t('kde.kernel')}
              onChange={(e) => onKernelChange?.(e.target.value as KernelType)}
            >
              <MenuItem value="gaussian">{t('kde.kernels.gaussian')}</MenuItem>
              <MenuItem value="epanechnikov">{t('kde.kernels.epanechnikov')}</MenuItem>
              <MenuItem value="triangular">{t('kde.kernels.triangular')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box 
          sx={{ 
            height: { xs: 300, sm: 400 },
            width: '100%',
            position: 'relative'
          }}
        >
          {chartData && (
            <Line 
              data-testid="kde-chart"
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