// GymFit API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Generic API request handler with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Provide more detailed error information
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.status}`;
      
      if (response.status === 404) {
        errorMessage = `API endpoint not found: ${url}. Please check if the API server is running and the endpoint exists.`;
      } else if (response.status === 500) {
        errorMessage = `Internal server error: ${url}. Please check the API server logs.`;
      } else if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to API server at ${url}. Please ensure the server is running.`);
    }
    throw error;
  }
}

/**
 * Get all exercises from the API
 */
export async function getAllExercises() {
  return apiRequest('/exercises');
}

/**
 * Get a specific exercise by ID
 */
export async function getExerciseById(id) {
  return apiRequest(`/exercises/${id}`);
}

/**
 * Create a new exercise
 */
export async function createExercise(exerciseData) {
  return apiRequest('/exercises', {
    method: 'POST',
    body: JSON.stringify(exerciseData),
  });
}

/**
 * Update an existing exercise
 */
export async function updateExercise(id, exerciseData) {
  return apiRequest(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(exerciseData),
  });
}

/**
 * Delete an exercise
 */
export async function deleteExercise(id) {
  return apiRequest(`/exercises/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(category) {
  return apiRequest(`/exercises/category/${category}`);
}

/**
 * Search exercises by name or description
 */
export async function searchExercises(query) {
  return apiRequest(`/exercises/search?q=${encodeURIComponent(query)}`);
}

// Export the base API request function for custom requests
export { apiRequest };