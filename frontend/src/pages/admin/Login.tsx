import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, TextField, Link as MuiLink, Box, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login as loginApi } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import type { LoginDto } from "../../types";
import type { ApiError } from "../../types/error";
import { LockOutlined } from "@mui/icons-material";
import { AuthLayout } from "../../components/AuthLayout";
import { PasswordField } from "../../components/PasswordField";
import { AuthSnackbar } from "../../components/AuthSnackbar";

const schema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(schema),
  });

  const [apiError, setApiError] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginDto) => {
    try {
      setApiError(""); // Clear previous errors
      const response = await loginApi(data);
      login(response.admin, response.accessToken, response.refreshToken);

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";

      // Show error in BOTH Alert box AND Toast notification
      setApiError(errorMessage);
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
      title="Admin Sign In"
      subtitle="Enter your credentials to access admin panel"
      icon={<LockOutlined sx={{ fontSize: 32 }} />}
      avatarBgColor="primary.main"
    >
      {/* Error Alert - Shows inline when login fails */}
      {apiError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setApiError("")}
        >
          {apiError}
        </Alert>
      )}

      {/* Login Form */}
      <Box>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />

        <PasswordField
          register={register("password")}
          label="Password"
          id="password"
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
          sx={{ mb: 3 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />

        <Button
          type="button"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          sx={{
            py: 1.5,
            mb: 2,
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <MuiLink
            component={Link}
            to="/admin/register"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Don't have an account? Sign Up
          </MuiLink>
        </Box>
      </Box>

      {/* Toast Notification */}
      <AuthSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </AuthLayout>
  );
};
