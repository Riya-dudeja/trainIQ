"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

// Gym pose definitions with target angles
const GYM_POSES = {
  pushup: {
    name: "Push-up",
    description: "Keep your body straight, lower chest to ground",
    targetAngles: {
      leftElbow: { min: 80, max: 100, ideal: 90 },
      rightElbow: { min: 80, max: 100, ideal: 90 },
      leftShoulder: { min: 0, max: 20, ideal: 10 },
      rightShoulder: { min: 0, max: 20, ideal: 10 },
      leftHip: { min: 160, max: 180, ideal: 170 },
      rightHip: { min: 160, max: 180, ideal: 170 },
    },
    instructions: [
      "Keep your body in a straight line",
      "Lower your chest to the ground",
      "Keep your core tight",
      "Elbows should be at 90 degrees at bottom"
    ]
  },
  squat: {
    name: "Squat",
    description: "Lower your body as if sitting back into a chair",
    targetAngles: {
      leftKnee: { min: 80, max: 120, ideal: 100 },
      rightKnee: { min: 80, max: 120, ideal: 100 },
      leftHip: { min: 80, max: 120, ideal: 100 },
      rightHip: { min: 80, max: 120, ideal: 100 },
      leftAnkle: { min: 60, max: 90, ideal: 75 },
      rightAnkle: { min: 60, max: 90, ideal: 75 },
    },
    instructions: [
      "Keep your chest up",
      "Knees should not go past your toes",
      "Lower until thighs are parallel to ground",
      "Keep your weight in your heels"
    ]
  },
  plank: {
    name: "Plank",
    description: "Hold a straight body position",
    targetAngles: {
      leftElbow: { min: 85, max: 95, ideal: 90 },
      rightElbow: { min: 85, max: 95, ideal: 90 },
      leftShoulder: { min: 0, max: 10, ideal: 5 },
      rightShoulder: { min: 0, max: 10, ideal: 5 },
      leftHip: { min: 170, max: 180, ideal: 175 },
      rightHip: { min: 170, max: 180, ideal: 175 },
    },
    instructions: [
      "Keep your body in a straight line",
      "Engage your core muscles",
      "Don't let your hips sag",
      "Hold the position steady"
    ]
  }
};

