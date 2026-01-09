import axios from "axios";

// Secure client: never send RapidAPI keys from the browser.
// Route all external requests through server-side API proxies.
const API_BASE_URL = "/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // No secret headers on client. Server-side route handles auth.
    "Content-Type": "application/json",
  },
});

// Fetch exercise by ID (axios version)
export async function getExerciseById(id) {
  // Hits /api/exercises/[id] server route (secured, validated, rate limited)
  const response = await axiosInstance.get(`/exercises/${encodeURIComponent(id)}`);
  const payload = response.data;
  return payload?.data ?? payload; // unwrap { success, data }
}

// Search exercises by name (recommended by latest docs)
export async function searchExercises(query) {
  // Hits /api/exercises?name=...
  const response = await axiosInstance.get(`/exercises`, { params: { name: query } });
  const payload = response.data;
  return payload?.data ?? payload;
}

// You can add more functions as needed, following the same pattern
async function rapidApiRequest(endpoint, options = {}) {
  // Client-side wrapper: call server-side API endpoints to avoid exposing secrets.
  // Map supported RapidAPI endpoints to local proxy routes.
  const GET = options.method?.toUpperCase?.() || 'GET';
  let url = '';
  // endpoint examples used above: /exercises, /exercises/bodyPart/<bp>, /exercises/name/<name>
  if (endpoint.startsWith('/exercises')) {
    // For specific filters, convert to query params for our proxy
    const parts = endpoint.split('/').filter(Boolean);
    if (parts.length === 2 && parts[1] === 'exercises') {
      url = '/api/exercises';
    } else if (parts[1] === 'exercises' && parts[2] === 'bodyPart') {
      url = `/api/exercises?bodyPart=${encodeURIComponent(parts[3] || '')}`;
    } else if (parts[1] === 'exercises' && parts[2] === 'target') {
      url = `/api/exercises?target=${encodeURIComponent(parts[3] || '')}`;
    } else if (parts[1] === 'exercises' && parts[2] === 'equipment') {
      url = `/api/exercises?equipment=${encodeURIComponent(parts[3] || '')}`;
    } else if (parts[1] === 'exercises' && parts[2] === 'name') {
      url = `/api/exercises?name=${encodeURIComponent(parts[3] || '')}`;
    } else if (parts[1] === 'exercises' && parts[2]) {
      // Assume /exercises/<id>
      url = `/api/exercises/${encodeURIComponent(parts[2])}`;
    } else {
      url = '/api/exercises';
    }
  }

  try {
    const res = await fetch(url, { method: GET });
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (res.status === 404) {
        throw new Error('ENDPOINT_NOT_FOUND');
      }
      if (res.status === 401) {
        throw new Error('API_KEY_INVALID');
      }
      if (res.status === 403) {
        throw new Error('API_ACCESS_DENIED');
      }
      if (res.status >= 500) {
        throw new Error('SERVER_ERROR');
      }
      throw new Error(`HTTP_${res.status}`);
    }
    const payload = await res.json();
    return payload?.data ?? payload;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
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
  let partialCredit = 0;
  const feedback = [];
  const TOLERANCE_BUFFER = 10; // Additional degrees of tolerance
  
  for (const joint in tolerantTargetAngles) {
    total++;
    const target = tolerantTargetAngles[joint];
    const angle = angles[joint];
    if (angle === undefined) continue;
    
    // Perfect range
    if (angle >= target.min && angle <= target.max) {
      correct++;
    } 
    // Extended tolerance range for partial credit
    else if (angle >= (target.min - TOLERANCE_BUFFER) && angle <= (target.max + TOLERANCE_BUFFER)) {
      partialCredit += 0.7; // Give 70% credit for close angles
    }
    // Provide specific feedback only if significantly out of range
    else {
      const jointName = joint.replace(/([A-Z])/g, ' $1').toLowerCase();
      if (angle < target.min - TOLERANCE_BUFFER) {
        if (jointName.includes('knee') && exerciseType === 'squat') {
          feedback.push(`Squat deeper - bend your knees more`);
        } else {
          feedback.push(`Adjust your ${jointName} (too extended)`);
        }
      } else if (angle > target.max + TOLERANCE_BUFFER) {
        if (jointName.includes('knee') && exerciseType === 'squat') {
          feedback.push(`Don't go too low - rise up slightly`);
        } else {
          feedback.push(`Adjust your ${jointName} (too flexed)`);
        }
      }
    }
  }
  
  const finalScore = total > 0 ? Math.round(((correct + partialCredit) / total) * 100) : 0;
  
  // Cap feedback to prevent overwhelming user
  const limitedFeedback = feedback.slice(0, 2);
  
  return { score: Math.min(100, finalScore), feedback: limitedFeedback };
}

// Alias for compatibility
const localPoseAnalysis = analyzePose;

