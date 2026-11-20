export const PRICE = Number(process.env.PRICE_PLN_GROSZE || 4900);
export const ACCESS_DAYS = 365;
export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;
export const googleEnabled = () => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
export const appUrl = () => process.env.APP_URL || "http://localhost:3100";
export const pln = (grosze: number) =>
  (grosze / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
