import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";

// Pomijamy ścieżki techniczne i statyczne
function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") // pliki (favicon, obrazy itd.)
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (shouldSkip(pathname)) return NextResponse.next();

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  // Przekieruj na domyślny język (np. / -> /pl)
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
