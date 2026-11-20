# Małe Kroki — demo aplikacji edukacyjnej dla rodzin

Projekt demonstracyjny: płatna aplikacja webowa (telefon + komputer) z codziennymi aktywnościami dla rodziców i dzieci.

## Funkcje
- **Konta użytkowników**: rejestracja e-mail/hasło, logowanie przez Google (OAuth), reset hasła linkiem e-mail (jednorazowy, ważny 1 h).
- **Postępy na serwerze**: ukończone dni, ulubione, statystyki (seria dni, minuty, % programu).
- **Płatności**: Stripe Checkout z **BLIK** i kartą (PLN), webhook, potwierdzenia płatności, faktury Stripe. Bez kluczy działa tryb demo.
- **Audio** do każdego dnia (upload w panelu, odtwarzacz w aplikacji).
- **Panel administratora**: dodawanie/edycja/ukrywanie dni, darmowe vs płatne, upload audio, podstawowe statystyki.
- **RODO / dzieci**: konto zakłada dorosły, zgoda przy rejestracji, minimum danych dziecka (imię/pseudonim + przedział wieku), eksport danych (JSON), trwałe usunięcie konta.
- Responsywny interfejs (dolne menu na telefonie), tryb jasny/ciemny.

## Technologie
Next.js 15 (App Router, Server Actions) · TypeScript · Prisma (SQLite lokalnie → PostgreSQL/Supabase na produkcji) · JWT sesje w ciasteczkach httpOnly (jose) · bcrypt · Stripe API · Resend (e-mail).

## Uruchomienie lokalne
```bash
npm install
cp .env.example .env    # uzupełnij SESSION_SECRET i ADMIN_PASSWORD
npm run setup           # tworzy bazę i dodaje przykładowe treści + konto admina
npm run dev             # http://localhost:3100
```

## Konfiguracja opcjonalna (`.env`)
| Zmienna | Do czego |
|---|---|
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Logowanie Google. Redirect URI: `{APP_URL}/api/auth/google/callback` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Płatności BLIK/karta. Webhook: `{APP_URL}/api/stripe/webhook`, zdarzenia `checkout.session.completed`, `checkout.session.async_payment_succeeded` |
| `RESEND_API_KEY`, `MAIL_FROM` | Wysyłka e-maili (reset hasła). Bez tego link trafia do logów serwera |

## Wdrożenie produkcyjne (do zrobienia)
- Baza: zmień `provider` w `prisma/schema.prisma` na `postgresql` i ustaw `DATABASE_URL` (np. Supabase).
- Pliki audio: obecnie zapisywane na dysku (`public/uploads`) — na Vercel trzeba podmienić `saveAudio` na Supabase Storage / S3.
- Polityka prywatności (`/prywatnosc`) to wzór — wymaga weryfikacji prawnika.
