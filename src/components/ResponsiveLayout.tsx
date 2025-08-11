import React, { ReactNode } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { useMobileQuery } from '../hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  layoutType?: 'default' | 'statistics' | 'charts';
}

export function ResponsiveLayout({ children, className = '', layoutType = 'default' }: ResponsiveLayoutProps) {
  const theme = useTheme();
  const isMobile = useMobileQuery();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getLayoutClass = () => {
    const baseClass = 'responsive-layout';
    const deviceClass = isMobile ? 'mobile-layout' : 'desktop-layout';
    
    let typeClass = '';
    if (layoutType === 'statistics') {
      typeClass = isMobile ? 'stacked-layout' : 'grid-layout';
    } else if (layoutType === 'charts') {
      typeClass = isMobile ? 'stacked-layout' : 'flex-layout';
    }
    
    const safeAreaClass = isMobile ? 'safe-area' : '';
    
    return `${baseClass} ${deviceClass} ${typeClass} ${safeAreaClass} ${className}`.trim();
  };

  const containerStyles = {
    width: '100%',
    maxWidth: isMobile ? '100vw' : '1200px',
    margin: '0 auto',
    padding: isMobile ? theme.spacing(2) : theme.spacing(3),
    paddingTop: isMobile ? 'env(safe-area-inset-top, 16px)' : theme.spacing(3),
    paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 16px)' : theme.spacing(3),
    ...(layoutType === 'statistics' && !isMobile && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: theme.spacing(2)
    }),
    ...(layoutType === 'charts' && {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: theme.spacing(2),
      flexWrap: 'wrap'
    }),
    ...(isMobile && {
      '& > *': {
        marginBottom: theme.spacing(2),
        '&:last-child': {
          marginBottom: 0
        }
      }
    })
  };

  // Add accessibility improvements for mobile
  const containerProps = isMobile ? {
    role: 'main',
    'aria-label': 'Statistics application content'
  } : {};

  return (
    <Container
      maxWidth={false}
      disableGutters
      data-testid="responsive-container"
      className={getLayoutClass()}
      sx={containerStyles}
      {...containerProps}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Add mobile-friendly props to input elements
          const mobileProps = isMobile && child.type === 'input' ? {
            'aria-label': `Input field ${index + 1}`
          } : {};
          
          return React.cloneElement(child, mobileProps);
        }
        return child;
      })}
    </Container>
  );
}