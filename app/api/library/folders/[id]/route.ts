export const dynamic = "force-dynamic";
function removed() { return Response.json({ error: "Setup and folders have been removed. Use study sets instead." }, { status: 410, headers: { "Cache-Control": "no-store" } }); }
export const GET = removed;
export const POST = removed;
export const PATCH = removed;
export const DELETE = removed;
