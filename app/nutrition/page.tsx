export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NutritionLogger } from "@/components/nutrition/nutrition-logger";

const TARGETS = {
  calories: 2450,
  protein: 172,
  carbs: 275,
  fats: 82,
};

async function getNutritionData() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Get today's logs
  const todayLogs = await prisma.nutritionLog.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { meal: true },
    orderBy: { date: "desc" },
  });

  // Calculate daily totals
  const dailyTotals = todayLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.meal.calories * log.servings,
      protein: acc.protein + log.meal.protein * log.servings,
      carbs: acc.carbs + log.meal.carbs * log.servings,
      fats: acc.fats + log.meal.fats * log.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Get all available meals
  const meals = await prisma.meal.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return { todayLogs, dailyTotals, meals };
}

export default async function NutritionPage() {
  const { todayLogs, dailyTotals, meals } = await getNutritionData();

  const macros = [
    {
      name: "Calories",
      current: dailyTotals.calories,
      target: TARGETS.calories,
      unit: "cal",
      color: "bg-orange-500",
    },
    {
      name: "Protein",
      current: dailyTotals.protein,
      target: TARGETS.protein,
      unit: "g",
      color: "bg-red-500",
    },
    {
      name: "Carbs",
      current: dailyTotals.carbs,
      target: TARGETS.carbs,
      unit: "g",
      color: "bg-blue-500",
    },
    {
      name: "Fats",
      current: dailyTotals.fats,
      target: TARGETS.fats,
      unit: "g",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold">Nutrition</h1>
        <p className="text-muted-foreground">
          Track your daily meals and macros
        </p>
      </div>

      {/* Daily Macro Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {macros.map((macro) => {
          const percentage = Math.min(
            (macro.current / macro.target) * 100,
            100
          );
          const remaining = macro.target - macro.current;
          return (
            <Card key={macro.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>{macro.name}</span>
                  <span
                    className={
                      percentage >= 100 ? "text-green-500" : "text-muted-foreground"
                    }
                  >
                    {Math.round(macro.current)} / {macro.target}
                    {macro.unit}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {remaining > 0
                    ? `${Math.round(remaining)}${macro.unit} remaining`
                    : "Target reached!"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meal Logging */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NutritionLogger meals={meals} />

        {/* Today's Log */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Log</CardTitle>
          </CardHeader>
          <CardContent>
            {todayLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No meals logged today
              </p>
            ) : (
              <div className="space-y-3">
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{log.meal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.servings !== 1 && `${log.servings}x - `}
                        {Math.round(log.meal.calories * log.servings)} cal,{" "}
                        {Math.round(log.meal.protein * log.servings)}g protein
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meal Timing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Timing (Kinobody)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold">Meal 1 (12-1 PM)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Break fast with moderate protein and carbs. ~600-800 cal
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold">Dinner Feast (6-7 PM)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Main meal of the day. High protein, satisfying. ~1200-1400 cal
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold">Late Night (Optional)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Light snack if needed. Casein protein or Greek yogurt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
