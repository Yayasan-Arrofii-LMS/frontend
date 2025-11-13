import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Return dummy profile data
    const dummyProfile = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Profile fetched successfully",
      data: dummyProfile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
