import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProfile } from "@/lib/api/profile";

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

    // Fetch user profile from backend
    try {
      const profileData = await getProfile(token);

      // Return user profile with all data from backend
      return NextResponse.json({
        success: true,
        message: "Profile fetched successfully",
        data: {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          username: profileData.username,
          role: profileData.role,
          profilePicture: profileData.profileImage,
          avatar: profileData.profileImage,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // If it's a 401 error (token expired/invalid), return 401 instead of 500
      if (errorMessage.includes("401")) {
        return NextResponse.json(
          { success: false, message: "Token expired or invalid", data: null },
          { status: 401 }
        );
      }

      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch profile", data: null },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
