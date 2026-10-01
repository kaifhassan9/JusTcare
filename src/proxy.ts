// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value; // or your auth cookie name
  const isLoginPage = request.nextUrl.pathname === "/login";

  // If user is already logged in and tries to open /login, send them to home
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};