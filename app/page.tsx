import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Utensils,
  Scale,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";

async function getDashboardData() {
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Get today's schedule
  const scheduleBlocks = await prisma.scheduleBlock.findMany({
    where: { day: dayName },
    orderBy: { startTime: "asc" },
  });

  // Get today's nutrition
  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { meal: true },
  });

  // Calculate daily macros
  const dailyMacros = nutritionLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.meal.calories * log.servings,
      protein: acc.protein + log.meal.protein * log.servings,
      carbs: acc.carbs + log.meal.carbs * log.servings,
      fats: acc.fats + log.meal.fats * log.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Get latest weight
  const latestWeight = await prisma.healthMetric.findFirst({
    where: { type: "weight" },
    orderBy: { date: "desc" },
  });

  // Get workouts
  const workouts = await prisma.workout.findMany({
    where: { version: "A" },
    orderBy: { id: "asc" },
  });

  // Get workout count this week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyWorkouts = await prisma.workoutLog.count({
    where: {
      date: {
        gte: startOfWeek,
      },
      completed: true,
    },
  });

  return {
    scheduleBlocks,
    dailyMacros,
    latestWeight,
    workouts,
    weeklyWorkouts,
    dayName,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  const CALORIE_TARGET = 2450;
  const PROTEIN_TARGET = 172;

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

  // Find current and next blocks
  const currentBlock = data.scheduleBlocks.find(
    (block) => block.startTime <= currentTimeString && block.endTime > currentTimeString
  );
  const nextBlock = data.scheduleBlocks.find(
    (block) => block.startTime > currentTimeString
  );

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{data.dayName}, {new Date().toLocaleDateString()}</p>
      </div>

      {/* Current Activity */}
      {currentBlock && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentBlock.title}</p>
            <p className="text-muted-foreground">
              {formatTime(currentBlock.startTime)} - {formatTime(currentBlock.endTime)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.latestWeight?.value || "--"} lbs
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 185-190 lbs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weeklyWorkouts} / 4</div>
            <p className="text-xs text-muted-foreground">
              {4 - data.weeklyWorkouts} remaining this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.dailyMacros.calories)}
            </div>
            <Progress
              value={(data.dailyMacros.calories / CALORIE_TARGET) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              of {CALORIE_TARGET} cal target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.dailyMacros.protein)}g
            </div>
            <Progress
              value={(data.dailyMacros.protein / PROTEIN_TARGET) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              of {PROTEIN_TARGET}g target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule and Workouts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.scheduleBlocks.slice(0, 6).map((block) => {
                const isPast = block.endTime < currentTimeString;
                const isCurrent = block === currentBlock;
                return (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      isCurrent
                        ? "bg-primary/10 border border-primary"
                        : isPast
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          block.type === "workout"
                            ? "bg-orange-500"
                            : block.type === "meal"
                            ? "bg-green-500"
                            : block.type === "work"
                            ? "bg-blue-500"
                            : block.type === "class"
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="font-medium">{block.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(block.startTime)}
                    </span>
                  </div>
                );
              })}
              {data.scheduleBlocks.length > 6 && (
                <Link
                  href="/schedule"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  View full schedule
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.workouts.map((workout) => (
                <Link
                  key={workout.id}
                  href={`/workouts/${workout.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workout.description}
                    </p>
                  </div>
                  <span className="text-primary">Start</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Up Next */}
      {nextBlock && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Up Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{nextBlock.title}</p>
            <p className="text-muted-foreground">
              {formatTime(nextBlock.startTime)} - {formatTime(nextBlock.endTime)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
