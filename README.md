# MYSTERIUM — Escape Room (strona WWW + panel CMS)

Strona internetowa escape roomu **Mysterium** w Warszawie wraz z pełnym panelem
administratora (CMS) do zarządzania treścią — bez dotykania kodu.

Zbudowane w **Next.js 14 + TypeScript + Tailwind CSS + Prisma**. Strona jest
**dwujęzyczna (PL / EN)** z przełącznikiem języka.

---

## ✨ Co potrafi

**Strona publiczna** (`/pl`, `/en`):
Hero, Pokoje, Galeria filmów, Jak to działa, Cennik, Galeria zdjęć, Opinie,
FAQ, Rezerwacja LockMe, formularz kontaktowy, WhatsApp, stopka.

**Panel CMS** (`/admin`) — zarządzanie:
- 🚪 Pokojami zagadek (zdjęcie, czas, liczba osób, trudność, status, kolejność)
- 🖼️ Galerią zdjęć (wgrywanie plików)
- 🎬 Galerią filmów (YouTube lub własny plik mp4)
- ⭐ Opiniami graczy · 💰 Cennikiem · ❓ FAQ
- ✉️ Wiadomościami z formularza kontaktowego
- ⚙️ Ustawieniami (telefon, e-mail, adres, WhatsApp, LockMe, Google Calendar, teksty)

Każda treść ma osobne pola **PL** i **EN**. Można ukrywać/pokazywać i zmieniać kolejność pozycji.

**Zarządzanie zespołem i rezerwacjami** (`/admin`):
- 👥 **Konta i role** — właściciel/admin oraz pracownicy; dodawanie kont z panelu, hasła, stawki
- 🗓️ **Grafik** zmian (kalendarz) + **dyspozycyjność** zgłaszana przez pracowników
- 💵 **Wypłaty** — wynagrodzenie liczone z grafiku wg stawek dzień / noc (22–6) / weekend
- 📅 **Rezerwacje** — ręczne w panelu + import z **LockMe API** (po konfiguracji)
- 📆 **Google Calendar** — subskrypcja iCal (każde konto ma swój link) + opcjonalna pełna
  synchronizacja przez konto serwisowe + osadzony kalendarz w panelu
- 📊 **Statystyki** w pulpicie (rezerwacje, godziny, wypłaty, wiadomości)

Role: **OWNER/ADMIN** widzą wszystko; **EMPLOYEE** widzi tylko swój grafik, dyspozycyjność i zarobki.

---

## 🚀 Uruchomienie lokalnie

> Projekt jest skonfigurowany pod **Postgres** (`provider = "postgresql"`).
> Do uruchomienia lokalnego ustaw `DATABASE_URL` na bazę Postgres (np. darmowy
> [Neon](https://neon.tech)). **Chcesz szybko, bez Postgresa?** Zmień w
> `prisma/schema.prisma` `provider` na `"sqlite"` i `DATABASE_URL="file:./dev.db"`.

```bash
# 1. Zainstaluj zależności
npm install

# 2. Skopiuj konfigurację i ustaw dane
cp .env.example .env
#   - DATABASE_URL: adres bazy Postgres (Neon) lub SQLite (patrz wyżej)
#   - AUTH_SECRET zmień na długi losowy ciąg
#   - ADMIN_EMAIL / ADMIN_PASSWORD ustaw swoje dane logowania

# 3. Utwórz bazę i wgraj dane startowe
npm run db:push
npm run db:seed

# 4. Start
npm run dev
```

- Strona: http://localhost:3000
- Panel: http://localhost:3000/admin
- Domyślne logowanie (z `.env`): `admin@mysterium.pl` / `mysterium123`
  — **koniecznie zmień hasło przed wdrożeniem!**

---

## 🌐 Wdrożenie na produkcję (Vercel)

Vercel nie przechowuje plików zapisanych na dysku (baza SQLite i wgrane zdjęcia
znikają). Na produkcji użyj zewnętrznej bazy i magazynu plików:

1. **Baza danych** — załóż darmową bazę Postgres (np. [Neon](https://neon.tech)
   lub Vercel Postgres). Następnie:
   - w `prisma/schema.prisma` zmień `provider = "sqlite"` na `provider = "postgresql"`,
   - ustaw `DATABASE_URL` w zmiennych środowiskowych Vercel,
   - uruchom `npx prisma db push` oraz `npm run db:seed`.

2. **Wgrywane pliki (zdjęcia/filmy)** — domyślnie zapisują się w
   `public/uploads`. Na Vercel podłącz [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
   i podmień zapis w `src/app/api/admin/upload/route.ts`.
   (Na zwykłym VPS-ie zapis na dysk działa bez zmian.)

3. Ustaw zmienne środowiskowe w panelu Vercel: `DATABASE_URL`, `AUTH_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

> Alternatywa bez zmian w kodzie: dowolny **VPS** z Node.js — tam SQLite i
> wgrywanie plików na dysk działają od razu (`npm run build && npm run start`).

---

## 🎨 Kolory i fonty

Paleta i typografia przeniesione z poprzedniego projektu:
- Złoto `#C9A84C`, ciemny granat/teal, fonty *Cinzel Decorative*, *Cinzel*, *Raleway*.
- Zmienne kolorów: `tailwind.config.ts` oraz `src/app/globals.css`.

## 📁 Struktura

```
src/
  app/
    [locale]/        – strona publiczna (PL/EN)
    admin/           – panel CMS (logowanie + (panel))
    api/             – API (auth, contact, admin CRUD, upload, settings)
  components/site/   – sekcje strony
  components/admin/  – komponenty panelu
  lib/               – prisma, auth, i18n, konfiguracja zasobów
prisma/              – schemat bazy + dane startowe (seed)
```

## 🔧 Przydatne komendy

```bash
npm run dev        # serwer deweloperski
npm run build      # build produkcyjny
npm run start      # uruchom build
npm run db:seed    # wgraj dane startowe
npm run db:reset   # wyczyść i wgraj dane od nowa
```
