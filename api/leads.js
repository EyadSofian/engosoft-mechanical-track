const REQUIRED_FIELDS = [
  "full_name",
  "phone",
  "country_code",
  "country",
  "job_description",
  "course_slug"
];

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Method not allowed." });
  }

  const webhookUrl = process.env.LEADS_WEBHOOK_URL;
  if (!webhookUrl) {
    return response.status(503).json({ message: "Lead service is not configured." });
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});

  if (body.company_website) {
    return response.status(200).json({ ok: true });
  }

  const missing = REQUIRED_FIELDS.filter((field) => !String(body[field] || "").trim());
  if (missing.length || body.consent !== true) {
    return response.status(400).json({ message: "Required fields are missing." });
  }

  const lead = {
    full_name: String(body.full_name).trim().slice(0, 120),
    phone: String(body.phone).trim().slice(0, 40),
    country_code: String(body.country_code).trim().slice(0, 8),
    country: String(body.country).trim().slice(0, 80),
    job_description: String(body.job_description).trim().slice(0, 160),
    course_name: "Mechanical Engineering Professional Track",
    course_slug: "mechanical-professional-track",
    lead_source: String(body.lead_source || "landing_page").slice(0, 120),
    page_url: String(body.page_url || "").slice(0, 500),
    referrer: String(body.referrer || "").slice(0, 500),
    utm_source: String(body.utm_source || "").slice(0, 160),
    utm_medium: String(body.utm_medium || "").slice(0, 160),
    utm_campaign: String(body.utm_campaign || "").slice(0, 160),
    utm_content: String(body.utm_content || "").slice(0, 160),
    utm_term: String(body.utm_term || "").slice(0, 160),
    created_at: new Date().toISOString()
  };

  const headers = { "Content-Type": "application/json" };
  if (process.env.LEADS_WEBHOOK_TOKEN) {
    headers.Authorization = `Bearer ${process.env.LEADS_WEBHOOK_TOKEN}`;
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(lead)
    });

    if (!upstream.ok) {
      return response.status(502).json({ message: "Lead service rejected the request." });
    }

    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ message: "Lead service is unavailable." });
  }
};
