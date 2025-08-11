import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Histogram } from './Histogram';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options, ...props }: any) => (
    <div data-testid="histogram-chart" data-chart-data={JSON.stringify(data)} {...props}>
      Mock Histogram Chart
    </div>
  )
}));

describe('Histogram Component', () => {
  const sampleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const mockOnBinsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render histogram chart with data', () => {
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} />);
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });

  it('should render bins control slider', () => {
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} />);
    expect(screen.getByLabelText(/number of bins/i)).toBeInTheDocument();
  });

  it('should call onBinsChange when bins slider changes', async () => {
    const user = userEvent.setup();
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} />);
    
    const binsSlider = screen.getByRole('slider', { name: /number of bins/i });
    
    // Simulate slider interaction
    await user.click(binsSlider);
    
    expect(mockOnBinsChange).toHaveBeenCalled();
  });

  it('should calculate histogram bins correctly', () => {
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} />);
    
    const chartElement = screen.getByTestId('histogram-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.labels).toHaveLength(5);
    expect(chartData.datasets[0].data).toHaveLength(5);
  });

  it('should handle empty data gracefully', () => {
    render(<Histogram data={[]} bins={5} onBinsChange={mockOnBinsChange} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('should be responsive on mobile screens', () => {
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} />);
    
    const chartElement = screen.getByTestId('histogram-chart');
    expect(chartElement).toHaveStyle({ width: '100%' });
  });

  it('should show statistical annotations', () => {
    render(<Histogram data={sampleData} bins={5} onBinsChange={mockOnBinsChange} showMean />);
    expect(screen.getByText(/mean/i)).toBeInTheDocument();
  });

  it('should allow customization of colors and styling', () => {
    const customColor = '#ff6384';
    render(
      <Histogram 
        data={sampleData} 
        bins={5} 
        onBinsChange={mockOnBinsChange}
        color={customColor}
      />
    );
    
    const chartElement = screen.getByTestId('histogram-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
    
    expect(chartData.datasets[0].backgroundColor).toBe(customColor);
  });
});