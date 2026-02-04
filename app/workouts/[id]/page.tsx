import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { WorkoutSession } from "@/components/workouts/workout-session";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWorkoutData(id: number) {
  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!workout) return null;

  // Get previous logs for each exercise (for showing history/PRs)
  const exerciseIds = workout.exercises.map((we) => we.exerciseId);
  const previousLogs = await prisma.setLog.findMany({
    where: {
      exerciseId: { in: exerciseIds },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get exercise PRs (max weight for each exercise)
  const prs = new Map<number, { weight: number; reps: number }>();
  for (const log of previousLogs) {
    const existing = prs.get(log.exerciseId);
    if (!existing || log.weight > existing.weight) {
      prs.set(log.exerciseId, { weight: log.weight, reps: log.reps });
    }
  }

  // Get last workout session for this workout
  const lastSession = await prisma.workoutLog.findFirst({
    where: { workoutId: id, completed: true },
    orderBy: { date: "desc" },
    include: {
      setLogs: true,
    },
  });

  return { workout, prs: Object.fromEntries(prs), lastSession };
}

export default async function WorkoutPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    notFound();
  }

  const data = await getWorkoutData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <WorkoutSession
        workout={data.workout}
        prs={data.prs}
        lastSession={data.lastSession}
      />
    </div>
  );
}
