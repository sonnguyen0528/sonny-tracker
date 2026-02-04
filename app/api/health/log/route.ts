import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, value, unit, notes } = await request.json();

    // Get or create user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    const metric = await prisma.healthMetric.create({
      data: {
        userId: user.id,
        type,
        value,
        unit,
        notes,
      },
    });

    return NextResponse.json({ success: true, id: metric.id });
  } catch (error) {
    console.error("Error logging health metric:", error);
    return NextResponse.json(
      { error: "Failed to log metric" },
      { status: 500 }
    );
  }
}
