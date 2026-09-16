import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sigap-pg-trangkil-secret-jwt-key-2026"
);

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const rawPathname = request.nextUrl.pathname;
  const pathname = rawPathname.toLowerCase();

  // Check admin session cookie
  const token = request.cookies.get("sigap_admin_session")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Auto-redirect logged-in admin from root "/" or "/admin/login" to "/admin/dashboard"
  if ((pathname === "/" || pathname === "/admin/login") && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
