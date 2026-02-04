"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Leaf } from "lucide-react";

interface Medication {
  id: number;
  name: string;
  dose: string;
  timing: string;
  type: string;
}

interface MedicationChecklistProps {
  title: string;
  items: Medication[];
  loggedIds: Set<number>;
  date: string;
}

export function MedicationChecklist({
  title,
  items,
  loggedIds,
  date,
}: MedicationChecklistProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [localLogged, setLocalLogged] = useState(loggedIds);

  const toggleMedication = async (medicationId: number, taken: boolean) => {
    setLoading(medicationId);
    try {
      const response = await fetch("/api/health/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId,
          date,
          taken,
        }),
      });

      if (response.ok) {
        const newLogged = new Set(localLogged);
        if (taken) {
          newLogged.add(medicationId);
        } else {
          newLogged.delete(medicationId);
        }
        setLocalLogged(newLogged);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update medication", error);
    } finally {
      setLoading(null);
    }
  };

  const timingLabels: Record<string, string> = {
    morning: "Morning",
    with_food: "With Food",
    evening: "Evening",
    before_bed: "Before Bed",
  };

  const Icon = title === "Medications" ? Pill : Leaf;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = localLogged.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isChecked ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    toggleMedication(item.id, !!checked)
                  }
                  disabled={loading === item.id}
                />
                <div className="flex-1">
                  <p className={`font-medium ${isChecked ? "line-through opacity-60" : ""}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.dose} • {timingLabels[item.timing] || item.timing}
                  </p>
                </div>
                {isChecked && (
                  <span className="text-xs text-green-600 font-medium">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
