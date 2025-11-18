import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRole } from "@/lib/api/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get("auth_token")?.value;
    
    // Fallback to Authorization header if cookie not found
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated", data: null },
        { status: 401 }
      );
    }

    // Verify role and get user info from backend
    try {
      const roleResult = await verifyRole(token);
      
      if (roleResult.success && roleResult.data) {
        // Return user profile with role from backend
        return NextResponse.json({
          success: true,
          message: "Profile fetched successfully",
          data: {
            role: roleResult.data.role,
            // Other fields will be added when backend profile endpoint is ready
          },
        });
      }
    } catch (error) {
      console.error("Error verifying role:", error);
    }

    // Fallback: return minimal profile if role verification fails
    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        role: "Student", // Default role
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
