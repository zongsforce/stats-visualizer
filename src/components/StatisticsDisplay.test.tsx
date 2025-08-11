import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatisticsDisplay } from './StatisticsDisplay';
import { DescriptiveStatistics } from '../utils/statistics';

describe('StatisticsDisplay Component', () => {
  const mockStats: DescriptiveStatistics = {
    mean: 5.5,
    median: 5.5,
    standardDeviation: 2.872,
    variance: 8.25,
    min: 1,
    max: 10,
    count: 10,
    quartiles: {
      q1: 3.25,
      q2: 5.5,
      q3: 7.75
    }
  };

  it('should display all statistical measures', () => {
    render(<StatisticsDisplay statistics={mockStats} />);
    
    expect(screen.getByText(/mean/i)).toBeInTheDocument();
    expect(screen.getByText(/median/i)).toBeInTheDocument();
    expect(screen.getByText(/standard deviation/i)).toBeInTheDocument();
    expect(screen.getByText(/variance/i)).toBeInTheDocument();
    expect(screen.getByText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum/i)).toBeInTheDocument();
    expect(screen.getByText(/count/i)).toBeInTheDocument();
  });

  it('should display quartile values', () => {
    render(<StatisticsDisplay statistics={mockStats} />);
    
    expect(screen.getByText(/q1/i)).toBeInTheDocument();
    expect(screen.getByText(/q2/i)).toBeInTheDocument();
    expect(screen.getByText(/q3/i)).toBeInTheDocument();
  });

  it('should format numbers with appropriate precision', () => {
    render(<StatisticsDisplay statistics={mockStats} />);
    
    expect(screen.getByText('5.50')).toBeInTheDocument(); // Mean
    expect(screen.getByText('2.87')).toBeInTheDocument(); // Std dev (rounded)
  });

  it('should be responsive for mobile screens', () => {
    render(<StatisticsDisplay statistics={mockStats} />);
    
    const container = screen.getByTestId('statistics-container');
    expect(container).toHaveClass('responsive');
  });

  it('should handle missing or null statistics gracefully', () => {
    const incompleteStats = {
      ...mockStats,
      quartiles: undefined
    } as any;
    
    render(<StatisticsDisplay statistics={incompleteStats} />);
    expect(screen.getByText(/mean/i)).toBeInTheDocument();
  });

  it('should show loading state when statistics are not provided', () => {
    render(<StatisticsDisplay statistics={null} />);
    expect(screen.getByText(/calculating/i)).toBeInTheDocument();
  });

  it('should display statistics in grid layout on desktop', () => {
    render(<StatisticsDisplay statistics={mockStats} />);
    
    const container = screen.getByTestId('statistics-container');
    expect(container).toHaveClass('grid-layout');
  });

  it('should display statistics in card format for mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<StatisticsDisplay statistics={mockStats} />);
    
    const container = screen.getByTestId('statistics-container');
    expect(container).toHaveClass('card-layout');
  });

  it('should allow copying statistics to clipboard', async () => {
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const user = userEvent.setup();
    render(<StatisticsDisplay statistics={mockStats} />);
    
    const copyButton = screen.getByText(/copy/i);
    await user.click(copyButton);
    
    expect(mockWriteText).toHaveBeenCalled();
  });

  it('should highlight outliers when present', () => {
    const statsWithOutliers = {
      ...mockStats,
      outliers: [100, -50]
    };
    
    render(<StatisticsDisplay statistics={statsWithOutliers} />);
    expect(screen.getByText(/outliers detected/i)).toBeInTheDocument();
  });
});