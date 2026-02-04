import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { workoutId, notes, sets } = await request.json();

    // Get or create user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Sonny" } });
    }

    // Create workout log
    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: user.id,
        workoutId,
        notes,
        completed: true,
      },
    });

    // Create set logs
    if (sets && sets.length > 0) {
      await prisma.setLog.createMany({
        data: sets.map(
          (set: {
            exerciseId: number;
            setNumber: number;
            weight: number;
            reps: number;
          }) => ({
            workoutLogId: workoutLog.id,
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
          })
        ),
      });
    }

    return NextResponse.json({ success: true, workoutLogId: workoutLog.id });
  } catch (error) {
    console.error("Error completing workout:", error);
    return NextResponse.json(
      { error: "Failed to complete workout" },
      { status: 500 }
    );
  }
}
