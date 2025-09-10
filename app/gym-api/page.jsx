"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { gymFitAPI, poseUtils } from "../utils/gymFitApi";

const VALID_BODYPARTS = [
  "Arms", "Back", "Chest", "Core", "Glutes", "Legs", "Shoulders"
];
const VALID_EQUIPMENT = [
  "Barbell", "Dumbbell", "Kettlebell", "Machine", "Bodyweight", "Band", "Cable", "Other"
];

// Enhanced voice feedback with different priorities
function speakFeedback(feedback, priority = 'normal') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && feedback && feedback.length > 0) {
    const utterance = new window.SpeechSynthesisUtterance(feedback.join('. '));
    utterance.rate = priority === 'urgent' ? 1.2 : 0.9;
    utterance.pitch = priority === 'urgent' ? 1.2 : 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

// Enhanced pose analysis utilities
const enhancedPoseUtils = {
  // Calculate distance between two landmarks
  calculateDistance: (landmark1, landmark2) => {
    if (!landmark1 || !landmark2) return 0;
    const dx = landmark1.x - landmark2.x;
    const dy = landmark1.y - landmark2.y;
    const dz = (landmark1.z || 0) - (landmark2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  // Calculate spine alignment
  calculateSpineAlignment: (landmarks) => {
    if (!landmarks || landmarks.length < 33) return 0;
    
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };
    
    // Calculate spine angle from vertical
    const spineVector = {
      x: shoulderMidpoint.x - hipMidpoint.x,
      y: shoulderMidpoint.y - hipMidpoint.y
    };
    
    const verticalVector = { x: 0, y: 1 };
    const dotProduct = spineVector.x * verticalVector.x + spineVector.y * verticalVector.y;
    const magnitude = Math.sqrt(spineVector.x * spineVector.x + spineVector.y * spineVector.y);
    
    return Math.acos(Math.abs(dotProduct) / magnitude) * (180 / Math.PI);
  },

  // Calculate hip hinge angle for deadlifts/squats
  calculateHipHingeAngle: (landmarks) => {
    if (!landmarks || landmarks.length < 33) return 0;
    
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftShoulder = landmarks[11];
    
    const hipToKnee = { x: leftKnee.x - leftHip.x, y: leftKnee.y - leftHip.y };
    const hipToShoulder = { x: leftShoulder.x - leftHip.x, y: leftShoulder.y - leftHip.y };
    
    const dotProduct = hipToKnee.x * hipToShoulder.x + hipToKnee.y * hipToShoulder.y;
    const mag1 = Math.sqrt(hipToKnee.x * hipToKnee.x + hipToKnee.y * hipToKnee.y);
    const mag2 = Math.sqrt(hipToShoulder.x * hipToShoulder.x + hipToShoulder.y * hipToShoulder.y);
    
    return Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI);
  },

  // Calculate joint velocity
  calculateJointVelocity: (currentLandmarks, previousLandmarks, deltaTime) => {
    if (!currentLandmarks || !previousLandmarks || deltaTime === 0) return {};
    
    const velocities = {};
    const keyJoints = [11, 12, 13, 14, 23, 24, 25, 26]; // shoulders, elbows, hips, knees
    
    keyJoints.forEach(jointIndex => {
      if (currentLandmarks[jointIndex] && previousLandmarks[jointIndex]) {
        const current = currentLandmarks[jointIndex];
        const previous = previousLandmarks[jointIndex];
        
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        velocities[`joint_${jointIndex}`] = distance / deltaTime;
      }
    });
    
    return velocities;
  },

  // Check for bilateral symmetry
  checkBilateralSymmetry: (landmarks) => {
    if (!landmarks || landmarks.length < 33) return { score: 0, feedback: [] };
    
    const feedback = [];
    let symmetryScore = 100;
    
    // Compare left and right angles
    const leftElbow = poseUtils.calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    const rightElbow = poseUtils.calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
    const elbowDiff = Math.abs(leftElbow - rightElbow);
    
    if (elbowDiff > 15) {
      feedback.push("Maintain symmetrical arm position");
      symmetryScore -= 20;
    }
    
    const leftKnee = poseUtils.calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
    const rightKnee = poseUtils.calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
    const kneeDiff = Math.abs(leftKnee - rightKnee);
    
    if (kneeDiff > 10) {
      feedback.push("Keep both legs moving symmetrically");
      symmetryScore -= 25;
    }
    
    return { score: Math.max(0, symmetryScore), feedback };
  },

  // Detect exercise phase based on movement patterns
  detectExercisePhase: (movementHistory, exerciseType) => {
    if (!movementHistory || movementHistory.length < 3) return 'start';
    
    const recent = movementHistory.slice(-5);
    const avgVelocity = recent.reduce((sum, frame) => {
      const frameVel = Object.values(frame.velocity || {}).reduce((s, v) => s + v, 0);
      return sum + frameVel;
    }, 0) / recent.length;
    
    if (avgVelocity < 0.001) return 'hold';
    
    // Simple phase detection based on joint positions
    const latestAngles = recent[recent.length - 1].angles;
    const earliestAngles = recent[0].angles;
    
    if (exerciseType.includes('squat') || exerciseType.includes('curl')) {
      const keyAngle = exerciseType.includes('squat') ? 'leftKnee' : 'leftElbow';
      if (latestAngles[keyAngle] < earliestAngles[keyAngle]) {
        return 'down';
      } else if (latestAngles[keyAngle] > earliestAngles[keyAngle]) {
        return 'up';
      }
    }
    
    return 'active';
  }
};

// Exercise-specific analyzers
const exerciseAnalyzers = {
  squat: (landmarks, angles, movementHistory) => {
    const feedback = [];
    let score = 100;
    
    // Depth check
    const avgKneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
    if (avgKneeAngle > 100) {
      feedback.push("Go deeper - aim for thighs parallel to floor");
      score -= 25;
    } else if (avgKneeAngle < 70) {
      feedback.push("Excellent depth!");
    }
    
    // Knee tracking
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    
    if (leftKnee.x < leftAnkle.x - 0.05 || rightKnee.x < rightAnkle.x - 0.05) {
      feedback.push("Keep knees in line with toes - don't let them cave in");
      score -= 20;
    }
    
    // Spine alignment
    const spineAlignment = enhancedPoseUtils.calculateSpineAlignment(landmarks);
    if (spineAlignment > 20) {
      feedback.push("Keep your chest up and spine neutral");
      score -= 15;
    }
    
    // Hip hinge
    const hipHinge = enhancedPoseUtils.calculateHipHingeAngle(landmarks);
    if (hipHinge < 45) {
      feedback.push("Push your hips back more");
      score -= 10;
    }
    
    return { score: Math.max(0, score), feedback };
  },

  bicep_curl: (landmarks, angles, movementHistory) => {
    const feedback = [];
    let score = 100;
    
    // Elbow stability
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    if (Math.abs(leftElbow.y - leftShoulder.y) > 0.15) {
      feedback.push("Keep your elbow stationary at your side");
      score -= 20;
    }
    
    // Range of motion
    const avgElbowAngle = (angles.leftElbow + angles.rightElbow) / 2;
    if (movementHistory && movementHistory.length > 10) {
      const recentAngles = movementHistory.slice(-10).map(h => h.angles.leftElbow);
      const range = Math.max(...recentAngles) - Math.min(...recentAngles);
      
      if (range < 90) {
        feedback.push("Use full range of motion");
        score -= 15;
      }
    }
    
    // Form tempo
    if (movementHistory && movementHistory.length > 5) {
      const recent = movementHistory.slice(-5);
      const avgVelocity = recent.reduce((sum, frame) => {
        return sum + (Object.values(frame.velocity || {}).reduce((s, v) => s + v, 0) || 0);
      }, 0) / recent.length;
      
      if (avgVelocity > 0.02) {
        feedback.push("Slow down - control the weight");
        score -= 10;
      }
    }
    
    return { score: Math.max(0, score), feedback };
  },

  bench_press: (landmarks, angles, movementHistory) => {
    const feedback = [];
    let score = 100;
    
    // Arm symmetry
    const elbowDiff = Math.abs(angles.leftElbow - angles.rightElbow);
    if (elbowDiff > 15) {
      feedback.push("Keep both arms moving evenly");
      score -= 20;
    }
    
    // Elbow angle
    const avgElbowAngle = (angles.leftElbow + angles.rightElbow) / 2;
    if (avgElbowAngle < 45) {
      feedback.push("Don't lower the bar too much - protect your shoulders");
      score -= 15;
    }
    
    // Wrist alignment (approximated)
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    if (Math.abs(leftWrist.y - rightWrist.y) > 0.05) {
      feedback.push("Keep the bar level");
      score -= 10;
    }
    
    return { score: Math.max(0, score), feedback };
  }
};

// Enhanced smoothing with Kalman-like filter
const enhancedSmoothing = {
  smoothAngle: (newValue, prevSmoothed, alpha = 0.3) => {
    if (prevSmoothed === undefined) return newValue;
    return alpha * newValue + (1 - alpha) * prevSmoothed;
  },
  
  smoothAngles: (newAngles, prevSmoothed) => {
    const smoothed = {};
    Object.keys(newAngles).forEach(key => {
      smoothed[key] = enhancedSmoothing.smoothAngle(
        newAngles[key], 
        prevSmoothed[key], 
        0.4
      );
    });
    return smoothed;
  }
};

export default function GymAPIPage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentAngles, setCurrentAngles] = useState({});
  const [smoothedAngles, setSmoothedAngles] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [poseScore, setPoseScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState("loading");
  const [exercisePhase, setExercisePhase] = useState("start");
  
  // Enhanced tracking states
  const [movementHistory, setMovementHistory] = useState([]);
  const [repCount, setRepCount] = useState(0);
  const [currentRep, setCurrentRep] = useState({ phase: 'start', startTime: null });
  const [userProgress, setUserProgress] = useState({
    commonMistakes: {},
    improvements: {},
    personalBests: {},
    weeklyStats: {}
  });
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    velocity: 0,
    symmetry: 100,
    stability: 100,
    rangeOfMotion: 0
  });
  
  const previousLandmarksRef = useRef(null);
  const lastAnalysisTimeRef = useRef(Date.now());
  const lastSpokenFeedbackRef = useRef("");
  
  const [sessionStats, setSessionStats] = useState({
    totalReps: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    caloriesBurned: 0,
    formImprovements: 0
  });

  const [isHydrated, setIsHydrated] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);

  // Enhanced pose analysis function
  const enhancedAnalyzePose = useCallback(async (landmarks, angles, exerciseType) => {
    try {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastAnalysisTimeRef.current) / 1000;
      lastAnalysisTimeRef.current = currentTime;
      
      // Calculate velocities
      let velocities = {};
      if (previousLandmarksRef.current && deltaTime > 0) {
        velocities = enhancedPoseUtils.calculateJointVelocity(
          landmarks, 
          previousLandmarksRef.current, 
          deltaTime
        );
      }
      
      // Check bilateral symmetry
      const symmetryCheck = enhancedPoseUtils.checkBilateralSymmetry(landmarks);
      
      // Exercise-specific analysis
      let exerciseAnalysis = { score: 80, feedback: [] };
      const exerciseKey = exerciseType.toLowerCase().replace(/[^a-z]/g, '_');
      
      if (exerciseAnalyzers[exerciseKey]) {
        exerciseAnalysis = exerciseAnalyzers[exerciseKey](landmarks, angles, movementHistory);
      } else if (exerciseKey.includes('squat')) {
        exerciseAnalysis = exerciseAnalyzers.squat(landmarks, angles, movementHistory);
      } else if (exerciseKey.includes('curl')) {
        exerciseAnalysis = exerciseAnalyzers.bicep_curl(landmarks, angles, movementHistory);
      } else if (exerciseKey.includes('press')) {
        exerciseAnalysis = exerciseAnalyzers.bench_press(landmarks, angles, movementHistory);
      }
      
      // Update movement history
      const frameData = {
        timestamp: currentTime,
        landmarks: landmarks,
        angles: angles,
        velocity: velocities,
        phase: exercisePhase
      };
      
      setMovementHistory(prev => {
        const updated = [...prev, frameData].slice(-30); // Keep last 30 frames
        return updated;
      });
      
      // Detect exercise phase
      const detectedPhase = enhancedPoseUtils.detectExercisePhase(movementHistory, exerciseType);
      if (detectedPhase !== exercisePhase) {
        setExercisePhase(detectedPhase);
      }
      
      // Rep counting logic
      if (movementHistory.length > 10) {
        const recentPhases = movementHistory.slice(-10).map(h => h.phase);
        const phaseChanges = recentPhases.filter((phase, i) => 
          i > 0 && phase !== recentPhases[i-1]
        );
        
        if (phaseChanges.includes('down') && phaseChanges.includes('up')) {
          setRepCount(prev => {
            const newCount = prev + 1;
            if (newCount > prev) {
              // New rep completed
              setSessionStats(s => ({
                ...s,
                totalReps: s.totalReps + 1
              }));
            }
            return newCount;
          });
        }
      }
      
      // Calculate combined score
      const finalScore = Math.round(
        (exerciseAnalysis.score * 0.5) + 
        (symmetryCheck.score * 0.2) + 
        (realTimeMetrics.stability * 0.3)
      );
      
      // Combine feedback
      const combinedFeedback = [
        ...exerciseAnalysis.feedback,
        ...symmetryCheck.feedback
      ];
      
      // Update real-time metrics
      setRealTimeMetrics({
        velocity: Object.values(velocities).reduce((sum, v) => sum + v, 0) || 0,
        symmetry: symmetryCheck.score,
        stability: 100 - Math.min(50, Object.values(velocities).reduce((sum, v) => sum + v, 0) * 1000),
        rangeOfMotion: calculateRangeOfMotion(angles, exerciseType)
      });
      
      // Track user progress
      updateUserProgress(combinedFeedback, finalScore);
      
      previousLandmarksRef.current = landmarks;
      
      return {
        score: finalScore,
        feedback: combinedFeedback,
        phase: detectedPhase,
        metrics: realTimeMetrics
      };
      
    } catch (error) {
      console.error("Enhanced analysis failed:", error);
      return { score: 0, feedback: ["Analysis error"], phase: "start" };
    }
  }, [exercisePhase, movementHistory, realTimeMetrics]);

  // Calculate range of motion for specific exercises
  const calculateRangeOfMotion = (angles, exerciseType) => {
    if (!movementHistory || movementHistory.length < 5) return 0;
    
    const recentAngles = movementHistory.slice(-10).map(h => h.angles);
    let keyAngle = 'leftElbow';
    
    if (exerciseType.toLowerCase().includes('squat')) {
      keyAngle = 'leftKnee';
    }
    
    const angleValues = recentAngles.map(a => a[keyAngle]).filter(Boolean);
    if (angleValues.length === 0) return 0;
    
    const range = Math.max(...angleValues) - Math.min(...angleValues);
    const expectedRange = exerciseType.toLowerCase().includes('squat') ? 90 : 120;
    
    return Math.min(100, (range / expectedRange) * 100);
  };

  // Update user progress tracking
  const updateUserProgress = (feedback, score) => {
    setUserProgress(prev => {
      const updated = { ...prev };
      
      // Track common mistakes
      feedback.forEach(issue => {
        updated.commonMistakes[issue] = (updated.commonMistakes[issue] || 0) + 1;
      });
      
      // Track improvements
      if (score > (prev.personalBests.lastScore || 0)) {
        updated.improvements.scoreImprovement = Date.now();
        updated.personalBests.lastScore = score;
      }
      
      return updated;
    });
  };

  useEffect(() => {
    const poseUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.6.1635989132/pose.js";
    const drawingUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.6.1635989132/drawing_utils.js";

    function loadScriptOnce(url, globalCheck) {
      return new Promise((resolve, reject) => {
        try {
          if (globalCheck()) return resolve();
          const existing = document.querySelector(`script[src='${url}']`);
          if (existing) {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
            return;
          }
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        } catch (e) {
          reject(e);
        }
      });
    }

    async function loadMediaPipeAndInit() {
      await loadScriptOnce(poseUrl, () => !!window.Pose);
      await loadScriptOnce(drawingUrl, () => !!window.drawConnectors);
      setIsHydrated(true);
      setSessionStartTime(Date.now());
    }
    loadMediaPipeAndInit();
  }, []);

  // Fetch exercises when filters change
  useEffect(() => {
    if (!isHydrated) return;

    const fetchExercises = async () => {
      try {
        setApiStatus("loading");
        const exercisesData = await gymFitAPI.searchExercises({
          query: searchTerm,
          number: 50,
          offset: 0,
          bodyPart: selectedBodyPart || undefined,
          equipment: selectedEquipment || undefined,
        });
        const exercisesArray = Array.isArray(exercisesData)
          ? exercisesData
          : Array.isArray(exercisesData?.data)
            ? exercisesData.data
            : [];
        setExercises(exercisesArray);
        setApiStatus("connected");
        if (exercisesArray.length > 0) {
          setSelectedExercise(exercisesArray[0]);
        } else {
          setSelectedExercise(null);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setApiStatus("error");
        setExercises([]);
        setSelectedExercise(null);
      }
    };

    fetchExercises();
  }, [isHydrated, searchTerm, selectedBodyPart, selectedEquipment]);

  // Enhanced MediaPipe pose detection
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    let poseInstance;
    let animationId;

    if (!window.Pose) return;
    poseInstance = new window.Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.6.1635989132/${file}`,
    });

    poseInstance.setOptions({
      modelComplexity: 2, // Increased for better accuracy
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.7, // Increased threshold
      minTrackingConfidence: 0.5,
    });

    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");

    poseInstance.onResults(async (results) => {
      ctx.save();
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.poseLandmarks) {
        // Draw pose with enhanced visualization
        if (window.drawConnectors && window.POSE_CONNECTIONS) {
          window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
            color: poseScore > 70 ? "#00FF00" : poseScore > 50 ? "#FFFF00" : "#FF0000",
            lineWidth: 4,
          });
        }
        if (window.drawLandmarks) {
          window.drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 3,
            radius: 3,
          });
        }

        // Extract and smooth angles
        const rawAngles = poseUtils.extractAngles(results.poseLandmarks);
        const newSmoothedAngles = enhancedSmoothing.smoothAngles(rawAngles, smoothedAngles);
        setCurrentAngles(rawAngles);
        setSmoothedAngles(newSmoothedAngles);

        if (selectedExercise) {
          setIsAnalyzing(true);
          
          try {
            const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
            const analysis = await enhancedAnalyzePose(
              results.poseLandmarks, 
              newSmoothedAngles, 
              exerciseType
            );
            
            setPoseScore(analysis.score);
            setFeedback(analysis.feedback);
            
            // Enhanced voice feedback with priorities
            const feedbackText = analysis.feedback.join('. ');
            if (feedbackText && feedbackText !== lastSpokenFeedbackRef.current) {
              const priority = analysis.score < 50 ? 'urgent' : 'normal';
              speakFeedback(analysis.feedback, priority);
              lastSpokenFeedbackRef.current = feedbackText;
            }
            
          } catch (error) {
            console.error("Enhanced analysis failed:", error);
          }
          
          setIsAnalyzing(false);

          // Update session stats with enhanced metrics
          if (sessionStartTime > 0) {
            setSessionStats(prev => {
              const newAvgScore = prev.totalReps > 0 
                ? Math.round((prev.averageScore * prev.totalReps + poseScore) / (prev.totalReps + 1))
                : poseScore;
              
              return {
                ...prev,
                totalTime: Math.floor((Date.now() - sessionStartTime) / 1000),
                averageScore: newAvgScore,
                bestScore: Math.max(prev.bestScore, poseScore),
                caloriesBurned: Math.round(prev.totalReps * 0.8), // Rough estimate
                formImprovements: prev.averageScore < newAvgScore ? prev.formImprovements + 1 : prev.formImprovements
              };
            });
          }

          // Enhanced angle display with color coding
          drawEnhancedAngles(ctx, canvasElement, newSmoothedAngles, results.poseLandmarks, selectedExercise);
          
          // Draw enhanced UI elements
          drawEnhancedUI(ctx, canvasElement);
        }
      }
      ctx.restore();
    });

    // Helper function for enhanced angle drawing
    function drawEnhancedAngles(ctx, canvas, angles, landmarks, exercise) {
      const exerciseType = gymFitAPI.mapExerciseNameToType(exercise.name);
      const targetAngles = gymFitAPI.getTargetAngles(exerciseType);
      const keyAngles = Object.keys(targetAngles);
      
      ctx.font = "14px Arial";
      
      keyAngles.forEach((angleKey, index) => {
        if (angles[angleKey] !== undefined) {
          const landmark = getLandmarkForAngle(angleKey, landmarks);
          if (landmark) {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            const target = targetAngles[angleKey];
            const tolerance = 15;
            
            const isInRange = angles[angleKey] >= (target.min - tolerance) && 
                             angles[angleKey] <= (target.max + tolerance);
            const isOptimal = angles[angleKey] >= target.min && 
                             angles[angleKey] <= target.max;
            
            // Color coding: Green = optimal, Yellow = acceptable, Red = poor
            ctx.fillStyle = isOptimal ? "#00FF00" : isInRange ? "#FFFF00" : "#FF0000";
            
            // Draw angle with background
            const text = `${angleKey}: ${angles[angleKey].toFixed(0)}°`;
            const textWidth = ctx.measureText(text).width;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(x - 5, y - 25, textWidth + 10, 20);
            
            ctx.fillStyle = isOptimal ? "#00FF00" : isInRange ? "#FFFF00" : "#FF0000";
            ctx.fillText(text, x, y - 10);
          }
        }
      });
    }

    // Helper function for enhanced UI drawing
    function drawEnhancedUI(ctx, canvas) {
      // Draw exercise info with better styling
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(10, 10, 300, 120);
      
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px Arial";
      ctx.fillText(`${selectedExercise.name}`, 15, 30);
      
      ctx.font = "14px Arial";
      ctx.fillStyle = "#CCCCCC";
      ctx.fillText(`Phase: ${exercisePhase.toUpperCase()}`, 15, 50);
      ctx.fillText(`Score: ${poseScore}%`, 15, 70);
      ctx.fillText(`Reps: ${repCount}`, 15, 90);
      
      // Real-time metrics
      ctx.fillStyle = realTimeMetrics.velocity < 0.01 ? "#00FF00" : "#FFAA00";
      ctx.fillText(`Tempo: ${realTimeMetrics.velocity < 0.01 ? "Good" : "Too Fast"}`, 15, 110);
      
      // Draw form quality indicator
      const qualityColor = poseScore >= 80 ? "#00FF00" : poseScore >= 60 ? "#FFFF00" : "#FF0000";
      ctx.fillStyle = qualityColor;
      ctx.fillRect(canvas.width - 120, 10, 100, 20);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 12px Arial";
      ctx.fillText("FORM QUALITY", canvas.width - 115, 25);
    }

    function getLandmarkForAngle(angleKey, landmarks) {
      const landmarkMap = {
        leftElbow: landmarks[13],
        rightElbow: landmarks[14],
        leftShoulder: landmarks[11],
        rightShoulder: landmarks[12],
        leftHip: landmarks[23],
        rightHip: landmarks[24],
        leftKnee: landmarks[25],
        rightKnee: landmarks[26],
        leftAnkle: landmarks[27],
        rightAnkle: landmarks[28],
      };
      return landmarkMap[angleKey];
    }

    const sendFrame = async () => {
      if (
        webcamRef.current?.video &&
        webcamRef.current.video.readyState === 4
      ) {
        await poseInstance.send({ image: webcamRef.current.video });
      }
      animationId = requestAnimationFrame(sendFrame);
    };
    sendFrame();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (poseInstance?.close) poseInstance.close();
    };
  }, [selectedExercise, exercisePhase, isHydrated, sessionStartTime, smoothedAngles, poseScore, repCount, realTimeMetrics, enhancedAnalyzePose]);

  const resetSession = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setSessionStats({
      totalReps: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0,
      caloriesBurned: 0,
      formImprovements: 0
    });
    setRepCount(0);
    setMovementHistory([]);
    setUserProgress({
      commonMistakes: {},
      improvements: {},
      personalBests: {},
      weeklyStats: {}
    });
    setSessionStartTime(Date.now());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseInstructions = () => {
    if (!selectedExercise) return [];
    
    if (selectedExercise.instructions) {
      return selectedExercise.instructions
        .sort((a, b) => a.order - b.order)
        .map(instruction => instruction.description);
    }
    
    const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
    return gymFitAPI.getExerciseInstructions(exerciseType);
  };

  const getTargetMuscles = () => {
    if (!selectedExercise) return [];
    return selectedExercise.targetMuscles || [];
  };

  const getSecondaryMuscles = () => {
    if (!selectedExercise) return [];
    return selectedExercise.secondaryMuscles || [];
  };

  const getFormQualityText = (score) => {
    if (score >= 90) return "Excellent Form! 🏆";
    if (score >= 80) return "Great Form! 💪";
    if (score >= 70) return "Good Form 👍";
    if (score >= 60) return "Fair Form ⚠️";
    if (score >= 50) return "Needs Work 📈";
    return "Poor Form - Focus! 🔴";
  };

  // Progressive difficulty adjustment
  const adjustDifficultyLevel = () => {
    const avgScore = sessionStats.averageScore;
    if (avgScore > 85) return "Consider adding weight or reps";
    if (avgScore < 60) return "Focus on form before increasing intensity";
    return "Good balance of challenge and form";
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading Enhanced AI Trainer...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing pose analysis engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">🏋️ Enhanced AI Gym Trainer</h1>
          <p className="text-gray-300">Advanced pose analysis with real-time feedback and form correction</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              apiStatus === "connected" ? "bg-green-600" : 
              apiStatus === "error" ? "bg-red-600" : "bg-yellow-600"
            }`}>
              {apiStatus === "connected" ? "🟢 AI Connected" : 
               apiStatus === "error" ? "🔴 Connection Error" : "🟡 Connecting..."}
            </span>
            {isAnalyzing && <span className="text-blue-400 animate-pulse">🔄 Analyzing Form...</span>}
            <span className="text-green-400 text-sm">Rep #{repCount}</span>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">🔍 Search Exercise:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="e.g. squat, deadlift, bench press"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">💪 Target Body Part:</label>
            <select
              value={selectedBodyPart}
              onChange={e => setSelectedBodyPart(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
            >
              <option value="">Any Body Part</option>
              {VALID_BODYPARTS.map(bp => (
                <option key={bp} value={bp}>{bp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">🏋️ Equipment:</label>
            <select
              value={selectedEquipment}
              onChange={e => setSelectedEquipment(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
            >
              <option value="">Any Equipment</option>
              {VALID_EQUIPMENT.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Enhanced Exercise Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">🎯 Select Exercise:</label>
          <select
            value={selectedExercise?.id || ""}
            onChange={(e) => {
              const exercise = exercises.find(ex => ex.id === e.target.value);
              setSelectedExercise(exercise);
              setRepCount(0);
              setMovementHistory([]);
            }}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
            disabled={exercises.length === 0}
          >
            <option value="">Choose your exercise...</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.bodyPart}) - {exercise.equipment || 'Any'}
              </option>
            ))}
          </select>
        </div>

        {/* Enhanced Session Stats */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">📊 Session Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{sessionStats.totalTime > 0 ? formatTime(sessionStats.totalTime) : "0:00"}</div>
              <div className="text-xs text-gray-400">Total Time</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{sessionStats.totalReps}</div>
              <div className="text-xs text-gray-400">Total Reps</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{sessionStats.averageScore}%</div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{sessionStats.bestScore}%</div>
              <div className="text-xs text-gray-400">Best Score</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{sessionStats.caloriesBurned}</div>
              <div className="text-xs text-gray-400">Calories</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-pink-400">{sessionStats.formImprovements}</div>
              <div className="text-xs text-gray-400">Improvements</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="mb-2">
              <span className="text-sm text-gray-300">{adjustDifficultyLevel()}</span>
            </div>
            <button
              onClick={resetSession}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Reset Session
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">⚡ Real-time Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-xl font-bold ${realTimeMetrics.velocity < 0.01 ? 'text-green-400' : 'text-orange-400'}`}>
                {realTimeMetrics.velocity < 0.01 ? 'Controlled' : 'Fast'}
              </div>
              <div className="text-xs text-gray-400">Movement Tempo</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${realTimeMetrics.symmetry > 80 ? 'text-green-400' : 'text-red-400'}`}>
                {realTimeMetrics.symmetry.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Bilateral Symmetry</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${realTimeMetrics.stability > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                {realTimeMetrics.stability.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Form Stability</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${realTimeMetrics.rangeOfMotion > 70 ? 'text-green-400' : 'text-orange-400'}`}>
                {realTimeMetrics.rangeOfMotion.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Range of Motion</div>
            </div>
          </div>
        </div>

        {/* Enhanced Exercise Info */}
        {selectedExercise && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-6">
              {selectedExercise.image && (
                <img 
                  src={selectedExercise.image} 
                  alt={selectedExercise.name}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-600"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">{selectedExercise.name}</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                    📍 {selectedExercise.bodyPart}
                  </span>
                  {selectedExercise.equipment && (
                    <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
                      🏋️ {selectedExercise.equipment}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">📋 Step-by-Step Instructions:</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
                      {getExerciseInstructions().map((instruction, index) => (
                        <li key={index} className="leading-relaxed">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">🎯 Target Muscles:</h3>
                    <div className="text-sm text-gray-300 space-y-2">
                      {getTargetMuscles().map((muscle, index) => (
                        <div key={muscle.id || index} className="flex justify-between p-2 bg-gray-700 rounded">
                          <span className="font-medium">{muscle.name}</span>
                          <span className="text-blue-400">{muscle.bodyPart}</span>
                        </div>
                      ))}
                    </div>
                    {getSecondaryMuscles().length > 0 && (
                      <>
                        <h3 className="font-semibold mb-3 mt-4 text-lg">💫 Secondary Muscles:</h3>
                        <div className="text-sm text-gray-300 space-y-2">
                          {getSecondaryMuscles().map((muscle, index) => (
                            <div key={muscle.id || index} className="flex justify-between p-2 bg-gray-700 rounded">
                              <span className="font-medium">{muscle.name}</span>
                              <span className="text-green-400">{muscle.bodyPart}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
              <div className="relative" style={{ width: 640, height: 480 }}>
                <Webcam
                  ref={webcamRef}
                  width={640}
                  height={480}
                  mirrored
                  style={{ position: "absolute", top: 0, left: 0, opacity: 0, pointerEvents: "none" }}
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                {/* Overlay for form quality */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-70 rounded-lg">
                  <span className={`text-sm font-bold ${
                    poseScore >= 80 ? 'text-green-400' : 
                    poseScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getFormQualityText(poseScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Feedback Panel */}
          <div className="space-y-4">
            {/* Form Score with Progress Ring */}
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <h3 className="font-semibold mb-4">🎯 Form Score</h3>
              <div className="relative inline-block">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="currentColor" strokeWidth="8"
                    fill="none"
                    className="text-gray-600"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="currentColor" strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={poseScore >= 80 ? 'text-green-400' : poseScore >= 60 ? 'text-yellow-400' : 'text-red-400'}
                    strokeDasharray={`${2.51 * poseScore} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{poseScore}%</span>
                </div>
              </div>
              <div className={`text-sm mt-2 font-medium ${
                poseScore >= 80 ? 'text-green-400' : 
                poseScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {getFormQualityText(poseScore)}
              </div>
            </div>

            {/* Current Angles with Enhanced Display */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">📐 Joint Angles</h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {Object.entries(smoothedAngles).map(([angle, value]) => {
                  if (!selectedExercise) return null;
                  
                  const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
                  const target = gymFitAPI.getTargetAngles(exerciseType)[angle];
                  if (!target) return null;
                  
                  const isInRange = value >= target.min && value <= target.max;
                  const isOptimal = value >= (target.min + 5) && value <= (target.max - 5);
                  
                  return (
                    <div key={angle} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-gray-300">
                        {angle.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          isOptimal ? 'text-green-400' : 
                          isInRange ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {value.toFixed(0)}°
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          isOptimal ? 'bg-green-400' : 
                          isInRange ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Feedback */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">💬 AI Feedback</h3>
              {feedback.length > 0 ? (
                <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                  {feedback.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-900 bg-opacity-30 rounded border-l-2 border-red-400">
                      <span className="text-red-400 mt-0.5">⚠️</span>
                      <span className="text-red-200 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 bg-green-900 bg-opacity-30 rounded border-l-2 border-green-400">
                  <span className="text-green-400">🎉 Perfect form! Keep it up!</span>
                </div>
              )}
            </div>

            {/* Enhanced Phase Control */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">🔄 Exercise Phase</h3>
              <div className="grid grid-cols-2 gap-2">
                {["start", "down", "hold", "up"].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setExercisePhase(phase)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      exercisePhase === phase
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-400">
                  Current: <span className="text-blue-400 font-bold">{exercisePhase.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* Progress Insights */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">📈 Progress Insights</h3>
              <div className="text-sm text-gray-300">
                {Object.keys(userProgress.commonMistakes).length > 0 ? (
                  <div>
                    <p className="mb-2 text-yellow-400">Most common issues:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {Object.entries(userProgress.commonMistakes)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([mistake, count]) => (
                          <li key={mistake}>{mistake} ({count}x)</li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-green-400 text-center">Keep practicing to see insights!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}