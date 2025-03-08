import { NextResponse } from "next/server";

export function middleware(request) {
  // Login sayfasına erişimi her zaman izin ver
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Diğer sayfalarda login kontrolü yap
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
