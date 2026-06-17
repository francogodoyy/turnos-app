import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest): any {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.cookies.get("authjs.session-token") || !!req.cookies.get("__Secure-authjs.session-token");

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/api/register",
    "/api/professionals",
    "/book",
  ];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
