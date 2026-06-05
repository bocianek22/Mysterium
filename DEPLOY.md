# 🚀 Wdrożenie na żywo — Vercel + Neon (Postgres)

Przewodnik krok po kroku. Czas: ~10–15 minut. Nie wymaga znajomości kodu.

> **Dlaczego Postgres i Blob?** Vercel nie przechowuje plików na dysku między
> uruchomieniami — dlatego baza danych idzie do **Neon (Postgres)**, a wgrywane
> zdjęcia/filmy do **Vercel Blob**. Kod jest już na to gotowy.

---

> Projekt jest już skonfigurowany pod **Postgres** (`prisma/schema.prisma`).

## 1. Baza danych — Neon (darmowa)

1. Wejdź na **https://neon.tech** → załóż konto → **Create project**.
2. Skopiuj **connection string** (zaczyna się od `postgresql://...`). Zaznacz opcję
   „Pooled connection" jeśli dostępna.

## 2. Tabele i dane startowe — automatycznie ✨

Nie musisz nic uruchamiać w terminalu. Przy pierwszym wdrożeniu Vercel uruchomi
skrypt `vercel-build`, który **sam utworzy tabele i wgra dane startowe** (konto
właściciela + treści). Wymóg: ustaw zmienne (krok 3) **przed** kliknięciem Deploy.

> Wolisz ręcznie? Lokalnie z `DATABASE_URL` z Neon: `npx prisma db push && npm run db:seed`.

## 3. Vercel — import projektu

1. Wejdź na **https://vercel.com** → zaloguj przez GitHub → **Add New… → Project**.
2. Wybierz repozytorium **bocianek22/Mysterium** → **Import**.
3. W sekcji **Environment Variables** dodaj:

   | Nazwa | Wartość |
   |---|---|
   | `DATABASE_URL` | connection string z Neon |
   | `AUTH_SECRET` | długi losowy ciąg (np. z `openssl rand -base64 32`) |
   | `ADMIN_EMAIL` | Twój e-mail logowania do panelu |
   | `ADMIN_PASSWORD` | Twoje hasło do panelu |

4. Kliknij **Deploy**. Poczekaj na zbudowanie.

## 4. Magazyn plików — Vercel Blob

1. W projekcie na Vercel: zakładka **Storage → Create → Blob** → utwórz.
2. Vercel sam doda zmienną `BLOB_READ_WRITE_TOKEN` do projektu.
   (Kod automatycznie użyje Blob, gdy ta zmienna istnieje.)
3. **Redeploy** projektu (Deployments → … → Redeploy), by token został wczytany.

Gotowe — wchodzisz na swój adres `https://twoja-nazwa.vercel.app`, a panel pod
`/admin`. **Zmień hasło administratora** po pierwszym logowaniu (zakładka Pracownicy).

## 6. Własna domena (opcjonalnie)

Vercel → **Settings → Domains** → dodaj swoją domenę i ustaw rekordy DNS wg instrukcji.

---

## Integracje (gdy będziesz gotów — wszystko z panelu)

- **LockMe** — *Ustawienia → Rezerwacje*: wklej kod widżetu oraz (opcjonalnie) dane API.
- **Google Calendar** — *Ustawienia → Google*: włącz synchronizację i wklej dane konta
  serwisowego; każde konto ma też gotowy link iCal w swoim pulpicie.
- **Mapa** — *Ustawienia → O nas i mapa*: wklej „embed" z Google Maps.

## Alternatywa: VPS

Na zwykłym serwerze VPS z Node.js możesz użyć Postgresa (jak wyżej) albo wrócić do
**SQLite** — wtedy w `prisma/schema.prisma` ustaw `provider = "sqlite"` i:

```bash
npm install && npm run db:push && npm run db:seed
npm run build && npm run start   # port 3000 (ustaw reverse proxy / PM2)
```

Na VPS pliki zapisują się na dysk (bez Vercel Blob) — nie ustawiaj `BLOB_READ_WRITE_TOKEN`.
