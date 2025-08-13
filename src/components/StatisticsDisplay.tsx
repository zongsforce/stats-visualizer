import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../utils/clipboard';
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
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  ContentCopy,
  Warning,
  HelpOutline
} from '@mui/icons-material';
import { DescriptiveStatistics } from '../utils/statistics';
import { useMobileQuery } from '../hooks/useMediaQuery';

interface StatisticsDisplayProps {
  statistics: DescriptiveStatistics | null;
}

export function StatisticsDisplay({ statistics }: StatisticsDisplayProps) {
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);
  const isMobile = useMobileQuery();

  if (!statistics) {
    return (
      <Card data-testid="statistics-container" className="responsive">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('statistics.title')}
          </Typography>
          <Typography color="textSecondary">
            {t('statistics.calculating')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const handleCopyToClipboard = async () => {
    const statsText = `
${t('export.statisticsSummary')}:
${t('statistics.mean')}: ${formatNumber(statistics.mean)}
${t('statistics.median')}: ${formatNumber(statistics.median)}
${t('statistics.standardDeviation')}: ${formatNumber(statistics.standardDeviation)}
${t('statistics.coefficientOfVariation')}: ${formatNumber(statistics.coefficientOfVariation)}%
${t('statistics.minimum')}: ${formatNumber(statistics.min)}
${t('statistics.maximum')}: ${formatNumber(statistics.max)}
${t('statistics.count')}: ${statistics.count}
${t('statistics.q1')}: ${formatNumber(statistics.quartiles.q1)}
${t('statistics.q2')}: ${formatNumber(statistics.quartiles.q2)}
${t('statistics.q3')}: ${formatNumber(statistics.quartiles.q3)}
    `.trim();

    const success = await copyToClipboard(statsText);
    if (success) {
      setCopySuccess(true);
    }
  };

  const TitleWithHelp = ({ title, helpKey }: { title: string; helpKey: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
      <Typography variant="subtitle2" color="textSecondary">
        {title}
      </Typography>
      <Tooltip 
        title={t(`statistics.help.${helpKey}`)}
        arrow
        placement="top"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      >
        <IconButton size="small" sx={{ padding: 0.25, opacity: 0.7 }}>
          <HelpOutline sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const StatisticCard = ({ title, value, subtitle, helpKey }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    helpKey?: string;
  }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ 
        textAlign: 'center', 
        p: { xs: '16px 16px', sm: 3 },
        '&:last-child': { pb: { xs: '16px', sm: 3 } }
      }}>
        {helpKey ? (
          <TitleWithHelp title={title} helpKey={helpKey} />
        ) : (
          <Typography variant="subtitle2" color="textSecondary" sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            mb: { xs: 0.75, sm: 1 },
            lineHeight: { xs: 1.2, sm: 1.5 }
          }}>
            {title}
          </Typography>
        )}
        <Typography variant="h5" component="div" color="primary" fontWeight="bold" sx={{ 
          mt: { xs: 0, sm: 1 },
          mb: { xs: 0.5, sm: 1 },
          fontSize: { xs: '1.1rem', sm: '1.5rem' },
          lineHeight: { xs: 1.2, sm: 1.4 }
        }}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          lineHeight: { xs: 1.2, sm: 1.4 },
          minHeight: { xs: '0.7rem', sm: '1rem' },
          display: 'block'
        }}>
          {subtitle || '\u00A0'}
        </Typography>
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
              {t('statistics.title')}
            </Typography>
            <Button
              size="small"
              startIcon={<ContentCopy fontSize="small" />}
              onClick={handleCopyToClipboard}
              variant="outlined"
              color="primary"
              sx={{
                fontSize: '13px',
                padding: '4px 10px',
                minHeight: 'auto',
                minWidth: 'auto',
                '& .MuiButton-startIcon': {
                  marginRight: 0.5,
                },
                '&:hover': {
                  backgroundColor: 'primary.main',
                  borderColor: 'primary.main',
                  color: 'primary.contrastText',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {t('statistics.copy')}
            </Button>
          </Box>

          {hasOutliers && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
              {t('statistics.outliersDetected')}
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
              gap: { xs: 1.5, sm: 2 }
            }}
          >
            <StatisticCard 
              title={t('statistics.mean')} 
              value={formatNumber(statistics.mean)} 
              helpKey="mean"
            />
            <StatisticCard 
              title={t('statistics.median')} 
              value={formatNumber(statistics.median)} 
              helpKey="median"
            />
            <StatisticCard 
              title={t('statistics.standardDeviation')} 
              value={formatNumber(statistics.standardDeviation)} 
              subtitle="σ"
              helpKey="standardDeviation"
            />
            <StatisticCard 
              title={t('statistics.coefficientOfVariation')} 
              value={`${formatNumber(statistics.coefficientOfVariation)}%`} 
              subtitle="CV"
              helpKey="coefficientOfVariation"
            />
            <StatisticCard 
              title={t('statistics.minimum')} 
              value={formatNumber(statistics.min)} 
              helpKey="minimum"
            />
            <StatisticCard 
              title={t('statistics.maximum')} 
              value={formatNumber(statistics.max)} 
              helpKey="maximum"
            />
            <StatisticCard 
              title={t('statistics.count')} 
              value={statistics.count} 
              subtitle="n"
              helpKey="count"
            />
            <StatisticCard 
              title={t('statistics.range')} 
              value={formatNumber(statistics.max - statistics.min)} 
              subtitle="max - min"
              helpKey="range"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">{t('statistics.quartiles')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box 
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr', // 单列布局在移动端
                    sm: 'repeat(3, 1fr)' // 三列布局在平板及以上
                  },
                  gap: { xs: 2, sm: 3 } // 移动端更小间距，桌面端更大间距
                }}
              >
                <StatisticCard 
                  title={t('statistics.q1')} 
                  value={formatNumber(statistics.quartiles.q1)} 
                  subtitle={t('statistics.q1Description')}
                  helpKey="q1"
                />
                <StatisticCard 
                  title={t('statistics.q2')} 
                  value={formatNumber(statistics.quartiles.q2)} 
                  subtitle={t('statistics.q2Description')}
                  helpKey="q2"
                />
                <StatisticCard 
                  title={t('statistics.q3')} 
                  value={formatNumber(statistics.quartiles.q3)} 
                  subtitle={t('statistics.q3Description')}
                  helpKey="q3"
                />
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Tooltip 
                  title={t('statistics.help.iqr')}
                  arrow
                  placement="bottom"
                >
                  <Chip 
                    label={t('statistics.iqr', { value: formatNumber(statistics.quartiles.q3 - statistics.quartiles.q1) })}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'help' }}
                  />
                </Tooltip>
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
          {t('statistics.copySuccess')}
        </Alert>
      </Snackbar>
    </>
  );
}