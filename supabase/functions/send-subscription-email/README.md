# Email Confirmation System

Automated email confirmations for new subscribers using Supabase Edge Functions + Resend.

## Quick Start

1. **Get Resend API Key**: Sign up at [resend.com](https://resend.com)
2. **Set Secret**: `supabase secrets set RESEND_API_KEY=your_key`
3. **Deploy**: `supabase functions deploy send-subscription-email --no-verify-jwt`
4. **Create Webhook**: Follow instructions in [deployment_guide.md](file:///Users/zasmooncat/.gemini/antigravity/brain/7f77cd3c-f677-4bd2-84f5-63811db2efe8/deployment_guide.md)

## Email Template

Personalized welcome email with:
- Subject: "Welcome to Moonkat Records!"
- Greeting: "Thank you for subscribing, {name}!"
- Beautiful HTML design with gradient header

## Files

- `index.ts` - Edge Function code
- `deno.json` - Deno configuration

## Documentation

📖 [Full Deployment Guide](file:///Users/zasmooncat/.gemini/antigravity/brain/7f77cd3c-f677-4bd2-84f5-63811db2efe8/deployment_guide.md)  
📝 [Implementation Walkthrough](file:///Users/zasmooncat/.gemini/antigravity/brain/7f77cd3c-f677-4bd2-84f5-63811db2efe8/walkthrough.md)
