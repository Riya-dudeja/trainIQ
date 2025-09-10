"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { gymFitAPI } from "../utils/gymFitApi";

// Enhanced gym pose definitions
const ENHANCED_GYM_POSES = {
  pushup: {
    name: "Push-up",
    description: "Perfect your push-up form with real-time feedback",
    phases: ["start", "down", "up"],
    targetAngles: {
      leftElbow: { min: 80, max: 100, ideal: 90 },
      rightElbow: { min: 80, max: 100, ideal: 90 },
      leftShoulder: { min: 0, max: 20, ideal: 10 },
      rightShoulder: { min: 0, max: 20, ideal: 10 },
      leftHip: { min: 160, max: 180, ideal: 170 },
      rightHip: { min: 160, max: 180, ideal: 170 },
    },
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Lower your body until your chest nearly touches the ground",
      "Keep your body in a straight line throughout the movement",
      "Push back up to the starting position",
      "Keep your core engaged and breathe steadily"
    ]
  },
  squat: {
    name: "Squat",
    description: "Master the perfect squat form",
    phases: ["start", "down", "hold", "up"],
    targetAngles: {
      leftKnee: { min: 80, max: 120, ideal: 100 },
      rightKnee: { min: 80, max: 120, ideal: 100 },
      leftHip: { min: 80, max: 120, ideal: 100 },
      rightHip: { min: 80, max: 120, ideal: 100 },
      leftAnkle: { min: 60, max: 90, ideal: 75 },
      rightAnkle: { min: 60, max: 90, ideal: 75 },
    },
    instructions: [
      "Stand with feet shoulder-width apart",
      "Lower your body as if sitting back into a chair",
      "Keep your chest up and knees behind your toes",
      "Lower until thighs are parallel to the ground",
      "Push through your heels to return to standing"
    ]
  },
  plank: {
    name: "Plank",
    description: "Hold the perfect plank position",
    phases: ["hold"],
    targetAngles: {
      leftElbow: { min: 85, max: 95, ideal: 90 },
      rightElbow: { min: 85, max: 95, ideal: 90 },
      leftShoulder: { min: 0, max: 10, ideal: 5 },
      rightShoulder: { min: 0, max: 10, ideal: 5 },
      leftHip: { min: 170, max: 180, ideal: 175 },
      rightHip: { min: 170, max: 180, ideal: 175 },
    },
    instructions: [
      "Start in a forearm plank position",
      "Keep your body in a straight line from head to heels",
      "Engage your core muscles",
      "Hold the position without letting your hips sag",
      "Breathe steadily and maintain the position"
    ]
  },
  deadlift: {
    name: "Deadlift",
    description: "Perfect your deadlift technique",
    phases: ["start", "down", "lift", "return"],
    targetAngles: {
      leftHip: { min: 100, max: 140, ideal: 120 },
      rightHip: { min: 100, max: 140, ideal: 120 },
      leftKnee: { min: 60, max: 100, ideal: 80 },
      rightKnee: { min: 60, max: 100, ideal: 80 },
      leftAnkle: { min: 70, max: 90, ideal: 80 },
      rightAnkle: { min: 70, max: 90, ideal: 80 },
    },
    instructions: [
      "Stand with feet hip-width apart",
      "Bend at your hips and knees to lower the weight",
      "Keep your back straight and chest up",
      "Grip the weight with hands shoulder-width apart",
      "Lift by extending your hips and knees"
    ]
  },
  lunge: {
    name: "Lunge",
    description: "Master the perfect lunge form",
    phases: ["start", "step", "down", "up"],
    targetAngles: {
      leftHip: { min: 80, max: 120, ideal: 100 },
      rightHip: { min: 80, max: 120, ideal: 100 },
      leftKnee: { min: 80, max: 120, ideal: 100 },
      rightKnee: { min: 80, max: 120, ideal: 100 },
    },
    instructions: [
      "Step forward with one leg",
      "Lower your body until both knees are bent at 90 degrees",
      "Keep your front knee behind your toes",
      "Push back to the starting position",
      "Alternate legs for each repetition"
    ]
  }
};

