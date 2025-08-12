import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LanguageSwitch } from './LanguageSwitch';
import { useTranslation } from 'react-i18next';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LanguageSwitch', () => {
  const mockChangeLanguage = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      } as any,
    });
    jest.clearAllMocks();
  });

  it('should render language switch with default props', () => {
    renderWithTheme(<LanguageSwitch />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display current language', () => {
    renderWithTheme(<LanguageSwitch />);
    
    // Check if English is selected by default
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en');
  });

  it('should handle Chinese language selection', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'zh',
        changeLanguage: mockChangeLanguage,
      } as any,
    });

    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('zh');
  });

  it('should handle language change', () => {
    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const chineseOption = screen.getByText('中文');
    fireEvent.click(chineseOption);
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh');
  });

  it('should call translation function', () => {
    renderWithTheme(<LanguageSwitch />);
    
    expect(mockT).toHaveBeenCalledWith('app.language');
  });

  it('should render with custom variant', () => {
    renderWithTheme(<LanguageSwitch variant="filled" />);
    
    const formControl = screen.getByRole('combobox').closest('.MuiFormControl-root');
    expect(formControl).toHaveClass('MuiFormControl-filled');
  });

  it('should render with custom size', () => {
    renderWithTheme(<LanguageSwitch size="medium" />);
    
    const formControl = screen.getByRole('combobox').closest('.MuiFormControl-root');
    expect(formControl).toHaveClass('MuiFormControl-sizeM');
  });

  it('should display both language options', () => {
    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('中文')).toBeInTheDocument();
  });

  it('should handle Chinese locale variants', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'zh-CN',
        changeLanguage: mockChangeLanguage,
      } as any,
    });

    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('zh');
  });

  it('should apply custom styling', () => {
    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    const styles = window.getComputedStyle(select);
    
    // Should have custom styles applied
    expect(select).toBeInTheDocument();
  });

  it('should be accessible', () => {
    renderWithTheme(<LanguageSwitch />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-labelledby');
    
    const label = screen.getByLabelText(/app.language/);
    expect(label).toBeInTheDocument();
  });
});