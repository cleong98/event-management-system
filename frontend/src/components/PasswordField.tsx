import { useState, type ChangeEvent, type FocusEvent } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  register: {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
    ref: (instance: HTMLInputElement | null) => void;
    name: string;
  };
  label: string;
  id: string;
  error?: boolean;
  helperText?: string;
  autoComplete?: string;
  sx?: object;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const PasswordField = ({
  register,
  label,
  id,
  error,
  helperText,
  autoComplete = "current-password",
  sx = { mb: 2 },
  onKeyDown,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      {...register}
      margin="normal"
      required
      fullWidth
      label={label}
      type={showPassword ? "text" : "password"}
      id={id}
      autoComplete={autoComplete}
      error={error}
      helperText={helperText}
      onKeyDown={onKeyDown}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                tabIndex={-1}
                type="button"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={sx}
    />
  );
};
