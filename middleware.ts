import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  console.log('session', session)
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chat")) {
    if (!session) {
      console.log("[Middleware] 未登录，跳转到 /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login") {
    if (session) {
      console.log("[Middleware] 已登录，跳转到 /chat");
      return NextResponse.redirect(new URL("/chat", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login"],
};
