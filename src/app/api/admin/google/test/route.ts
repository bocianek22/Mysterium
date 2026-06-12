import { NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { testGoogleSync } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const result = await testGoogleSync();
  return NextResponse.json(result);
}
