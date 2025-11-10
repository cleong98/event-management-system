import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent, uploadPoster } from "../../api/events";
import type { CreateEventDto } from "../../types";
import type { ApiError } from "../../types/error";
import { EventFormFields } from "../../components/EventFormFields";
import { PosterUpload } from "../../components/PosterUpload";
import { AuthSnackbar } from "../../components/AuthSnackbar";

const schema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(200, "Name must be at most 200 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z
      .string()
      .min(1, "Location is required")
      .max(300, "Location must be at most 300 characters"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

interface CreateEventFormData {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
}

export const CreateEvent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Watch start date to set min date for end date
  const startDate = watch('startDate');

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      // Upload poster first if file selected
      let posterUrl: string | undefined;

      if (file) {
        const uploadResponse = await uploadPoster(file);
        posterUrl = uploadResponse.url;
      }

      // Create event with posterUrl
      const eventData: CreateEventDto = {
        ...data,
        posterUrl,
      };

      return createEvent(eventData);
    },
    onSuccess: () => {
      // Invalidate events cache to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['events'] });

      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    },
    onError: (err) => {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create event. Please try again.";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    setError("");
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 4 }}
        >
          Create New Event
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <EventFormFields
              register={register}
              errors={errors}
              startDate={startDate}
            />

            {/* File Upload */}
            <Grid size={12}>
              <PosterUpload onFileSelect={setFile} />
            </Grid>

            {/* Action Buttons */}
            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  flexDirection: { xs: "column-reverse", sm: "row" },
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSubmitting || createMutation.isPending}
                  size="large"
                  fullWidth={false}
                  sx={{ px: 4 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || createMutation.isPending}
                  size="large"
                  fullWidth={false}
                  sx={{ px: 4, fontWeight: 600 }}
                >
                  {isSubmitting || createMutation.isPending
                    ? "Creating..."
                    : "Create Event"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <AuthSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};
