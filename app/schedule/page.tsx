import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleBlockItem } from "@/components/schedule/schedule-block-item";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

async function getScheduleData() {
  const scheduleBlocks = await prisma.scheduleBlock.findMany({
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const completions = await prisma.scheduleCompletion.findMany({
    where: {
      date: startOfDay,
    },
  });

  const completionMap = new Map(
    completions.map((c) => [c.blockId, c.completed])
  );

  // Group by day
  const byDay = DAYS.map((day) => ({
    day,
    blocks: scheduleBlocks.filter((b) => b.day === day),
  }));

  return { byDay, completionMap, today: startOfDay };
}

export default async function SchedulePage() {
  const { byDay, completionMap, today } = await getScheduleData();
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold">Weekly Schedule</h1>
        <p className="text-muted-foreground">Your daily time blocks</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-sm">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Work
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span className="w-3 h-3 rounded-full bg-purple-500" /> Class
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span className="w-3 h-3 rounded-full bg-orange-500" /> Workout
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Meal
        </span>
        <span className="flex items-center gap-1 text-sm">
          <span className="w-3 h-3 rounded-full bg-gray-500" /> Personal
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {byDay.map(({ day, blocks }) => (
          <Card
            key={day}
            className={day === currentDay ? "border-primary border-2" : ""}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{day}</span>
                {day === currentDay && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Today
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blocks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Rest day</p>
                ) : (
                  blocks.map((block) => (
                    <ScheduleBlockItem
                      key={block.id}
                      block={block}
                      isToday={day === currentDay}
                      isCompleted={completionMap.get(block.id) || false}
                      date={today.toISOString()}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
