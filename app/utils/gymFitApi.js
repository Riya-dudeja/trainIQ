// Gym Fit API integration utilities
// Using RapidAPI gym-fit endpoint

const RAPIDAPI_KEY = '6966b7dff4msh1accdbc4da177cap1875adjsn5476308fc9d6';
const RAPIDAPI_HOST = 'gym-fit.p.rapidapi.com';

export class GymFitAPI {
  constructor(apiKey = RAPIDAPI_KEY) {
    this.apiKey = apiKey;
    this.host = RAPIDAPI_HOST;
  }

  // Get exercise details by ID
  async getExerciseById(exerciseId) {
    try {
      const response = await fetch(`https://${this.host}/v1/exercises/${exerciseId}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.host,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
      return null;
    }
  }

  // Get all exercises
  async getAllExercises() {
    try {
      const response = await fetch(`https://${this.host}/v1/exercises`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.host,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      return [];
    }
  }

  // Get exercises by body part
  async getExercisesByBodyPart(bodyPart) {
    try {
      const response = await fetch(`https://${this.host}/v1/exercises?bodyPart=${bodyPart}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.host,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch exercises by body part:', error);
      return [];
    }
  }

  // Analyze pose data and get feedback (local analysis since API doesn't provide pose analysis)
  async analyzePose(poseData, exerciseType) {
    try {
      // Since the gym-fit API doesn't provide pose analysis, we'll use local analysis
      // In a real implementation, you might want to send pose data to a separate pose analysis service
      return this.localPoseAnalysis(poseData, exerciseType);
    } catch (error) {
      console.error('Pose analysis failed:', error);
      return this.localPoseAnalysis(poseData, exerciseType);
    }
  }

  // Local fallback analysis (when API is unavailable)
  localPoseAnalysis(poseData, exerciseType) {
    const analysis = {
      confidence: 0.8,
      feedback: [],
      score: 0,
      corrections: [],
    };

    // Basic angle-based analysis
    if (poseData.angles) {
      const targetAngles = this.getTargetAngles(exerciseType);
      let totalScore = 0;
      let validAngles = 0;

      Object.keys(targetAngles).forEach(angleKey => {
        if (poseData.angles[angleKey] !== undefined) {
          const currentAngle = poseData.angles[angleKey];
          const target = targetAngles[angleKey];
          const deviation = Math.abs(currentAngle - target.ideal);
          const maxDeviation = (target.max - target.min) / 2;
          const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
          totalScore += score;
          validAngles++;

          if (currentAngle < target.min) {
            analysis.feedback.push(`${angleKey.replace(/([A-Z])/g, ' $1').toLowerCase()} is too small. Increase to ${target.ideal}°`);
          } else if (currentAngle > target.max) {
            analysis.feedback.push(`${angleKey.replace(/([A-Z])/g, ' $1').toLowerCase()} is too large. Decrease to ${target.ideal}°`);
          }
        }
      });

      analysis.score = validAngles > 0 ? Math.round(totalScore / validAngles) : 0;
    }

    return analysis;
  }

  // Local pose comparison
  localPoseComparison(currentPose, referencePose, exerciseType) {
    const comparison = {
      similarity: 0,
      differences: [],
      recommendations: [],
    };

    // Calculate similarity based on landmark positions
    if (currentPose.landmarks && referencePose.landmarks) {
      let totalDistance = 0;
      let validLandmarks = 0;

      currentPose.landmarks.forEach((landmark, index) => {
        if (referencePose.landmarks[index]) {
          const distance = Math.sqrt(
            Math.pow(landmark.x - referencePose.landmarks[index].x, 2) +
            Math.pow(landmark.y - referencePose.landmarks[index].y, 2)
          );
          totalDistance += distance;
          validLandmarks++;
        }
      });

      comparison.similarity = validLandmarks > 0 ? 
        Math.max(0, 100 - (totalDistance / validLandmarks) * 100) : 0;
    }

    return comparison;
  }

  // Get target angles for different exercises
  getTargetAngles(exerciseType) {
    const targetAngles = {
      pushup: {
        leftElbow: { min: 80, max: 100, ideal: 90 },
        rightElbow: { min: 80, max: 100, ideal: 90 },
        leftShoulder: { min: 0, max: 20, ideal: 10 },
        rightShoulder: { min: 0, max: 20, ideal: 10 },
        leftHip: { min: 160, max: 180, ideal: 170 },
        rightHip: { min: 160, max: 180, ideal: 170 },
      },
      squat: {
        leftKnee: { min: 80, max: 120, ideal: 100 },
        rightKnee: { min: 80, max: 120, ideal: 100 },
        leftHip: { min: 80, max: 120, ideal: 100 },
        rightHip: { min: 80, max: 120, ideal: 100 },
        leftAnkle: { min: 60, max: 90, ideal: 75 },
        rightAnkle: { min: 60, max: 90, ideal: 75 },
      },
      plank: {
        leftElbow: { min: 85, max: 95, ideal: 90 },
        rightElbow: { min: 85, max: 95, ideal: 90 },
        leftShoulder: { min: 0, max: 10, ideal: 5 },
        rightShoulder: { min: 0, max: 10, ideal: 5 },
        leftHip: { min: 170, max: 180, ideal: 175 },
        rightHip: { min: 170, max: 180, ideal: 175 },
      },
      deadlift: {
        leftHip: { min: 100, max: 140, ideal: 120 },
        rightHip: { min: 100, max: 140, ideal: 120 },
        leftKnee: { min: 60, max: 100, ideal: 80 },
        rightKnee: { min: 60, max: 100, ideal: 80 },
        leftAnkle: { min: 70, max: 90, ideal: 80 },
        rightAnkle: { min: 70, max: 90, ideal: 80 },
      },
      lunge: {
        leftHip: { min: 80, max: 120, ideal: 100 },
        rightHip: { min: 80, max: 120, ideal: 100 },
        leftKnee: { min: 80, max: 120, ideal: 100 },
        rightKnee: { min: 80, max: 120, ideal: 100 },
      },
      benchPress: {
        leftElbow: { min: 80, max: 100, ideal: 90 },
        rightElbow: { min: 80, max: 100, ideal: 90 },
        leftShoulder: { min: 0, max: 20, ideal: 10 },
        rightShoulder: { min: 0, max: 20, ideal: 10 },
        leftHip: { min: 160, max: 180, ideal: 170 },
        rightHip: { min: 160, max: 180, ideal: 170 },
      },
    };

    return targetAngles[exerciseType] || targetAngles.pushup;
  }

  // Map exercise names to our internal types
  mapExerciseNameToType(exerciseName) {
    const exerciseMap = {
      'Push-up': 'pushup',
      'Squat': 'squat',
      'Plank': 'plank',
      'Deadlift': 'deadlift',
      'Lunge': 'lunge',
      'Bench Press (Barbell)': 'benchPress',
      'Incline Bench Press (Barbell)': 'benchPress',
      'Decline Bench Press (Barbell)': 'benchPress',
      'Close Grip Bench Press (Barbell)': 'benchPress',
    };

    return exerciseMap[exerciseName] || 'pushup';
  }

  // Get exercise instructions from API response
  getExerciseInstructionsFromAPI(exerciseData) {
    if (!exerciseData || !exerciseData.instructions) {
      return this.getExerciseInstructions('pushup'); // fallback
    }

    return exerciseData.instructions
      .sort((a, b) => a.order - b.order)
      .map(instruction => instruction.description);
  }

  // Get exercise instructions (fallback)
  getExerciseInstructions(exerciseType) {
    const instructions = {
      pushup: [
        "Start in a plank position with hands shoulder-width apart",
        "Lower your body until your chest nearly touches the ground",
        "Keep your body in a straight line throughout the movement",
        "Push back up to the starting position",
        "Keep your core engaged and breathe steadily"
      ],
      squat: [
        "Stand with feet shoulder-width apart",
        "Lower your body as if sitting back into a chair",
        "Keep your chest up and knees behind your toes",
        "Lower until thighs are parallel to the ground",
        "Push through your heels to return to standing"
      ],
      plank: [
        "Start in a forearm plank position",
        "Keep your body in a straight line from head to heels",
        "Engage your core muscles",
        "Hold the position without letting your hips sag",
        "Breathe steadily and maintain the position"
      ],
      deadlift: [
        "Stand with feet hip-width apart",
        "Bend at your hips and knees to lower the weight",
        "Keep your back straight and chest up",
        "Grip the weight with hands shoulder-width apart",
        "Lift by extending your hips and knees"
      ],
      lunge: [
        "Step forward with one leg",
        "Lower your body until both knees are bent at 90 degrees",
        "Keep your front knee behind your toes",
        "Push back to the starting position",
        "Alternate legs for each repetition"
      ],
      benchPress: [
        "Lie on the bench with your eyes directly under the barbell",
        "Grab the bar with a slightly wider than shoulder-width grip",
        "Bring your shoulder blades together and lower your shoulders",
        "Inhale and lower the barbell slowly to touch your chest",
        "Exhale and push the barbell back up to the starting position"
      ]
    };

    return instructions[exerciseType] || instructions.pushup;
  }

  // Get target muscles from API response
  getTargetMusclesFromAPI(exerciseData) {
    if (!exerciseData || !exerciseData.targetMuscles) {
      return [];
    }

    return exerciseData.targetMuscles.map(muscle => ({
      id: muscle.id,
      name: muscle.name,
      bodyPart: muscle.bodyPart
    }));
  }

  // Get secondary muscles from API response
  getSecondaryMusclesFromAPI(exerciseData) {
    if (!exerciseData || !exerciseData.secondaryMuscles) {
      return [];
    }

    return exerciseData.secondaryMuscles.map(muscle => ({
      id: muscle.id,
      name: muscle.name,
      bodyPart: muscle.bodyPart
    }));
  }
}

// Export a default instance
export const gymFitAPI = new GymFitAPI();

// Utility functions for pose data processing
export const poseUtils = {
  // Convert MediaPipe landmarks to a standardized format
  normalizeLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;
    
    return landmarks.map(landmark => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      visibility: landmark.visibility || 1
    }));
  },

  // Calculate angles between three points
  calculateAngle(pointA, pointB, pointC) {
    const ab = { x: pointA.x - pointB.x, y: pointA.y - pointB.y, z: pointA.z - pointB.z };
    const cb = { x: pointC.x - pointB.x, y: pointC.y - pointB.y, z: pointC.z - pointB.z };
    
    const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
    
    const angleRad = Math.acos(dot / (magAB * magCB));
    return (angleRad * 180) / Math.PI;
  },

  // Extract all relevant angles from MediaPipe pose landmarks
  extractAngles(landmarks) {
    if (!landmarks || landmarks.length < 33) return {};

    return {
      leftElbow: this.calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
      rightElbow: this.calculateAngle(landmarks[12], landmarks[14], landmarks[16]),
      leftShoulder: this.calculateAngle(landmarks[13], landmarks[11], landmarks[23]),
      rightShoulder: this.calculateAngle(landmarks[14], landmarks[12], landmarks[24]),
      leftHip: this.calculateAngle(landmarks[11], landmarks[23], landmarks[25]),
      rightHip: this.calculateAngle(landmarks[12], landmarks[24], landmarks[26]),
      leftKnee: this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]),
      rightKnee: this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]),
      leftAnkle: this.calculateAngle(landmarks[25], landmarks[27], landmarks[31]),
      rightAnkle: this.calculateAngle(landmarks[26], landmarks[28], landmarks[32]),
    };
  }
};