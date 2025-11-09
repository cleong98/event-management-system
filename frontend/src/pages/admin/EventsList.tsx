import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Typography,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Stack,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { eventsService } from '../../services/events.service';
import { EventStatus } from '../../types';
import type { EventFilters } from '../../types';
import { DeleteEventDialog } from '../../components/DeleteEventDialog';

export const EventsList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: undefined,
    search: '',
  });

  const [searchInput, setSearchInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch events with react-query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsService.getAll(filters),
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleStatusFilterChange = (status: EventStatus | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy: EventFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/dashboard/events/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedEventId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
    refetch();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: EventStatus) => {
    return status === EventStatus.ONGOING ? 'success' : 'default';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          Failed to load events. Please try again.
        </Alert>
      </Box>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
            Events
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/dashboard/events/create')}
            fullWidth
            size="large"
            sx={{ fontWeight: 600 }}
          >
            Create Event
          </Button>
        </Box>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <TextField
            fullWidth
            placeholder="Search events..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchSubmit} edge="end" color="primary">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status || 'ALL'}
              label="Status Filter"
              onChange={(e) => handleStatusFilterChange(e.target.value as EventStatus | 'ALL')}
            >
              <MenuItem value="ALL">All Events</MenuItem>
              <MenuItem value={EventStatus.ONGOING}>Ongoing</MenuItem>
              <MenuItem value={EventStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Event Cards */}
        <Stack spacing={2}>
          {data?.data.map((event) => (
            <Card
              key={event.id}
              elevation={3}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-2px)',
                },
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {event.name}
                  </Typography>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')} - {format(new Date(event.endDate), 'MMM dd, yyyy')}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(event.id)}
                  sx={{ fontWeight: 600 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(event.id)}
                  sx={{ fontWeight: 600 }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>

        {data && data.data.length === 0 && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            No events found. Create your first event!
          </Alert>
        )}

        <DeleteEventDialog
          open={deleteDialogOpen}
          eventId={selectedEventId}
          onClose={() => setDeleteDialogOpen(false)}
          onSuccess={handleDeleteSuccess}
        />

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
      </Box>
    );
  }

  // Desktop Table View
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
          Events Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/dashboard/events/create')}
          size="large"
          sx={{ fontWeight: 600, px: 3 }}
        >
          Create Event
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name or location..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            sx={{ flex: 1, minWidth: 300 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchSubmit} edge="end" color="primary">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status || 'ALL'}
              label="Status Filter"
              onChange={(e) => handleStatusFilterChange(e.target.value as EventStatus | 'ALL')}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value={EventStatus.ONGOING}>Ongoing</MenuItem>
              <MenuItem value={EventStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => handleSortChange(e.target.value as EventFilters['sortBy'])}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="startDate">Start Date</MenuItem>
              <MenuItem value="endDate">End Date</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>Event Name</TableCell>
              <TableCell sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>Location</TableCell>
              <TableCell sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>Start Date</TableCell>
              <TableCell sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>End Date</TableCell>
              <TableCell sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell align="right" sx={{ py: 2.5, fontWeight: 700, fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((event) => (
              <TableRow
                key={event.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {event.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body2">
                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Typography variant="body2">
                    {format(new Date(event.endDate), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2.5 }}>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 2.5 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(event.id)}
                    title="Edit Event"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(event.id)}
                    title="Delete Event"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data && data.data.length === 0 && (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first event to get started!
            </Typography>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.meta.total || 0}
          rowsPerPage={filters.limit || 10}
          page={(filters.page || 1) - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </TableContainer>

      <DeleteEventDialog
        open={deleteDialogOpen}
        eventId={selectedEventId}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
      />

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
    </Box>
  );
};
