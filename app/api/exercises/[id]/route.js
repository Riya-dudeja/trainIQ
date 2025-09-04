import { NextResponse } from 'next/server';

// Mock exercise data - should match the data in /api/exercises/route.js
const exercises = [
  {
    id: 1,
    name: "Push-ups",
    description: "A classic upper body exercise that targets chest, shoulders, and triceps",
    category: "strength",
    muscleGroups: ["chest", "shoulders", "triceps"],
    difficulty: "beginner",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Lower your body until chest nearly touches the floor",
      "Push back up to starting position",
      "Keep core tight throughout the movement"
    ],
    imageUrl: "/images/push-ups.jpg"
  },
  {
    id: 2,
    name: "Squats",
    description: "A fundamental lower body exercise targeting glutes, quads, and hamstrings",
    category: "strength",
    muscleGroups: ["glutes", "quadriceps", "hamstrings"],
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep knees behind toes and chest up",
      "Return to starting position by driving through heels"
    ],
    imageUrl: "/images/squats.jpg"
  },
  {
    id: 3,
    name: "Plank",
    description: "An isometric core exercise that builds stability and strength",
    category: "core",
    muscleGroups: ["core", "shoulders", "glutes"],
    difficulty: "beginner",
    instructions: [
      "Start in a push-up position",
      "Lower to forearms, keeping body in straight line",
      "Engage core and hold position",
      "Breathe normally while maintaining form"
    ],
    imageUrl: "/images/plank.jpg"
  },
  {
    id: 4,
    name: "Deadlifts",
    description: "A compound movement that works the entire posterior chain",
    category: "strength",
    muscleGroups: ["hamstrings", "glutes", "lower back", "traps"],
    difficulty: "intermediate",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Hinge at hips and knees to lower and grip the bar",
      "Keep chest up and back straight",
      "Drive hips forward to lift bar, keeping it close to body"
    ],
    imageUrl: "/images/deadlifts.jpg"
  },
  {
    id: 5,
    name: "Burpees",
    description: "A full-body cardio exercise combining squat, push-up, and jump",
    category: "cardio",
    muscleGroups: ["full body"],
    difficulty: "intermediate",
    instructions: [
      "Start standing, then squat down and place hands on floor",
      "Jump feet back into plank position",
      "Perform a push-up",
      "Jump feet back to squat position",
      "Jump up with arms overhead"
    ],
    imageUrl: "/images/burpees.jpg"
  }
];

// GET /api/exercises/[id] - Get a specific exercise by ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const exercise = exercises.find(ex => ex.id === id);
    
    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Update an existing exercise
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const exerciseIndex = exercises.findIndex(ex => ex.id === id);
    
    if (exerciseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Update the exercise
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      ...body,
      id: id // Ensure ID doesn't change
    };

    return NextResponse.json({
      success: true,
      data: exercises[exerciseIndex]
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete an exercise
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const exerciseIndex = exercises.findIndex(ex => ex.id === id);
    
    if (exerciseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    const deletedExercise = exercises.splice(exerciseIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedExercise,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}