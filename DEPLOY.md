# 🚀 Wdrożenie na żywo — Vercel + Neon (Postgres)

Przewodnik krok po kroku. Czas: ~10–15 minut. Nie wymaga znajomości kodu.

> **Dlaczego Postgres i Blob?** Vercel nie przechowuje plików na dysku między
> uruchomieniami — dlatego baza danych idzie do **Neon (Postgres)**, a wgrywane
> zdjęcia/filmy do **Vercel Blob**. Kod jest już na to gotowy.

---

## 1. Baza danych — Neon (darmowa)

1. Wejdź na **https://neon.tech** → załóż konto → **Create project**.
2. Skopiuj **connection string** (zaczyna się od `postgresql://...`). Zaznacz opcję
   „Pooled connection" jeśli dostępna.

## 2. Przełącz projekt na Postgres

W pliku `prisma/schema.prisma` zmień **jedną linię**:

```prisma
datasource db {
  provider = "postgresql"   // było: "sqlite"
  url      = env("DATABASE_URL")
}
```

Zatwierdź zmianę (commit) i wypchnij do gałęzi, z której wdrażasz.

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

## 5. Utwórz tabele i dane startowe

Jednorazowo, na swoim komputerze (z connection stringiem z Neon):

```bash
# w pliku .env ustaw DATABASE_URL na adres z Neon, potem:
npx prisma db push     # tworzy tabele w bazie Neon
npm run db:seed        # konto właściciela + treści startowe
```

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

## Alternatywa: VPS (bez zmian)

Na zwykłym serwerze VPS z Node.js działa też SQLite i zapis plików na dysk:

```bash
npm install && npm run db:push && npm run db:seed
npm run build && npm run start   # port 3000 (ustaw reverse proxy / PM2)
```
