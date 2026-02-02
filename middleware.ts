import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes admin/teacher yang akan menampilkan 404 jika tidak ada token (untuk keamanan)
const adminTeacherRoutes = ["/dashboard", "/course", "/teacher"];

// Routes user yang akan redirect ke login jika tidak ada token
const userProtectedRoutes = ["/classes", "/my-classes"];

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

  // Check if accessing admin/teacher route
  const isAdminTeacherRoute = adminTeacherRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing user protected route
  const isUserProtectedRoute = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

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
