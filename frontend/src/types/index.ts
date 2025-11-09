// Event Status
export const EventStatus = {
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

// Admin
export interface Admin {
  id: string;
  email: string;
}

// Event
export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  posterUrl: string | null;
  status: EventStatus;
  createdById: string;
  createdBy?: Admin;
  createdAt: string;
  updatedAt: string;
}

// Auth DTOs
export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Event DTOs
export interface CreateEventDto {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  posterUrl?: string;
}

export interface UpdateEventDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  posterUrl?: string;
  status?: EventStatus;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  status?: EventStatus;
  search?: string;
}

export interface PaginatedEventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Upload Response
export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// Delete Event DTO
export interface DeleteEventDto {
  password: string;
}
