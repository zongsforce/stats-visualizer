import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KDEPlot } from './KDEPlot';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options, ...props }: any) => (
    <div data-testid="kde-chart" data-chart-data={JSON.stringify(data)} {...props}>
      Mock KDE Chart
    </div>
  )
}));

describe('KDEPlot Component', () => {
  const sampleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const mockOnBandwidthChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render KDE plot with data', () => {
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    expect(screen.getByTestId('kde-chart')).toBeInTheDocument();
  });

  it('should render bandwidth control slider', () => {
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    expect(screen.getByLabelText(/bandwidth/i)).toBeInTheDocument();
  });

  it('should call onBandwidthChange when bandwidth slider changes', async () => {
    const user = userEvent.setup();
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    
    const bandwidthSlider = screen.getByRole('slider', { name: /bandwidth/i });
    
    // Simulate slider interaction
    await user.click(bandwidthSlider);
    
    expect(mockOnBandwidthChange).toHaveBeenCalled();
  });

  it('should calculate KDE curve points correctly', () => {
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    
    const chartElement = screen.getByTestId('kde-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets[0].data).toHaveLength(100); // Default 100 points for smooth curve
    expect(chartData.labels).toHaveLength(100);
  });

  it('should handle small datasets', () => {
    const smallData = [1, 2, 3];
    render(<KDEPlot data={smallData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    expect(screen.getByTestId('kde-chart')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(<KDEPlot data={[]} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('should use Gaussian kernel by default', () => {
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    
    const chartElement = screen.getByTestId('kde-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    // KDE should produce a smooth curve
    expect(chartData.datasets[0].tension).toBeGreaterThan(0);
  });

  it('should allow custom kernel selection', () => {
    render(
      <KDEPlot 
        data={sampleData} 
        bandwidth={0.5} 
        onBandwidthChange={mockOnBandwidthChange}
        kernel="epanechnikov"
      />
    );
    expect(screen.getByDisplayValue(/epanechnikov/i)).toBeInTheDocument();
  });

  it('should be responsive on mobile screens', () => {
    render(<KDEPlot data={sampleData} bandwidth={0.5} onBandwidthChange={mockOnBandwidthChange} />);
    
    const chartElement = screen.getByTestId('kde-chart');
    expect(chartElement).toHaveStyle({ width: '100%' });
  });

  it('should show area under curve when enabled', () => {
    render(
      <KDEPlot 
        data={sampleData} 
        bandwidth={0.5} 
        onBandwidthChange={mockOnBandwidthChange}
        fill={true}
      />
    );
    
    const chartElement = screen.getByTestId('kde-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets[0].fill).toBe(true);
  });
});