"use client";

import { useState, useEffect } from 'react';
import { getAllExercises } from '../utils/gymFitApi';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllExercises();
        setExercises(data.data || data); // Handle both response formats
      } catch (err) {
        setError(err.message);
        console.error('Error fetching exercises:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading exercises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gym Exercises</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow-md p-6 border">
            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>
            <p className="text-gray-600 mb-4">{exercise.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-500">Category:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {exercise.category}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-500">Difficulty:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {exercise.difficulty}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-sm text-gray-500">Muscle Groups:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((muscle, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-sm text-gray-500 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {exercises.length === 0 && (
        <div className="text-center text-gray-500">
          No exercises found.
        </div>
      )}
    </div>
  );
}