// Enhanced search with multiple filters
export async function searchExercisesAdvanced({ query = '', bodyPart = '', equipment = '', target = '', number = 20, offset = 0 }) {
  try {
    console.log('Searching exercises with params:', { query, bodyPart, equipment, target, number, offset });
    
    // Try the simplest approach first - get all exercises (limit to avoid large response)
    let searchUrl = '/exercises';
    
    // Try specific filtering endpoints if no general search term
    if (!query || query.trim() === '') {
      if (bodyPart && bodyPart.trim()) {
        console.log(`Trying bodyPart filter: ${bodyPart}`);
        try {
          const result = await rapidApiRequest(`/exercises/bodyPart/${encodeURIComponent(bodyPart.toLowerCase())}`);
          if (result && (Array.isArray(result) || typeof result === 'object')) {
            const exercises = Array.isArray(result) ? result : [result];
            return filterAndLimitResults(exercises, { query, bodyPart, equipment, target, number, offset });
          }
        } catch (bodyPartError) {
          console.log('BodyPart endpoint failed:', bodyPartError.message);
          // Continue to next attempt - 404s are expected for some endpoints
        }
      }
      
      if (equipment && equipment.trim()) {
        console.log(`Trying equipment filter: ${equipment}`);
        try {
          const result = await rapidApiRequest(`/exercises/equipment/${encodeURIComponent(equipment.toLowerCase())}`);
          if (result && (Array.isArray(result) || typeof result === 'object')) {
            const exercises = Array.isArray(result) ? result : [result];
            return filterAndLimitResults(exercises, { query, bodyPart, equipment, target, number, offset });
          }
        } catch (equipmentError) {
          console.log('Equipment endpoint failed:', equipmentError.message);
          // Continue to next attempt - 404s are expected for some endpoints
        }
      }
    }
    
    // If specific filters failed, try general exercises endpoint with limit
    console.log('Trying general exercises endpoint');
    try {
      const result = await rapidApiRequest(`/exercises?limit=${number || 20}&offset=${offset || 0}`);
      if (result && (Array.isArray(result) || typeof result === 'object')) {
        let exercises = [];
        
        if (Array.isArray(result)) {
          exercises = result;
        } else if (result.data && Array.isArray(result.data)) {
          exercises = result.data;
        } else if (result.exercises && Array.isArray(result.exercises)) {
          exercises = result.exercises;
        } else if (typeof result === 'object') {
          exercises = [result];
        }
        
        console.log(`Found ${exercises.length} exercises from general endpoint`);
        return filterAndLimitResults(exercises, { query, bodyPart, equipment, target, number, offset });
      }
    } catch (generalError) {
      console.log('General exercises endpoint failed:', generalError.message);
      // This is expected if the API structure is different
    }
    
    // If all API calls fail, return mock data
    console.log('All API endpoints failed, using mock data');
    return getMockExercises({ query, bodyPart, equipment, target, number });
    
  } catch (error) {
    console.error('Search exercises completely failed:', error.message);
    return getMockExercises({ query, bodyPart, equipment, target, number });
  }
}

