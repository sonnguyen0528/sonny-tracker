import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { blockId, date, completed } = await request.json();

    // Get or create user (for simplicity, we use user id 1)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Upsert completion record
    await prisma.scheduleCompletion.upsert({
      where: {
        userId_blockId_date: {
          userId: user.id,
          blockId,
          date: dateObj,
        },
      },
      update: { completed },
      create: {
        userId: user.id,
        blockId,
        date: dateObj,
        completed,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating schedule completion:", error);
    return NextResponse.json(
      { error: "Failed to update completion" },
      { status: 500 }
    );
  }
}
