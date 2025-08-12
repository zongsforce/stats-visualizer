import { DescriptiveStatistics } from './statistics';

export type ExportFormat = 'png' | 'jpeg' | 'json' | 'csv';

export interface ExportOptions {
  format?: ExportFormat;
  filename?: string;
  quality?: number;
  includeMetadata?: boolean;
}

export async function exportChartAsImage(canvas: HTMLCanvasElement, options: ExportOptions = {}): Promise<void> {
  const { format = 'png', filename = `chart-${Date.now()}.${format}`, quality } = options;
  
  if (!['png', 'jpeg'].includes(format)) {
    throw new Error(`Unsupported export format: ${format}`);
  }
  
  const mimeType = `image/${format}`;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export chart as image'));
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve();
    }, mimeType, quality);
  });
}

export function exportStatisticsAsJSON(statistics: DescriptiveStatistics, options: ExportOptions = {}): void {
  const { filename = `statistics-${new Date().toISOString().split('T')[0]}.json`, includeMetadata = false } = options;
  
  let exportData: any = { ...statistics };
  
  if (includeMetadata) {
    exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        type: 'descriptive-statistics'
      },
      data: statistics
    };
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStatisticsAsCSV(statistics: DescriptiveStatistics, options: ExportOptions = {}): void {
  const { filename = `statistics-${new Date().toISOString().split('T')[0]}.csv` } = options;
  
  const headers = ['Statistic', 'Value'];
  const rows = [
    ['Mean', statistics.mean.toString()],
    ['Median', statistics.median.toString()],
    ['Standard Deviation', statistics.standardDeviation.toString()],
    ['Coefficient of Variation (%)', statistics.coefficientOfVariation.toString()],
    ['Minimum', statistics.min.toString()],
    ['Maximum', statistics.max.toString()],
    ['Count', statistics.count.toString()],
    ['Q1', statistics.quartiles.q1.toString()],
    ['Q2 (Median)', statistics.quartiles.q2.toString()],
    ['Q3', statistics.quartiles.q3.toString()]
  ];
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportData(data: number[], statistics: DescriptiveStatistics | null, format: ExportFormat, filename?: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `data-export-${timestamp}.${format}`;
  const finalFilename = filename || defaultFilename;
  
  if (format === 'json') {
    const exportObject = {
      rawData: data,
      statistics: statistics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    downloadBlob(blob, finalFilename);
  } else if (format === 'csv') {
    let csvContent = 'Data\n';
    csvContent += data.join('\n');
    
    if (statistics) {
      csvContent += '\n\nStatistics,Value\n';
      csvContent += `Mean,${statistics.mean}\n`;
      csvContent += `Median,${statistics.median}\n`;
      csvContent += `Standard Deviation,${statistics.standardDeviation}\n`;
      csvContent += `Coefficient of Variation (%),${statistics.coefficientOfVariation}\n`;
      csvContent += `Min,${statistics.min}\n`;
      csvContent += `Max,${statistics.max}\n`;
      csvContent += `Count,${statistics.count}\n`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, finalFilename);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}