import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/case-studies(.*)',
  '/pricing(.*)',
  '/sign-up(.*)',
  '/sign-in(.*)',
  '/api/webhooks/stripe(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/webhooks/subscription-check(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Allow public routes and static assets
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect private routes
  if (!userId) {
    const signUpUrl = new URL('/pricing', req.url);
    return NextResponse.redirect(signUpUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};




