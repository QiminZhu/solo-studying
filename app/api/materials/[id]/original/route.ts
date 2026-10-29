import { getChatGPTUser } from "@/app/chatgpt-auth";
import { materialBucket, materialError, ownedMaterial, privateHeaders } from "@/lib/material-store";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  try {
    const row = await ownedMaterial((await context.params).id, user.userId);
    if (!row || row.archived) return Response.json({ error: "Material not found." }, { status: 404, headers: privateHeaders });
    const file = await materialBucket().get(row.originalKey);
    if (!file) return Response.json({ error: "Original file not found." }, { status: 404, headers: privateHeaders });
    return new Response(file.body, { headers: { ...privateHeaders, "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`, "Content-Length": String(file.size) } });
  } catch (e) { return materialError(e); }
}
