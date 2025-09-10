import axios from "axios";

const RAPIDAPI_BASE_URL = "https://gym-fit.p.rapidapi.com/v1";
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

const axiosInstance = axios.create({
  baseURL: RAPIDAPI_BASE_URL,
  headers: {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
  },
});

// Fetch exercise by ID (axios version)
export async function getExerciseById(id) {
  const response = await axiosInstance.get(`/exercises/${id}`);
  return response.data;
}

// Search exercises by name (recommended by latest docs)
export async function searchExercises(query) {
  const response = await axiosInstance.get(`/exercises/search`, {
    params: { query },
  });
  return response.data;
}

// You can add more functions as needed, following the same pattern
async function rapidApiRequest(endpoint, options = {}) {
  const url = `${RAPIDAPI_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
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
      let errorMessage = `RapidAPI request failed: ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = `Unauthorized: Invalid RapidAPI key. Please check your API key configuration.`;
      } else if (response.status === 403) {
        errorMessage = `Forbidden: API access denied. Please check your RapidAPI subscription.`;
      } else if (response.status === 404) {
        errorMessage = `Exercise not found: ${url}. Please check the exercise ID.`;
      } else if (response.status === 429) {
        errorMessage = `Rate limit exceeded: Too many requests. Please try again later.`;
      } else if (response.status === 500) {
        errorMessage = `RapidAPI server error: ${url}. Please try again later.`;
      } else if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to RapidAPI at ${url}. Please check your internet connection.`);
    }
    throw error;
  }
}



/**
 * Get exercises by body part from RapidAPI
 */
export async function getExercisesByBodyPart(bodyPart) {
  return rapidApiRequest(`/exercises/bodyPart/${bodyPart}`);
}

/**
 * Get exercises by target muscle from RapidAPI
 */
export async function getExercisesByTarget(target) {
  return rapidApiRequest(`/exercises/target/${target}`);
}

/**
 * Get exercises by equipment from RapidAPI
 */
export async function getExercisesByEquipment(equipment) {
  return rapidApiRequest(`/exercises/equipment/${equipment}`);
}



/**
 * Get exercise by name (exact match) from RapidAPI
 */
export async function getExerciseByName(name) {
  return rapidApiRequest(`/exercises/name/${encodeURIComponent(name)}`);
}

// Export the base API request function for custom requests
export { rapidApiRequest };

// --- Local pose analysis ---
/**
 * Analyze pose angles against target ranges and return score/feedback.
 * @param {Object} poseData - { angles: {joint: angle, ...}, tolerantTargetAngles: {joint: {min,max}, ...} }
 * @param {string} exerciseType
 * @returns {Object} { score: number, feedback: string[] }
 */
function analyzePose(poseData, exerciseType) {
  const { angles = {}, tolerantTargetAngles = {} } = poseData;
  let total = 0;
  let correct = 0;
  const feedback = [];
  for (const joint in tolerantTargetAngles) {
    total++;
    const target = tolerantTargetAngles[joint];
    const angle = angles[joint];
    if (angle === undefined) continue;
    if (angle >= target.min && angle <= target.max) {
      correct++;
    } else {
      feedback.push(`Adjust your ${joint.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }
  }
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { score, feedback };
}

// Alias for compatibility
const localPoseAnalysis = analyzePose;

export const gymFitAPI = {
  getExerciseById,
  getExercisesByBodyPart,
  getExercisesByTarget,
  getExercisesByEquipment,
  searchExercises,
  getExerciseByName,
  analyzePose,
  localPoseAnalysis,
};

// --- poseUtils ---
export const poseUtils = {
  // Calculate angle between three points (A, B, C)
  calculateAngle: (A, B, C) => {
    const toDegrees = (radians) => radians * (180 / Math.PI);
    const AB = { x: A.x - B.x, y: A.y - B.y };
    const CB = { x: C.x - B.x, y: C.y - B.y };
    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
    const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2);
    const angle = Math.acos(dot / (magAB * magCB));
    return Math.round(toDegrees(angle));
  },
  // Extract angles for all relevant joints
  extractAngles: (landmarks) => {
    if (!landmarks) return {};
    return {
      leftElbow: poseUtils.calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
      rightElbow: poseUtils.calculateAngle(landmarks[12], landmarks[14], landmarks[16]),
      leftShoulder: poseUtils.calculateAngle(landmarks[13], landmarks[11], landmarks[23]),
      rightShoulder: poseUtils.calculateAngle(landmarks[14], landmarks[12], landmarks[24]),
      leftHip: poseUtils.calculateAngle(landmarks[11], landmarks[23], landmarks[25]),
      rightHip: poseUtils.calculateAngle(landmarks[12], landmarks[24], landmarks[26]),
      leftKnee: poseUtils.calculateAngle(landmarks[23], landmarks[25], landmarks[27]),
      rightKnee: poseUtils.calculateAngle(landmarks[24], landmarks[26], landmarks[28]),
      leftAnkle: poseUtils.calculateAngle(landmarks[25], landmarks[27], landmarks[31]),
      rightAnkle: poseUtils.calculateAngle(landmarks[26], landmarks[28], landmarks[32]),
    };
  },
  // Normalize landmarks (optional, for API)
  normalizeLandmarks: (landmarks) => {
    if (!landmarks) return [];
    // Normalize to [0,1] range for x/y, keep z/visibility
    return landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility
    }));
  }
};
// --- end poseUtils ---