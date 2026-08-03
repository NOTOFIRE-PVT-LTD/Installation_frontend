import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Renders a value as a row of single-character boxes (matches the original form's
// digit-grid style for Branch Code / account numbers), while the underlying RHF value
// stays a single plain string.
export default function SegmentedCodeField({ name, label, boxes = 14, disabled }) {
  const { control } = useFormContext();
  const inputRefs = useRef([]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const chars = (field.value || '').split('');
        const setChar = (index, char) => {
          const next = [...chars];
          next[index] = char;
          field.onChange(next.join('').slice(0, boxes));
        };

        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {Array.from({ length: boxes }).map((_, i) => (
                <Box
                  key={i}
                  component="input"
                  ref={(el) => (inputRefs.current[i] = el)}
                  value={chars[i] || ''}
                  disabled={disabled}
                  onChange={(e) => {
                    const char = e.target.value.slice(-1);
                    setChar(i, char);
                    if (char && inputRefs.current[i + 1]) inputRefs.current[i + 1].focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !chars[i] && inputRefs.current[i - 1]) {
                      inputRefs.current[i - 1].focus();
                    }
                  }}
                  maxLength={1}
                  sx={{
                    width: 24,
                    height: 30,
                    textAlign: 'center',
                    fontSize: 14,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    fontFamily: 'inherit',
                    bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                    color: 'text.primary',
                    '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -1 },
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      }}
    />
  );
}
