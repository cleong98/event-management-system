import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPublicEvents,
  getPublicEventById,
  uploadPoster,
} from "./events";
import api from "./api";
import type {
  CreateEventDto,
  UpdateEventDto,
  Event,
  EventFilters,
  PaginatedEventsResponse,
  DeleteEventDto,
} from "../types";

// Mock the API module
vi.mock("./api");

describe("Events API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: Event = {
    id: "1",
    name: "Test Event",
    startDate: "2025-12-01",
    endDate: "2025-12-02",
    location: "Test Location",
    status: "ONGOING",
    posterUrl: "https://example.com/poster.jpg",
    createdById: "admin-1",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  describe("getAllEvents", () => {
    it("should fetch paginated events with filters", async () => {
      const filters: EventFilters = {
        page: 1,
        limit: 10,
        status: "ONGOING",
      };

      const mockResponse: PaginatedEventsResponse = {
        data: [mockEvent],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await getAllEvents(filters);

      expect(api.get).toHaveBeenCalledWith("/events", { params: filters });
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return empty data when no events match filters", async () => {
      const filters: EventFilters = { search: "nonexistent" };
      const mockResponse: PaginatedEventsResponse = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await getAllEvents(filters);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe("getEventById", () => {
    it("should fetch event by ID", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockEvent });

      const result = await getEventById("1");

      expect(api.get).toHaveBeenCalledWith("/events/1");
      expect(result).toEqual(mockEvent);
      expect(result.id).toBe("1");
      expect(result.name).toBe("Test Event");
    });

    it("should throw error when event not found", async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: "Event not found" },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await expect(getEventById("999")).rejects.toEqual(mockError);
    });
  });

  describe("createEvent", () => {
    it("should successfully create a new event", async () => {
      const createData: CreateEventDto = {
        name: "New Event",
        startDate: "2025-12-15",
        endDate: "2025-12-16",
        location: "New Location",
        posterUrl: "https://example.com/new-poster.jpg",
      };

      const createdEvent: Event = {
        id: "3",
        name: "New Event",
        startDate: "2025-12-15",
        endDate: "2025-12-16",
        location: "New Location",
        status: "ONGOING",
        posterUrl: "https://example.com/new-poster.jpg",
        createdById: "admin-1",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: createdEvent });

      const result = await createEvent(createData);

      expect(api.post).toHaveBeenCalledWith("/events", createData);
      expect(result).toEqual(createdEvent);
      expect(result.name).toBe("New Event");
      expect(result.location).toBe("New Location");
    });

    it("should handle validation errors", async () => {
      const invalidData: CreateEventDto = {
        name: "",
        startDate: "invalid-date",
        endDate: "invalid-date",
        location: "",
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            message: "Validation failed",
            errors: ["Name is required", "Invalid date format"],
          },
        },
      };

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(createEvent(invalidData)).rejects.toEqual(mockError);
    });
  });

  describe("updateEvent", () => {
    it("should successfully update an event", async () => {
      const updateData: UpdateEventDto = {
        name: "Updated Event",
        location: "Updated Location",
      };

      const updatedEvent: Event = {
        ...mockEvent,
        name: "Updated Event",
        location: "Updated Location",
      };

      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedEvent });

      const result = await updateEvent("1", updateData);

      expect(api.patch).toHaveBeenCalledWith("/events/1", updateData);
      expect(result.name).toBe("Updated Event");
      expect(result.location).toBe("Updated Location");
    });

    it("should handle partial updates", async () => {
      const updateData: UpdateEventDto = {
        status: "COMPLETED",
      };

      const updatedEvent: Event = {
        ...mockEvent,
        status: "COMPLETED",
      };

      vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedEvent });

      const result = await updateEvent("1", updateData);

      expect(result.status).toBe("COMPLETED");
      expect(result.name).toBe("Test Event"); // Other fields unchanged
    });
  });

  describe("deleteEvent", () => {
    it("should successfully delete an event with password", async () => {
      const deleteData: DeleteEventDto = {
        password: "admin-password",
      };

      vi.mocked(api.delete).mockResolvedValueOnce({ data: undefined });

      await deleteEvent("1", deleteData);

      expect(api.delete).toHaveBeenCalledWith("/events/1", {
        data: deleteData,
      });
    });

    it("should throw error when password is incorrect", async () => {
      const deleteData: DeleteEventDto = {
        password: "wrong-password",
      };

      const mockError = {
        response: {
          status: 401,
          data: { message: "Invalid password" },
        },
      };

      vi.mocked(api.delete).mockRejectedValueOnce(mockError);

      await expect(deleteEvent("1", deleteData)).rejects.toEqual(mockError);
    });
  });

  describe("getPublicEvents", () => {
    it("should fetch all public events", async () => {
      const mockEvents = [
        mockEvent,
        { ...mockEvent, id: "2", name: "Event 2" },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockEvents });

      const result = await getPublicEvents();

      expect(api.get).toHaveBeenCalledWith("/events/public");
      expect(result).toEqual(mockEvents);
      expect(result).toHaveLength(2);
    });

    it("should only return ongoing events", async () => {
      const publicEvents = [
        { ...mockEvent, status: "ONGOING" },
        { ...mockEvent, id: "2", status: "ONGOING" },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: publicEvents });

      const result = await getPublicEvents();

      expect(result.every((event) => event.status === "ONGOING")).toBe(true);
    });
  });

  describe("getPublicEventById", () => {
    it("should fetch public event by ID", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockEvent });

      const result = await getPublicEventById("1");

      expect(api.get).toHaveBeenCalledWith("/events/public/1");
      expect(result).toEqual(mockEvent);
    });
  });

  describe("uploadPoster", () => {
    it("should successfully upload a poster file", async () => {
      const mockFile = new File(["poster content"], "poster.jpg", {
        type: "image/jpeg",
      });

      const mockResponse = {
        url: "https://example.com/uploads/poster.jpg",
        filename: "poster.jpg",
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await uploadPoster(mockFile);

      expect(api.post).toHaveBeenCalled();
      const callArgs = vi.mocked(api.post).mock.calls[0];
      expect(callArgs[0]).toBe("/uploads");
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(callArgs[2]).toEqual({
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      expect(result.url).toBe("https://example.com/uploads/poster.jpg");
    });

    it("should handle file upload errors", async () => {
      const mockFile = new File(["invalid"], "large.jpg", {
        type: "image/jpeg",
      });

      const mockError = {
        response: {
          status: 413,
          data: { message: "File too large" },
        },
      };

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(uploadPoster(mockFile)).rejects.toEqual(mockError);
    });
  });
});
