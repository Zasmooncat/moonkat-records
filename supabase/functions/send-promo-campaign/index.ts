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

interface CampaignPayload {
    adminKey: string
    title: string
    artist: string
    coverUrl: string
    promoUrl: string // The full link to /promo/slug
    description: string
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload: CampaignPayload = await req.json()

        // 1. Security Check
        if (payload.adminKey !== ADMIN_SECRET_KEY) {
            throw new Error('Unauthorized: Invalid Admin Key')
        }

        if (!payload.title || !payload.promoUrl) {
            throw new Error('Missing required campaign data')
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

        console.log(`Sending campaign to ${subscribers.length} subscribers...`)

        // 4. Send Emails via Resend (Batching would be ideal, but simple loop for now)
        // Resend Rate Limits apply. Ideally use Batch API or Queue.
        // For MVP, we'll loop sequentially or parallel with Promise.all

        const emailPromises = subscribers.map(async (sub) => {
            const unsubscribeLink = `https://moonkatrecords.com/unsubscribe?id=${sub.id}`

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
                        subject: `New Release: ${payload.title} by ${payload.artist}`,
                        html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; background: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 10px; overflow: hidden; border: 1px solid #333; }
          .header { background: #000; padding: 20px; text-align: center; border-bottom: 1px solid #222; }
          .logo { width: 150px; }
          .content { padding: 40px 20px; text-align: center; }
          .cover { width: 100%; max-width: 400px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 30px; }
          h1 { color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
          h2 { color: #ec4899; font-weight: normal; margin-top: 0; margin-bottom: 30px; }
          p { color: #ccc; line-height: 1.6; margin-bottom: 30px; }
          .btn { display: inline-block; background: #ec4899; color: white; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .btn:hover { background: #db2777; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #222; }
          .link { color: #666; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://moonkatrecords.com/moonkat-logo.png" alt="Moonkat Records" class="logo">
          </div>
          <div class="content">
            <img src="${payload.coverUrl}" alt="${payload.title}" class="cover">
            
            <h1>${payload.title}</h1>
            <h2>${payload.artist}</h2>
            
            <p>Hey ${sub.name},</p>
            <p>${payload.description}</p>
            
            <a href="${payload.promoUrl}" class="btn">Get Promo</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Link expires in 5 minutes after opening.
            </p>
          </div>
          <div class="footer">
            <p>You received this email because you are a Moonkat Records subscriber.</p>
            <p><a href="${unsubscribeLink}" class="link">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
                    `
                    })
                })
                return res.ok
            } catch (e) {
                console.error(`Failed to email ${sub.email}`, e)
                return false
            }
        })

        await Promise.all(emailPromises)

        return new Response(
            JSON.stringify({
                success: true,
                message: `Campaign sent to ${subscribers.length} subscribers`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
