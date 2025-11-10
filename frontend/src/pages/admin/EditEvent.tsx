import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEventById, updateEvent, uploadPoster } from '../../api/events';
import type { UpdateEventDto } from '../../types';
import type { ApiError } from '../../types/error';
import { EventStatus } from '../../types';
import { EventFormFields } from '../../components/EventFormFields';
import { PosterUpload } from '../../components/PosterUpload';
import { AuthSnackbar } from '../../components/AuthSnackbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

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
  const [currentPosterUrl, setCurrentPosterUrl] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const status = watch('status');
  const startDate = watch('startDate');

  // Fetch existing event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
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
        const uploadResponse = await uploadPoster(file);
        posterUrl = uploadResponse.url;
      }

      // Update event
      const eventData: UpdateEventDto = {
        ...data,
        posterUrl,
        status: data.status as EventStatus,
      };

      return updateEvent(id!, eventData);
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
    onError: (err) => {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || 'Failed to update event. Please try again.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    },
  });

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
    return <LoadingSpinner />;
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
            <EventFormFields
              register={register}
              errors={errors}
              showStatus={true}
              statusValue={status}
              startDate={startDate}
            />

            {/* File Upload */}
            <Grid size={12}>
              <PosterUpload
                onFileSelect={setFile}
                currentPosterUrl={currentPosterUrl}
              />
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
                  disabled={isSubmitting || updateMutation.isPending}
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
      <AuthSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};
