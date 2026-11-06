import { NextResponse, type NextRequest } from "next/server";

/**
 * Without a database the admin dashboard is off. Redirect before rendering:
 * a redirect from the admin layout alone still lets Next.js start rendering
 * the page in parallel, and those pages query the database.
 */
export function proxy(request: NextRequest) {
  if (process.env.DATA_SOURCE !== "database") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Every admin route except the login page, which explains why the admin is off.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
