import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ContentCopy,
  Warning
} from '@mui/icons-material';
import { DescriptiveStatistics } from '../utils/statistics';
import { useMobileQuery } from '../hooks/useMediaQuery';

interface StatisticsDisplayProps {
  statistics: DescriptiveStatistics | null;
}

export function StatisticsDisplay({ statistics }: StatisticsDisplayProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const isMobile = useMobileQuery();

  if (!statistics) {
    return (
      <Card data-testid="statistics-container" className="responsive">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Statistics
          </Typography>
          <Typography color="textSecondary">
            Calculating statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const copyToClipboard = async () => {
    const statsText = `
Statistics Summary:
Mean: ${formatNumber(statistics.mean)}
Median: ${formatNumber(statistics.median)}
Standard Deviation: ${formatNumber(statistics.standardDeviation)}
Variance: ${formatNumber(statistics.variance)}
Minimum: ${formatNumber(statistics.min)}
Maximum: ${formatNumber(statistics.max)}
Count: ${statistics.count}
Q1: ${formatNumber(statistics.quartiles.q1)}
Q2 (Median): ${formatNumber(statistics.quartiles.q2)}
Q3: ${formatNumber(statistics.quartiles.q3)}
    `.trim();

    try {
      await navigator.clipboard.writeText(statsText);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy statistics');
    }
  };

  const StatisticCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div" color="primary" fontWeight="bold">
          {typeof value === 'number' ? formatNumber(value) : value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const hasOutliers = (statistics as any).outliers?.length > 0;

  return (
    <>
      <Card data-testid="statistics-container" className={`responsive ${isMobile ? 'card-layout' : 'grid-layout'}`}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Descriptive Statistics
            </Typography>
            <Button
              size="small"
              startIcon={<ContentCopy />}
              onClick={copyToClipboard}
              variant="outlined"
            >
              Copy
            </Button>
          </Box>

          {hasOutliers && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
              Outliers detected in the dataset
            </Alert>
          )}

          <Box 
            className="grid-layout"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)', 
                md: 'repeat(4, 1fr)'
              },
              gap: 2
            }}
          >
            <StatisticCard title="Mean" value={formatNumber(statistics.mean)} />
            <StatisticCard title="Median" value={formatNumber(statistics.median)} />
            <StatisticCard 
              title="Standard Deviation" 
              value={formatNumber(statistics.standardDeviation)} 
              subtitle="σ"
            />
            <StatisticCard 
              title="Variance" 
              value={formatNumber(statistics.variance)} 
              subtitle="σ²"
            />
            <StatisticCard title="Minimum" value={formatNumber(statistics.min)} />
            <StatisticCard title="Maximum" value={formatNumber(statistics.max)} />
            <StatisticCard title="Count" value={statistics.count} subtitle="n" />
            <StatisticCard 
              title="Range" 
              value={formatNumber(statistics.max - statistics.min)} 
              subtitle="max - min"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Quartiles</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box 
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2
                }}
              >
                <StatisticCard 
                  title="Q1" 
                  value={formatNumber(statistics.quartiles.q1)} 
                  subtitle="25th percentile"
                />
                <StatisticCard 
                  title="Q2" 
                  value={formatNumber(statistics.quartiles.q2)} 
                  subtitle="50th percentile"
                />
                <StatisticCard 
                  title="Q3" 
                  value={formatNumber(statistics.quartiles.q3)} 
                  subtitle="75th percentile"
                />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip 
                  label={`IQR: ${formatNumber(statistics.quartiles.q3 - statistics.quartiles.q1)}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          Statistics copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}