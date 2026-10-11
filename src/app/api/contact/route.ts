import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDictionary } from "@/content";
import { HONEYPOT_FIELD, MIN_FILL_MS, validateContact } from "@/lib/contact-schema";

// Basic in-memory rate limit: 5 requests per IP every 10 minutes.
// It resets on cold starts; put a shared store (e.g. Upstash) in front if spam grows.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Spam traps: a filled honeypot or an impossibly fast submission.
  // Answer with success so bots get no signal, but drop the message.
  const elapsed = Number(body.elapsed ?? 0);
  if (String(body[HONEYPOT_FIELD] ?? "").trim() !== "" || elapsed < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const { site, contact } = getDictionary();
  const { data, errors } = validateContact(body, contact.form);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Nuven Digital <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("\n[contacto] RESEND_API_KEY no configurada. Mensaje recibido (modo desarrollo):\n", data, "\n");
      return NextResponse.json({ ok: true, dev: true });
    }
    console.error("[contacto] RESEND_API_KEY no está configurada en producción; el mensaje no se ha enviado.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Nombre", data.name],
    ["Email", data.email],
    ["Tipo de proyecto", data.projectType],
    ["Presupuesto", data.budget],
  ];
  const html = `
    <h2 style="font-family:sans-serif">Nueva solicitud de presupuesto</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(data.message)}</p>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${data.message}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: data.email,
      subject: `Nueva solicitud: ${data.projectType} · ${data.name}`,
      html,
      text,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contacto] Error al enviar con Resend:", err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