// --- Minimal poseUtils implementation ---
const poseUtils = {
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

export default function AdvancedGymPage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedPose, setSelectedPose] = useState("pushup");
  const [currentAngles, setCurrentAngles] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [poseScore, setPoseScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState("local"); // "local", "api", "error"
  const [exercisePhase, setExercisePhase] = useState("start");
  const [repCount, setRepCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    totalReps: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScripts = async () => {
      const poseUrl = "https://unpkg.com/@mediapipe/pose@0.5.1675469404/pose.js";
      const drawingUrl = "https://unpkg.com/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js";

      const loadScriptOnce = (url, globalCheck) => {
        return new Promise((resolve) => {
          if (globalCheck()) return resolve();
          if (document.querySelector(`script[src='${url}']`)) {
            document.querySelector(`script[src='${url}']`).addEventListener('load', resolve);
            return;
          }
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.onload = resolve;
          document.body.appendChild(script);
        });
      };

      await loadScriptOnce(poseUrl, () => !!window.Pose);
      await loadScriptOnce(drawingUrl, () => !!window.drawConnectors);
    };

    let poseInstance;
    let animationId;
    let sessionStartTime = Date.now();

    loadScripts().then(() => {
      if (!window.Pose) return;
      poseInstance = new window.Pose({
        locateFile: (file) =>
          `https://unpkg.com/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const canvasElement = canvasRef.current;
      const ctx = canvasElement.getContext("2d");

      poseInstance.onResults(async (results) => {
        ctx.save();
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        if (results.poseLandmarks) {
          if (window.drawConnectors && window.POSE_CONNECTIONS) {
            window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 4,
            });
          }
          if (window.drawLandmarks) {
            window.drawLandmarks(ctx, results.poseLandmarks, {
              color: "#FF0000",
              lineWidth: 2,
            });
          }

          // Extract angles using utility function
          const angles = poseUtils.extractAngles(results.poseLandmarks);
          setCurrentAngles(angles);

          // Prepare pose data for API analysis
          const poseData = {
            landmarks: poseUtils.normalizeLandmarks(results.poseLandmarks),
            angles: angles,
            timestamp: new Date().toISOString(),
            phase: exercisePhase
          };

          // Analyze pose with API or fallback to local analysis
          setIsAnalyzing(true);

          let analysis = null;
          try {
            analysis = await gymFitAPI.analyzePose(poseData, selectedPose);
            setPoseScore(analysis.score || 0);
            setFeedback(analysis.feedback || []);
            setApiStatus("api");
          } catch (error) {
            console.error("Analysis failed:", error);
            setApiStatus("error");
            // Fallback to local analysis
            analysis = gymFitAPI.localPoseAnalysis(poseData, selectedPose);
            setPoseScore(analysis.score || 0);
            setFeedback(analysis.feedback || []);
          }
          setIsAnalyzing(false);

          // Update session stats
          setSessionStats(prev => ({
            ...prev,
            totalTime: Math.floor((Date.now() - sessionStartTime) / 1000),
            averageScore: Math.round((prev.averageScore * prev.totalReps + (analysis?.score || 0)) / (prev.totalReps + 1)),
            bestScore: Math.max(prev.bestScore, analysis?.score || 0)
          }));

          // Draw angle measurements and feedback
          ctx.font = "16px Arial";
          ctx.fillStyle = "yellow";
          
          const targetPose = ENHANCED_GYM_POSES[selectedPose];
          const keyAngles = Object.keys(targetPose.targetAngles);
          keyAngles.forEach((angleKey) => {
            if (angles[angleKey] !== undefined) {
              const landmark = getLandmarkForAngle(angleKey, results.poseLandmarks);
              if (landmark) {
                const x = landmark.x * canvasElement.width;
                const y = landmark.y * canvasElement.height;
                const target = targetPose.targetAngles[angleKey];
                const isInRange = angles[angleKey] >= target.min && angles[angleKey] <= target.max;
                ctx.fillStyle = isInRange ? "#00FF00" : "#FF0000";
                ctx.fillText(`${angleKey}: ${angles[angleKey].toFixed(0)}°`, x, y - 10);
              }
            }
          });

          // Draw phase indicator
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "20px Arial";
          ctx.fillText(`Phase: ${exercisePhase.toUpperCase()}`, 10, 30);
          ctx.fillText(`Score: ${poseScore}%`, 10, 60);
        }
        ctx.restore();
      });

      // Helper function to get landmark position for angle display
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
    });

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (poseInstance?.close) poseInstance.close();
    };
  }, [selectedPose, exercisePhase]);

  const resetSession = () => {
    setSessionStats({
      totalReps: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0
    });
    setRepCount(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🏋️ Advanced Gym Trainer</h1>
          <p className="text-gray-300">AI-powered pose analysis with gym-fit-api integration</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              apiStatus === "api" ? "bg-green-600" : 
              apiStatus === "error" ? "bg-red-600" : "bg-yellow-600"
            }`}>
              {apiStatus === "api" ? "🟢 API Connected" : 
               apiStatus === "error" ? "🔴 API Error" : "🟡 Local Mode"}
            </span>
            {isAnalyzing && <span className="text-blue-400">🔄 Analyzing...</span>}
          </div>
        </div>

        {/* Exercise Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Exercise:</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(ENHANCED_GYM_POSES).map((poseKey) => (
              <button
                key={poseKey}
                onClick={() => setSelectedPose(poseKey)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPose === poseKey
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {ENHANCED_GYM_POSES[poseKey].name}
              </button>
            ))}
          </div>
        </div>

        {/* Session Stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Session Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{sessionStats.totalTime > 0 ? formatTime(sessionStats.totalTime) : "0:00"}</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{sessionStats.totalReps}</div>
              <div className="text-sm text-gray-400">Total Reps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{sessionStats.averageScore}%</div>
              <div className="text-sm text-gray-400">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{sessionStats.bestScore}%</div>
              <div className="text-sm text-gray-400">Best Score</div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={resetSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
            >
              Reset Session
            </button>
          </div>
        </div>

        {/* Exercise Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">{ENHANCED_GYM_POSES[selectedPose].name}</h2>
          <p className="text-gray-300 mb-3">{ENHANCED_GYM_POSES[selectedPose].description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {ENHANCED_GYM_POSES[selectedPose].instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Exercise Phases:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                {ENHANCED_GYM_POSES[selectedPose].phases.map((phase, index) => (
                  <div key={phase} className="flex justify-between">
                    <span>{phase}:</span>
                    <span className="capitalize">{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden">
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
              </div>
            </div>
          </div>

          {/* Advanced Feedback Panel */}
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Form Score</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{poseScore}%</div>
                <div className="text-sm text-gray-400 mt-1">
                  {poseScore >= 90 ? "Excellent!" : poseScore >= 70 ? "Good" : poseScore >= 50 ? "Fair" : "Needs Work"}
                </div>
              </div>
            </div>

            {/* Current Angles */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Current Angles</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(currentAngles).map(([angle, value]) => {
                  const target = ENHANCED_GYM_POSES[selectedPose].targetAngles[angle];
                  if (!target) return null;
                  
                  const isInRange = value >= target.min && value <= target.max;
                  return (
                    <div key={angle} className="flex justify-between">
                      <span className={isInRange ? "text-green-400" : "text-red-400"}>
                        {angle.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className={isInRange ? "text-green-400" : "text-red-400"}>
                        {value.toFixed(0)}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Feedback */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">AI Feedback</h3>
              {feedback.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {feedback.map((item, index) => (
                    <li key={index} className="text-red-400 flex items-start">
                      <span className="mr-2">⚠️</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-400 text-sm">Perfect form! Keep it up! 🎉</p>
              )}
            </div>

            {/* Phase Control */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Exercise Phase</h3>
              <div className="flex gap-2 flex-wrap">
                {ENHANCED_GYM_POSES[selectedPose].phases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setExercisePhase(phase)}
                    className={`px-3 py-1 rounded text-sm ${
                      exercisePhase === phase
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}