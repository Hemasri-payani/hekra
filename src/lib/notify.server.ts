/**
 * Server-only notification helpers (SMS via Twilio + in-app notifications).
 * Never import this from client code.
 */

type SmsResult = { sent: boolean; error?: string };

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_PHONE_NUMBER"];

  if (!sid || !token || !from) {
    console.warn("[sms] Twilio credentials missing — skipping SMS send");
    return { sent: false, error: "twilio_not_configured" };
  }

  const normalised = to.trim().startsWith("+") ? to.trim() : `+91${to.replace(/\D/g, "")}`;

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: normalised, From: from, Body: body }).toString(),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[sms] Twilio send failed", res.status, detail);
      return { sent: false, error: `twilio_${res.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("[sms] Twilio request threw", error);
    return { sent: false, error: "twilio_request_failed" };
  }
}
