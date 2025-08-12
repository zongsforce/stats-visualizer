import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import { CloudUpload, Clear } from '@mui/icons-material';
import { validateNumericInput, parseNumericInput } from '../utils/validation';

interface DataInputProps {
  onDataChange: (data: number[]) => void;
  onError: (error: string | null) => void;
}

export function DataInput({ onDataChange, onError }: DataInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    if (!value.trim()) {
      setValidationErrors([]);
      onDataChange([]);
      onError(null);
      return;
    }

    const validation = validateNumericInput(value);
    
    if (validation.isValid) {
      try {
        const data = parseNumericInput(value);
        setValidationErrors([]);
        onDataChange(data);
        onError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setValidationErrors([errorMessage]);
        onError(errorMessage);
      }
    } else {
      setValidationErrors(validation.errors);
      onError(validation.errors.join(', '));
    }
  }, [onDataChange, onError]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    event.preventDefault(); // Prevent default paste behavior
    const pastedData = event.clipboardData.getData('text');
    if (pastedData) {
      // Replace the entire input value with pasted data
      setInputValue(pastedData);
      handleInputChange(pastedData);
    }
  }, [handleInputChange]);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        handleInputChange(content);
      }
    };
    reader.onerror = () => {
      onError('Failed to read file');
    };
    reader.readAsText(file);
  }, [handleInputChange, onError]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setValidationErrors([]);
    onDataChange([]);
    onError(null);
  }, [onDataChange, onError]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Input
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="Enter numerical values separated by commas, spaces, or new lines (e.g., 1,2,3,4,5 or 1 2 3 4 5)"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onPaste={handlePaste}
          error={validationErrors.length > 0}
          helperText={validationErrors.length > 0 ? validationErrors[0] : 'Supports multiple formats: comma, space, or newline separated'}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: { xs: '14px', sm: '16px' }
            }
          }}
        />
      </Box>

      <Box
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 2,
          mb: 2,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".txt,.csv,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Upload file"
        />
        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
        <Typography variant="body2" color="textSecondary">
          Click to upload or drag and drop a file
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Supports .txt, .csv, .json files
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleClear}
          startIcon={<Clear />}
          size="small"
        >
          Clear
        </Button>
        
        {inputValue && validationErrors.length === 0 && (
          <Chip
            label={`${parseNumericInput(inputValue).length} values`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {validationErrors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {validationErrors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ))}
        </Box>
      )}
    </Paper>
  );
}