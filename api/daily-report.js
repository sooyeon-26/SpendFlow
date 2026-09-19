export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.N8N_DAILY_REPORT_WEBHOOK_URL;
  if (!webhookUrl) {
    return response.status(503).json({ error: "Daily report automation is not configured" });
  }

  if (!request.body || request.body.eventType !== "DAILY_SPENDING_REPORT") {
    return response.status(400).json({ error: "Invalid daily report" });
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.body),
    });

    if (!webhookResponse.ok) {
      return response.status(502).json({ error: "Automation service rejected the request" });
    }

    return response.status(204).end();
  } catch {
    return response.status(502).json({ error: "Automation service is unavailable" });
  }
}
