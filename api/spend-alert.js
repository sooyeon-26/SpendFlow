export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.N8N_SPEND_ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return response.status(503).json({ error: "Spend alert automation is not configured" });
  }

  if (!request.body || request.body.event !== "expense_created") {
    return response.status(400).json({ error: "Invalid expense event" });
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
