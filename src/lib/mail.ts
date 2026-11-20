import "server-only";

/** Sends an email via Resend if configured; otherwise prints it to the server log (demo mode). */
export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !process.env.MAIL_FROM) {
    console.log(`\n[DEMO MAIL] to=${to}\nsubject=${subject}\n${text}\n`);
    return { demo: true };
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }),
  });
  if (!r.ok) console.error("Mail error", await r.text());
  return { demo: false };
}
