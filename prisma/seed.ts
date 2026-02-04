import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.scheduleCompletion.deleteMany();
  await prisma.medicationLog.deleteMany();
  await prisma.setLog.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.healthMetric.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: { name: "Sonny" },
  });

  console.log("Created user:", user.name);

  // Create exercises
  const exercises = await Promise.all([
    // Chest exercises
    prisma.exercise.create({
      data: {
        name: "Incline Barbell Press",
        muscleGroup: "chest",
        method: "RPT",
        notes: "30-degree incline, 4-6 reps top set, drop 10% each set",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Flat Dumbbell Press",
        muscleGroup: "chest",
        method: "RPT",
        notes: "6-8 reps top set",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Cable Flyes",
        muscleGroup: "chest",
        method: "KinoRep",
        notes: "12-15 reps, rest-pause to 20-25 total",
      },
    }),
    // Shoulder exercises
    prisma.exercise.create({
      data: {
        name: "Standing Barbell Press",
        muscleGroup: "shoulders",
        method: "RPT",
        notes: "4-6 reps top set",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Lateral Raises",
        muscleGroup: "shoulders",
        method: "KinoRep",
        notes: "12-15 reps, rest-pause to failure",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Face Pulls",
        muscleGroup: "shoulders",
        method: "Standard",
        notes: "15-20 reps for rear delts",
      },
    }),
    // Back exercises
    prisma.exercise.create({
      data: {
        name: "Weighted Chin-ups",
        muscleGroup: "back",
        method: "RPT",
        notes: "4-6 reps top set, underhand grip",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Cable Rows",
        muscleGroup: "back",
        method: "RPT",
        notes: "6-8 reps top set",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Lat Pulldown",
        muscleGroup: "back",
        method: "KinoRep",
        notes: "10-12 reps, rest-pause",
      },
    }),
    // Arm exercises
    prisma.exercise.create({
      data: {
        name: "Incline Dumbbell Curls",
        muscleGroup: "biceps",
        method: "KinoRep",
        notes: "6-8 reps, rest-pause to 12-15 total",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Hammer Curls",
        muscleGroup: "biceps",
        method: "RestPause",
        notes: "8-10 reps, rest-pause set",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Rope Pushdowns",
        muscleGroup: "triceps",
        method: "KinoRep",
        notes: "10-12 reps, rest-pause",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Overhead Tricep Extension",
        muscleGroup: "triceps",
        method: "RestPause",
        notes: "10-12 reps",
      },
    }),
    // Leg exercises
    prisma.exercise.create({
      data: {
        name: "Bulgarian Split Squats",
        muscleGroup: "legs",
        method: "RPT",
        notes: "6-8 reps each leg",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Romanian Deadlift",
        muscleGroup: "legs",
        method: "RPT",
        notes: "6-8 reps",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Leg Curls",
        muscleGroup: "legs",
        method: "KinoRep",
        notes: "10-12 reps",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "Calf Raises",
        muscleGroup: "legs",
        method: "Standard",
        notes: "12-15 reps, full stretch",
      },
    }),
  ]);

  console.log("Created", exercises.length, "exercises");

  // Create workouts (Phase A)
  const workout1A = await prisma.workout.create({
    data: {
      name: "Workout #1",
      version: "A",
      description: "Chest & Shoulders focus",
    },
  });

  const workout2A = await prisma.workout.create({
    data: {
      name: "Workout #2",
      version: "A",
      description: "Back & Arms focus",
    },
  });

  const workout3A = await prisma.workout.create({
    data: {
      name: "Workout #3",
      version: "A",
      description: "Legs & Shoulders",
    },
  });

  const workout4A = await prisma.workout.create({
    data: {
      name: "Workout #4",
      version: "A",
      description: "Full Upper Body",
    },
  });

  // Map exercises by name for easier lookup
  const exerciseMap = new Map(exercises.map((e) => [e.name, e]));

  // Workout #1 exercises
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutId: workout1A.id,
        exerciseId: exerciseMap.get("Incline Barbell Press")!.id,
        orderIndex: 1,
        targetSets: 3,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout1A.id,
        exerciseId: exerciseMap.get("Flat Dumbbell Press")!.id,
        orderIndex: 2,
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 150,
      },
      {
        workoutId: workout1A.id,
        exerciseId: exerciseMap.get("Standing Barbell Press")!.id,
        orderIndex: 3,
        targetSets: 3,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout1A.id,
        exerciseId: exerciseMap.get("Lateral Raises")!.id,
        orderIndex: 4,
        targetSets: 2,
        targetRepsMin: 12,
        targetRepsMax: 15,
        restSeconds: 60,
      },
      {
        workoutId: workout1A.id,
        exerciseId: exerciseMap.get("Rope Pushdowns")!.id,
        orderIndex: 5,
        targetSets: 2,
        targetRepsMin: 10,
        targetRepsMax: 12,
        restSeconds: 60,
      },
    ],
  });

  // Workout #2 exercises
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutId: workout2A.id,
        exerciseId: exerciseMap.get("Weighted Chin-ups")!.id,
        orderIndex: 1,
        targetSets: 3,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout2A.id,
        exerciseId: exerciseMap.get("Cable Rows")!.id,
        orderIndex: 2,
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 150,
      },
      {
        workoutId: workout2A.id,
        exerciseId: exerciseMap.get("Face Pulls")!.id,
        orderIndex: 3,
        targetSets: 2,
        targetRepsMin: 15,
        targetRepsMax: 20,
        restSeconds: 60,
      },
      {
        workoutId: workout2A.id,
        exerciseId: exerciseMap.get("Incline Dumbbell Curls")!.id,
        orderIndex: 4,
        targetSets: 2,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 90,
      },
      {
        workoutId: workout2A.id,
        exerciseId: exerciseMap.get("Hammer Curls")!.id,
        orderIndex: 5,
        targetSets: 2,
        targetRepsMin: 8,
        targetRepsMax: 10,
        restSeconds: 60,
      },
    ],
  });

  // Workout #3 exercises
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutId: workout3A.id,
        exerciseId: exerciseMap.get("Bulgarian Split Squats")!.id,
        orderIndex: 1,
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 120,
      },
      {
        workoutId: workout3A.id,
        exerciseId: exerciseMap.get("Romanian Deadlift")!.id,
        orderIndex: 2,
        targetSets: 3,
        targetRepsMin: 6,
        targetRepsMax: 8,
        restSeconds: 150,
      },
      {
        workoutId: workout3A.id,
        exerciseId: exerciseMap.get("Leg Curls")!.id,
        orderIndex: 3,
        targetSets: 2,
        targetRepsMin: 10,
        targetRepsMax: 12,
        restSeconds: 60,
      },
      {
        workoutId: workout3A.id,
        exerciseId: exerciseMap.get("Calf Raises")!.id,
        orderIndex: 4,
        targetSets: 3,
        targetRepsMin: 12,
        targetRepsMax: 15,
        restSeconds: 60,
      },
      {
        workoutId: workout3A.id,
        exerciseId: exerciseMap.get("Lateral Raises")!.id,
        orderIndex: 5,
        targetSets: 2,
        targetRepsMin: 12,
        targetRepsMax: 15,
        restSeconds: 60,
      },
    ],
  });

  // Workout #4 exercises
  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutId: workout4A.id,
        exerciseId: exerciseMap.get("Incline Barbell Press")!.id,
        orderIndex: 1,
        targetSets: 2,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout4A.id,
        exerciseId: exerciseMap.get("Weighted Chin-ups")!.id,
        orderIndex: 2,
        targetSets: 2,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout4A.id,
        exerciseId: exerciseMap.get("Standing Barbell Press")!.id,
        orderIndex: 3,
        targetSets: 2,
        targetRepsMin: 4,
        targetRepsMax: 6,
        restSeconds: 180,
      },
      {
        workoutId: workout4A.id,
        exerciseId: exerciseMap.get("Cable Flyes")!.id,
        orderIndex: 4,
        targetSets: 1,
        targetRepsMin: 12,
        targetRepsMax: 15,
        restSeconds: 60,
      },
      {
        workoutId: workout4A.id,
        exerciseId: exerciseMap.get("Lat Pulldown")!.id,
        orderIndex: 5,
        targetSets: 1,
        targetRepsMin: 10,
        targetRepsMax: 12,
        restSeconds: 60,
      },
    ],
  });

  console.log("Created 4 workouts with exercises");

  // Create medications
  const medications = await Promise.all([
    prisma.medication.create({
      data: {
        name: "Sertraline",
        dose: "50mg",
        timing: "morning",
        type: "medication",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Allopurinol",
        dose: "300mg",
        timing: "morning",
        type: "medication",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Colchicine",
        dose: "0.6mg",
        timing: "morning",
        type: "medication",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Melatonin",
        dose: "3mg",
        timing: "before_bed",
        type: "medication",
      },
    }),
    // Supplements
    prisma.medication.create({
      data: {
        name: "Vitamin D3",
        dose: "5000 IU",
        timing: "with_food",
        type: "supplement",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Methylfolate",
        dose: "1000mcg",
        timing: "morning",
        type: "supplement",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Omega-3 Fish Oil",
        dose: "2000mg",
        timing: "with_food",
        type: "supplement",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Magnesium Glycinate",
        dose: "400mg",
        timing: "evening",
        type: "supplement",
      },
    }),
    prisma.medication.create({
      data: {
        name: "Tart Cherry Extract",
        dose: "500mg",
        timing: "evening",
        type: "supplement",
      },
    }),
  ]);

  console.log("Created", medications.length, "medications/supplements");

  // Create common meals
  const meals = await Promise.all([
    prisma.meal.create({
      data: {
        name: "Greek Yogurt with Berries",
        calories: 250,
        protein: 20,
        carbs: 30,
        fats: 5,
        category: "breakfast",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Protein Shake",
        calories: 200,
        protein: 40,
        carbs: 5,
        fats: 3,
        category: "snack",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Chicken Breast (6oz)",
        calories: 280,
        protein: 52,
        carbs: 0,
        fats: 6,
        category: "dinner",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Salmon Fillet (6oz)",
        calories: 350,
        protein: 40,
        carbs: 0,
        fats: 20,
        category: "dinner",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Brown Rice (1 cup cooked)",
        calories: 215,
        protein: 5,
        carbs: 45,
        fats: 2,
        category: "dinner",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Mixed Vegetables (1 cup)",
        calories: 50,
        protein: 2,
        carbs: 10,
        fats: 0,
        category: "dinner",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Eggs (2 whole)",
        calories: 140,
        protein: 12,
        carbs: 1,
        fats: 10,
        category: "breakfast",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Oatmeal (1 cup)",
        calories: 300,
        protein: 10,
        carbs: 54,
        fats: 5,
        category: "breakfast",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Steak (8oz ribeye)",
        calories: 600,
        protein: 50,
        carbs: 0,
        fats: 44,
        category: "dinner",
      },
    }),
    prisma.meal.create({
      data: {
        name: "Sweet Potato (medium)",
        calories: 115,
        protein: 2,
        carbs: 27,
        fats: 0,
        category: "dinner",
      },
    }),
  ]);

  console.log("Created", meals.length, "meals");

  // Create schedule blocks
  const scheduleBlocks = await Promise.all([
    // Monday
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "06:30",
        endTime: "07:30",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "08:00",
        endTime: "12:00",
        title: "Motus Deep Work",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "13:00",
        endTime: "14:00",
        title: "Workout #1",
        type: "workout",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "14:30",
        endTime: "17:30",
        title: "Motus Afternoon",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Monday",
        startTime: "18:00",
        endTime: "19:00",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Tuesday
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "06:30",
        endTime: "07:30",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "08:00",
        endTime: "12:00",
        title: "Motus Deep Work",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "13:00",
        endTime: "17:00",
        title: "Motus Afternoon",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "17:30",
        endTime: "19:00",
        title: "Zoom Class",
        type: "class",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Tuesday",
        startTime: "19:30",
        endTime: "20:30",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Wednesday
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "06:30",
        endTime: "07:30",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "08:00",
        endTime: "12:00",
        title: "Motus Deep Work",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "13:00",
        endTime: "14:00",
        title: "Workout #2",
        type: "workout",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "14:30",
        endTime: "17:30",
        title: "Motus Afternoon",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Wednesday",
        startTime: "18:00",
        endTime: "19:00",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Thursday
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "06:30",
        endTime: "07:30",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "08:00",
        endTime: "12:00",
        title: "Motus Deep Work",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "13:00",
        endTime: "17:00",
        title: "Motus Afternoon",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "17:30",
        endTime: "19:00",
        title: "Zoom Class",
        type: "class",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Thursday",
        startTime: "19:30",
        endTime: "20:30",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Friday
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "06:30",
        endTime: "07:30",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "08:00",
        endTime: "12:00",
        title: "Motus Deep Work",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "13:00",
        endTime: "14:00",
        title: "Workout #3",
        type: "workout",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "14:30",
        endTime: "17:30",
        title: "Motus Afternoon",
        type: "work",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Friday",
        startTime: "18:00",
        endTime: "19:00",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Saturday
    prisma.scheduleBlock.create({
      data: {
        day: "Saturday",
        startTime: "08:00",
        endTime: "09:00",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Saturday",
        startTime: "10:00",
        endTime: "11:00",
        title: "Workout #4",
        type: "workout",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Saturday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Saturday",
        startTime: "18:00",
        endTime: "19:00",
        title: "Dinner Feast",
        type: "meal",
      },
    }),

    // Sunday
    prisma.scheduleBlock.create({
      data: {
        day: "Sunday",
        startTime: "08:00",
        endTime: "09:00",
        title: "Morning Routine",
        type: "personal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Sunday",
        startTime: "12:00",
        endTime: "13:00",
        title: "Meal 1",
        type: "meal",
      },
    }),
    prisma.scheduleBlock.create({
      data: {
        day: "Sunday",
        startTime: "18:00",
        endTime: "19:00",
        title: "Dinner Feast",
        type: "meal",
      },
    }),
  ]);

  console.log("Created", scheduleBlocks.length, "schedule blocks");

  // Add initial health metrics
  await prisma.healthMetric.create({
    data: {
      userId: user.id,
      type: "weight",
      value: 195,
      unit: "lbs",
      notes: "Starting weight",
    },
  });

  await prisma.healthMetric.create({
    data: {
      userId: user.id,
      type: "waist",
      value: 34,
      unit: "inches",
      notes: "Starting measurement",
    },
  });

  console.log("Created initial health metrics");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