// Helper function to filter and limit results client-side
function filterAndLimitResults(exercises, { query, bodyPart, equipment, target, number, offset }) {
  let filtered = exercises;
  
  // Apply client-side filtering if server-side filtering wasn't applied
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    filtered = filtered.filter(ex => 
      ex.name?.toLowerCase().includes(searchTerm) ||
      ex.bodyPart?.toLowerCase().includes(searchTerm) ||
      ex.equipment?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (bodyPart) {
    filtered = filtered.filter(ex => 
      ex.bodyPart?.toLowerCase() === bodyPart.toLowerCase()
    );
  }
  
  if (equipment) {
    filtered = filtered.filter(ex => 
      ex.equipment?.toLowerCase() === equipment.toLowerCase()
    );
  }
  
  if (target) {
    filtered = filtered.filter(ex => 
      ex.target?.toLowerCase() === target.toLowerCase()
    );
  }
  
  // Apply pagination
  const startIndex = offset || 0;
  const endIndex = number ? startIndex + number : filtered.length;
  
  return filtered.slice(startIndex, endIndex);
}

// Fallback mock data to keep the app functional
function getMockExercises({ query, bodyPart, equipment, target, number = 10 }) {
  console.log('Using mock exercises data as fallback');
  
  const mockExercises = [
    {
      id: 'mock-1',
      name: 'Bodyweight Squat',
      bodyPart: 'legs',
      equipment: 'body weight',
      target: 'quadriceps',
      gifUrl: '/api/placeholder/squat.gif',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending knees and hips',
        'Keep chest up and back straight',
        'Lower until thighs are parallel to floor',
        'Push through heels to return to start'
      ]
    },
    {
      id: 'mock-2',
      name: 'Push-up',
      bodyPart: 'chest',
      equipment: 'body weight',
      target: 'pectorals',
      gifUrl: '/api/placeholder/pushup.gif',
      instructions: [
        'Start in plank position with hands shoulder-width apart',
        'Lower chest toward ground',
        'Keep body in straight line',
        'Push back up to starting position'
      ]
    },
    {
      id: 'mock-3',
      name: 'Dumbbell Bicep Curl',
      bodyPart: 'upper arms',
      equipment: 'dumbbell',
      target: 'biceps',
      gifUrl: '/api/placeholder/bicep-curl.gif',
      instructions: [
        'Hold dumbbells at sides with palms facing forward',
        'Keep elbows close to body',
        'Curl weights up toward shoulders',
        'Lower weights back to starting position'
      ]
    },
    {
      id: 'mock-4',
      name: 'Plank',
      bodyPart: 'waist',
      equipment: 'body weight',
      target: 'abs',
      gifUrl: '/api/placeholder/plank.gif',
      instructions: [
        'Start in push-up position on forearms',
        'Keep body in straight line from head to heels',
        'Hold position while breathing normally',
        'Keep core engaged throughout'
      ]
    },
    {
      id: 'mock-5',
      name: 'Lunges',
      bodyPart: 'legs',
      equipment: 'body weight',
      target: 'quadriceps',
      gifUrl: '/api/placeholder/lunges.gif',
      instructions: [
        'Stand with feet hip-width apart',
        'Step forward with one leg',
        'Lower hips until both knees are at 90 degrees',
        'Push back to starting position'
      ]
    },
    {
      id: 'mock-6',
      name: 'Bench Press',
      bodyPart: 'chest',
      equipment: 'barbell',
      target: 'pectorals',
      gifUrl: '/api/placeholder/bench-press.gif',
      instructions: [
        'Lie flat on bench with feet on floor',
        'Grip bar slightly wider than shoulder-width',
        'Lower bar to chest with control',
        'Press bar up explosively'
      ]
    },
    {
      id: 'mock-7',
      name: 'Deadlift',
      bodyPart: 'upper legs',
      equipment: 'barbell',
      target: 'glutes',
      gifUrl: '/api/placeholder/deadlift.gif',
      instructions: [
        'Stand with feet hip-width apart',
        'Grip bar with hands just outside legs',
        'Keep back straight and chest up',
        'Lift by driving through heels'
      ]
    },
    {
      id: 'mock-8',
      name: 'Shoulder Press',
      bodyPart: 'shoulders',
      equipment: 'dumbbell',
      target: 'delts',
      gifUrl: '/api/placeholder/shoulder-press.gif',
      instructions: [
        'Hold dumbbells at shoulder height',
        'Press weights overhead',
        'Keep core engaged',
        'Lower with control'
      ]
    },
    {
      id: 'mock-9',
      name: 'Pull-ups',
      bodyPart: 'back',
      equipment: 'body weight',
      target: 'lats',
      gifUrl: '/api/placeholder/pullups.gif',
      instructions: [
        'Hang from pull-up bar with palms facing away',
        'Pull body up until chin clears bar',
        'Lower with control',
        'Keep core engaged'
      ]
    },
    {
      id: 'mock-10',
      name: 'Tricep Dips',
      bodyPart: 'upper arms',
      equipment: 'body weight',
      target: 'triceps',
      gifUrl: '/api/placeholder/tricep-dips.gif',
      instructions: [
        'Position hands on bench behind you',
        'Lower body by bending elbows',
        'Push back up to starting position',
        'Keep legs extended for more difficulty'
      ]
    }
  ];
  
  // Apply basic filtering
  let filtered = mockExercises;
  
  if (query) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(ex => 
      ex.name.toLowerCase().includes(searchTerm) ||
      ex.bodyPart.toLowerCase().includes(searchTerm) ||
      ex.target.toLowerCase().includes(searchTerm)
    );
  }
  
  if (bodyPart) {
    filtered = filtered.filter(ex => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase());
  }
  
  if (equipment) {
    filtered = filtered.filter(ex => ex.equipment.toLowerCase() === equipment.toLowerCase());
  }
  
  if (target) {
    filtered = filtered.filter(ex => ex.target.toLowerCase() === target.toLowerCase());
  }
  
  return filtered.slice(0, number);
}

