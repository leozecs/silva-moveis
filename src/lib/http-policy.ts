export class StoreError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = "store_error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new StoreError(403, "Origem da solicitação inválida.", "invalid_origin");
  }
}

export async function readJsonObject(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new StoreError(415, "Envie dados em JSON.");
  }
  // Limit the stream, not just Content-Length (which the caller can omit).
  const reader = request.body?.getReader();
  if (!reader) throw new StoreError(400, "Dados ausentes.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) { await reader.cancel(); throw new StoreError(413, "Solicitação muito grande."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch { throw new StoreError(400, "Dados inválidos."); }
}

export function requireId(value: unknown, prefix: string) {
  if (typeof value !== "string" || !new RegExp(`^${prefix}_[A-Za-z0-9]{6,80}$`).test(value)) {
    throw new StoreError(400, "Identificador inválido.");
  }
  return value;
}

export function requireQuantity(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > 999) {
    throw new StoreError(400, "A quantidade deve ser um número inteiro entre 1 e 999.");
  }
  return value;
}
