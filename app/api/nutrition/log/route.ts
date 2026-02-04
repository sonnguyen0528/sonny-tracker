import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { mealId, servings } = await request.json();

    // Get or create user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    const nutritionLog = await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        mealId,
        servings,
      },
    });

    return NextResponse.json({ success: true, id: nutritionLog.id });
  } catch (error) {
    console.error("Error logging nutrition:", error);
    return NextResponse.json(
      { error: "Failed to log nutrition" },
      { status: 500 }
    );
  }
}
