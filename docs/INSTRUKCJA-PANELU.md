# Mysterium — instrukcja panelu administracyjnego

Krótki przewodnik po panelu pod adresem **`/admin`**. Logowanie: e-mail + hasło (zakładane przez właściciela/admina w sekcji **Pracownicy**).

---

## 1. Role i uprawnienia

Każdy widzi w menu tylko to, do czego ma dostęp.

| Rola | Co może |
|------|---------|
| **Właściciel / Admin** | Wszystko — pełen dostęp |
| **Recepcja** | Rezerwacje, Klienci, grafik, zegar pracy, operacje |
| **Księgowa** | Finanse, Faktury, Płatności, Wypłaty, Wydatki, eksporty |
| **Technik** | Operacje (konserwacja, checklisty, magazyn), Wydatki |
| **Pracownik** | Mój grafik, Zegar pracy, Dyspozycyjność, operacje |

> Konta i role nadaje **Właściciel/Admin** w **👥 Pracownicy**.

---

## 2. Pulpit (📊)

Strona startowa po zalogowaniu — skróty do najważniejszych sekcji dopasowane do Twojej roli oraz szybki podgląd bieżącej sytuacji.

---

## 3. Rezerwacje i klienci

### 📅 Rezerwacje
- Kalendarz i lista zgłoszeń z pokojów (stacjonarny / wyjazdowy).
- Przy każdej rezerwacji ustaw: **klienta, liczbę osób, status, przychód, zaliczkę, koszty (paliwo/inne)** oraz załączniki faktur.
- Statusy: nowa → potwierdzona → zrealizowana / anulowana.

### 📇 Klienci (CRM)
- Baza klientów budowana automatycznie z rezerwacji.
- Historia wizyt, dane kontaktowe, notatki.

### 📣 Kampanie (tylko zarząd)
- Wysyłka e-maili do klientów (promocje, newsletter).
- **Wymaga skonfigurowanego Resend** (patrz sekcja 8).

---

## 4. Grafik i czas pracy

### 🗓️ Grafik / Mój grafik
- Zarząd: układa grafik wszystkim; pracownik: widzi swoje zmiany.

### 🤖 Auto-grafik (zarząd)
- Automatyczna propozycja grafiku na podstawie dyspozycyjności.

### ✋ Dyspozycyjność (pracownik)
- Pracownik zaznacza, kiedy może pracować — to zasila auto-grafik.

### ⏱️ Zegar pracy / Zegar (RCP)
- **Pracownik:** „Zegar pracy" — odbija wejście/wyjście (rejestr czasu pracy).
- **Zarząd:** „Zegar (RCP)" — podgląd i korekta kart godzin zespołu.
- Godziny z zegara → automatycznie liczą **Wypłaty**.

### 🏖️ Urlopy / Mój urlop
- Pracownik składa wniosek, zarząd akceptuje.

---

## 5. Finanse (księgowa + zarząd)

### 💰 Finanse
- Miesięczne podsumowanie: **przychód, koszty, wypłaty, zysk** + wykres dzienny i statystyki gier/bonów.
- Przełączanie miesięcy strzałkami.
- **Eksporty PDF:** Podsumowanie, Wydatki, Bony (przyciski po prawej u góry).

### 🧾 Faktury i koszty
- Wszystkie zlecenia z wartością/kosztami, podgląd załączonych faktur.
- Eksport **CSV** i **PDF** (rezerwacje).

### 💵 Wypłaty
- Wynagrodzenia liczone automatycznie z kart godzin × stawki pracownika (netto/brutto).
- Eksport **CSV** i **PDF** wg miesiąca.

### 🧾 Wydatki (księgowa/technik)
- Rejestr kosztów firmowych (zakupy, naprawy, media, marketing…) z numerem faktury i kontrahentem.

### 💳 Płatności online → patrz sekcja 7

---

## 6. Operacje

### 🛠️ Konserwacja
- Zgłaszanie i obsługa usterek w pokojach.

### ✅ Checklisty
- Listy kontrolne (np. przygotowanie pokoju przed grą).

### 📦 Magazyn
- Stany rekwizytów i materiałów eksploatacyjnych.

---

## 7. Płatności online (💳) — Stripe / Przelewy24

> Sekcja działa dopiero po skonfigurowaniu kluczy (patrz 8) i włączeniu w **Ustawienia → Płatności**.

### Linki płatności na eventy i wyceny
1. Wejdź w **Płatności**.
2. Wpisz **kwotę** (zadatek albo całość) i **opis** (np. „Zadatek — event firmowy 12.04"), opcjonalnie dane klienta.
3. Kliknij **Utwórz link** → skopiuj wygenerowany link i wyślij klientowi.
4. Klient płaci (karta / BLIK / przelew). Status zmienia się na **Opłacone** na liście.

### Sprzedaż bonów online
- Po włączeniu „sprzedaży bonów online" na stronie **/bony** pojawia się formularz zakupu.
- Klient wybiera kwotę, płaci, a **kod bonu trafia do niego mailem** i do bazy bonów jako „sprzedany".

---

## 8. Ustawienia (⚙️) i konfiguracja techniczna

W **Ustawieniach** ustawisz dane firmy, kontakt, pop-up, social media oraz **Płatności** (włączenie + wybór operatora).

Klucze/sekrety ustawia osoba techniczna w zmiennych środowiskowych (Vercel) — szczegóły w pliku `.env.example`:

- **E-mail (kampanie, podziękowania, kody bonów):** `RESEND_API_KEY` + zweryfikowana domena (`EMAIL_FROM`).
- **Płatności — Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook → `.../api/pay/webhook/stripe`, zdarzenie `checkout.session.completed`).
- **Płatności — Przelewy24:** `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY`, `P24_SANDBOX` (urlStatus → `.../api/pay/webhook/p24`).
- **Adres strony:** `NEXT_PUBLIC_SITE_URL` (zalecane — używane w SEO i linkach płatności).

---

## 9. Najczęstsze zadania — szybka ściąga

| Chcę… | Gdzie |
|-------|-------|
| Dodać/edytować rezerwację | 📅 Rezerwacje |
| Wystawić link do zapłaty (event/zadatek) | 💳 Płatności → Utwórz link |
| Sprawdzić zysk w tym miesiącu | 💰 Finanse |
| Pobrać raport pod księgowość (PDF) | 💰 Finanse / 🧾 Faktury / 💵 Wypłaty → ⬇ PDF |
| Odbić wejście/wyjście | ⏱️ Zegar pracy |
| Naliczyć wypłaty | 💵 Wypłaty (liczy się automatycznie) |
| Dodać konto pracownika / zmienić rolę | 👥 Pracownicy |
| Wysłać newsletter / promocję | 📣 Kampanie |
| Zgłosić usterkę | 🛠️ Konserwacja |

---

*Dokument wewnętrzny Mysterium. W razie pytań technicznych — sprawdź `.env.example` lub skontaktuj się z osobą administrującą wdrożeniem.*
