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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Snackbar,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/events.service';
import type { UpdateEventDto } from '../../types';
import { EventStatus } from '../../types';

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
  status: z.string().min(1, 'Status is required'),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

interface EditEventFormData {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
}

export const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EditEventFormData>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [currentPosterUrl, setCurrentPosterUrl] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  const status = watch('status');
  const startDate = watch('startDate');

  // Fetch existing event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getById(id!),
    enabled: !!id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (event) {
      setValue('name', event.name);
      setValue('startDate', event.startDate.split('T')[0]);
      setValue('endDate', event.endDate.split('T')[0]);
      setValue('location', event.location);
      setValue('status', event.status);
      if (event.posterUrl) {
        setCurrentPosterUrl(event.posterUrl);
      }
    }
  }, [event, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditEventFormData) => {
      // Upload new poster if file selected
      let posterUrl: string | undefined = currentPosterUrl;

      if (file) {
        const uploadResponse = await eventsService.uploadPoster(file);
        posterUrl = uploadResponse.url;
      }

      // Update event
      const eventData: UpdateEventDto = {
        ...data,
        posterUrl,
        status: data.status as EventStatus,
      };

      return eventsService.update(id!, eventData);
    },
    onSuccess: () => {
      // Invalidate events cache to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['events'] });

      setSnackbar({
        open: true,
        message: 'Event updated successfully!',
        severity: 'success'
      });

      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to update event. Please try again.';
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

  const onSubmit = async (data: EditEventFormData) => {
    setError('');
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

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
          Edit Event
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
                inputProps={{
                  min: today,
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
                inputProps={{
                  min: startDate || today,
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

            {/* Status */}
            <Grid size={12}>
              <FormControl fullWidth error={!!errors.status} required>
                <InputLabel>Event Status</InputLabel>
                <Select
                  {...register('status')}
                  value={status || EventStatus.ONGOING}
                  label="Event Status"
                >
                  <MenuItem value={EventStatus.ONGOING}>Ongoing</MenuItem>
                  <MenuItem value={EventStatus.COMPLETED}>Completed</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.status.message}
                  </Typography>
                )}
              </FormControl>
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
                  {currentPosterUrl || file ? 'Change Event Poster' : 'Upload Event Poster'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>

                {currentPosterUrl && !file && (
                  <Alert severity="info" icon={false} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Current poster: {currentPosterUrl.split('/').pop()}
                    </Typography>
                  </Alert>
                )}

                {file && (
                  <Alert severity="success" icon={false} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      New file selected: {file.name}
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
                  disabled={isSubmitting || updateMutation.isPending}
                  size="large"
                  fullWidth={false}
                  sx={{ px: 4 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || updateMutation.isPending || !!fileError}
                  size="large"
                  fullWidth={false}
                  sx={{ px: 4, fontWeight: 600 }}
                >
                  {isSubmitting || updateMutation.isPending ? 'Updating...' : 'Update Event'}
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
