"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const METRIC_TYPES = [
  { value: "weight", label: "Weight", unit: "lbs" },
  { value: "waist", label: "Waist", unit: "inches" },
  { value: "vitamin_d", label: "Vitamin D", unit: "ng/mL" },
  { value: "alt", label: "ALT (Liver)", unit: "U/L" },
  { value: "uric_acid", label: "Uric Acid", unit: "mg/dL" },
  { value: "fasting_glucose", label: "Fasting Glucose", unit: "mg/dL" },
  { value: "testosterone", label: "Testosterone", unit: "ng/dL" },
  { value: "ldl", label: "LDL Cholesterol", unit: "mg/dL" },
  { value: "hdl", label: "HDL Cholesterol", unit: "mg/dL" },
  { value: "triglycerides", label: "Triglycerides", unit: "mg/dL" },
];

export function MetricLogger() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedType = METRIC_TYPES.find((t) => t.value === type);

  const logMetric = async () => {
    if (!type || !value) return;

    setLoading(true);
    try {
      const response = await fetch("/api/health/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          value: parseFloat(value),
          unit: selectedType?.unit || "",
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        setType("");
        setValue("");
        setNotes("");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to log metric", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Log Metric
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="metric-type">Metric Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="metric-type">
              <SelectValue placeholder="Select metric..." />
            </SelectTrigger>
            <SelectContent>
              {METRIC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metric-value">
            Value {selectedType && `(${selectedType.unit})`}
          </Label>
          <Input
            id="metric-value"
            type="number"
            step="0.1"
            placeholder={selectedType ? `e.g., ${type === "weight" ? "195" : "50"}` : ""}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metric-notes">Notes (optional)</Label>
          <Input
            id="metric-notes"
            placeholder="Any context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          onClick={logMetric}
          disabled={!type || !value || loading}
        >
          {loading ? "Logging..." : "Log Metric"}
        </Button>
      </CardContent>
    </Card>
  );
}
