import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe('App', () => {
  it('should render the app header', () => {
    render(<App />);
    expect(screen.getByText('app.title')).toBeInTheDocument();
  });

  it('should render data input component', () => {
    render(<App />);
    expect(screen.getByText('dataInput.placeholder')).toBeInTheDocument();
  });
});
