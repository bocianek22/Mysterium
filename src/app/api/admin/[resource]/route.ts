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

export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!isResource(params.resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const delegate = getDelegate(params.resource);
  const config = getConfig(params.resource);
  const orderBy = config.readOnly ? { createdAt: "desc" } : { order: "asc" };
  const items = await delegate.findMany({ orderBy });
  return NextResponse.json({ items });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { resource: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!isResource(params.resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = getConfig(params.resource);
  if (config.readOnly) return NextResponse.json({ error: "Read only" }, { status: 403 });

  const body = await req.json();
  const parsed = buildSchema(config).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" },
      { status: 400 }
    );
  }
  const data = pickFields(config, parsed.data);
  try {
    const item = await getDelegate(params.resource).create({ data });
    logAudit(s, "CREATE", params.resource, (data as any).titlePl || (data as any).namePl || (data as any).slug || item.id);
    return NextResponse.json({ item });
  } catch (e: any) {
    const msg = e?.code === "P2002" ? "Taki slug/adres już istnieje" : "Nie udało się utworzyć pozycji";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
