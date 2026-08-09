// The email server's API key must never be embedded in the built JS bundle —
// that bundle is public (served to anyone who loads the site), so anything
// baked in at build time is effectively public too. Instead each device
// enters the key once; it's kept only in that browser's localStorage and
// sent as a request header, never bundled into the app itself.
const STORAGE_KEY = 'techinnosphere_email_api_key_v1';

export const getApiKey = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const setApiKey = (key) => {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

// Prompts the user once, only when the server actually asks for a key
// (401 response). Safe to call repeatedly — a no-op once a key is stored.
export const promptForApiKey = () => {
  const existing = getApiKey();
  if (existing) return existing;
  const entered = window.prompt(
    'This email server requires an API key (set in your .env as API_KEY).\n' +
    'Paste it here — it will be remembered on this device only.'
  );
  if (entered && entered.trim()) {
    setApiKey(entered);
    return entered.trim();
  }
  return '';
};
