import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getWorkoutsData() {
  const workouts = await prisma.workout.findMany({
    where: { version: "A" },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
      workoutLogs: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { id: "asc" },
  });

  // Get total workout count
  const totalWorkouts = await prisma.workoutLog.count({
    where: { completed: true },
  });

  // Get this week's workouts
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyWorkouts = await prisma.workoutLog.count({
    where: {
      completed: true,
      date: { gte: startOfWeek },
    },
  });

  return { workouts, totalWorkouts, weeklyWorkouts };
}

export default async function WorkoutsPage() {
  const { workouts, totalWorkouts, weeklyWorkouts } = await getWorkoutsData();

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold">Workouts</h1>
        <p className="text-muted-foreground">
          Kinobody Movie Star Program - Phase A
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyWorkouts} / 4</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Phase A</div>
            <p className="text-xs text-muted-foreground">12 week cycle</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {workouts.map((workout) => {
          const lastLog = workout.workoutLogs[0];
          return (
            <Card key={workout.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{workout.name}</span>
                  <Link
                    href={`/workouts/${workout.id}`}
                    className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                  >
                    Start Workout
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {workout.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workout.exercises.map((we) => (
                    <div
                      key={we.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{we.exercise.name}</span>
                      <span className="text-muted-foreground">
                        {we.targetSets} x {we.targetRepsMin}-{we.targetRepsMax} ({we.exercise.method})
                      </span>
                    </div>
                  ))}
                </div>

                {lastLog && (
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    Last completed:{" "}
                    {new Date(lastLog.date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* RPT Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Progression Guidelines (RPT)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Top Set:</strong> Go to technical failure at 4-6 reps
            </li>
            <li>
              <strong>Back-off Sets:</strong> Drop weight 10%, increase reps by 1-2
            </li>
            <li>
              <strong>Progression:</strong> When you hit top of rep range, add 5 lbs next session
            </li>
            <li>
              <strong>Rest:</strong> 3 minutes between heavy sets, 2 minutes for accessories
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