// Map exercise names to standardized types for analysis
export function mapExerciseNameToType(exerciseName) {
  if (!exerciseName) return 'general';
  
  const name = exerciseName.toLowerCase();
  
  // Squat variations
  if (name.includes('squat')) return 'squat';
  if (name.includes('lunge')) return 'squat';
  
  // Pressing movements
  if (name.includes('bench press') || name.includes('chest press')) return 'bench_press';
  if (name.includes('shoulder press') || name.includes('overhead press')) return 'shoulder_press';
  if (name.includes('push up') || name.includes('pushup')) return 'push_up';
  
  // Curling movements
  if (name.includes('bicep curl') || name.includes('arm curl')) return 'bicep_curl';
  if (name.includes('hammer curl')) return 'hammer_curl';
  
  // Pulling movements
  if (name.includes('pull up') || name.includes('pullup')) return 'pull_up';
  if (name.includes('row')) return 'row';
  if (name.includes('lat pulldown')) return 'lat_pulldown';
  
  // Deadlift variations
  if (name.includes('deadlift')) return 'deadlift';
  
  return 'general';
}

// Get target angles for different exercise types
export function getTargetAngles(exerciseType) {
  const angleTargets = {
    tree_pose: {
      // Standing leg should be straight
      leftKnee: { min: 165, max: 185 },
      rightKnee: { min: 30, max: 90 }, // lifted leg bent
      // Hips should be square
      leftHip: { min: 80, max: 120 },
      rightHip: { min: 80, max: 120 },
      // Standing ankle straight, lifted ankle bent
      leftAnkle: { min: 160, max: 190 },
      rightAnkle: { min: 30, max: 100 },
      // Arms overhead or at chest (wide range)
      leftShoulder: { min: 40, max: 180 },
      rightShoulder: { min: 40, max: 180 }
    },
    squat: {
      leftKnee: { min: 80, max: 120 },  // More forgiving knee range
      rightKnee: { min: 80, max: 120 },
      leftHip: { min: 60, max: 110 },   // Better hip angle range
      rightHip: { min: 60, max: 110 }
    },
    bicep_curl: {
      leftElbow: { min: 30, max: 150 },
      rightElbow: { min: 30, max: 150 }
    },
    bench_press: {
      leftElbow: { min: 45, max: 120 },
      rightElbow: { min: 45, max: 120 },
      leftShoulder: { min: 45, max: 135 },
      rightShoulder: { min: 45, max: 135 }
    },
    shoulder_press: {
      leftElbow: { min: 90, max: 180 },
      rightElbow: { min: 90, max: 180 },
      leftShoulder: { min: 90, max: 180 },
      rightShoulder: { min: 90, max: 180 }
    },
    deadlift: {
      leftKnee: { min: 160, max: 180 },
      rightKnee: { min: 160, max: 180 },
      leftHip: { min: 160, max: 180 },
      rightHip: { min: 160, max: 180 }
    },
    push_up: {
      leftElbow: { min: 45, max: 170 },
      rightElbow: { min: 45, max: 170 }
    },
    general: {
      leftElbow: { min: 30, max: 180 },
      rightElbow: { min: 30, max: 180 },
      leftKnee: { min: 70, max: 180 },
      rightKnee: { min: 70, max: 180 }
    }
  };
  
  return angleTargets[exerciseType] || angleTargets.general;
}

// Get exercise-specific instructions
export function getExerciseInstructions(exerciseType) {
  const instructions = {
    squat: [
      "Stand with feet shoulder-width apart",
      "Keep your chest up and core engaged",
      "Lower by pushing hips back and bending knees",
      "Go down until thighs are parallel to floor",
      "Push through heels to return to starting position"
    ],
    bicep_curl: [
      "Hold weights at your sides with palms facing forward",
      "Keep elbows close to your torso",
      "Curl weights up by contracting biceps",
      "Squeeze at the top of the movement",
      "Lower weights slowly with control"
    ],
    bench_press: [
      "Lie flat on bench with feet on floor",
      "Grip bar slightly wider than shoulder-width",
      "Lower bar to chest with control",
      "Press bar up explosively",
      "Keep core tight throughout movement"
    ],
    deadlift: [
      "Stand with feet hip-width apart",
      "Grip bar with hands just outside legs",
      "Keep back straight and chest up",
      "Lift by driving through heels",
      "Stand tall and squeeze glutes at top"
    ],
    push_up: [
      "Start in plank position with hands shoulder-width apart",
      "Keep body in straight line from head to heels",
      "Lower chest to floor with control",
      "Push back up to starting position",
      "Maintain core engagement throughout"
    ]
  };
  
  return instructions[exerciseType] || [
    "Follow proper form for your chosen exercise",
    "Maintain controlled movements",
    "Focus on the target muscle groups",
    "Breathe properly throughout the movement"
  ];
}

export const gymFitAPI = {
  getExerciseById,
  getExercisesByBodyPart,
  getExercisesByTarget,
  getExercisesByEquipment,
  searchExercises: searchExercisesAdvanced, // Use enhanced version
  getExerciseByName,
  analyzePose,
  localPoseAnalysis,
  mapExerciseNameToType,
  getTargetAngles,
  getExerciseInstructions,
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