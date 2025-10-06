import { NextRequest, NextResponse, MiddlewareConfig } from "next/server";

const publicRoutes = [
  {
    path: "/auth/login",
    whenAuthenticated: "redirect",
  },
  {
    path: "/auth/login",
    whenAuthenticated: "redirect",
  },
  {
    path: "/auth/login",
    whenAuthenticated: "redirect",
  },
];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "auth/login";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log("MIDDLEWARE RODANDO");
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    /* Match all request paths except for the ones starting with:
   - api (API routes)
   - _next/static (static files) 
   - _next/image (image optimization files)
   - favicon.ico (favicon file)
   - sitemap.xml (sitemap file)
   - robots.txt (robots file)
   */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
