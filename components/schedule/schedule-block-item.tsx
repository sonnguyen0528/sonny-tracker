"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTime } from "@/lib/utils";

interface ScheduleBlock {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  type: string;
}

interface ScheduleBlockItemProps {
  block: ScheduleBlock;
  isToday: boolean;
  isCompleted: boolean;
  date: string;
}

export function ScheduleBlockItem({
  block,
  isToday,
  isCompleted: initialCompleted,
  date,
}: ScheduleBlockItemProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggleCompletion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/schedule/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: block.id,
          date,
          completed: !completed,
        }),
      });

      if (response.ok) {
        setCompleted(!completed);
      }
    } catch (error) {
      console.error("Failed to update completion", error);
    } finally {
      setLoading(false);
    }
  };

  const typeColor = {
    workout: "bg-orange-500",
    meal: "bg-green-500",
    work: "bg-blue-500",
    class: "bg-purple-500",
    personal: "bg-gray-500",
    sleep: "bg-indigo-500",
  }[block.type] || "bg-gray-500";

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded transition-opacity ${
        completed ? "opacity-50" : ""
      }`}
    >
      {isToday && (
        <Checkbox
          checked={completed}
          onCheckedChange={toggleCompletion}
          disabled={loading}
        />
      )}
      <span className={`w-2 h-2 rounded-full ${typeColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${completed ? "line-through" : ""}`}>
          {block.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTime(block.startTime)} - {formatTime(block.endTime)}
        </p>
      </div>
    </div>
  );
}
