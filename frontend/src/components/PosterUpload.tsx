import { useState } from "react";
import { Box, Button, Alert, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface PosterUploadProps {
  onFileSelect: (file: File | null) => void;
  currentPosterUrl?: string;
}

export const PosterUpload = ({ onFileSelect, currentPosterUrl }: PosterUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileError("");
      onFileSelect(null);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError(
        "Invalid file type. Please upload an image (JPEG, PNG, WebP)"
      );
      setFile(null);
      onFileSelect(null);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setFileError("File size must be less than 5MB");
      setFile(null);
      onFileSelect(null);
      return;
    }

    setFile(selectedFile);
    setFileError("");
    onFileSelect(selectedFile);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUpload />}
        fullWidth
        size="large"
        sx={{ py: 1.5, mb: 1 }}
      >
        {currentPosterUrl || file ? "Change Poster" : "Upload Event Poster"}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Upload poster"
        />
      </Button>

      {currentPosterUrl && !file && (
        <Alert severity="info" icon={false} sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            Current poster: {currentPosterUrl.split("/").pop()}
          </Typography>
        </Alert>
      )}

      {file && (
        <Alert severity="success" icon={false} sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            {currentPosterUrl ? "New file selected: " : "Selected: "}
            {file.name}
          </Typography>
        </Alert>
      )}

      {fileError && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {fileError}
        </Alert>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        Accepted formats: JPEG, PNG, WebP (Maximum size: 5MB)
      </Typography>
    </Box>
  );
};
