/**
 * Sample datasets for demonstrating statistical visualizer functionality
 */

export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  data: number[];
  context?: string;
}

// Generate normal distribution using Box-Muller transform
function generateNormal(mean: number, stdDev: number, count: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < count; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    data.push(mean + stdDev * z0);
    if (i + 1 < count) {
      data.push(mean + stdDev * z1);
    }
  }
  return data.slice(0, count).map(x => Math.round(x * 100) / 100);
}

// Generate bimodal distribution
function generateBimodal(count: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.6) {
      // First peak around 165cm
      data.push(165 + (Math.random() - 0.5) * 20);
    } else {
      // Second peak around 185cm  
      data.push(185 + (Math.random() - 0.5) * 16);
    }
  }
  return data.map(x => Math.round(x * 10) / 10);
}

// Generate right-skewed distribution (income-like)
function generateSkewed(count: number): number[] {
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    // Use gamma-like distribution
    let value = 0;
    for (let j = 0; j < 3; j++) {
      value += -Math.log(Math.random());
    }
    data.push(value * 15000 + 25000); // Scale to income range
  }
  return data.map(x => Math.round(x));
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'normal',
    name: 'Normal Distribution',
    description: 'Bell curve data (test scores)',
    data: generateNormal(75, 12, 100),
    context: 'Student test scores out of 100 points'
  },
  {
    id: 'bimodal', 
    name: 'Bimodal Distribution',
    description: 'Two peaks (height data)',
    data: generateBimodal(120),
    context: 'Heights in cm from a mixed population'
  },
  {
    id: 'skewed',
    name: 'Skewed Distribution', 
    description: 'Right-skewed (income data)',
    data: generateSkewed(80),
    context: 'Annual household income in USD'
  },
  {
    id: 'small',
    name: 'Small Dataset',
    description: 'Quick example (10 values)',
    data: [12, 15, 18, 22, 24, 27, 29, 33, 35, 38],
    context: 'Simple dataset for quick testing'
  }
];

export function getSampleDataset(id: string): SampleDataset | undefined {
  return sampleDatasets.find(dataset => dataset.id === id);
}

export function getAllSampleDatasets(): SampleDataset[] {
  return sampleDatasets;
}