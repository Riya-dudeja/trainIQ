import { NextResponse } from 'next/server';

// Mock exercise data - replace with your actual data source
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

// GET /api/exercises - Get all exercises
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');

    let filteredExercises = [...exercises];

    // Filter by category
    if (category) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by difficulty
    if (difficulty) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.description.toLowerCase().includes(searchLower) ||
        exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredExercises,
      count: filteredExercises.length
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new exercise
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const newExercise = {
      id: exercises.length + 1,
      name: body.name,
      description: body.description,
      category: body.category || 'strength',
      muscleGroups: body.muscleGroups || [],
      difficulty: body.difficulty || 'beginner',
      instructions: body.instructions || [],
      imageUrl: body.imageUrl || ''
    };

    exercises.push(newExercise);

    return NextResponse.json({
      success: true,
      data: newExercise
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}