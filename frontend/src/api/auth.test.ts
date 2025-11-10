import { describe, it, expect, beforeEach, vi } from "vitest";
import { login, register, refreshToken, logout, verifyPassword } from "./auth";
import api from "./api";
import type { LoginDto, RegisterDto, AuthResponse } from "../types";

// Mock the API module
vi.mock("./api");

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const loginData: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse: AuthResponse = {
        admin: { id: "1", email: "test@example.com" },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await login(loginData);

      expect(api.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(result).toEqual(mockResponse);
      expect(result.admin.email).toBe("test@example.com");
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("should throw error when login fails with invalid credentials", async () => {
      const loginData: LoginDto = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      const mockError = {
        response: {
          status: 401,
          data: { message: "Invalid credentials" },
        },
      };

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(login(loginData)).rejects.toEqual(mockError);
      expect(api.post).toHaveBeenCalledWith("/auth/login", loginData);
    });

    it("should handle network errors", async () => {
      const loginData: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const networkError = new Error("Network Error");
      vi.mocked(api.post).mockRejectedValueOnce(networkError);

      await expect(login(loginData)).rejects.toThrow("Network Error");
    });
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      const registerData: RegisterDto = {
        email: "newuser@example.com",
        password: "securepassword123",
      };

      const mockResponse: AuthResponse = {
        admin: { id: "2", email: "newuser@example.com" },
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await register(registerData);

      expect(api.post).toHaveBeenCalledWith("/auth/register", registerData);
      expect(result).toEqual(mockResponse);
      expect(result.admin.email).toBe("newuser@example.com");
    });

    it("should throw error when email already exists", async () => {
      const registerData: RegisterDto = {
        email: "existing@example.com",
        password: "password123",
      };

      const mockError = {
        response: {
          status: 409,
          data: { message: "Email already exists" },
        },
      };

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(register(registerData)).rejects.toEqual(mockError);
    });
  });

  describe("refreshToken", () => {
    it("should successfully refresh access token", async () => {
      const refreshTokenData = {
        refreshToken: "valid-refresh-token",
      };

      const mockResponse: AuthResponse = {
        admin: { id: "1", email: "test@example.com" },
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await refreshToken(refreshTokenData);

      expect(api.post).toHaveBeenCalledWith("/auth/refresh", refreshTokenData);
      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
    });

    it("should throw error when refresh token is invalid", async () => {
      const refreshTokenData = {
        refreshToken: "invalid-refresh-token",
      };

      const mockError = {
        response: {
          status: 401,
          data: { message: "Invalid refresh token" },
        },
      };

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(refreshToken(refreshTokenData)).rejects.toEqual(mockError);
    });
  });

  describe("logout", () => {
    it("should successfully logout", async () => {
      const refreshToken = "valid-refresh-token";

      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await logout(refreshToken);

      expect(api.post).toHaveBeenCalledWith("/auth/logout", { refreshToken });
    });
  });

  describe("verifyPassword", () => {
    it("should return true for valid password", async () => {
      const password = "correctpassword";
      const mockResponse = { valid: true };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await verifyPassword(password);

      expect(api.post).toHaveBeenCalledWith("/auth/verify-password", {
        password,
      });
      expect(result.valid).toBe(true);
    });

    it("should return false for invalid password", async () => {
      const password = "wrongpassword";
      const mockResponse = { valid: false };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await verifyPassword(password);

      expect(result.valid).toBe(false);
    });
  });
});
