"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isPushupMode, setIsPushupMode] = useState(false);
  const [leftArmPercentage, setLeftArmPercentage] = useState(0);
  const [rightArmPercentage, setRightArmPercentage] = useState(0);
  const [backendStatus, setBackendStatus] = useState("disconnected");

    // Backend connection management
    useEffect(() => {
      if (typeof window === "undefined") return;
      setIsHydrated(true);
      const initializeBackend = async () => {
        try {
          // Check backend health
          const healthResponse = await fetch('http://localhost:5000/api/health');
          if (!healthResponse.ok) {
            throw new Error('Backend not available');
          }
          // Initialize pose detection
          const initResponse = await fetch('http://localhost:5000/api/initialize');
          if (!initResponse.ok) {
            throw new Error('Failed to initialize pose detection');
          }
          setBackendStatus("connected");
          setApiStatus("connected");
          setIsLoaded(true);
          setFeedback(['🚀 Python Backend Connected!', 'Using same libraries as reference repo']);
        } catch (err) {
          console.error('Backend connection error:', err);
          setError('Python backend not available. Please start the backend server.');
          setBackendStatus("error");
          setApiStatus("offline");
          setFeedback([
            'Backend server not running',
            'Run: python backend/pose_server.py',
            'Install: pip install -r backend/requirements.txt'
          ]);
        }
      };
      initializeBackend();
    }, []);



  // WebSocket ref for cleanup
  const wsRef = useRef(null);

  // WebSocket camera streaming when backend is connected
  useEffect(() => {
    if (backendStatus !== "connected") return;
    let ws;
    let isMounted = true;
    try {
      ws = new window.WebSocket('ws://localhost:8765');
      wsRef.current = ws;
      ws.onopen = () => {
        // Optionally set feedback or status
      };
      ws.onmessage = (event) => {
        if (!isMounted) return;
        let data = {};
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          // Fallback: treat as raw base64 string
          data = { frame_base64: event.data };
        }
        // Update pose data state
        setPushupCount(data.push_ups || 0);
        setLeftArmPercentage(data.left_percentage || 0);
        setRightArmPercentage(data.right_percentage || 0);
        if (isPushupMode) {
          setFeedback([
            `Push-ups: ${data.push_ups || 0}`,
            `L-Arm: ${data.left_percentage || 0}%`,
            `R-Arm: ${data.right_percentage || 0}%`,
            `Direction: ${data.direction === 0 ? 'DOWN' : 'UP'}`
          ]);
          setPoseScore(Math.round(((data.left_percentage || 0) + (data.right_percentage || 0)) / 2));
        }
        // Draw frame
        if (data.frame_base64 && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new window.Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = `data:image/jpeg;base64,${data.frame_base64}`;
        }
      };
      ws.onerror = (e) => {
        // Optionally set error feedback
        console.error('WebSocket error', e);
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch (e) {
      console.error('WebSocket connection failed', e);
    }
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [backendStatus]);

    // Top-level processFrame function
    const processFrame = async () => {
      try {
        if (backendStatus !== "connected") return;
        const response = await fetch('http://localhost:5000/api/process_frame');
        if (!response.ok) {
          throw new Error('Failed to process frame');
        }
        const data = await response.json();
        if (data.error) {
          console.error('Backend error:', data.error);
          return;
        }
        // Update push-up data from backend
        setPushupCount(data.push_ups || 0);
        setLeftArmPercentage(data.left_percentage || 0);
        setRightArmPercentage(data.right_percentage || 0);
        // Display the processed frame
        if (data.frame_base64 && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = `data:image/jpeg;base64,${data.frame_base64}`;
        }
        // Update feedback
        if (isPushupMode) {
          setFeedback([
            `Push-ups: ${data.push_ups || 0}`,
            `L-Arm: ${data.left_percentage || 0}%`,
            `R-Arm: ${data.right_percentage || 0}%`,
            `Direction: ${data.direction === 0 ? 'DOWN' : 'UP'}`
          ]);
          setPoseScore(Math.round((data.left_percentage + data.right_percentage) / 2));
        }
      } catch (err) {
        console.warn('Frame processing error:', err.message);
      }
    };
  const resetPushupCounter = async () => {
    try {
      await fetch('http://localhost:5000/api/reset');
      setPushupCount(0);
      setLeftArmPercentage(0);
      setRightArmPercentage(0);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };
  
  // Fetch exercises (same as before)
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
        if (backendStatus === "connected") {
          setApiStatus("connected");
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setApiStatus("offline");
        
        // Set demo exercises
        setExercises([
          {
            id: 'demo-pushup',
            name: 'Push-up Counter',
            bodyPart: 'chest',
            equipment: 'body weight',
            target: 'pectorals',
            instructions: [
              'Get in plank position with hands under shoulders',
              'Keep body straight from head to heels',
              'Lower chest toward ground by bending elbows',
              'Push back up to starting position',
              'Maintain core engagement throughout'
            ]
          },
          {
            id: 'demo-1',
            name: 'Bodyweight Squat',
            bodyPart: 'legs',
            equipment: 'body weight',
            target: 'quadriceps',
            instructions: [
              'Stand with feet shoulder-width apart',
              'Lower your body by bending knees and hips',
              'Keep chest up and back straight',
              'Lower until thighs are parallel to floor',
              'Push through heels to return to start'
            ]
          }
        ]);
      }
    };

    fetchExercises();
  }, [isHydrated, searchTerm, selectedBodyPart, selectedEquipment, backendStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-stone-950 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TrainIQ AI Trainer</h1>
          <div className="flex justify-center gap-4">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              backendStatus === "connected" ? "bg-green-900 text-green-300" :
              backendStatus === "error" ? "bg-red-900 text-red-300" :
              "bg-yellow-900 text-yellow-300"
            }`}>
              {backendStatus === "connected" ? "🐍 Python Backend Connected" :
               backendStatus === "error" ? "❌ Backend Offline" :
               "🔄 Connecting to Backend..."}
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              apiStatus === "connected" ? "bg-green-900 text-green-300" :
              apiStatus === "offline" ? "bg-blue-900 text-blue-300" :
              "bg-yellow-900 text-yellow-300"
            }`}>
              {apiStatus === "connected" ? "🟢 API Connected" :
               apiStatus === "offline" ? "🔵 Offline Mode" :
               "🟡 Loading..."}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Live Camera</h2>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              {backendStatus === "connected" ? (
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg">Python Backend Required</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Run: python backend/pose_server.py
                    </p>
                  </div>
                </div>
              )}
              
              {/* Backend status indicator */}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-xs">
                {backendStatus === "connected" ? "Python Active" : "📷 Backend Offline"}
              </div>
              
              {/* Push-up mode indicator with progress bars */}
              {isPushupMode && backendStatus === "connected" && (
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="bg-blue-600/90 px-3 py-2 rounded-lg text-sm font-medium">
                    🏃 Push-up Mode: {pushupCount} reps
                  </div>
                  {/* Visual progress bars like reference repo */}
                  <div className="bg-black/50 p-2 rounded flex space-x-4 text-xs">
                    <div className="text-center">
                      <div className="text-white mb-1">L-Arm</div>
                      <div className="w-6 h-20 bg-gray-600 rounded relative">
                        <div 
                          className="absolute bottom-0 w-full bg-red-500 rounded transition-all duration-150"
                          style={{ height: `${leftArmPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-white text-xs mt-1">{leftArmPercentage}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white mb-1">R-Arm</div>
                      <div className="w-6 h-20 bg-gray-600 rounded relative">
                        <div 
                          className="absolute bottom-0 w-full bg-red-500 rounded transition-all duration-150"
                          style={{ height: `${rightArmPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-white text-xs mt-1">{rightArmPercentage}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Section */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">AI Feedback</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPushupMode(!isPushupMode)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      isPushupMode 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                    disabled={backendStatus !== "connected"}
                  >
                    {isPushupMode ? "Exit Push-up Mode" : "Push-up Counter"}
                  </button>
                  {isPushupMode && (
                    <button
                      onClick={resetPushupCounter}
                      className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-500"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                {feedback.map((item, index) => (
                  <p key={index} className="text-sm text-gray-300">{item}</p>
                ))}
              </div>
              
              {backendStatus === "connected" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-900/30 rounded">
                    <div className="text-2xl font-bold text-blue-400">
                      {isPushupMode ? pushupCount : `${poseScore}%`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isPushupMode ? "Push-ups" : "Score"}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-900/30 rounded">
                    <div className="text-2xl font-bold text-green-400">
                      {isPushupMode ? Math.round((leftArmPercentage + rightArmPercentage) / 2) : "0"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {isPushupMode ? "Avg %" : "Reps"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exercise Library */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Exercise Library</h2>
              {apiStatus === "offline" && (
                <div className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                  Offline Demo Library
                </div>
              )}
            </div>
            
            {/* Search and Filters */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={selectedBodyPart}
                  onChange={(e) => setSelectedBodyPart(e.target.value)}
                  className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="">All Body Parts</option>
                  {VALID_BODYPARTS.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
                
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="">All Equipment</option>
                  {VALID_EQUIPMENT.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {exercises.slice(0, 10).map((exercise, index) => (
                <div
                  key={exercise.id || index}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedExercise?.id === exercise.id
                      ? "bg-blue-900/50 border border-blue-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="text-sm text-gray-400">
                    {exercise.bodyPart} • {exercise.equipment}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Selected Exercise Details */}
            {selectedExercise && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">{selectedExercise.name}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Target:</strong> {selectedExercise.target}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Equipment:</strong> {selectedExercise.equipment}
                </p>
                {selectedExercise.instructions && (
                  <div>
                    <h4 className="font-semibold mb-1">Instructions:</h4>
                    <ol className="text-sm text-gray-300 space-y-1">
                      {selectedExercise.instructions.slice(0, 3).map((instruction, i) => (
                        <li key={i}>
                          {i + 1}. {typeof instruction === 'string' ? instruction : instruction.description}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {backendStatus === "error" && (
          <div className="mt-8 bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">🐍 Python Backend Required</h3>
            <div className="text-left max-w-2xl mx-auto space-y-2">
              <p className="text-sm">To use the stable pose detection:</p>
              <div className="bg-black/50 p-4 rounded font-mono text-sm">
                <p>cd backend</p>
                <p>pip install -r requirements.txt</p>
                <p>python pose_server.py</p>
              </div>
              <p className="text-xs text-gray-400">
                This uses cvzone.PoseModule for reliable pose detection without CDN loading issues.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}