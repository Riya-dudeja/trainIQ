"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Link from "next/link";

// Gym pose definitions with target angles
const GYM_POSES = {
  pushup: {
    name: "Push-up",
    description: "Keep your body straight, lower chest to ground",
    icon: "💪",
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
    icon: "🏋️",
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
    icon: "⏱️",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400/80 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading trainIQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-transparent to-gray-950"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-600/3 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 rounded-lg flex items-center justify-center">
                <span className="text-black font-semibold text-sm">T</span>
              </div>
              <div>
                <span className="text-white text-xl font-semibold tracking-tight">trainIQ</span>
                <div className="text-amber-400/60 text-xs font-medium">QUICK START</div>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/gym-api" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Full Trainer
              </Link>
              <Link 
                href="/" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-tight">
            <span className="text-white">Quick Start</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400/90 via-yellow-500/90 to-amber-500/90 bg-clip-text text-transparent">
              Form Trainer
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Fast pose analysis with instant feedback. Perfect your form with minimal setup.
          </p>
        </div>

        {/* Exercise Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Choose Your Exercise</h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Object.keys(GYM_POSES).map((poseKey) => (
              <button
                key={poseKey}
                onClick={() => setSelectedPose(poseKey)}
                className={`group relative p-6 rounded-xl border transition-all duration-200 ${
                  selectedPose === poseKey
                    ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-gray-900/30 border-gray-700/30 hover:border-gray-600/40 hover:bg-gray-900/50"
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors ${
                    selectedPose === poseKey 
                      ? "bg-amber-500/20" 
                      : "bg-gray-600/20 group-hover:bg-gray-600/30"
                  }`}>
                    <span className="text-3xl">{GYM_POSES[poseKey].icon}</span>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                    selectedPose === poseKey ? "text-amber-300" : "text-white"
                  }`}>
                    {GYM_POSES[poseKey].name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {GYM_POSES[poseKey].description}
                  </p>
                </div>
                {selectedPose === poseKey && (
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>



        {/* Main Camera View */}
        <div className="mb-8">
          <div className="bg-black rounded-xl overflow-hidden max-w-4xl mx-auto">
            <div className="relative bg-black" style={{ width: '100%', aspectRatio: '4/3' }}>
              <Webcam
                ref={webcamRef}
                width={640}
                height={480}
                mirrored
                onUserMedia={handleCameraLoad}
                onUserMediaError={handleCameraError}
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0, 
                  pointerEvents: "none" 
                }}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              
              {/* Camera error overlay */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">📹</div>
                    <p className="text-lg mb-4">{cameraError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2 rounded-lg"
                    >
                      Retry Camera
                    </button>
                  </div>
                </div>
              )}

              {/* Exercise name overlay */}
              <div className="absolute top-4 left-4">
                <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                  {GYM_POSES[selectedPose].name}
                </div>
              </div>

              {/* Score overlay */}
              <div className="absolute top-4 right-4">
                <div className="bg-black/50 text-amber-400 px-3 py-1 rounded text-sm font-medium">
                  {poseScore}%
                </div>
              </div>

              {/* Live Feedback Overlay */}
              <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-2 md:px-4 md:py-3 rounded-lg">
                  {feedback.length > 0 ? (
                    <div className="flex items-start">
                      <span className="text-red-400 mr-1 md:mr-2 text-xs md:text-sm">⚠️</span>
                      <div className="text-xs md:text-sm text-red-200 leading-tight">{feedback[0]}</div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-1 md:mr-2 text-xs md:text-sm">
                        {!mediaPipeLoaded ? "⏳" : 
                         cameraError ? "📹" : 
                         poseScore === 0 ? "👤" : "✅"}
                      </span>
                      <div className="text-xs md:text-sm leading-tight">
                        {!mediaPipeLoaded ? "Loading..." : 
                         cameraError ? "Camera needed" : 
                         poseScore === 0 ? "Get in position" : 
                         "Great form!"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Status Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-900/30 rounded-lg p-4 text-center">
            {feedback.length > 0 ? (
              <div className="text-red-300">{feedback[0]}</div>
            ) : (
              <div className="text-gray-300">
                {!mediaPipeLoaded ? "Loading AI..." : 
                 cameraError ? "Camera access required" : 
                 poseScore === 0 ? "Position yourself in the camera view" : 
                 "Great form! Keep it up!"}
              </div>
            )}
          </div>
        </div>

        {/* Exercise Instructions */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900/30 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{GYM_POSES[selectedPose].icon}</span>
              <h3 className="text-xl font-semibold text-white">{GYM_POSES[selectedPose].name}</h3>
            </div>
            <p className="text-gray-300 mb-4">{GYM_POSES[selectedPose].description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-amber-400 font-medium mb-2">Form Instructions</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  {GYM_POSES[selectedPose].instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Target Angles</h4>
                <div className="space-y-1 text-gray-300 text-sm">
                  {Object.entries(GYM_POSES[selectedPose].targetAngles).slice(0, 4).map(([angle, target]) => (
                    <div key={angle} className="flex justify-between">
                      <span className="capitalize">{angle.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className="text-blue-400">{target.ideal}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}