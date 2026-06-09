import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  isResource,
  getDelegate,
  getConfig,
  buildSchema,
  pickFields,
} from "@/lib/resources.server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!isResource(params.resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = getConfig(params.resource);
  const body = await req.json();

  // Wiadomości: dozwolona tylko zmiana statusu "przeczytane"
  if (config.readOnly) {
    if (typeof body.read !== "boolean") {
      return NextResponse.json({ error: "Read only" }, { status: 403 });
    }
    const item = await getDelegate(params.resource).update({
      where: { id: params.id },
      data: { read: body.read },
    });
    return NextResponse.json({ item });
  }

  const parsed = buildSchema(config).partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const data = pickFields(config, parsed.data);
  try {
    const item = await getDelegate(params.resource).update({
      where: { id: params.id },
      data,
    });
    logAudit(s, "UPDATE", params.resource, (data as any).titlePl || (data as any).namePl || (data as any).slug || params.id);
    return NextResponse.json({ item });
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Taki slug/adres już istnieje" : "Nie udało się zapisać zmian";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { resource: string; id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!isResource(params.resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await getDelegate(params.resource).delete({ where: { id: params.id } });
  logAudit(s, "DELETE", params.resource, params.id);
  return NextResponse.json({ ok: true });
}
