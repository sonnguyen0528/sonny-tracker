import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { medicationId, date, taken } = await request.json();

    // Get or create user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Upsert medication log
    await prisma.medicationLog.upsert({
      where: {
        userId_medicationId_date: {
          userId: user.id,
          medicationId,
          date: dateObj,
        },
      },
      update: { taken },
      create: {
        userId: user.id,
        medicationId,
        date: dateObj,
        taken,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating medication log:", error);
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    );
  }
}
