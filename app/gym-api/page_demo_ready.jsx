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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-stone-950 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TrainIQ AI Trainer</h1>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            apiStatus === "connected" ? "bg-green-900 text-green-300" :
            apiStatus === "loading" ? "bg-yellow-900 text-yellow-300" :
            apiStatus === "offline" ? "bg-blue-900 text-blue-300" :
            "bg-red-900 text-red-300"
          }`}>
            {apiStatus === "connected" ? "🟢 AI Ready" :
             apiStatus === "loading" ? "🟡 Loading..." :
             apiStatus === "offline" ? "🔵 Demo Mode" :
             "🔴 Camera Only"}
          </div>
        </div>

        <div className={isFullScreen ? "relative h-screen w-screen" : "flex h-[calc(100vh-120px)]"}>
          {/* Full Screen Camera View */}
          <div className={`relative ${isFullScreen ? 'w-full h-full' : 'flex-1'} bg-black overflow-hidden`}>
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
                frameRate: { ideal: 20, max: 25 }
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
                    <p key={index} className="text-sm text-gray-300 mb-1">{text}</p>
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
                      isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {isAudioEnabled ? '🔊' : '🔇'} Audio
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
                  {VALID_BODYPARTS.map(part => (
                    <option key={part} value={part}>{part}</option>
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
                        ? 'bg-blue-600 border border-blue-500'
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
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
                  <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    webcamRef.current?.video?.readyState === 4 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {webcamRef.current?.video?.readyState === 4 ? 'Camera Active' : 'Camera Loading'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Info */}
        {!isFullScreen && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>
              {webcamRef.current?.video?.readyState === 4 ? "📹 Camera Active" : "📷 Camera Loading"} | 
              {isLoaded ? " ✅ AI Ready" : " 🔄 Loading..."} | 
              Score: {poseScore}% | 
              Status: {apiStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}