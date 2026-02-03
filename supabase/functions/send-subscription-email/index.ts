// Supabase Edge Function to send subscription confirmation emails
// This function is triggered by a database trigger when a new subscription is created

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionData {
  name: string
  email: string
  ip?: string
  city?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { name, email, ip, city }: SubscriptionData = await req.json()

    console.log(`Processing subscription for: ${name} (${email})`)

    // Validate required fields
    if (!name || !email) {
      throw new Error('Missing required fields: name and email')
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    // 1. Send welcome email to subscriber
    const welcomeEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Moonkat Records <hello@moonkatrecords.com>',
        to: [email],
        subject: 'Welcome to Moonkat Records!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                 .header {
                  background: linear-gradient(to bottom, #171717ff 0%, #653955ff 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                }
                .logo {
                  max-width: 300px;
                  height: auto;
                 
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  color: #666;
                  font-size: 14px;
                }
                h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .greeting {
                  font-size: 20px;
                  font-weight: bold;
                  color: #381e3cff;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="https://www.moonkatrecords.com/moonkat-logo.png" alt="Moonkat Records" class="logo" />
              </div>
              <div class="content">
                <p class="greeting">Thank you for subscribing, ${name}!</p>
                <p>We're excited to have you on our promo list. You'll be the first to know about our latest releases, exclusive tracks, and upcoming events.</p>
                <p>Stay tuned for amazing music!</p>
                <p style="margin-top: 30px;">
                  <strong>Best regards,</strong><br>
                  Moonkat Records
                </p>
              </div>
              <div class="footer">
                <p>You're receiving this email because you subscribed to Moonkat Records.</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!welcomeEmailRes.ok) {
      const error = await welcomeEmailRes.text()
      throw new Error(`Resend API error (welcome email): ${error}`)
    }

    const welcomeData = await welcomeEmailRes.json()
    console.log(`Welcome email sent to ${email}. ID: ${welcomeData.id}`)

    // 2. Send notification email to admin
    const notificationEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Moonkat Records <hello@moonkatrecords.com>',
        to: ['moonkatrecords@gmail.com'],
        subject: '🎉 New Subscriber!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .content {
                  background: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .info-box {
                  background: white;
                  border-left: 4px solid #667eea;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .info-label {
                  font-weight: bold;
                  color: #667eea;
                  margin-bottom: 5px;
                }
                h1 {
                  margin: 0;
                  font-size: 28px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎉 New Subscriber!</h1>
              </div>
              <div class="content">
                <p>You have a new subscriber to your promo list:</p>
                
                <div class="info-box">
                  <div class="info-label">Name:</div>
                  <div>${name}</div>
                </div>
                
                <div class="info-box">
                  <div class="info-label">Email:</div>
                  <div>${email}</div>
                </div>

                ${city ? `
                <div class="info-box">
                  <div class="info-label">City:</div>
                  <div>${city}</div>
                </div>` : ''}

                ${ip ? `
                <div class="info-box">
                  <div class="info-label">IP Address:</div>
                  <div>${ip}</div>
                </div>` : ''}
                
                <div class="info-box">
                  <div class="info-label">Subscribed:</div>
                  <div>${new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'Europe/Madrid'
        })}</div>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  This is an automated notification from your Moonkat Records subscription system.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!notificationEmailRes.ok) {
      const notifError = await notificationEmailRes.text()
      console.error(`Failed to send notification email: ${notifError}`)
      // Don't throw error - we don't want to fail the whole process if admin notification fails
    } else {
      const notificationData = await notificationEmailRes.json()
      console.log(`Notification email sent to admin. ID: ${notificationData.id}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        welcomeEmailId: welcomeData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending email:', error)

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
