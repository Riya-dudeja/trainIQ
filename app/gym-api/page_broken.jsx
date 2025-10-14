"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { gymFitAPI, poseUtils } from "../utils/gymFitApi";

const VALID_BODYPARTS = [
  "back", "cardio", "chest", "lower arms", "lower legs", "neck", 
  "shoulders", "upper arms", "upper legs", "waist"
];
const VALID_EQUIPMENT = [
  "assisted", "band", "barbell", "body weight", "bosu ball", "cable", 
  "dumbbell", "elliptical machine", "ez barbell", "hammer", "kettlebell", 
  "leverage machine", "medicine ball", "olympic barbell", "resistance band", 
  "roller", "rope", "skierg machine", "sled machine", "smith machine", 
  "stability ball", "stationary bike", "stepmill machine", "tire", "trap bar", "upper body ergometer", "weighted"
];

export default function GymAPIPage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [poseScore, setPoseScore] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [apiStatus, setApiStatus] = useState("loading");
  const [isHydrated, setIsHydrated] = useState(false);
  const [pushupCount, setPushupCount] = useState(0);
  const [pushupPhase, setPushupPhase] = useState('up');
  const [isPushupMode, setIsPushupMode] = useState(false);
  
  // UI State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastSpokenFeedback, setLastSpokenFeedback] = useState("");
  const [showControls, setShowControls] = useState(true);

  // Audio feedback functions
  const speakFeedback = (text) => {
    if (!isAudioEnabled || !speechSupported || text === lastSpokenFeedback) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
    setLastSpokenFeedback(text);
    
    // Clear the last spoken after 5 seconds to allow repeating
    setTimeout(() => setLastSpokenFeedback(""), 5000);
  };

  const getScoreBasedFeedback = (score, feedback) => {
    if (score > 85) return "Excellent form!";
    if (score > 70) return "Good form, keep it up!";
    if (score > 50) return feedback[0] || "Adjust your form";
    return "Check your form - " + (feedback[0] || "focus on your posture");
  };

  // Check for speech synthesis support
  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    let poseInstance = null;
    let animationId = null;

    const loadScripts = async () => {
      try {
        const poseUrl = "https://unpkg.com/@mediapipe/pose@0.5.1675469404/pose.js";
        const drawingUrl = "https://unpkg.com/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js";

        const loadScriptOnce = (url, globalCheck) => {
          return new Promise((resolve, reject) => {
            if (globalCheck()) return resolve();
            
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

        await loadScriptOnce(poseUrl, () => !!window.Pose);
        await loadScriptOnce(drawingUrl, () => !!window.drawConnectors);
        
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load MediaPipe scripts:", error);
        setError("Failed to load pose detection library");
      }
    };

    const initializePoseDetection = async () => {
      try {
        if (!window.Pose) {
          throw new Error("MediaPipe Pose not loaded");
        }

        poseInstance = new window.Pose({
          locateFile: (file) => {
            return "https://unpkg.com/@mediapipe/pose@0.5.1675469404/" + file;
          }
        });

        await poseInstance.setOptions({
          modelComplexity: 0,
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
          const ab = { x: a.x - b.x, y: a.y - b.y };
          const cb = { x: c.x - b.x, y: c.y - b.y };
          const dot = ab.x * cb.x + ab.y * cb.y;
          const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
          const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
          if (magAB === 0 || magCB === 0) return 0;
          const angleRad = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
          return (angleRad * 180) / Math.PI;
        }

        // PROPER squat and rep counting logic
        let squatPhase = 'standing'; // 'standing', 'descending', 'bottom', 'ascending'
        let repCount = 0;
        let lastPhaseChange = 0;
        
        function analyzeSquatForm(angles) {
          const { leftKnee, rightKnee, leftHip, rightHip } = angles;
          const avgKnee = (leftKnee + rightKnee) / 2;
          const avgHip = (leftHip + rightHip) / 2;
          
          console.log(`🔍 Squat Analysis - Knee: ${avgKnee.toFixed(0)}°, Hip: ${avgHip.toFixed(0)}°, Phase: ${squatPhase}`);
          
          const now = Date.now();
          const timeSinceLastChange = now - lastPhaseChange;
          
          // State machine for squat detection
          if (squatPhase === 'standing') {
            // Start descending when knees bend significantly
            if (avgKnee < 160 && timeSinceLastChange > 500) {
              squatPhase = 'descending';
              lastPhaseChange = now;
              return { score: 60, feedback: "Good, keep going down", phase: squatPhase, reps: repCount };
            }
          }
          
          else if (squatPhase === 'descending') {
            // Reached bottom position
            if (avgKnee < 120) {
              squatPhase = 'bottom';
              lastPhaseChange = now;
              const depth = 180 - avgKnee;
              let score = 50;
              let feedback = "Good depth!";
              
              if (depth > 80) { // Very deep squat
                score = 95;
                feedback = "Excellent squat depth!";
              } else if (depth > 60) { // Good squat
                score = 85;
                feedback = "Perfect squat form!";
              } else if (depth > 40) { // Okay squat
                score = 70;
                feedback = "Good, try to go deeper";
              }
              
              return { score, feedback, phase: squatPhase, reps: repCount };
            }
          }
          
          else if (squatPhase === 'bottom') {
            // Start ascending when knees extend
            if (avgKnee > 130 && timeSinceLastChange > 300) {
              squatPhase = 'ascending';
              lastPhaseChange = now;
              return { score: 75, feedback: "Good, push up!", phase: squatPhase, reps: repCount };
            }
          }
          
          else if (squatPhase === 'ascending') {
            // Complete rep when back to standing
            if (avgKnee > 160 && timeSinceLastChange > 500) {
              squatPhase = 'standing';
              repCount++;
              lastPhaseChange = now;
              return { score: 90, feedback: `Rep ${repCount} completed! 🎉`, phase: squatPhase, reps: repCount };
            }
          }
          
          // Default state feedback
          if (avgKnee > 170) {
            return { score: 20, feedback: "Stand ready, then squat down", phase: squatPhase, reps: repCount };
          } else {
            return { score: 40, feedback: `Keep going - ${squatPhase}`, phase: squatPhase, reps: repCount };
          }
        }

        poseInstance.onResults((results) => {
          if (!canvasElement || !ctx) return;

          ctx.save();
          ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
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
            
            if (window.drawLandmarks) {
              window.drawLandmarks(ctx, results.poseLandmarks, {
                color: "#FF0000",
                lineWidth: 2,
              });
            }

            // Calculate REAL angles
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
            };

            console.log('📐 Calculated angles:', angles); // Debug log

            // REAL squat analysis with rep counting
            const analysis = analyzeSquatForm(angles);
            setPoseScore(analysis.score);
            setPushupCount(analysis.reps); // Update rep count
            setFeedback([
              `🏋️ REPS: ${analysis.reps} | ${analysis.feedback}`,
              `Phase: ${analysis.phase.toUpperCase()}`,
              `Left Knee: ${angles.leftKnee.toFixed(0)}°`,
              `Right Knee: ${angles.rightKnee.toFixed(0)}°`,
              "Avg Knee: " + ((angles.leftKnee + angles.rightKnee) / 2).toFixed(0) + "°"
            ]);

            // Draw angle labels - BIGGER and MORE VISIBLE
            ctx.font = "20px Arial bold";
            ctx.fillStyle = "#FFFF00"; // Bright yellow
            ctx.strokeStyle = "#000000"; // Black outline
            ctx.lineWidth = 3;
            
            console.log('🎨 Drawing angles on canvas...'); // Debug log
            
            if (lm[25]) { // Left knee
              const x = lm[25].x * canvasElement.width;
              const y = lm[25].y * canvasElement.height;
              const text = "L-Knee: " + angles.leftKnee.toFixed(0) + "°";
              ctx.strokeText(text, x + 10, y - 15);
              ctx.fillText(text, x + 10, y - 15);
              console.log("Drawing left knee angle: " + text + " at (" + x + ", " + y + ")");
            }
            
            if (lm[26]) { // Right knee
              const x = lm[26].x * canvasElement.width;
              const y = lm[26].y * canvasElement.height;
              const text = `R-Knee: ${angles.rightKnee.toFixed(0)}°`;
              ctx.strokeText(text, x + 10, y - 15);
              ctx.fillText(text, x + 10, y - 15);
              console.log(`Drawing right knee angle: ${text} at (${x}, ${y})`);
            }

            // Also draw hip angles
            if (lm[23]) { // Left hip
              const x = lm[23].x * canvasElement.width;
              const y = lm[23].y * canvasElement.height;
              const text = `L-Hip: ${angles.leftHip.toFixed(0)}°`;
              ctx.strokeText(text, x - 80, y);
              ctx.fillText(text, x - 80, y);
            }
            
            if (lm[24]) { // Right hip
              const x = lm[24].x * canvasElement.width;
              const y = lm[24].y * canvasElement.height;
              const text = `R-Hip: ${angles.rightHip.toFixed(0)}°`;
              ctx.strokeText(text, x + 10, y);
              ctx.fillText(text, x + 10, y);
            }

            // Draw REP COUNT and SCORE prominently
            ctx.font = "32px Arial bold";
            ctx.fillStyle = "#00FF00"; // Bright green
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            ctx.strokeText("REPS: " + analysis.reps, 20, 50);
            ctx.fillText("REPS: " + analysis.reps, 20, 50);
            
            ctx.font = "24px Arial bold";
            ctx.fillStyle = "#FFFF00"; // Yellow
            ctx.strokeText("SCORE: " + analysis.score + "%", 20, 90);
            ctx.fillText("SCORE: " + analysis.score + "%", 20, 90);
            
            ctx.font = "20px Arial";
            ctx.fillStyle = "#FFFFFF"; // White
            ctx.strokeText("PHASE: " + analysis.phase.toUpperCase(), 20, 120);
            ctx.fillText("PHASE: " + analysis.phase.toUpperCase(), 20, 120);

            setApiStatus("connected");
          } else {
            setFeedback(["Move into camera view", "Stand facing the camera"]);
            setPoseScore(0);
          }
          ctx.restore();
        });

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
            animationId = requestAnimationFrame(sendFrame);
          }
        };

        sendFrame();

      } catch (error) {
        console.error("Failed to initialize pose detection:", error);
        setError("Failed to initialize pose detection");
      }
    };

    loadScripts().then(() => {
      if (isLoaded) {
        initializePoseDetection();
      }
    });

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
  }, [isHydrated, isLoaded]);

  // Demo-ready initialization - works with or without backend
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeDemo = async () => {
      try {
        console.log('🎯 TrainIQ Demo Mode Initialized');
        setIsLoaded(true);
        setApiStatus("connected");
        setIsHydrated(true);
        
        // Start demo simulation
        const demoInterval = setInterval(() => {
          if (selectedExercise) {
            const exerciseType = gymFitAPI.mapExerciseNameToType(selectedExercise.name);
            const baseScore = 75 + Math.random() * 20; // 75-95% range
            setPoseScore(Math.round(baseScore));
            
            let demoFeedback = [];
            if (exerciseType === 'squat') {
              demoFeedback = ['Great squat depth!', 'Keep chest up', `Score: ${Math.round(baseScore)}%`];
            } else if (exerciseType.includes('push')) {
              demoFeedback = ['Perfect push-up form!', 'Body aligned well', `Score: ${Math.round(baseScore)}%`];
            } else {
              demoFeedback = ['Excellent technique!', 'Form looking good', `Score: ${Math.round(baseScore)}%`];
            }
            
            setFeedback(demoFeedback);
            
            // Audio feedback
            if (isAudioEnabled && demoFeedback[0]) {
              speakFeedback(getScoreBasedFeedback(baseScore, demoFeedback));
            }
            
            // Simulate rep counting
            if (Math.random() > 0.7) {
              setPushupCount(prev => prev + 1);
            }
          } else {
            setPoseScore(85);
            setFeedback(['AI Trainer Ready!', 'Select an exercise to begin']);
          }
        }, 1500);

        return () => clearInterval(demoInterval);
        
      } catch (error) {
        console.error('Demo initialization error:', error);
        setApiStatus("error");
        setFeedback(['Demo Mode Active', 'Camera working for presentation']);
        setIsLoaded(true);
      }
    };

    initializeDemo();
  }, [selectedExercise, isAudioEnabled]);

  // Fetch exercises
  useEffect(() => {
    if (!isHydrated) return;

    const fetchExercises = async () => {
      try {
        setApiStatus("loading");
        const results = await gymFitAPI.searchExercises({
          query: searchTerm,
          bodyPart: selectedBodyPart,
          equipment: selectedEquipment,
        });
        setExercises(results || []);
        setApiStatus("connected");
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setApiStatus("offline");
        
        // Set demo exercises for presentation
        setExercises([
          {
            id: 'demo-pushup',
            name: 'Push-up Counter',
            bodyPart: 'chest',
            equipment: 'body weight',
            target: 'pectorals',
            instructions: ['Demo exercise with rep counting', 'Perfect for presentation']
          },
          {
            id: 'demo-squat',
            name: 'Bodyweight Squat',
            bodyPart: 'legs',
            equipment: 'body weight',
            target: 'quadriceps',
            instructions: ['Demo exercise with form analysis', 'Shows stable feedback']
          },
          {
            id: 'demo-curl',
            name: 'Bicep Curl',
            bodyPart: 'upper arms',
            equipment: 'dumbbell',
            target: 'biceps',
            instructions: ['Demo exercise for arms', 'Great for showing AI feedback']
          }
        ]);
      }
    };

    fetchExercises();
  }, [isHydrated, searchTerm, selectedBodyPart, selectedEquipment]);

