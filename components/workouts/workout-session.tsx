"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trophy, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  method: string;
  notes: string | null;
}

interface WorkoutExercise {
  id: number;
  exerciseId: number;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  exercise: Exercise;
}

interface Workout {
  id: number;
  name: string;
  version: string;
  description: string | null;
  exercises: WorkoutExercise[];
}

interface SetLog {
  id: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
}

interface LastSession {
  id: number;
  date: Date;
  setLogs: SetLog[];
}

interface WorkoutSessionProps {
  workout: Workout;
  prs: Record<number, { weight: number; reps: number }>;
  lastSession: LastSession | null;
}

interface SetData {
  weight: string;
  reps: string;
  completed: boolean;
}

export function WorkoutSession({ workout, prs, lastSession }: WorkoutSessionProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [notes, setNotes] = useState("");

  // Initialize sets state for all exercises
  const [exerciseSets, setExerciseSets] = useState<Record<number, SetData[]>>(
    () => {
      const initial: Record<number, SetData[]> = {};
      workout.exercises.forEach((we) => {
        // Try to get last session's weights for this exercise
        const lastLogs = lastSession?.setLogs.filter(
          (sl) => sl.exerciseId === we.exerciseId
        );

        initial[we.exerciseId] = Array.from(
          { length: we.targetSets },
          (_, i) => {
            const lastLog = lastLogs?.find((l) => l.setNumber === i + 1);
            return {
              weight: lastLog?.weight.toString() || "",
              reps: lastLog?.reps.toString() || "",
              completed: false,
            };
          }
        );
      });
      return initial;
    }
  );

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSets = exerciseSets[currentExercise.exerciseId];
  const pr = prs[currentExercise.exerciseId];

  const updateSet = (
    exerciseId: number,
    setIndex: number,
    field: keyof SetData,
    value: string | boolean
  ) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  };

  const completeWorkout = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/workouts/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: workout.id,
          notes,
          sets: Object.entries(exerciseSets).flatMap(([exerciseId, sets]) =>
            sets
              .filter((s) => s.weight && s.reps)
              .map((s, i) => ({
                exerciseId: parseInt(exerciseId),
                setNumber: i + 1,
                weight: parseFloat(s.weight),
                reps: parseInt(s.reps),
              }))
          ),
        }),
      });

      if (response.ok) {
        router.push("/workouts");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save workout", error);
    } finally {
      setSaving(false);
    }
  };

  const exerciseProgress = workout.exercises.map((we) => {
    const sets = exerciseSets[we.exerciseId];
    const completed = sets.filter((s) => s.completed).length;
    return { total: sets.length, completed };
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground">{workout.description}</p>
        </div>
      </div>

      {/* Exercise Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {workout.exercises.map((we, index) => {
          const progress = exerciseProgress[index];
          const isComplete = progress.completed === progress.total;
          return (
            <Button
              key={we.id}
              variant={index === currentExerciseIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentExerciseIndex(index)}
              className="shrink-0"
            >
              {isComplete && <CheckCircle className="h-3 w-3 mr-1" />}
              {index + 1}. {we.exercise.name.split(" ")[0]}
            </Button>
          );
        })}
      </div>

      {/* Current Exercise Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span>{currentExercise.exercise.name}</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {currentExercise.targetSets} sets x {currentExercise.targetRepsMin}-
                {currentExercise.targetRepsMax} reps ({currentExercise.exercise.method})
              </p>
            </div>
            {pr && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">PR</span>
                </div>
                <p className="text-sm">
                  {pr.weight} lbs x {pr.reps}
                </p>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentExercise.exercise.notes && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              {currentExercise.exercise.notes}
            </p>
          )}

          {/* Rest Timer Display */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Rest: {Math.floor(currentExercise.restSeconds / 60)}:
            {(currentExercise.restSeconds % 60).toString().padStart(2, "0")} between sets
          </div>

          {/* Sets */}
          <div className="space-y-3">
            {currentSets.map((set, setIndex) => (
              <div
                key={setIndex}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  set.completed ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={(checked) =>
                    updateSet(
                      currentExercise.exerciseId,
                      setIndex,
                      "completed",
                      !!checked
                    )
                  }
                />
                <span className="font-medium w-16">Set {setIndex + 1}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`weight-${setIndex}`} className="sr-only">
                    Weight
                  </Label>
                  <Input
                    id={`weight-${setIndex}`}
                    type="number"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        currentExercise.exerciseId,
                        setIndex,
                        "weight",
                        e.target.value
                      )
                    }
                    className="w-24"
                  />
                  <span className="text-muted-foreground">lbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`reps-${setIndex}`} className="sr-only">
                    Reps
                  </Label>
                  <Input
                    id={`reps-${setIndex}`}
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        currentExercise.exerciseId,
                        setIndex,
                        "reps",
                        e.target.value
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-muted-foreground">reps</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
              disabled={currentExerciseIndex === 0}
            >
              Previous
            </Button>
            {currentExerciseIndex < workout.exercises.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentExerciseIndex(
                    Math.min(workout.exercises.length - 1, currentExerciseIndex + 1)
                  )
                }
              >
                Next Exercise
              </Button>
            ) : (
              <Button
                onClick={completeWorkout}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? "Saving..." : "Complete Workout"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progression Tip */}
      {currentExercise.exercise.method === "RPT" && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">RPT Progression</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                Set 1: Top set at {currentExercise.targetRepsMin}-{currentExercise.targetRepsMax} reps (failure)
              </li>
              <li>Set 2: Drop 10% weight, add 1-2 reps</li>
              {currentExercise.targetSets > 2 && (
                <li>Set 3: Drop another 10%, add 1-2 more reps</li>
              )}
              <li className="text-primary font-medium">
                Hit {currentExercise.targetRepsMax} reps on top set? Add 5 lbs next time!
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-md text-sm resize-none"
            rows={3}
            placeholder="How did the workout feel? Any adjustments needed?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>
    </>
  );
}
