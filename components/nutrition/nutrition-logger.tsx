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
import { Plus, Utensils } from "lucide-react";

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
}

interface NutritionLoggerProps {
  meals: Meal[];
}

export function NutritionLogger({ meals }: NutritionLoggerProps) {
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [servings, setServings] = useState("1");
  const [loading, setLoading] = useState(false);

  // Quick add form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAdd, setQuickAdd] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const meal = meals.find((m) => m.id.toString() === selectedMeal);

  const logMeal = async () => {
    if (!selectedMeal) return;

    setLoading(true);
    try {
      const response = await fetch("/api/nutrition/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId: parseInt(selectedMeal),
          servings: parseFloat(servings),
        }),
      });

      if (response.ok) {
        setSelectedMeal("");
        setServings("1");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to log meal", error);
    } finally {
      setLoading(false);
    }
  };

  const createAndLogMeal = async () => {
    if (!quickAdd.name || !quickAdd.calories) return;

    setLoading(true);
    try {
      const response = await fetch("/api/nutrition/quick-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickAdd.name,
          calories: parseInt(quickAdd.calories),
          protein: parseInt(quickAdd.protein) || 0,
          carbs: parseInt(quickAdd.carbs) || 0,
          fats: parseInt(quickAdd.fats) || 0,
        }),
      });

      if (response.ok) {
        setQuickAdd({ name: "", calories: "", protein: "", carbs: "", fats: "" });
        setShowQuickAdd(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add meal", error);
    } finally {
      setLoading(false);
    }
  };

  // Group meals by category
  const mealsByCategory = meals.reduce((acc, meal) => {
    if (!acc[meal.category]) {
      acc[meal.category] = [];
    }
    acc[meal.category].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Log Meal
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showQuickAdd ? (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium">Quick Add Custom Meal</h4>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="quick-name">Name</Label>
                <Input
                  id="quick-name"
                  placeholder="e.g., Chicken Salad"
                  value={quickAdd.name}
                  onChange={(e) =>
                    setQuickAdd({ ...quickAdd, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quick-cal">Calories</Label>
                  <Input
                    id="quick-cal"
                    type="number"
                    placeholder="0"
                    value={quickAdd.calories}
                    onChange={(e) =>
                      setQuickAdd({ ...quickAdd, calories: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quick-protein">Protein (g)</Label>
                  <Input
                    id="quick-protein"
                    type="number"
                    placeholder="0"
                    value={quickAdd.protein}
                    onChange={(e) =>
                      setQuickAdd({ ...quickAdd, protein: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quick-carbs">Carbs (g)</Label>
                  <Input
                    id="quick-carbs"
                    type="number"
                    placeholder="0"
                    value={quickAdd.carbs}
                    onChange={(e) =>
                      setQuickAdd({ ...quickAdd, carbs: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quick-fats">Fats (g)</Label>
                  <Input
                    id="quick-fats"
                    type="number"
                    placeholder="0"
                    value={quickAdd.fats}
                    onChange={(e) =>
                      setQuickAdd({ ...quickAdd, fats: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createAndLogMeal} disabled={loading}>
                {loading ? "Adding..." : "Add Meal"}
              </Button>
              <Button variant="outline" onClick={() => setShowQuickAdd(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="meal-select">Select Meal</Label>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger id="meal-select">
                  <SelectValue placeholder="Choose a meal..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(mealsByCategory).map(([category, categoryMeals]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                        {category}
                      </div>
                      {categoryMeals.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.name} ({m.calories} cal, {m.protein}g protein)
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {meal && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{meal.name}</p>
                <p className="text-sm text-muted-foreground">
                  {meal.calories} cal | {meal.protein}g P | {meal.carbs}g C |{" "}
                  {meal.fats}g F
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="0.25"
                step="0.25"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>

            {meal && parseFloat(servings) > 0 && (
              <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                <p className="text-sm font-medium">Total</p>
                <p className="text-lg font-bold">
                  {Math.round(meal.calories * parseFloat(servings))} cal
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(meal.protein * parseFloat(servings))}g protein |{" "}
                  {Math.round(meal.carbs * parseFloat(servings))}g carbs |{" "}
                  {Math.round(meal.fats * parseFloat(servings))}g fats
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={logMeal}
              disabled={!selectedMeal || loading}
            >
              {loading ? "Logging..." : "Log Meal"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