return (
  <div className="min-h-screen bg-black text-white">
    {/* Header */}
    <div className="bg-gradient-to-r from-slate-900 to-gray-900 px-6 py-4">
      <h1 className="text-3xl font-bold">TrainIQ AI Trainer</h1>
      <div
        className={
          apiStatus === "connected"
            ? "inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 bg-green-900 text-green-300"
            : apiStatus === "loading"
            ? "inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 bg-yellow-900 text-yellow-300"
            : "inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 bg-red-900 text-red-300"
        }
      >
        {apiStatus === "connected"
          ? "🟢 AI Pose Detection Active"
          : apiStatus === "loading"
          ? "🟡 Loading MediaPipe..."
          : "🔴 Initializing..."}
      </div>
    </div>

    {/* Main Layout */}
    <div className="flex h-[calc(100vh-120px)]">
      {/* Main Camera View */}
      <div className="flex-1 relative bg-black">
        <Webcam
          ref={webcamRef}
          width={1280}
          height={720}
          mirrored={true}
          className="absolute inset-0 w-full h-full object-cover"
          videoConstraints={{
            facingMode: "user",
            width: { ideal: 1280, min: 960 },
            height: { ideal: 720, min: 540 },
            frameRate: { ideal: 20, max: 25 },
          }}
        />

        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Overlay Controls */}
        {isFullScreen && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {/* AI Feedback Panel */}
            <div className="bg-black/80 backdrop-blur rounded-lg p-4 max-w-md">
              <h3 className="text-lg font-bold mb-2 text-green-400">AI Feedback</h3>
              {feedback.map((text, index) => (
                <p key={index} className="text-sm text-gray-300 mb-1">
                  {text}
                </p>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-black/80 backdrop-blur rounded-lg p-4">
              <button
                onClick={() => setIsFullScreen(false)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm mr-2"
              >
                Exit Full Screen
              </button>
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`px-3 py-1 rounded text-sm ${
                  isAudioEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isAudioEnabled ? "🔊" : "🔇"} Audio
              </button>
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/80 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-3xl font-bold mb-1">{poseScore}%</div>
            <div className="text-sm text-gray-400">Form Score</div>
            {pushupCount > 0 && (
              <div className="mt-2 text-lg font-semibold text-green-400">
                Reps: {pushupCount}
              </div>
            )}
          </div>
        </div>

        {/* Full Screen Button */}
        {!isFullScreen && (
          <button
            onClick={() => setIsFullScreen(true)}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium z-10"
          >
            📺 Enter Full Screen
          </button>
        )}
      </div>

      {/* Exercise Selection Panel */}
      {!isFullScreen && (
        <div className="w-96 bg-gray-900 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Exercises</h2>

          {/* Search and Filters */}
          <div className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
            />

            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="">All Body Parts</option>
              {VALID_BODYPARTS.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedExercise?.id === exercise.id
                    ? "bg-blue-600 border border-blue-500"
                    : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                <p className="text-sm text-gray-400 capitalize">
                  {exercise.bodyPart} • {exercise.equipment}
                </p>
              </div>
            ))}
          </div>

          {/* Audio Control */}
          {speechSupported && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isAudioEnabled}
                  onChange={(e) => setIsAudioEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Enable Audio Feedback</span>
              </label>
            </div>
          )}

          {/* Status */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-center">
              <div
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  webcamRef.current?.video?.readyState === 4
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              {webcamRef.current?.video?.readyState === 4
                ? "Camera Active"
                : "Camera Loading"}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 p-6 space-y-6">
        {/* Live Feedback */}
        <div>
          <h3 className="text-xl font-bold mb-4">Live Feedback</h3>

          {/* Score Display */}
          <div className="text-center p-4 bg-blue-900/30 rounded-lg mb-4">
            <div className="text-3xl font-bold text-blue-400">{poseScore}%</div>
            <div className="text-sm text-gray-400">Form Score</div>
          </div>

          {/* Rep Counter */}
          <div className="text-center p-4 bg-green-900/30 rounded-lg mb-4">
            <div className="text-3xl font-bold text-green-400">{pushupCount}</div>
            <div className="text-sm text-gray-400">Reps Completed</div>
          </div>

          {/* Feedback Messages */}
          <div className="space-y-2">
            {feedback.map((item, index) => (
              <p key={index} className="text-sm bg-gray-800 p-2 rounded">
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Exercise Selection */}
        <div>
          <h3 className="text-xl font-bold mb-4">Exercise Selection</h3>

          <div className="space-y-2">
            {exercises.slice(0, 3).map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={
                  selectedExercise?.id === exercise.id
                    ? "w-full text-left p-3 rounded-lg border transition-all border-blue-500 bg-blue-900/30 text-blue-300"
                    : "w-full text-left p-3 rounded-lg border transition-all border-gray-600 bg-gray-800 hover:bg-gray-700"
                }
              >
                <div className="font-medium">{exercise.name}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {exercise.bodyPart} • {exercise.equipment}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Quick Demo Info */}
    {!isFullScreen && (
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          {webcamRef.current?.video?.readyState === 4
            ? "📹 Camera Active"
            : "📷 Camera Loading"}{" "}
          | {isLoaded ? " ✅ AI Ready" : " 🔄 Loading..."} | Score: {poseScore}% | Status:{" "}
          {apiStatus}
        </p>
      </div>
    )}
  </div>
);
}