# Mechanical Engineering Professional Track

Static Arabic RTL landing page for Engosoft.

## Vercel environment variables

- `LEADS_WEBHOOK_URL`: required destination for registration leads.
- `LEADS_WEBHOOK_TOKEN`: optional bearer token sent to the webhook.

The form never shows a fake success state. If the webhook is not configured or rejects the request, the page offers WhatsApp as a fallback.
