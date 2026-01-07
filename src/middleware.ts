import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  // The `pathnames` object holds pairs of internal
  // and external paths, separated by locale.
  pathnames: {
    // If all locales use the same path, use the
    // special `shared` key.
    '/': '/',
    '/dashboard': '/dashboard',
 
    // If locales use different paths, specify them separately
    '/about': {
      en: '/about',
      es: '/acerca'
    }
  }
});
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - … the admin path
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)']
};
