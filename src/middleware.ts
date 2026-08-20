export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/projects/:path*",
    "/profile",
    "/workspace/:path*",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
