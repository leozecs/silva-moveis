import { merchantClient } from "@/lib/merchant-api";
import { assertSameOrigin, StoreError } from "@/lib/http-policy";
import { privateJson, storeFailure } from "@/lib/store-server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const api = await merchantClient();
    const type = request.headers.get("content-type") ?? "";
    if (!type.startsWith("multipart/form-data")) throw new StoreError(415, "Envie uma imagem.");
    const reader = request.body?.getReader();
    if (!reader) throw new StoreError(400, "Arquivo ausente.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 3 * 1024 * 1024) { await reader.cancel(); throw new StoreError(413, "Use imagens de até 2 MB."); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const data = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": type } }).formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size > 2 * 1024 * 1024) throw new StoreError(400, "Selecione uma imagem de até 2 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    if (!(png && file.type === "image/png") && !(jpg && file.type === "image/jpeg") && !(webp && file.type === "image/webp")) throw new StoreError(415, "Use uma imagem PNG, JPEG ou WebP válida.");
    const form = new FormData();
    form.append("files", file, `${crypto.randomUUID()}.${png ? "png" : jpg ? "jpg" : "webp"}`);
    return privateJson(await api("/admin/uploads", "POST", form));
  } catch (error) { return storeFailure(error); }
}
