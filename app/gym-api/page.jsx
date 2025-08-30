"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { gymFitAPI, poseUtils } from "../utils/gymFitApi";

export default function GymAPIPage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentAngles, setCurrentAngles] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [poseScore, setPoseScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState("loading"); // "loading", "connected", "error"
  const [exercisePhase, setExercisePhase] = useState("start");
  const [sessionStats, setSessionStats] = useState({
    totalReps: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0
  });

  // Fetch exercises from API on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setApiStatus("loading");
        const exercisesData = await gymFitAPI.getAllExercises();
        setExercises(exercisesData);
        setApiStatus("connected");
        
        // Set default exercise if available
        if (exercisesData.length > 0) {
          setSelectedExercise(exercisesData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setApiStatus("error");
      }
    };

    fetchExercises();
  }, []);

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

          if (selectedExercise) {
            // Prepare pose data for analysis
            const poseData = {
              landmarks: poseUtils.normalizeLandmarks(results.poseLandmarks),
              angles: angles,
              timestamp: new Date().toISOString(),
              phase: exercisePhase
            };

            // Analyze pose
            setIsAnalyzing(true);
            try {
              const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
              const analysis = await gymFitAPI.analyzePose(poseData, exerciseType);
              setPoseScore(analysis.score || 0);
              setFeedback(analysis.feedback || []);
            } catch (error) {
              console.error("Analysis failed:", error);
            }
            setIsAnalyzing(false);

            // Update session stats
            setSessionStats(prev => ({
              ...prev,
              totalTime: Math.floor((Date.now() - sessionStartTime) / 1000),
              averageScore: Math.round((prev.averageScore * prev.totalReps + (analysis?.score || 0)) / (prev.totalReps + 1)),
              bestScore: Math.max(prev.bestScore, analysis?.score || 0)
            }));

            // Draw angle measurements
            ctx.font = "16px Arial";
            ctx.fillStyle = "yellow";
            
            const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
            const targetAngles = gymFitAPI.getTargetAngles(exerciseType);
            const keyAngles = Object.keys(targetAngles);
            
            keyAngles.forEach((angleKey) => {
              if (angles[angleKey] !== undefined) {
                const landmark = getLandmarkForAngle(angleKey, results.poseLandmarks);
                if (landmark) {
                  const x = landmark.x * canvasElement.width;
                  const y = landmark.y * canvasElement.height;
                  const target = targetAngles[angleKey];
                  const isInRange = angles[angleKey] >= target.min && angles[angleKey] <= target.max;
                  ctx.fillStyle = isInRange ? "#00FF00" : "#FF0000";
                  ctx.fillText(`${angleKey}: ${angles[angleKey].toFixed(0)}°`, x, y - 10);
                }
              }
            });

            // Draw exercise info
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "20px Arial";
            ctx.fillText(`Exercise: ${selectedExercise.name}`, 10, 30);
            ctx.fillText(`Phase: ${exercisePhase.toUpperCase()}`, 10, 60);
            ctx.fillText(`Score: ${poseScore}%`, 10, 90);
          }
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
  }, [selectedExercise, exercisePhase]);

  const resetSession = () => {
    setSessionStats({
      totalReps: 0,
      averageScore: 0,
      bestScore: 0,
      totalTime: 0
    });
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
    
    // Fallback to local instructions
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🏋️ Gym-Fit API Trainer</h1>
          <p className="text-gray-300">Real exercise data from gym-fit-api with pose analysis</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              apiStatus === "connected" ? "bg-green-600" : 
              apiStatus === "error" ? "bg-red-600" : "bg-yellow-600"
            }`}>
              {apiStatus === "connected" ? "🟢 API Connected" : 
               apiStatus === "error" ? "🔴 API Error" : "🟡 Loading..."}
            </span>
            {isAnalyzing && <span className="text-blue-400">🔄 Analyzing...</span>}
          </div>
        </div>

        {/* Exercise Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Exercise:</label>
          <select
            value={selectedExercise?.id || ""}
            onChange={(e) => {
              const exercise = exercises.find(ex => ex.id === e.target.value);
              setSelectedExercise(exercise);
            }}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select an exercise...</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.bodyPart})
              </option>
            ))}
          </select>
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
        {selectedExercise && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-4">
              {selectedExercise.image && (
                <img 
                  src={selectedExercise.image} 
                  alt={selectedExercise.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{selectedExercise.name}</h2>
                <p className="text-gray-300 mb-3">
                  <span className="font-medium">Body Part:</span> {selectedExercise.bodyPart}
                  {selectedExercise.equipment && (
                    <span className="ml-4">
                      <span className="font-medium">Equipment:</span> {selectedExercise.equipment}
                    </span>
                  )}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Instructions:</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                      {getExerciseInstructions().map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Target Muscles:</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      {getTargetMuscles().map((muscle, index) => (
                        <div key={muscle.id || index} className="flex justify-between">
                          <span>{muscle.name}:</span>
                          <span className="text-blue-400">{muscle.bodyPart}</span>
                        </div>
                      ))}
                    </div>
                    {getSecondaryMuscles().length > 0 && (
                      <>
                        <h3 className="font-medium mb-2 mt-4">Secondary Muscles:</h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          {getSecondaryMuscles().map((muscle, index) => (
                            <div key={muscle.id || index} className="flex justify-between">
                              <span>{muscle.name}:</span>
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

          {/* Feedback Panel */}
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
                  if (!selectedExercise) return null;
                  
                  const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
                  const target = gymFitAPI.getTargetAngles(exerciseType)[angle];
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

            {/* Feedback */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feedback</h3>
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
                <p className="text-green-400 text-sm">Great form! Keep it up! 🎉</p>
              )}
            </div>

            {/* Phase Control */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Exercise Phase</h3>
              <div className="flex gap-2 flex-wrap">
                {["start", "down", "hold", "up"].map((phase) => (
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