import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  SelectChangeEvent 
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface LanguageSwitchProps {
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
}

export function LanguageSwitch({ variant = 'outlined', size = 'small' }: LanguageSwitchProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' }
  ];

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant={variant} size={size} fullWidth>
        <InputLabel 
          id="language-select-label"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LanguageIcon fontSize="small" />
            {t('app.language')}
          </Box>
        </InputLabel>
        <Select
          labelId="language-select-label"
          value={i18n.language.startsWith('zh') ? 'zh' : i18n.language}
          onChange={handleLanguageChange}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageIcon fontSize="small" />
              {t('app.language')}
            </Box>
          }
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'rgba(255, 255, 255, 0.9)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiSelect-icon': {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{lang.nativeName}</span>
                <span style={{ color: 'text.secondary', fontSize: '0.875em' }}>
                  ({lang.name})
                </span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}