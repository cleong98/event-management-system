import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  TextField,
  Alert,
  Link as MuiLink,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register as registerApi } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterDto } from "../../types";
import type { ApiError } from "../../types/error";
import { PersonAdd } from "@mui/icons-material";
import { AuthLayout } from "../../components/AuthLayout";
import { PasswordField } from "../../components/PasswordField";
import { AuthSnackbar } from "../../components/AuthSnackbar";

const schema = z
  .object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

interface RegisterFormData extends RegisterDto {
  confirmPassword: string;
}

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      const { email, password } = data;
      const response = await registerApi({ email, password });
      login(response.admin, response.accessToken, response.refreshToken);

      setSnackbar({
        open: true,
        message: "Account created successfully! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as an admin to manage events"
      icon={<PersonAdd sx={{ fontSize: 32 }} />}
      avatarBgColor="secondary.main"
    >
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("email")}
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 2 }}
        />

        <PasswordField
          register={register("password")}
          label="Password"
          id="password"
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="new-password"
          sx={{ mb: 2 }}
        />

        <PasswordField
          register={register("confirmPassword")}
          label="Confirm Password"
          id="confirmPassword"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          autoComplete="new-password"
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{
            py: 1.5,
            mb: 2,
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <MuiLink
            component={Link}
            to="/admin/login"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Already have an account? Sign In
          </MuiLink>
        </Box>
      </Box>

      <AuthSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </AuthLayout>
  );
};
