/**
 * Cloudflare Pages Function: POST /api/contact
 * Delivers Quick Inquiry messages directly via Resend or Telegram if configured
 * in Cloudflare Pages Environment Variables:
 *   - RESEND_API_KEY + CONTACT_TO_EMAIL (optional)
 *   - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (optional)
 * If no delivery provider is configured yet, returns { ok: false, fallback: true }
 * so the frontend smoothly falls back to mailto:.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const name = String(body?.name || '').trim().slice(0, 120);
    const email = String(body?.email || '').trim().slice(0, 160);
    const message = String(body?.message || '').trim().slice(0, 2000);

    if (!name || !message) {
      return jsonResponse({ ok: false, error: 'Name and message are required.' }, 400);
    }

    let delivered = false;

    // Option 1: Telegram Bot notification
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const text = [
        '📩 New Portfolio Inquiry (native.web.id)',
        `From: ${name}`,
        email ? `Reply-To: ${email}` : null,
        '',
        message
      ].filter(Boolean).join('\n');

      const tgRes = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text
          })
        }
      );
      if (tgRes.ok) delivered = true;
    }

    // Option 2: Resend Email API
    if (!delivered && env.RESEND_API_KEY) {
      const toEmail = env.CONTACT_TO_EMAIL || 'nativeomni@gmail.com';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL || 'Native Omni Portfolio <onboarding@resend.dev>',
          to: [toEmail],
          reply_to: email || undefined,
          subject: `Portfolio Inquiry from ${name}`,
          text: `Name: ${name}\nEmail: ${email || '-'}\n\n${message}`
        })
      });
      if (resendRes.ok) delivered = true;
    }

    if (!delivered) {
      return jsonResponse({ ok: false, fallback: true }, 200);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, fallback: true, error: 'Invalid request' }, 400);
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
