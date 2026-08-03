import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const GROUPS = [2, 2, 4]; // D D | M M | Y Y Y Y

function isoToDigits(iso) {
  if (!iso) return '';
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  const [, yyyy, mm, dd] = match;
  return `${dd}${mm}${yyyy}`;
}

function digitsToIso(digits) {
  if (digits.length !== 8) return '';
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

function DateBoxes({ label, disabled, value, onChange }) {
  const inputRefs = useRef([]);
  const [digits, setDigits] = useState(() => isoToDigits(value));

  useEffect(() => {
    const next = isoToDigits(value);
    setDigits((prev) => (next !== prev ? next : prev));
  }, [value]);

  const setChar = (index, char) => {
    const chars = digits.split('');
    chars[index] = char;
    const nextDigits = chars.join('').slice(0, 8);
    setDigits(nextDigits);
    onChange(digitsToIso(nextDigits));
  };

  let boxIndex = 0;

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {GROUPS.map((count, groupIdx) => (
          <Box key={groupIdx} sx={{ display: 'flex', gap: 0.5 }}>
            {Array.from({ length: count }).map(() => {
              const i = boxIndex;
              boxIndex += 1;
              return (
                <Box
                  key={i}
                  component="input"
                  ref={(el) => (inputRefs.current[i] = el)}
                  value={digits[i] || ''}
                  disabled={disabled}
                  onChange={(e) => {
                    const char = e.target.value.replace(/\D/g, '').slice(-1);
                    setChar(i, char);
                    if (char && inputRefs.current[i + 1]) inputRefs.current[i + 1].focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digits[i] && inputRefs.current[i - 1]) {
                      inputRefs.current[i - 1].focus();
                    }
                  }}
                  maxLength={1}
                  sx={{
                    width: 22,
                    height: 28,
                    textAlign: 'center',
                    fontSize: 13,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    fontFamily: 'inherit',
                    bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                    color: 'text.primary',
                    '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -1 },
                  }}
                />
              );
            })}
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary">
          DD MM YYYY
        </Typography>
      </Box>
    </Box>
  );
}

// Renders a date as a row of D D | M M | Y Y Y Y single-character boxes, matching the
// original form's segmented date fields (Expiry Date, Claim Expiry Date, Date).
export default function SegmentedDateField({ name, label, disabled }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DateBoxes label={label} disabled={disabled} value={field.value} onChange={field.onChange} />
      )}
    />
  );
}
