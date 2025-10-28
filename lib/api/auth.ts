// API client untuk authentication endpoints
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

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
}

export interface VerifyOTPData {
  token?: string; // Token akan ada jika dari forgot password flow
}

// Register user
export async function register(data: {
  username: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResponse<RegisterData>> {
  const formData = new URLSearchParams();
  formData.append("username", data.username);
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("passwordConfirmation", data.passwordConfirmation);

  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
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
  identifier: string; // username or email
  password: string;
}): Promise<AuthResponse<LoginData>> {
  const formData = new URLSearchParams();
  formData.append("username", data.identifier); // backend accepts username field for both username/email
  formData.append("password", data.password);

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
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
  const response = await fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${BASE_URL}/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
