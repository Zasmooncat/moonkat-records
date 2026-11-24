import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ADMIN_SECRET_KEY = Deno.env.get('ADMIN_SECRET_KEY') // We'll set this in Secrets

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackData {
    title: string
    url?: string
}

interface ReleaseData {
    title: string
    artist: string
    coverUrl: string
    promoUrl: string
    description: string
    tracks?: TrackData[]
}

interface NewsletterData {
    subject: string
    content: string
    imageUrl?: string
}

interface CampaignPayload {
    adminKey: string
    type: 'release' | 'newsletter'
    releaseData?: ReleaseData
    newsletterData?: NewsletterData
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return new Response("Method not allowed", { status: 405, headers: corsHeaders })
    }

    try {
        const rawBody = await req.text();
        console.log("Raw Request Body:", rawBody);

        if (!rawBody) {
            throw new Error("Request body is empty");
        }

        let payload: CampaignPayload = JSON.parse(rawBody);

        // Handle potential double-wrapping by Supabase Invoke
        if (payload.body) {
            // @ts-ignore - dynamic unwrap
            payload = payload.body;
        }

        // 1. Security Check
        if (payload.adminKey !== ADMIN_SECRET_KEY) {
            throw new Error('Unauthorized: Invalid Admin Key')
        }

        // Validate Payload based on Type
        let emailSubject = '';
        let emailHtmlContent = '';

        if (payload.type === 'release') {
            if (!payload.releaseData) throw new Error('Missing releaseData');
            const data = payload.releaseData;
            emailSubject = `New Release: ${data.title} by ${data.artist}`;
            
            let tracksHtml = '';
            if (data.tracks && data.tracks.length > 0) {
                tracksHtml = `
                    <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="color: #ec4899; margin-top: 0; font-size: 16px;">Tracklist:</h3>
                        <ul style="list-style: none; padding: 0; margin: 0; color: #ccc;">
                            ${data.tracks.map((t, i) => `<li style="margin-bottom: 8px; font-size: 14px;">🎧 ${i + 1}. ${t.title}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            const formattedDescription = data.description.split('\n').join('<br>');

            emailHtmlContent = `
                <img src="${data.coverUrl}" alt="${data.title}" class="cover">
                <h1>${data.title}</h1>
                <h2>${data.artist}</h2>
                <p>${formattedDescription}</p>
                ${tracksHtml}
                <a href="${data.promoUrl}" class="btn">Get Promo</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    Link expires in 5 minutes after opening.
                </p>
            `;
        } else if (payload.type === 'newsletter') {
            if (!payload.newsletterData) throw new Error('Missing newsletterData');
            const data = payload.newsletterData;
            emailSubject = data.subject || 'News from Moonkat Records';

            // Optional Image for Newsletter
            const imageBlock = data.imageUrl ? `<img src="${data.imageUrl}" alt="Newsletter Image" class="cover">` : '';

            // Convert newlines to <br> for simple text content
            const formattedContent = data.content.split('\n').join('<br>');

            emailHtmlContent = `
                ${imageBlock}
                <h1>${emailSubject}</h1>
                <div style="text-align: left; margin-top: 20px;">
                    <p>${formattedContent}</p>
                </div>
            `;
        } else {
            throw new Error('Invalid campaign type');
        }

        // 2. Init Supabase Admin Client
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // 3. Fetch Active Subscribers
        const { data: subscribers, error } = await supabase
            .from('subscriptions')
            .select('email, id, name')
            .eq('is_subscribed', true)

        if (error) throw error
        if (!subscribers || subscribers.length === 0) {
            return new Response(JSON.stringify({ message: 'No active subscribers found.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        console.log(`Sending ${payload.type} campaign to ${subscribers.length} subscribers...`)

        // 4. Send Emails via Resend (Batched)
        // Rate Limit: 2 requests per second.
        // We set BATCH_SIZE to 1 and DELAY_MS to 600 to trigger ~1.6 requests/sec, safe under the limit.
        const BATCH_SIZE = 1;
        const DELAY_MS = 600;
        const emailResults = [];

        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
            const batch = subscribers.slice(i, i + BATCH_SIZE);

            if (i > 0) await new Promise(resolve => setTimeout(resolve, DELAY_MS)); // Rate limit protection

            const batchResults = await Promise.all(batch.map(async (sub) => {
                const unsubscribeLink = `https://moonkatrecords.com/unsubscribe?id=${sub.id}`
                const personalGreeting = payload.type === 'release'
                    ? `<p>Hey ${sub.name},</p>`
                    : `<p>Hi ${sub.name},</p>`;

                const finalHtml = `
                    <!DOCTYPE html>
                    <html bgcolor="#000000">
                      <head>
                        <meta charset="utf-8">
                        <meta name="color-scheme" content="dark">
                        <meta name="supported-color-schemes" content="dark">
                        <style>
                          :root { color-scheme: dark; }
                          body { font-family: sans-serif; background-color: #000000 !important; background: #000000 !important; color: #ffffff; margin: 0; padding: 20px; }
                          .container { max-width: 600px; margin: 0 auto; background-color: #111111 !important; background: #111111 !important; border-radius: 10px; overflow: hidden; border: 1px solid #333333; }
                          .header { background-color: #000000 !important; background: #000000 !important; padding: 20px; text-align: center; border-bottom: 1px solid #222222; }
                          .logo { width: 150px; }
                          .content { padding: 40px 20px; text-align: center; color: #cccccc; background-color: #111111 !important; }
                          .cover { width: 100%; max-width: 400px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 30px; }
                          h1 { color: #ffffff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; font-size: 24px; }
                          h2 { color: #ec4899; font-weight: normal; margin-top: 0; margin-bottom: 30px; font-size: 18px; }
                          p { line-height: 1.6; margin-bottom: 20px; color: #cccccc; }
                          .btn { display: inline-block; background-color: #ec4899 !important; background: #ec4899 !important; color: #ffffff !important; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; }
                          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #222222; background-color: #000000 !important; }
                          .link { color: #666666; text-decoration: underline; }
                        </style>
                      </head>
                      <body bgcolor="#000000" style="background-color:#000000 !important; margin:0; padding:20px;">
                        <table width="100%" bgcolor="#000000" cellpadding="0" cellspacing="0" style="background-color:#000000;">
                          <tr><td align="center">
                        <div class="container" style="max-width:600px; background-color:#111111; border-radius:10px; overflow:hidden; border:1px solid #333333;">
                          <div class="header" style="background-color:#000000; padding:20px; text-align:center; border-bottom:1px solid #222222;">
                            <img src="https://moonkatrecords.com/moonkatrecords.png" alt="Moonkat Records" class="logo" style="width:150px;">
                          </div>
                          <div class="content" style="padding:40px 20px; text-align:center; color:#cccccc; background-color:#111111;">
                            ${personalGreeting}
                            ${emailHtmlContent}
                          </div>
                          <div class="footer" style="padding:20px; text-align:center; font-size:12px; color:#666666; border-top:1px solid #222222; background-color:#000000;">
                            <p>You received this email because you are a Moonkat Records subscriber.</p>
                            <p><a href="${unsubscribeLink}" class="link" style="color:#666666; text-decoration:underline;">Unsubscribe</a></p>
                          </div>
                        </div>
                          </td></tr>
                        </table>
                      </body>
                    </html>
                `;

                try {
                    const res = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${RESEND_API_KEY}`,
                        },
                        body: JSON.stringify({
                            from: 'Moonkat Records <hello@moonkatrecords.com>',
                            to: [sub.email],
                            subject: emailSubject,
                            html: finalHtml
                        })
                    })

                    if (!res.ok) {
                        const errorData = await res.json();
                        return { email: sub.email, success: false, error: errorData.message || res.statusText };
                    }
                    return { email: sub.email, success: true };

                } catch (e) {
                    console.error(`Failed to email ${sub.email}`, e)
                    return { email: sub.email, success: false, error: e.message };
                }
            }));

            emailResults.push(...batchResults);
        }

        const successCount = emailResults.filter(r => r.success).length;
        const failures = emailResults.filter(r => !r.success);

        // Check for Sandbox warning
        const isSandboxIssue = failures.some(f => f.error && (f.error.toLowerCase().includes('sandbox') || f.error.toLowerCase().includes('verified')));
        let successMessage = `Sent to ${successCount} of ${subscribers.length} subscribers`;

        if (isSandboxIssue) {
            successMessage += " (WARNING: Resend Sandbox Mode Detected - only verified emails allowe)";
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: successMessage,
                failures: failures.length > 0 ? failures : undefined
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error("Critical Error in send-promo-campaign:", error)
        return new Response(
            JSON.stringify({ success: false, error: error.message || "Internal Server Error" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
