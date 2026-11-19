import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes admin/teacher yang akan menampilkan 404 jika tidak ada token (untuk keamanan)
const adminTeacherRoutes = ["/dashboard", "/course", "/teacher", "/workshop"];

// Routes user yang akan redirect ke login jika tidak ada token
const userProtectedRoutes = ["/my-classes", "/profile", "/settings"];

// Routes yang hanya bisa diakses ketika belum login
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/otp",
];

// Helper to check exact route or subpath match (prevents /workshop from matching /workshops)
function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or check if it exists in localStorage (client-side)
  const rawToken = request.cookies.get("auth_token")?.value;
  const token =
    rawToken && rawToken !== "undefined" && rawToken !== "null" && rawToken.trim() !== ""
      ? rawToken
      : undefined;

  // Check if accessing admin/teacher route
  const isAdminTeacherRoute = adminTeacherRoutes.some((route) =>
    matchesRoute(pathname, route)
  );

  // Check if accessing user protected route
  const isUserProtectedRoute = userProtectedRoutes.some((route) =>
    matchesRoute(pathname, route)
  );

  // Check if accessing auth route
  const isAuthRoute = authRoutes.some((route) =>
    matchesRoute(pathname, route)
  );

  // Return 404 for admin/teacher routes without token (untuk keamanan)
  if (isAdminTeacherRoute && !token) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Redirect to login for user routes without token
  if (isUserProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect based on role if accessing auth route with token
  if (isAuthRoute && token) {
    let role = request.cookies.get("user_role")?.value?.toLowerCase();

    // Fallback: decode role from JWT payload if user_role cookie is missing
    if (!role) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
          );
          if (payload?.role) {
            role = String(payload.role).toLowerCase();
          }
        }
      } catch {
        // Ignore JWT parse error
      }
    }

    if (role === "admin" || role === "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (role === "teacher") {
      return NextResponse.redirect(new URL("/teacher/my-courses", request.url));
    } else {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
