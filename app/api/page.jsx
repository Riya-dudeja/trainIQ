"use client";

import { useState, useEffect } from 'react';
import { getAllExercises } from '../../utils/gymFitApi';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllExercises();
        // Handle the response from our API proxy
        if (response.success) {
          setExercises(response.data || []);
        } else {
          setError(response.error || 'Failed to fetch exercises');
        }
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
            <p className="text-gray-600 mb-4">{exercise.instructions?.[0] || 'No description available'}</p>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-500">Body Part:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {exercise.bodyPart || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-500">Target:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {exercise.target || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-sm text-gray-500">Equipment:</span>
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  {exercise.equipment || 'N/A'}
                </span>
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
            
            {exercise.gifUrl && (
              <div className="mt-4">
                <img 
                  src={exercise.gifUrl} 
                  alt={exercise.name}
                  className="w-full h-32 object-cover rounded"
                />
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