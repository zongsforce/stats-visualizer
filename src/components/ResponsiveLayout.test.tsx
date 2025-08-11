import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveLayout } from './ResponsiveLayout';

// Mock useMediaQuery hook
const mockUseMobileQuery = jest.fn();
jest.mock('../hooks/useMediaQuery', () => ({
  useMobileQuery: () => mockUseMobileQuery()
}));

// Mock Material-UI useMediaQuery
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(() => false)
}));

describe('ResponsiveLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render desktop layout on large screens', () => {
    mockUseMobileQuery.mockReturnValue(false); // Not mobile
    
    render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('desktop-layout');
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render mobile layout on small screens', () => {
    mockUseMobileQuery.mockReturnValue(true); // Is mobile
    
    render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('mobile-layout');
  });

  it('should apply custom className when provided', () => {
    mockUseMobileQuery.mockReturnValue(false);
    
    render(
      <ResponsiveLayout className="custom-class">
        <div>Test Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('custom-class');
  });

  it('should handle orientation changes', () => {
    mockUseMobileQuery.mockReturnValue(true);
    
    const { rerender } = render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('responsive-container')).toHaveClass('mobile-layout');
    
    // Simulate screen rotation to landscape
    mockUseMobileQuery.mockReturnValue(false);
    
    rerender(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('responsive-container')).toHaveClass('desktop-layout');
  });

  it('should render grid layout for statistics on desktop', () => {
    mockUseMobileQuery.mockReturnValue(false);
    
    render(
      <ResponsiveLayout layoutType="statistics">
        <div data-testid="stats-1">Stat 1</div>
        <div data-testid="stats-2">Stat 2</div>
        <div data-testid="stats-3">Stat 3</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('grid-layout');
  });

  it('should render stacked layout for charts on mobile', () => {
    mockUseMobileQuery.mockReturnValue(true);
    
    render(
      <ResponsiveLayout layoutType="charts">
        <div data-testid="chart-1">Chart 1</div>
        <div data-testid="chart-2">Chart 2</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('stacked-layout');
  });

  it('should handle touch-friendly spacing on mobile', () => {
    mockUseMobileQuery.mockReturnValue(true);
    
    render(
      <ResponsiveLayout>
        <button data-testid="touch-button">Touch Button</button>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveStyle({ padding: expect.stringMatching(/16px|1rem/) });
  });

  it('should optimize for accessibility on mobile', () => {
    mockUseMobileQuery.mockReturnValue(true);
    
    render(
      <ResponsiveLayout>
        <input data-testid="mobile-input" />
      </ResponsiveLayout>
    );
    
    const input = screen.getByTestId('mobile-input');
    expect(input).toHaveAttribute('aria-label');
  });

  it('should handle safe area insets on mobile devices', () => {
    mockUseMobileQuery.mockReturnValue(true);
    
    render(<ResponsiveLayout><div>Content</div></ResponsiveLayout>);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('safe-area');
  });
});