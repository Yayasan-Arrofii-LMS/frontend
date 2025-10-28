import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes yang memerlukan autentikasi
const protectedRoutes = ["/dashboard", "/course", "/teacher"];

// Routes yang hanya bisa diakses ketika belum login
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/otp",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or check if it exists in localStorage (client-side)
  const token = request.cookies.get("auth_token")?.value;

  // Check if accessing protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Return 404 if accessing protected route without token (untuk keamanan)
  // Tidak redirect ke login agar tidak mengekspos bahwa route tersebut ada
  if (isProtectedRoute && !token) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Redirect to dashboard if accessing auth route with token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
