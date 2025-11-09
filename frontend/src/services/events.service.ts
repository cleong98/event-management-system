import api from './api';
import type {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventFilters,
  PaginatedEventsResponse,
  DeleteEventDto,
  UploadResponse,
} from '../types';

export const eventsService = {
  // Get all events (admin - with auth)
  getAll: async (filters: EventFilters): Promise<PaginatedEventsResponse> => {
    const response = await api.get<PaginatedEventsResponse>('/events', {
      params: filters,
    });
    return response.data;
  },

  // Get single event (admin - with auth)
  getById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  // Create event (admin - with auth)
  create: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  // Update event (admin - with auth)
  update: async (id: string, data: UpdateEventDto): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  },

  // Delete event (admin - with auth + password)
  delete: async (id: string, data: DeleteEventDto): Promise<void> => {
    await api.delete(`/events/${id}`, { data });
  },

  // Upload poster image
  uploadPoster: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get public events (user portal - no auth)
  getPublicEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/public');
    return response.data;
  },

  // Get public event details (user portal - no auth)
  getPublicEventById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/public/${id}`);
    return response.data;
  },
};
