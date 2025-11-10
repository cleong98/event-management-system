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

export const getAllEvents = async (filters: EventFilters): Promise<PaginatedEventsResponse> => {
  const response = await api.get<PaginatedEventsResponse>('/events', {
    params: filters,
  });
  return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data: CreateEventDto): Promise<Event> => {
  const response = await api.post<Event>('/events', data);
  return response.data;
};

export const updateEvent = async (id: string, data: UpdateEventDto): Promise<Event> => {
  const response = await api.patch<Event>(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string, data: DeleteEventDto): Promise<void> => {
  await api.delete(`/events/${id}`, { data });
};

export const uploadPoster = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPublicEvents = async (): Promise<Event[]> => {
  const response = await api.get<Event[]>('/events/public');
  return response.data;
};

export const getPublicEventById = async (id: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/public/${id}`);
  return response.data;
};
