// Where to find the email/tracking API (email-server.cjs).
//
// Two modes:
//
// 1. Deployed with a real backend host (Railway/Render/etc): set
//    VITE_EMAIL_API_BASE at build time (see .env.production.example) to
//    that host's public HTTPS URL. Required once the frontend (e.g. Surge)
//    and the backend live on different domains — a phone on cellular data
//    has no way to guess "your PC's address" the way it can on shared Wi-Fi.
//
// 2. Everything else (local dev, phone on the same Wi-Fi as your PC): no
//    env var needed. This derives the address from whatever URL the page
//    itself was loaded from, so it keeps working automatically as:
//      PC:    http://localhost:5173      -> http://localhost:3001
//      Phone: http://192.168.1.102:5173  -> http://192.168.1.102:3001
export const EMAIL_API_BASE =
  import.meta.env.VITE_EMAIL_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:3001`;
