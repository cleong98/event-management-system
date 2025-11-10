import { Snackbar, Alert } from "@mui/material";

interface AuthSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

export const AuthSnackbar = ({
  open,
  message,
  severity,
  onClose,
}: AuthSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={severity === "error" ? 8000 : 3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 2 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: "300px",
          fontSize: "1rem",
          fontWeight: 500,
          boxShadow: 3,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
