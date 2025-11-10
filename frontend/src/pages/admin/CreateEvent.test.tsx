import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateEvent } from './CreateEvent';
import * as eventsService from '../../api/events';

// Mock the services
vi.mock('../../api/events');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreateEvent Component - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: Component renders with all form fields
  it('should render create event form with all required fields', () => {
    renderWithProviders(<CreateEvent />);

    expect(screen.getByRole('heading', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByText(/upload poster/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
  });

  // TEST 2: Form validation - empty fields
  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/event name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    });
  });

  // TEST 3: Form validation - end date before start date
  it('should show error when end date is before start date', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-12-31');
    await user.type(endDateInput, '2025-01-01');

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  // TEST 4: Form validation - name length
  it('should show error when event name exceeds 200 characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    const nameInput = screen.getByLabelText(/event name/i);
    const longName = 'a'.repeat(201);

    await user.type(nameInput, longName);
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/name must be at most 200 characters/i)).toBeInTheDocument();
    });
  });

  // TEST 5: Form validation - location length
  it('should show error when location exceeds 300 characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    const locationInput = screen.getByLabelText(/location/i);
    const longLocation = 'a'.repeat(301);

    await user.type(locationInput, longLocation);
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/location must be at most 300 characters/i)).toBeInTheDocument();
    });
  });

  // TEST 6: File upload validation - file type
  it('should accept image file upload', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload poster/i, { selector: 'input[type="file"]' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/test.jpg/i)).toBeInTheDocument();
    });
  });

  // TEST 7: File upload validation - file size
  it('should show error when file size exceeds 5MB', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEvent />);

    // Create a file larger than 5MB
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const fileInput = screen.getByLabelText(/upload poster/i, { selector: 'input[type="file"]' });

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5MB/i)).toBeInTheDocument();
    });
  });

  // TEST 8: Successful form submission
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockUploadPoster = vi.spyOn(eventsService, 'uploadPoster');
    const mockCreateEvent = vi.spyOn(eventsService.eventsService, 'create');

    mockUploadPoster.mockResolvedValue({
      url: '/uploads/test.jpg',
      filename: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    });

    mockCreateEvent.mockResolvedValue({
      id: '1',
      name: 'Test Event',
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      location: 'Test Location',
      posterUrl: '/uploads/test.jpg',
      status: 'ONGOING',
      createdById: 'admin1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithProviders(<CreateEvent />);

    // Fill in form
    await user.type(screen.getByLabelText(/event name/i), 'Test Event');
    await user.type(screen.getByLabelText(/start date/i), '2025-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2025-01-02');
    await user.type(screen.getByLabelText(/location/i), 'Test Location');

    // Upload file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload poster/i, { selector: 'input[type="file"]' });
    await user.upload(fileInput, file);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUploadPoster).toHaveBeenCalledWith(file);
      expect(mockCreateEvent).toHaveBeenCalledWith({
        name: 'Test Event',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        location: 'Test Location',
        posterUrl: '/uploads/test.jpg',
      });
    });
  });

  // TEST 9: Loading state during submission
  it('should show loading state during form submission', async () => {
    const user = userEvent.setup();
    const mockUploadPoster = vi.spyOn(eventsService, 'uploadPoster');
    const mockCreateEvent = vi.spyOn(eventsService.eventsService, 'create');

    mockUploadPoster.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    mockCreateEvent.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderWithProviders(<CreateEvent />);

    // Fill in minimum required fields
    await user.type(screen.getByLabelText(/event name/i), 'Test Event');
    await user.type(screen.getByLabelText(/start date/i), '2025-01-01');
    await user.type(screen.getByLabelText(/end date/i), '2025-01-02');
    await user.type(screen.getByLabelText(/location/i), 'Test Location');

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload poster/i, { selector: 'input[type="file"]' });
    await user.upload(fileInput, file);

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  // TEST 10: Cancel button navigates back
  it('should navigate back when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

    renderWithProviders(<CreateEvent />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });
});
