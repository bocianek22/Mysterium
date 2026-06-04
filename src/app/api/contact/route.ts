import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(1).max(5000),
  coupon: z.string().max(100).optional().or(z.literal("")),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const d = parsed.data;
    if (d.website) {
      // bot — udajemy sukces
      return NextResponse.json({ ok: true });
    }
    await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        subject: d.subject || null,
        message: d.message,
        coupon: d.coupon || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
