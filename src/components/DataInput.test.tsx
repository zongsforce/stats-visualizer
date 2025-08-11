import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataInput } from './DataInput';

describe('DataInput Component', () => {
  const mockOnDataChange = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input textarea', () => {
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    expect(screen.getByPlaceholderText(/enter numerical values/i)).toBeInTheDocument();
  });

  it('should render file upload input', () => {
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument();
  });

  it('should call onDataChange with valid numeric input', async () => {
    const user = userEvent.setup();
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const textarea = screen.getByPlaceholderText(/enter numerical values/i);
    await user.type(textarea, '1,2,3,4,5');
    
    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    });
  });

  it('should call onError with invalid input', async () => {
    const user = userEvent.setup();
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const textarea = screen.getByPlaceholderText(/enter numerical values/i);
    await user.type(textarea, '1,abc,3');
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });

  it('should handle paste events', async () => {
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const textarea = screen.getByPlaceholderText(/enter numerical values/i);
    
    const pasteEvent = new Event('paste', { bubbles: true }) as any;
    pasteEvent.clipboardData = {
      getData: jest.fn(() => '10,20,30,40,50')
    };
    
    fireEvent(textarea, pasteEvent);
    
    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalledWith([10, 20, 30, 40, 50]);
    });
  });

  it('should handle file upload', async () => {
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['1,2,3,4,5'], 'data.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnDataChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    });
  });

  it('should show validation errors in UI', async () => {
    const user = userEvent.setup();
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const textarea = screen.getByPlaceholderText(/enter numerical values/i);
    await user.type(textarea, '1,invalid,3');
    
    await waitFor(() => {
      expect(screen.getByText(/invalid number/i)).toBeInTheDocument();
    });
  });

  it('should clear data when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<DataInput onDataChange={mockOnDataChange} onError={mockOnError} />);
    
    const textarea = screen.getByPlaceholderText(/enter numerical values/i);
    await user.type(textarea, '1,2,3');
    
    const clearButton = screen.getByText(/clear/i);
    await user.click(clearButton);
    
    expect(textarea).toHaveValue('');
    expect(mockOnDataChange).toHaveBeenCalledWith([]);
  });
});