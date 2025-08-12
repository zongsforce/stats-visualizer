import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Chip,
  Collapse,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { CloudUpload, Clear, ExpandMore, ExpandLess, PlayArrow } from '@mui/icons-material';
import { validateNumericInput, parseNumericInput } from '../utils/validation';
import { getAllSampleDatasets, SampleDataset } from '../utils/sampleData';
import { useMobileOptimized } from '../hooks/useMobileOptimized';
import { mobileStyles, touchGestures } from '../utils/mobileOptimizations';

interface DataInputProps {
  onDataChange: (data: number[]) => void;
  onError: (error: string | null) => void;
}

export function DataInput({ onDataChange, onError }: DataInputProps) {
  const { t } = useTranslation();
  const { capabilities, feedback, announce } = useMobileOptimized();
  const [inputValue, setInputValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileUploadExpanded, setFileUploadExpanded] = useState(false);
  const [isDataValid, setIsDataValid] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    if (!value.trim()) {
      setValidationErrors([]);
      setIsDataValid(false);
      onDataChange([]);
      onError(null);
      return;
    }

    const validation = validateNumericInput(value);
    
    if (validation.isValid) {
      try {
        const data = parseNumericInput(value);
        setValidationErrors([]);
        setIsDataValid(data.length > 0);
        onDataChange(data);
        onError(null);
        
        // Mobile feedback for successful data entry
        if (data.length > 0) {
          feedback.light();
          announce(t('dataInput.valuesCount', { count: data.length }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('validation.unknownError');
        setValidationErrors([errorMessage]);
        setIsDataValid(false);
        onError(errorMessage);
        
        // Mobile feedback for errors
        feedback.error();
        announce(errorMessage);
      }
    } else {
      setValidationErrors(validation.errors);
      setIsDataValid(false);
      onError(validation.errors.join(', '));
      
      // Mobile feedback for validation errors
      feedback.error();
      announce(validation.errors[0]);
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
      onError(t('validation.failedToReadFile'));
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
    setIsDataValid(false);
    onDataChange([]);
    onError(null);
  }, [onDataChange, onError]);

  const handleLoadSampleData = useCallback((dataset: SampleDataset) => {
    const dataString = dataset.data.join(', ');
    setInputValue(dataString);
    handleInputChange(dataString);
    
    // Mobile feedback for sample data loading
    feedback.success();
    announce(`${t(`dataInput.samples.${dataset.id}.name`)} ${t('dataInput.sampleDataButton').toLowerCase()}`);
  }, [handleInputChange, feedback, announce, t]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('dataInput.title')}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={capabilities.isTouch ? 4 : 3}
          maxRows={capabilities.isTouch ? 6 : 8}
          variant="outlined"
          placeholder={t('dataInput.placeholder')}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onPaste={handlePaste}
          error={validationErrors.length > 0}
          helperText={
            validationErrors.length > 0 
              ? validationErrors[0] 
              : isDataValid && inputValue.trim()
                ? `✓ ${t('dataInput.valuesCount', { count: parseNumericInput(inputValue).length })}`
                : t('dataInput.helperText')
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              ...mobileStyles.touchInput,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
              },
              transition: 'background-color 0.2s ease',
              ...touchGestures.preventDoubleZoom,
            },
            '& .MuiFormHelperText-root': {
              color: isDataValid && validationErrors.length === 0 ? 'success.main' : undefined,
              fontWeight: isDataValid && validationErrors.length === 0 ? 500 : undefined,
              fontSize: capabilities.isTouch ? '14px' : '12px',
            }
          }}
          inputProps={{
            'aria-label': t('dataInput.placeholder'),
            spellCheck: false,
            inputMode: 'text',
            pattern: '[0-9.,\\s\\n\\t-]*',
            ...touchGestures.preventDoubleZoom,
          }}
        />
      </Box>

      {!inputValue && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="text"
            startIcon={fileUploadExpanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setFileUploadExpanded(!fileUploadExpanded)}
            size="small"
            sx={{ 
              mb: 1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            {t('dataInput.fileUpload')}
          </Button>
          
          <Collapse in={fileUploadExpanded}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                backgroundColor: dragActive ? 'primary.light' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.light'
                }
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-input')?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('file-upload-input')?.click();
                }
              }}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label={t('dataInput.fileUploadDescription')}
              />
              <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="textPrimary" sx={{ mb: 0.5 }}>
                {t('dataInput.fileUploadDescription')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('dataInput.fileUploadSupports')}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {inputValue && (
            <Button
              variant="outlined"
              onClick={() => {
                handleClear();
                feedback.light();
                announce(t('dataInput.clear'));
              }}
              startIcon={<Clear />}
              size={capabilities.isTouch ? 'medium' : 'small'}
              color={isDataValid ? 'primary' : 'secondary'}
              sx={{
                ...mobileStyles.touchButton,
                ...(capabilities.isTouch && {
                  fontSize: '14px',
                  padding: '10px 16px',
                }),
                ...touchGestures.preventDoubleZoom,
              }}
            >
              {t('dataInput.clear')}
            </Button>
          )}
        </Box>
        
        {/* Success state is already shown in helper text, no need for redundant chip */}
      </Box>

      {!inputValue && (
        <Box sx={{ 
          mt: 3, 
          p: { xs: 2, sm: 3 }, 
          background: 'linear-gradient(135deg, rgba(44, 123, 229, 0.08) 0%, rgba(0, 191, 166, 0.08) 100%)',
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'rgba(44, 123, 229, 0.2)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 700 }}>
            {t('dataInput.getStarted')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('dataInput.getStartedDescription')}
          </Typography>
          
          <Grid container spacing={2}>
            {getAllSampleDatasets().map((dataset) => (
              <Grid size={{ xs: 12, sm: 6 }} key={dataset.id}>
                <Card 
                  sx={{ 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'rgba(44, 123, 229, 0.1)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    ...mobileStyles.touchButton,
                    ...touchGestures.preventDoubleZoom,
                    minHeight: capabilities.isTouch ? 72 : 60,
                    '&:hover': {
                      transform: capabilities.isTouch ? 'scale(1.02)' : 'translateY(-4px)',
                      boxShadow: '0 10px 25px -3px rgb(44 123 229 / 0.1), 0 4px 6px -4px rgb(44 123 229 / 0.1)',
                      borderColor: 'primary.main',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(44, 123, 229, 0.02) 100%)',
                      '& .MuiSvgIcon-root': {
                        color: 'secondary.main',
                        transform: capabilities.isTouch ? 'scale(1.1)' : 'translateX(4px)'
                      }
                    },
                    '&:active': {
                      transform: capabilities.isTouch ? 'scale(0.98)' : 'translateY(-1px)',
                      boxShadow: '0 4px 6px -1px rgb(99 102 241 / 0.1), 0 2px 4px -2px rgb(99 102 241 / 0.1)'
                    }
                  }}
                  onClick={() => handleLoadSampleData(dataset)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLoadSampleData(dataset);
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {t(`dataInput.samples.${dataset.id}.name`)}
                      </Typography>
                      <PlayArrow sx={{ 
                        fontSize: 18, 
                        color: 'action.active',
                        transition: 'all 0.2s ease'
                      }} />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                      {t(`dataInput.samples.${dataset.id}.description`)}
                    </Typography>
                    <Chip 
                      label={`${dataset.data.length} values`}
                      size="small"
                      variant="filled"
                      color="primary"
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 22,
                        background: 'linear-gradient(135deg, #2C7BE5 0%, #00BFA6 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

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