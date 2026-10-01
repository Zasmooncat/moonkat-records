// Supabase Edge Function: send-contact-form
// Features: Resend email API, rate limiting (1 per IP per 10min), honeypot anti-bot, auto-reply to sender

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: max 1 submission per IP every 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitMap = new Map()

const INQUIRY_LABELS = {
  demos: '🎵 Demo Submission',
  booking: '🎤 Booking Request',
  press: '📰 Press / Media',
  general: '💬 General Inquiry',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { name, email, inquiry_type, message, honeypot } = body

    // 1. HONEYPOT CHECK
    if (honeypot && honeypot.trim() !== '') {
      console.warn(`Honeypot triggered from ${name} <${email}>`)
      return new Response(
        JSON.stringify({ success: true, message: 'Message sent!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. FIELD VALIDATION
    if (!name?.trim() || !email?.trim() || !message?.trim() || !inquiry_type) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (message.trim().length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is too short (min 10 characters).' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (message.trim().length > 2000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is too long (max 2000 characters).' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 3. RATE LIMITING
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    const now = Date.now()
    const lastSubmission = rateLimitMap.get(clientIp)

    if (lastSubmission && now - lastSubmission < RATE_LIMIT_WINDOW_MS) {
      const remainingMs = RATE_LIMIT_WINDOW_MS - (now - lastSubmission)
      const remainingMin = Math.ceil(remainingMs / 60000)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Too many requests. Please wait ${remainingMin} minute${remainingMin > 1 ? 's' : ''} before sending another message.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const inquiryLabel = INQUIRY_LABELS[inquiry_type] || '💬 General Inquiry'
    const sentAt = new Date().toLocaleString('es-ES', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Madrid',
    })

    const escapedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // 4. SEND NOTIFICATION EMAIL TO MOONKAT
    const notifRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Moonkat Records Contact <hello@moonkatrecords.com>',
        to: ['moonkatrecords@gmail.com'],
        reply_to: email,
        subject: `${inquiryLabel} from ${name}`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px}.wrapper{max-width:600px;margin:0 auto}.header{background:linear-gradient(135deg,#18071e 0%,#2d0a3a 50%,#18071e 100%);border:1px solid rgba(168,85,247,.3);border-radius:12px 12px 0 0;padding:32px;text-align:center}.header h1{font-size:22px;font-weight:700;letter-spacing:.1em;color:#fff;text-transform:uppercase}.badge{display:inline-block;background:rgba(168,85,247,.2);border:1px solid rgba(168,85,247,.5);color:#d8b4fe;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:600;margin-top:12px;letter-spacing:.05em}.content{background:#111;border:1px solid #222;border-top:none;border-radius:0 0 12px 12px;padding:32px}.field{background:#1a1a1a;border-left:3px solid #a855f7;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:16px}.field-label{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#a855f7;margin-bottom:6px}.field-value{font-size:15px;color:#e5e5e5;line-height:1.5}.msg-box{background:#1a1a1a;border:1px solid #2a2a2a;border-top:3px solid #a855f7;border-radius:0 0 8px 8px;padding:18px;margin:16px 0}.reply-btn{display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;margin-top:20px}.meta{font-size:12px;color:#555;margin-top:24px;padding-top:20px;border-top:1px solid #222}</style></head><body><div class="wrapper"><div class="header"><h1>📬 New Contact Message</h1><div class="badge">${inquiryLabel}</div></div><div class="content"><div class="field"><div class="field-label">From</div><div class="field-value">${name}</div></div><div class="field"><div class="field-label">Email</div><div class="field-value"><a href="mailto:${email}" style="color:#a855f7">${email}</a></div></div><div class="field"><div class="field-label">Type</div><div class="field-value">${inquiryLabel}</div></div><div class="field-label" style="margin-bottom:8px;margin-top:20px">Message</div><div class="msg-box"><div class="field-value" style="white-space:pre-wrap">${escapedMessage}</div></div><center><a href="mailto:${email}?subject=Re:%20Moonkat%20Records" class="reply-btn">Reply to ${name} →</a></center><div class="meta">Received: ${sentAt} · IP: ${clientIp}</div></div></div></body></html>`,
      }),
    })

    if (!notifRes.ok) {
      const err = await notifRes.text()
      throw new Error(`Resend error (notification): ${err}`)
    }

    const notifData = await notifRes.json()
    console.log(`Contact notification sent. ID: ${notifData.id}`)

    // 5. SEND AUTO-REPLY TO SENDER
    const autoReplyRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Moonkat Records <hello@moonkatrecords.com>',
        to: [email],
        subject: 'We received your message — Moonkat Records',
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f4;padding:24px}.wrapper{max-width:560px;margin:0 auto}.header{background:linear-gradient(to bottom,#0f0f0f 0%,#1e0a2e 100%);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center}.header img{max-width:160px;height:auto;margin-bottom:16px}.header h1{color:#fff;font-size:20px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.header p{color:#f9a8d4;font-size:13px;letter-spacing:.05em;margin-top:8px}.content{background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none}.greeting{font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:16px}.body-text{font-size:15px;color:#444;line-height:1.7;margin-bottom:20px}.highlight-box{background:#faf5ff;border-left:4px solid #a855f7;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;font-size:14px;color:#555;line-height:1.6}.inquiry-tag{display:inline-block;background:#f3e8ff;color:#7c3aed;font-weight:700;font-size:12px;letter-spacing:.08em;padding:4px 12px;border-radius:999px;margin-bottom:12px}.footer{text-align:center;margin-top:28px;font-size:12px;color:#999;line-height:1.8}.social-links{margin-top:14px}.social-links a{color:#a855f7;text-decoration:none;margin:0 8px;font-size:12px}</style></head><body><div class="wrapper"><div class="header"><img src="https://www.moonkatrecords.com/moonkat-logo.png" alt="Moonkat Records"><h1>Moonkat Records</h1><p>Drum &amp; Bass Underground Culture</p></div><div class="content"><p class="greeting">Hey ${name} 👋</p><p class="body-text">Thank you for reaching out! We've received your message and our team will get back to you as soon as possible.</p><div class="highlight-box"><div class="inquiry-tag">${inquiryLabel}</div><br><strong>Your message:</strong><br><br><span style="white-space:pre-wrap">${escapedMessage}</span></div><p class="body-text">We typically respond within <strong>2–5 business days</strong>. In the meantime, follow us on our socials to stay up to date with our latest releases.</p><p class="body-text" style="margin-top:24px">Best regards,<br><strong>Moonkat Records</strong></p></div><div class="footer"><p>© ${new Date().getFullYear()} Moonkat Records · Spain</p><div class="social-links"><a href="https://www.instagram.com/moonkatrecords">Instagram</a><a href="https://soundcloud.com/moonkatrecords">SoundCloud</a><a href="https://www.moonkatrecords.com">Website</a></div><p style="margin-top:12px;font-size:11px;color:#bbb">You received this because you contacted us via moonkatrecords.com</p></div></div></body></html>`,
      }),
    })

    if (!autoReplyRes.ok) {
      const err = await autoReplyRes.text()
      console.error(`Auto-reply failed (non-fatal): ${err}`)
    } else {
      const arData = await autoReplyRes.json()
      console.log(`Auto-reply sent to ${email}. ID: ${arData.id}`)
    }

    // 6. UPDATE RATE LIMIT MAP
    rateLimitMap.set(clientIp, now)
    for (const [ip, ts] of rateLimitMap.entries()) {
      if (now - ts > 15 * 60 * 1000) rateLimitMap.delete(ip)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in send-contact-form:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
