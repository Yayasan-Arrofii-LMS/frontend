// API client untuk authentication endpoints (client -> internal Next.js API routes)
// These client helpers call our own server-side API routes under /api/auth/*
// which will forward the requests to the real backend. This keeps external
// API credentials and host configuration on the server.

// Response types
export interface AuthResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterData {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface LoginData {
  token: string;
  role?: string;
}

export interface VerifyOTPData {
  reset_token?: string; // Token akan ada jika dari forgot password flow
}

// Register user
export async function register(data: {
  username: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResponse<RegisterData>> {
  const response = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // Backend mengembalikan success: false untuk error
  if (!result.success) {
    throw new Error(result.message || "Failed to register");
  }

  return result;
}

// Login user
export async function login(data: {
  usernameoremail: string; // username or email
  password: string;
}): Promise<AuthResponse<LoginData>> {
  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to login");
  }

  return result;
}

// Verify OTP
export async function verifyOTP(data: {
  email: string;
  code: string;
}): Promise<AuthResponse<VerifyOTPData | null>> {
  const response = await fetch(`/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to verify OTP");
  }

  return result;
}

// Resend OTP
export async function resendOTP(email: string): Promise<AuthResponse<null>> {
  const response = await fetch(`/api/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to resend OTP");
  }

  return result;
}

// Forgot password
export async function forgotPassword(
  email: string
): Promise<AuthResponse<null>> {
  const response = await fetch(`/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to send reset password OTP");
  }

  return result;
}

// Reset password
export async function resetPassword(data: {
  reset_token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse<null>> {
  const response = await fetch(`/api/auth/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to reset password");
  }

  return result;
}

// Token management utilities
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    // Also set in cookie for middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`; // 7 days

    // Dispatch event to notify components
    window.dispatchEvent(new Event("auth-changed"));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    // Also remove from cookie
    document.cookie = "auth_token=; path=/; max-age=0";

    // Dispatch event to notify components
    window.dispatchEvent(new Event("auth-changed"));
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Verify role (server-side only)
export interface VerifyRoleData {
  role: string;
}

export async function verifyRole(
  token: string
): Promise<AuthResponse<VerifyRoleData>> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

  const response = await fetch(`${API_BASE_URL}/verify-role`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Disable caching for role verification
  });

  if (!response.ok) {
    throw new Error(`Failed to verify role: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to verify role");
  }

  return result;
}
