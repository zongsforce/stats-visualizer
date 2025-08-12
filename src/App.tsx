import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box, Divider, Fade } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { DataInput } from './components/DataInput';
import { StatisticsDisplay } from './components/StatisticsDisplay';
import { Histogram } from './components/Histogram';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useStatsState } from './hooks/useStatsState';
import './i18n';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C7BE5',
      light: '#5A9BEC',
      dark: '#1F5BBD',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00BFA6',
      light: '#33CDB8',
      dark: '#008574',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00BFA6',
      light: '#33CDB8',
      dark: '#008574',
    },
    error: {
      main: '#E85959',
      light: '#ED7A7A',
      dark: '#D73838',
    },
    warning: {
      main: '#F6C90E',
      light: '#F8D541',
      dark: '#D4A50A',
    },
    background: {
      default: '#F5F7FA',
      paper: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #2C7BE5 0%, #00BFA6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      marginBottom: '0.75rem',
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      marginBottom: '0.5rem',
      color: '#333333',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#666666',
      lineHeight: 1.5,
    },
    body1: {
      lineHeight: 1.6,
      color: '#333333',
    },
    body2: {
      lineHeight: 1.5,
      color: '#666666',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #e0e7f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderColor: '#c0d0e0',
          },
          transition: 'all 0.2s ease-in-out',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
        filled: {
          background: 'linear-gradient(135deg, #00BFA6 0%, #008574 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2C7BE5',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2C7BE5',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgb(44 123 229 / 0.1)',
            },
          },
        },
      },
    },
  },
});

function App() {
  const { t } = useTranslation();
  const {
    data,
    statistics,
    isLoading,
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


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #2C7BE5 0%, #00BFA6 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <BarChart sx={{ 
              fontSize: '2rem', 
              color: '#ffffff',
              mr: 1.5,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} />
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('app.title')}
            </Typography>
          </Box>
          <LanguageSwitch />
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        background: 'linear-gradient(135deg, #F5F7FA 0%, #f0f4f8 50%, #e5eef5 100%)',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(135deg, rgba(44, 123, 229, 0.05) 0%, rgba(0, 191, 166, 0.05) 100%)',
          zIndex: 0,
        }
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <ResponsiveLayout>
            {/* Data Input Section */}
            <Box component="section" sx={{ mb: 4 }}>
              <DataInput 
                onDataChange={handleDataChange}
                onError={setError}
              />
            </Box>
            
            {/* Loading State */}
            {isLoading && (
              <Fade in={isLoading}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="primary">
                    {t('dataInput.processingData')}
                  </Typography>
                </Box>
              </Fade>
            )}
            
            {/* Analysis Results Section */}
            {data.length > 0 && statistics && (
              <Fade in={!!statistics} timeout={600}>
                <Box>
                  {/* Section Header */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" color="text.primary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      {t('app.sections.analysisResults')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      {t('app.sections.analysisResultsSubtitle')}
                    </Typography>
                  </Box>
                  
                  {/* Statistics Overview */}
                  <Box component="section" sx={{ mb: 4 }}>
                    <StatisticsDisplay statistics={statistics} />
                  </Box>
                  
                  <Divider sx={{ my: 4 }} />
                  
                  {/* Visualizations Section */}
                  <Box component="section">
                    <Typography variant="h5" color="text.primary" sx={{ mb: 3, textAlign: { xs: 'center', sm: 'left' } }}>
                      {t('app.sections.visualizations')}
                    </Typography>
                    
                    {/* Histogram Panel */}
                    <Histogram 
                      data={data}
                      bins={visualizationParams.bins || 10}
                      onBinsChange={handleBinsChange}
                      showMean={true}
                    />
                  </Box>
                </Box>
              </Fade>
            )}
          </ResponsiveLayout>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
