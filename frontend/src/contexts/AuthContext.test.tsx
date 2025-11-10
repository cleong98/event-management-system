import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import type { Admin } from "../types";

describe("AuthContext", () => {
  const mockAdmin: Admin = {
    id: "1",
    email: "test@example.com",
  };

  const mockTokens = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("AuthProvider initialization", () => {
    it("should initialize with no authenticated user", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.admin).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should restore admin from localStorage on mount", async () => {
      // Simulate stored auth data
      localStorage.setItem("admin", JSON.stringify(mockAdmin));
      localStorage.setItem("access_token", mockTokens.accessToken);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.admin).toEqual(mockAdmin);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should not restore admin if only admin is stored without access token", async () => {
      localStorage.setItem("admin", JSON.stringify(mockAdmin));
      // No access_token stored

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.admin).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should set loading to false after initialization", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Loading state changes too quickly in tests, so we just verify final state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("login", () => {
    it("should successfully login and store admin data", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });

      expect(result.current.admin).toEqual(mockAdmin);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("admin")).toBe(JSON.stringify(mockAdmin));
      expect(localStorage.getItem("access_token")).toBe(mockTokens.accessToken);
      expect(localStorage.getItem("refresh_token")).toBe(
        mockTokens.refreshToken
      );
    });

    it("should update admin data on subsequent login", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First login
      act(() => {
        result.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });

      // Second login with different admin
      const newAdmin: Admin = {
        id: "2",
        email: "newadmin@example.com",
      };

      act(() => {
        result.current.login(newAdmin, "new-token", "new-refresh");
      });

      expect(result.current.admin).toEqual(newAdmin);
      expect(localStorage.getItem("admin")).toBe(JSON.stringify(newAdmin));
      expect(localStorage.getItem("access_token")).toBe("new-token");
      expect(localStorage.getItem("refresh_token")).toBe("new-refresh");
    });
  });

  describe("logout", () => {
    it("should successfully logout and clear all data", async () => {
      // Setup: login first
      localStorage.setItem("admin", JSON.stringify(mockAdmin));
      localStorage.setItem("access_token", mockTokens.accessToken);
      localStorage.setItem("refresh_token", mockTokens.refreshToken);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify logged in
      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.admin).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("admin")).toBeNull();
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });

    it("should handle logout when not logged in", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Logout when not logged in
      act(() => {
        result.current.logout();
      });

      expect(result.current.admin).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when admin exists", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should return false when admin is null", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("useAuth hook", () => {
    it("should throw error when used outside AuthProvider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      console.error = originalError;
    });

    it("should provide auth context when used within AuthProvider", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty("admin");
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("login");
      expect(result.current).toHaveProperty("logout");
      expect(result.current).toHaveProperty("loading");
    });
  });

  describe("localStorage integration", () => {
    it("should persist admin data across sessions", async () => {
      // First render - login
      const { result: result1, unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      act(() => {
        result1.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });

      expect(result1.current.isAuthenticated).toBe(true);

      // Unmount (simulate page refresh)
      unmount();

      // Second render - should restore from localStorage
      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(result2.current.admin).toEqual(mockAdmin);
      expect(result2.current.isAuthenticated).toBe(true);
    });

    it("should handle corrupted localStorage data gracefully", async () => {
      // Store invalid JSON
      localStorage.setItem("admin", "invalid-json{");
      localStorage.setItem("access_token", mockTokens.accessToken);

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should handle gracefully and not authenticate
      expect(result.current.admin).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      console.error = originalError;
    });
  });

  describe("state transitions", () => {
    it("should handle complete auth flow: login -> logout -> login", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial state
      expect(result.current.isAuthenticated).toBe(false);

      // Login
      act(() => {
        result.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });
      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      act(() => {
        result.current.logout();
      });
      expect(result.current.isAuthenticated).toBe(false);

      // Login again
      act(() => {
        result.current.login(
          mockAdmin,
          mockTokens.accessToken,
          mockTokens.refreshToken
        );
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
