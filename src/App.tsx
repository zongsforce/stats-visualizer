import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { DataInput } from './components/DataInput';
import { StatisticsDisplay } from './components/StatisticsDisplay';
import { Histogram } from './components/Histogram';
import { KDEPlot } from './components/KDEPlot';
import { KernelType } from './utils/kde';
import { useStatsState } from './hooks/useStatsState';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const {
    data,
    statistics,
    isLoading,
    error,
    visualizationParams,
    setData,
    setError,
    setVisualizationParams
  } = useStatsState();

  const handleDataChange = (newData: number[]) => {
    setData(newData);
  };

  const handleBinsChange = (bins: number) => {
    setVisualizationParams({ bins });
  };

  const handleBandwidthChange = (bandwidth: number) => {
    setVisualizationParams({ bandwidth });
  };

  const handleKernelChange = (kernel: KernelType) => {
    setVisualizationParams({ kernel });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            📊 Statistics Visualizer
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <ResponsiveLayout>
          <DataInput 
            onDataChange={handleDataChange}
            onError={setError}
          />
          
          {data.length > 0 && statistics && (
            <>
              <StatisticsDisplay statistics={statistics} />
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Histogram 
                    data={data}
                    bins={visualizationParams.bins || 10}
                    onBinsChange={handleBinsChange}
                    showMean={true}
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <KDEPlot 
                    data={data}
                    bandwidth={visualizationParams.bandwidth || 0.5}
                    onBandwidthChange={handleBandwidthChange}
                    kernel={visualizationParams.kernel || 'gaussian'}
                    onKernelChange={handleKernelChange}
                    fill={true}
                  />
                </Box>
              </Box>
            </>
          )}
          
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Processing data...</Typography>
            </Box>
          )}
        </ResponsiveLayout>
      </Container>
    </ThemeProvider>
  );
}

export default App;
