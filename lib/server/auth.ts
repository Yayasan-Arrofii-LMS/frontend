import { cookies } from "next/headers";
import { verifyRole } from "@/lib/api/auth";

/**
 * Get auth token from cookies (server-side only)
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || null;
  return token;
}

/**
 * Verify if the current user has admin role (server-side only)
 * @returns The user's role if authenticated, null otherwise
 */
export async function verifyAdminRole(): Promise<string | null> {
  try {
    const token = await getServerAuthToken();

    if (!token) {
      return null;
    }

    const result = await verifyRole(token);

    if (result.success && result.data.role === "Admin") {
      return result.data.role;
    }

    return null;
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return null;
  }
}

/**
 * Verify if the current user has a specific role (server-side only)
 * @param allowedRoles - Array of allowed roles
 * @returns The user's role if it matches one of the allowed roles, null otherwise
 */
export async function verifyUserRole(
  allowedRoles: string[]
): Promise<string | null> {
  try {
    const token = await getServerAuthToken();

    if (!token) {
      return null;
    }

    const result = await verifyRole(token);

    // Case-insensitive role comparison
    const userRole = result.data.role;
    const hasRole = allowedRoles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );

    if (result.success && hasRole) {
      return result.data.role;
    }

    return null;
  } catch (error) {
    console.error("Error verifying user role:", error);
    return null;
  }
}