export default function GymPage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedPose, setSelectedPose] = useState("pushup");
  const [currentAngles, setCurrentAngles] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [poseScore, setPoseScore] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    let poseInstance = null;
    let animationId = null;

    const loadScripts = async () => {
      try {
        // Load MediaPipe scripts
        const poseUrl = "https://unpkg.com/@mediapipe/pose@0.5.1675469404/pose.js";
        const drawingUrl = "https://unpkg.com/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js";

        const loadScriptOnce = (url, globalCheck) => {
          return new Promise((resolve, reject) => {
            if (globalCheck()) return resolve();
            
            // Check if script already exists
            const existingScript = document.querySelector(`script[src='${url}']`);
            if (existingScript) {
              existingScript.addEventListener('load', resolve);
              existingScript.addEventListener('error', reject);
              return;
            }

            const script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        };

        // Load scripts sequentially
        await loadScriptOnce(poseUrl, () => !!window.Pose);
        await loadScriptOnce(drawingUrl, () => !!window.drawConnectors);
        
        setMediaPipeLoaded(true);
      } catch (error) {
        console.error("Failed to load MediaPipe scripts:", error);
        setCameraError("Failed to load pose detection library");
      }
    };

    const initializePoseDetection = async () => {
      try {
        if (!window.Pose) {
          throw new Error("MediaPipe Pose not loaded");
        }

        // Initialize pose detection with proper configuration
        poseInstance = new window.Pose({
          locateFile: (file) => {
            // Use a more stable CDN or local files if needed
            return `https://unpkg.com/@mediapipe/pose@0.5.1675469404/${file}`;
          }
        });

        // Configure pose detection
        await poseInstance.setOptions({
          modelComplexity: 0, // Use simpler model for better performance
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const ctx = canvasElement.getContext("2d");

        // Calculate angle between three points
        function calcAngle(a, b, c) {
          if (!a || !b || !c) return 0;
          
          const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
          const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
          
          const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
          const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
          const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
          
          if (magAB === 0 || magCB === 0) return 0;
          
          const angleRad = Math.acos(Math.max(-1, Math.min(1, dot / (magAB * magCB))));
          return (angleRad * 180) / Math.PI;
        }

        // Calculate pose score based on target angles
        function calculatePoseScore(angles, targetPose) {
          let totalScore = 0;
          let validAngles = 0;
          const targetAngles = targetPose.targetAngles;

          Object.keys(targetAngles).forEach(angleKey => {
            if (angles[angleKey] !== undefined && !isNaN(angles[angleKey])) {
              const currentAngle = angles[angleKey];
              const target = targetAngles[angleKey];
              const deviation = Math.abs(currentAngle - target.ideal);
              const maxDeviation = (target.max - target.min) / 2;
              const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
              totalScore += score;
              validAngles++;
            }
          });

          return validAngles > 0 ? Math.round(totalScore / validAngles) : 0;
        }

        // Generate feedback based on current angles vs target
        function generateFeedback(angles, targetPose) {
          const feedback = [];
          const targetAngles = targetPose.targetAngles;

          Object.keys(targetAngles).forEach(angleKey => {
            if (angles[angleKey] !== undefined && !isNaN(angles[angleKey])) {
              const currentAngle = angles[angleKey];
              const target = targetAngles[angleKey];
              
              if (currentAngle < target.min) {
                feedback.push(`${angleKey.replace(/([A-Z])/g, ' $1').toLowerCase()} is too small. Increase to ${target.ideal}°`);
              } else if (currentAngle > target.max) {
                feedback.push(`${angleKey.replace(/([A-Z])/g, ' $1').toLowerCase()} is too large. Decrease to ${target.ideal}°`);
              }
            }
          });

          return feedback.slice(0, 3); // Limit to 3 feedback items
        }

        // Set up pose detection results handler
        poseInstance.onResults((results) => {
          if (!canvasElement || !ctx) return;

          ctx.save();
          ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          // Draw the camera feed
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
          }

          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            // Draw pose connections
            if (window.drawConnectors && window.POSE_CONNECTIONS) {
              window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 4,
              });
            }
            
            // Draw landmarks
            if (window.drawLandmarks) {
              window.drawLandmarks(ctx, results.poseLandmarks, {
                color: "#FF0000",
                lineWidth: 2,
              });
            }

            // Calculate all relevant angles
            const lm = results.poseLandmarks;
            const angles = {
              leftElbow: calcAngle(lm[11], lm[13], lm[15]),
              rightElbow: calcAngle(lm[12], lm[14], lm[16]),
              leftShoulder: calcAngle(lm[13], lm[11], lm[23]),
              rightShoulder: calcAngle(lm[14], lm[12], lm[24]),
              leftHip: calcAngle(lm[11], lm[23], lm[25]),
              rightHip: calcAngle(lm[12], lm[24], lm[26]),
              leftKnee: calcAngle(lm[23], lm[25], lm[27]),
              rightKnee: calcAngle(lm[24], lm[26], lm[28]),
              leftAnkle: calcAngle(lm[25], lm[27], lm[31]),
              rightAnkle: calcAngle(lm[26], lm[28], lm[32]),
            };

            setCurrentAngles(angles);

            // Calculate score and feedback
            const targetPose = GYM_POSES[selectedPose];
            const score = calculatePoseScore(angles, targetPose);
            const newFeedback = generateFeedback(angles, targetPose);

            setPoseScore(score);
            setFeedback(newFeedback);

            // Draw angle measurements
            ctx.font = "16px Arial";
            ctx.fillStyle = "yellow";
            
            // Display key angles for the selected pose
            const keyAngles = Object.keys(targetPose.targetAngles);
            keyAngles.forEach((angleKey) => {
              if (angles[angleKey] !== undefined && !isNaN(angles[angleKey])) {
                const landmark = getLandmarkForAngle(angleKey, lm);
                if (landmark) {
                  const x = landmark.x * canvasElement.width;
                  const y = landmark.y * canvasElement.height;
                  ctx.fillText(`${angleKey}: ${angles[angleKey].toFixed(0)}°`, x, y - 10);
                }
              }
            });
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

        // Start pose detection loop
        const sendFrame = async () => {
          try {
            if (
              webcamRef.current?.video &&
              webcamRef.current.video.readyState === 4 &&
              poseInstance
            ) {
              await poseInstance.send({ image: webcamRef.current.video });
            }
            animationId = requestAnimationFrame(sendFrame);
          } catch (error) {
            console.error("Error in pose detection loop:", error);
            // Continue the loop even if there's an error
            animationId = requestAnimationFrame(sendFrame);
          }
        };

        sendFrame();

      } catch (error) {
        console.error("Failed to initialize pose detection:", error);
        setCameraError("Failed to initialize pose detection");
      }
    };

    // Load scripts first, then initialize pose detection
    loadScripts().then(() => {
      if (mediaPipeLoaded) {
        initializePoseDetection();
      }
    });

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (poseInstance && typeof poseInstance.close === 'function') {
        try {
          poseInstance.close();
        } catch (error) {
          console.error("Error closing pose instance:", error);
        }
      }
    };
  }, [selectedPose, isHydrated, mediaPipeLoaded]);

  // Handle camera errors
  const handleCameraError = (error) => {
    console.error("Camera error:", error);
    setCameraError("Camera access denied or not available");
  };

  const handleCameraLoad = () => {
    setCameraError(null);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🏋️ Gym Pose Trainer</h1>
          <p className="text-gray-300">Perfect your form with real-time feedback</p>
        </div>

        {/* Pose Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Exercise:</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(GYM_POSES).map((poseKey) => (
              <button
                key={poseKey}
                onClick={() => setSelectedPose(poseKey)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPose === poseKey
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {GYM_POSES[poseKey].name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">{GYM_POSES[selectedPose].name}</h2>
          <p className="text-gray-300 mb-3">{GYM_POSES[selectedPose].description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {GYM_POSES[selectedPose].instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Target Angles:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                {Object.entries(GYM_POSES[selectedPose].targetAngles).map(([angle, target]) => (
                  <div key={angle} className="flex justify-between">
                    <span>{angle.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span>{target.ideal}° (ideal)</span>
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
                  onUserMedia={handleCameraLoad}
                  onUserMediaError={handleCameraError}
                  style={{ position: "absolute", top: 0, left: 0, opacity: 0, pointerEvents: "none" }}
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                
                {/* Camera error overlay */}
                {cameraError && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-lg mb-2">⚠️ Camera Error</p>
                      <p className="text-sm">{cameraError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
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
                  const target = GYM_POSES[selectedPose].targetAngles[angle];
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
          </div>
        </div>
      </div>
    </div>
  );
}