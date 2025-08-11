import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
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

          <Grid container spacing={2} className="grid-layout">
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard title="Mean" value={formatNumber(statistics.mean)} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard title="Median" value={formatNumber(statistics.median)} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard 
                title="Standard Deviation" 
                value={formatNumber(statistics.standardDeviation)} 
                subtitle="σ"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard 
                title="Variance" 
                value={formatNumber(statistics.variance)} 
                subtitle="σ²"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard title="Minimum" value={formatNumber(statistics.min)} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard title="Maximum" value={formatNumber(statistics.max)} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard title="Count" value={statistics.count} subtitle="n" />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatisticCard 
                title="Range" 
                value={formatNumber(statistics.max - statistics.min)} 
                subtitle="max - min"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Quartiles</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <StatisticCard 
                    title="Q1" 
                    value={formatNumber(statistics.quartiles.q1)} 
                    subtitle="25th percentile"
                  />
                </Grid>
                <Grid item xs={4}>
                  <StatisticCard 
                    title="Q2" 
                    value={formatNumber(statistics.quartiles.q2)} 
                    subtitle="50th percentile"
                  />
                </Grid>
                <Grid item xs={4}>
                  <StatisticCard 
                    title="Q3" 
                    value={formatNumber(statistics.quartiles.q3)} 
                    subtitle="75th percentile"
                  />
                </Grid>
              </Grid>
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