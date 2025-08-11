export type KernelType = 'gaussian' | 'epanechnikov' | 'triangular';

export function calculateKDE(data: number[], bandwidth: number = 0.5, points: number = 100, kernel: KernelType = 'gaussian'): { x: number[]; y: number[] } {
  if (data.length === 0) {
    return { x: [], y: [] };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const padding = range * 0.1; // Add 10% padding on each side
  
  const xMin = min - padding;
  const xMax = max + padding;
  
  const x: number[] = [];
  const y: number[] = [];
  
  // Generate evaluation points
  for (let i = 0; i < points; i++) {
    x.push(xMin + (i / (points - 1)) * (xMax - xMin));
  }
  
  // Calculate KDE at each point
  for (let i = 0; i < points; i++) {
    let density = 0;
    const xi = x[i];
    
    for (const dataPoint of data) {
      const u = (xi - dataPoint) / bandwidth;
      density += kernelFunction(u, kernel);
    }
    
    y.push(density / (data.length * bandwidth));
  }
  
  return { x, y };
}

function kernelFunction(u: number, kernel: KernelType): number {
  switch (kernel) {
    case 'gaussian':
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
    
    case 'epanechnikov':
      return Math.abs(u) <= 1 ? (3/4) * (1 - u * u) : 0;
    
    case 'triangular':
      return Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
    
    default:
      return kernelFunction(u, 'gaussian');
  }
}

export function estimateOptimalBandwidth(data: number[]): number {
  if (data.length === 0) return 0.5;
  
  // Silverman's rule of thumb
  const n = data.length;
  const mean = data.reduce((sum, x) => sum + x, 0) / n;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  return 1.06 * stdDev * Math.pow(n, -1/5);
}