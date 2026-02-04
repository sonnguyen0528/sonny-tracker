import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, calories, protein, carbs, fats } = await request.json();

    // Get or create user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    // Create the meal
    const meal = await prisma.meal.create({
      data: {
        name,
        calories,
        protein,
        carbs,
        fats,
        category: "custom",
      },
    });

    // Log it immediately
    const nutritionLog = await prisma.nutritionLog.create({
      data: {
        userId: user.id,
        mealId: meal.id,
        servings: 1,
      },
    });

    return NextResponse.json({
      success: true,
      mealId: meal.id,
      logId: nutritionLog.id,
    });
  } catch (error) {
    console.error("Error quick adding meal:", error);
    return NextResponse.json(
      { error: "Failed to add meal" },
      { status: 500 }
    );
  }
}
