import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Warning, Close } from '@mui/icons-material';
import { deleteEvent } from '../api/events';
import type { ApiError } from '../types/error';

interface DeleteEventDialogProps {
  open: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const DeleteEventDialog = ({
  open,
  eventId,
  onClose,
  onSuccess,
}: DeleteEventDialogProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (data: { password: string }) =>
      deleteEvent(eventId, data),
    onSuccess: () => {
      setPassword('');
      setError('');
      onClose();
      onSuccess('Event deleted successfully!');
    },
    onError: (err) => {
      const error = err as ApiError;
      setError(
        error.response?.data?.message || 'Failed to delete event. Please check your password.'
      );
    },
  });

  const handleSubmit = () => {
    if (!password) {
      setError('Password is required');
      return;
    }
    setError('');
    deleteMutation.mutate({ password });
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              Delete Event
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            disabled={deleteMutation.isPending}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            This action cannot be undone!
          </Typography>
          <Typography variant="body2">
            Are you sure you want to permanently delete this event?
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please enter your password to confirm deletion.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Admin Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          autoFocus
          placeholder="Enter your password"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={deleteMutation.isPending}
          variant="outlined"
          size="large"
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
          size="large"
          sx={{ px: 3, fontWeight: 600 }}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
