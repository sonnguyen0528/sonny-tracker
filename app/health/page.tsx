export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, TestTube, Pill, TrendingDown } from "lucide-react";
import { WeightChart } from "@/components/health/weight-chart";
import { MetricLogger } from "@/components/health/metric-logger";
import { MedicationChecklist } from "@/components/health/medication-checklist";

async function getHealthData() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Get weight history (last 30 entries)
  const weightHistory = await prisma.healthMetric.findMany({
    where: { type: "weight" },
    orderBy: { date: "desc" },
    take: 30,
  });

  // Get waist history
  const waistHistory = await prisma.healthMetric.findMany({
    where: { type: "waist" },
    orderBy: { date: "desc" },
    take: 30,
  });

  // Get lab results
  const labResults = await prisma.healthMetric.findMany({
    where: {
      type: {
        notIn: ["weight", "waist"],
      },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  // Get medications and supplements
  const medications = await prisma.medication.findMany({
    orderBy: [{ type: "asc" }, { timing: "asc" }],
  });

  // Get today's medication logs
  const medicationLogs = await prisma.medicationLog.findMany({
    where: {
      date: {
        gte: startOfDay,
      },
    },
  });

  const loggedMeds = new Set(
    medicationLogs.filter((l) => l.taken).map((l) => l.medicationId)
  );

  return {
    weightHistory: weightHistory.reverse(),
    waistHistory: waistHistory.reverse(),
    labResults,
    medications,
    loggedMeds,
    today: startOfDay,
  };
}

export default async function HealthPage() {
  const data = await getHealthData();

  const currentWeight = data.weightHistory[data.weightHistory.length - 1]?.value;
  const currentWaist = data.waistHistory[data.waistHistory.length - 1]?.value;
  const targetWeight = 187.5; // Middle of 185-190

  const meds = data.medications.filter((m) => m.type === "medication");
  const supps = data.medications.filter((m) => m.type === "supplement");

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold">Health</h1>
        <p className="text-muted-foreground">
          Track your metrics, labs, and medications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight || "--"} lbs
            </div>
            {currentWeight && (
              <p
                className={`text-xs ${
                  currentWeight > targetWeight
                    ? "text-orange-500"
                    : "text-green-500"
                }`}
              >
                {currentWeight > targetWeight
                  ? `${(currentWeight - targetWeight).toFixed(1)} lbs above target`
                  : `${(targetWeight - currentWeight).toFixed(1)} lbs below target`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waist</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWaist || "--"}&quot;
            </div>
            <p className="text-xs text-muted-foreground">Target: 32-33&quot;</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meds Today</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.loggedMeds.size} / {meds.length}
            </div>
            <p className="text-xs text-muted-foreground">medications taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supps Today</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(data.loggedMeds).filter((id) =>
                supps.some((s) => s.id === id)
              ).length}{" "}
              / {supps.length}
            </div>
            <p className="text-xs text-muted-foreground">supplements taken</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Weight & Measurements</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Weight Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart
                  data={data.weightHistory.map((w) => ({
                    date: new Date(w.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    value: w.value,
                  }))}
                  target={targetWeight}
                />
              </CardContent>
            </Card>

            {/* Log New Metric */}
            <MetricLogger />
          </div>

          {/* 90-Day Goals */}
          <Card>
            <CardHeader>
              <CardTitle>90-Day Target Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold">Weight</h4>
                  <p className="text-2xl font-bold mt-1">
                    {currentWeight || "--"} → 185-190 lbs
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lean muscle retention while cutting
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold">Waist</h4>
                  <p className="text-2xl font-bold mt-1">
                    {currentWaist || "--"}&quot; → 32-33&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visible abs territory
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold">Body Comp</h4>
                  <p className="text-2xl font-bold mt-1">Movie Star</p>
                  <p className="text-sm text-muted-foreground">
                    ~12% body fat target
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <MedicationChecklist
              title="Medications"
              items={meds}
              loggedIds={data.loggedMeds}
              date={data.today.toISOString()}
            />
            <MedicationChecklist
              title="Supplements"
              items={supps}
              loggedIds={data.loggedMeds}
              date={data.today.toISOString()}
            />
          </div>

          {/* Medication Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Morning</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.medications
                      .filter((m) => m.timing === "morning")
                      .map((m) => (
                        <li key={m.id}>
                          {m.name} - {m.dose}
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-semibold text-green-800">With Food</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.medications
                      .filter((m) => m.timing === "with_food")
                      .map((m) => (
                        <li key={m.id}>
                          {m.name} - {m.dose}
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <h4 className="font-semibold text-purple-800">Evening</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.medications
                      .filter((m) => m.timing === "evening")
                      .map((m) => (
                        <li key={m.id}>
                          {m.name} - {m.dose}
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800">Before Bed</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.medications
                      .filter((m) => m.timing === "before_bed")
                      .map((m) => (
                        <li key={m.id}>
                          {m.name} - {m.dose}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Results</CardTitle>
            </CardHeader>
            <CardContent>
              {data.labResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No lab results recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {data.labResults.map((lab) => (
                    <div
                      key={lab.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {lab.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lab.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {lab.value} {lab.unit}
                        </p>
                        {lab.notes && (
                          <p className="text-xs text-muted-foreground">
                            {lab.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Labs to Track */}
          <Card>
            <CardHeader>
              <CardTitle>Labs to Monitor (VA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-3 rounded border">
                  <h4 className="font-medium">Vitamin D</h4>
                  <p className="text-sm text-muted-foreground">
                    Target: 40-60 ng/mL
                  </p>
                </div>
                <div className="p-3 rounded border">
                  <h4 className="font-medium">ALT (Liver)</h4>
                  <p className="text-sm text-muted-foreground">
                    Normal: &lt;40 U/L
                  </p>
                </div>
                <div className="p-3 rounded border">
                  <h4 className="font-medium">Uric Acid</h4>
                  <p className="text-sm text-muted-foreground">
                    Target: &lt;6.0 mg/dL
                  </p>
                </div>
                <div className="p-3 rounded border">
                  <h4 className="font-medium">Fasting Glucose</h4>
                  <p className="text-sm text-muted-foreground">
                    Normal: 70-100 mg/dL
                  </p>
                </div>
                <div className="p-3 rounded border">
                  <h4 className="font-medium">Testosterone</h4>
                  <p className="text-sm text-muted-foreground">
                    Normal: 300-1000 ng/dL
                  </p>
                </div>
                <div className="p-3 rounded border">
                  <h4 className="font-medium">Lipid Panel</h4>
                  <p className="text-sm text-muted-foreground">
                    LDL, HDL, Triglycerides
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
