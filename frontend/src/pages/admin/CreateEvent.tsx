import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  Snackbar,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { eventsService } from '../../services/events.service';
import type { CreateEventDto } from '../../types';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(200, 'Name must be at most 200 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(300, 'Location must be at most 300 characters'),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

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
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      // Upload poster first if file selected
      let posterUrl: string | undefined;

      if (file) {
        const uploadResponse = await eventsService.uploadPoster(file);
        posterUrl = uploadResponse.url;
      }

      // Create event with posterUrl
      const eventData: CreateEventDto = {
        ...data,
        posterUrl,
      };

      return eventsService.create(eventData);
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Event created successfully!',
        severity: 'success'
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to create event. Please try again.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileError('');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Invalid file type. Please upload an image (JPEG, PNG, WebP)');
      setFile(null);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setFileError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFileError('');
  };

  const onSubmit = async (data: CreateEventFormData) => {
    setError('');
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
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
            {/* Event Name */}
            <Grid size={12}>
              <TextField
                {...register('name')}
                label="Event Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                inputProps={{ maxLength: 200 }}
                placeholder="Enter event name"
              />
            </Grid>

            {/* Date Fields */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('startDate')}
                label="Start Date"
                type="date"
                fullWidth
                required
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('endDate')}
                label="End Date"
                type="date"
                fullWidth
                required
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* Location */}
            <Grid size={12}>
              <TextField
                {...register('location')}
                label="Location"
                fullWidth
                required
                error={!!errors.location}
                helperText={errors.location?.message}
                inputProps={{ maxLength: 300 }}
                placeholder="Enter event location"
              />
            </Grid>

            {/* File Upload */}
            <Grid size={12}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                  size="large"
                  sx={{ py: 1.5, mb: 1 }}
                >
                  {file ? 'Change Poster' : 'Upload Event Poster'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Upload poster"
                  />
                </Button>

                {file && (
                  <Alert severity="success" icon={false} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Selected: {file.name}
                    </Typography>
                  </Alert>
                )}

                {fileError && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {fileError}
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Accepted formats: JPEG, PNG, WebP (Maximum size: 5MB)
                </Typography>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' }, mt: 2 }}>
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
                  disabled={isSubmitting || createMutation.isPending || !!fileError}
                  size="large"
                  fullWidth={false}
                  sx={{ px: 4, fontWeight: 600 }}
                >
                  {isSubmitting || createMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
