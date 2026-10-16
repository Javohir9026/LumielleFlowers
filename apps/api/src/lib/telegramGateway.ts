const gatewayUrl = "https://gatewayapi.telegram.org";

type GatewayResponse<T> = { ok: boolean; result?: T; error?: string };
type RequestStatus = { request_id?: string; verification_status?: { status?: string } };

async function gatewayRequest(method: string, body: Record<string, string | number>) {
  const token = process.env.TELEGRAM_GATEWAY_TOKEN;
  if (!token) throw new Error("Telegram Gateway token sozlanmagan");

  let response: Response;
  try {
    response = await fetch(`${gatewayUrl}/${method}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000)
    });
  } catch {
    throw new Error("Telegram Gateway bilan bog‘lanib bo‘lmadi");
  }

  const data = await response.json().catch(() => null) as GatewayResponse<RequestStatus> | null;
  if (!response.ok || !data?.ok) throw new Error("Telegram orqali kod yuborib bo‘lmadi");
  return data.result ?? {};
}

export async function sendTelegramGatewayCode(phone: string) {
  const result = await gatewayRequest("sendVerificationMessage", { phone_number: phone, code_length: 6, ttl: 300, payload: "lumielle-login" });
  if (!result.request_id) throw new Error("Telegram Gateway so‘rovi noto‘g‘ri qaytdi");
  return result.request_id;
}

export async function verifyTelegramGatewayCode(requestId: string, code: string) {
  const result = await gatewayRequest("checkVerificationStatus", { request_id: requestId, code });
  return result.verification_status?.status;
}
