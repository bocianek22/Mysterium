import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { locales, defaultLocale } from "./lib/i18n";

const COOKIE_NAME = "mysterium_session";
const authSecret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

// Odczytuje rolę z sesji (JWT) — edge-safe, bez Prismy.
async function roleFromReq(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret);
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

// Pomijamy ścieżki techniczne i statyczne (logika językowa)
function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") // pliki (favicon, obrazy itd.)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Panel admina: rola „Kod" (kiosk) ma dostęp wyłącznie do ekranu kodu QR.
  if (pathname.startsWith("/admin")) {
    const allowed = pathname === "/admin/kod" || pathname.startsWith("/admin/login");
    if (!allowed && (await roleFromReq(req)) === "CODE") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/kod";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

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
