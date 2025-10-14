"use client";"use client";



import { useEffect, useRef, useState } from "react";import { useEffect, useRef, useState } from "react";

import Webcam from "react-webcam";import Webcam from "react-webcam";

import { gymFitAPI, poseUtils } from "../utils/gymFitApi";

export default function GymAPIPage() {

export default function GymAPIPage() {  const webcamRef = useRef(null);

  const webcamRef = useRef(null);  const canvasRef = useRef(null);

  const canvasRef = useRef(null);  const [isLoaded, setIsLoaded] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);  const [error, setError] = useState(null);

  const [feedback, setFeedback] = useState(['Connecting to Python backend...']);  const [feedback, setFeedback] = useState([]);

  const [poseScore, setPoseScore] = useState(0);

  const [apiStatus, setApiStatus] = useState("loading");  useEffect(() => {

  const [isHydrated, setIsHydrated] = useState(false);    if (typeof window === "undefined") return;

  

  // Initialize hydration    const loadMediaPipe = async () => {

  useEffect(() => {      try {

    setIsHydrated(true);        // Simple MediaPipe loading

  }, []);        const loadScript = (src) => {

          return new Promise((resolve, reject) => {

  // Python backend integration            if (document.querySelector(`script[src="${src}"]`)) {

  useEffect(() => {              resolve();

    if (!isHydrated) return;              return;

            }

    const connectToBackend = async () => {            

      try {            const script = document.createElement('script');

        console.log("🤖 Connecting to Python backend...");            script.src = src;

                    script.crossOrigin = 'anonymous';

        // Initialize backend            script.onload = resolve;

        const initResponse = await fetch('http://localhost:5000/api/initialize');            script.onerror = reject;

        if (!initResponse.ok) throw new Error('Init failed');            document.head.appendChild(script);

                  });

        console.log("✅ Backend initialized");        };

        setApiStatus("connected");

        setFeedback(["🤖 Python Backend Connected!", "Pose detection active"]);        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');

                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js');

        // Start polling for pose data        

        const pollBackend = async () => {        // Wait for globals

          try {        await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch('http://localhost:5000/api/process_frame');

            if (response.ok) {        if (!window.Pose) {

              const result = await response.json();          throw new Error('MediaPipe Pose not available');

                      }

              // Display backend camera feed on canvas

              const canvas = canvasRef.current;        const pose = new window.Pose({

              const ctx = canvas?.getContext('2d');          locateFile: (file) => {

                          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;

              if (canvas && ctx && result.frame_base64) {          }

                const img = new Image();        });

                img.onload = () => {

                  ctx.clearRect(0, 0, canvas.width, canvas.height);        pose.setOptions({

                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);          modelComplexity: 0,

                            smoothLandmarks: false,

                  // Overlay status          enableSegmentation: false,

                  ctx.font = '24px Arial';          minDetectionConfidence: 0.7,

                  ctx.fillStyle = '#00FF00';          minTrackingConfidence: 0.7,

                  ctx.strokeStyle = '#000000';          selfieMode: true,

                  ctx.lineWidth = 3;        });

                  ctx.strokeText('🤖 AI POSE DETECTION', 20, 40);

                  ctx.fillText('🤖 AI POSE DETECTION', 20, 40);        const canvasElement = canvasRef.current;

                };        const canvasCtx = canvasElement.getContext('2d');

                img.src = `data:image/jpeg;base64,${result.frame_base64}`;

              }        pose.onResults((results) => {

                        canvasCtx.save();

              // Update UI          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

              if (result.count !== undefined) {          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

                const score = Math.round((result.left_percentage + result.right_percentage) / 2) || 75;

                setPoseScore(score);          if (results.poseLandmarks && results.poseLandmarks.length === 33) {

                setFeedback([            // Draw pose connections

                  `Exercise Count: ${result.count}`,            if (window.drawConnectors && window.POSE_CONNECTIONS) {

                  `Type: ${result.exercise_type || 'Push-up'}`,              window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {

                  `Score: ${score}%`,                color: '#00FF00',

                  `Status: Active`                lineWidth: 2

                ]);              });

              } else {            }

                setPoseScore(60);

                setFeedback(['Move into camera view', 'Python backend active']);            // Draw landmarks

              }            if (window.drawLandmarks) {

            }              window.drawLandmarks(canvasCtx, results.poseLandmarks, {

          } catch (err) {                color: '#FF0000',

            console.warn('Backend polling error');                fillColor: '#FF0000',

          }                radius: 3

                        });

          // Continue polling            }

          setTimeout(pollBackend, 150);

        };            setFeedback(['Pose detected successfully!', 'Form analysis active']);

                  } else {

        pollBackend();            setFeedback(['No pose detected', 'Step back and face camera']);

        setIsLoaded(true);          }

        

      } catch (error) {          canvasCtx.restore();

        console.error('Backend connection failed:', error);        });

        setApiStatus("error");

        setFeedback(['Backend offline', 'Start Python server: python backend/pose_server.py']);        // Start detection

      }        let animationId;

    };        const detect = async () => {

          try {

    connectToBackend();            if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {

  }, [isHydrated]);              await pose.send({ image: webcamRef.current.video });

            }

  return (          } catch (err) {

    <div className="min-h-screen bg-black text-white">            console.warn('Detection frame skipped:', err.message);

      {/* Header */}          }

      <div className="bg-gradient-to-r from-slate-900 to-gray-900 px-6 py-4">          animationId = requestAnimationFrame(detect);

        <h1 className="text-3xl font-bold">TrainIQ AI Trainer</h1>        };

        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${

          apiStatus === "connected" ? "bg-green-900 text-green-300" :        detect();

          apiStatus === "loading" ? "bg-yellow-900 text-yellow-300" :        setIsLoaded(true);

          "bg-red-900 text-red-300"        setFeedback(['AI Trainer Ready!', 'Position yourself for analysis']);

        }`}>

          {apiStatus === "connected" ? "🟢 Python Backend Connected" :        return () => {

           apiStatus === "loading" ? "🟡 Connecting..." :          if (animationId) {

           "🔴 Backend Offline"}            cancelAnimationFrame(animationId);

        </div>          }

      </div>          pose.close();

        };

      <div className="flex h-[calc(100vh-120px)]">

        {/* Main Camera View */}      } catch (err) {

        <div className="flex-1 relative bg-black">        console.error('MediaPipe initialization error:', err);

          {/* Frontend webcam (dimmed when backend active) */}        setError(err.message);

          <Webcam        setFeedback(['AI Trainer unavailable', 'Camera feed only mode']);

            ref={webcamRef}      }

            className={`absolute inset-0 w-full h-full object-cover ${    };

              apiStatus === "connected" ? "opacity-20" : "opacity-100"

            }`}    loadMediaPipe();

            mirrored={true}  }, []);

            videoConstraints={{ 

              facingMode: "user",  return (

              width: { ideal: 1280 },    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-stone-950 text-white p-4">

              height: { ideal: 720 }      <div className="mb-6 text-center">

            }}        <h1 className="text-3xl font-semibold mb-2">🏋️ AI Fitness Trainer</h1>

          />        <p className="text-gray-400">Advanced pose analysis for perfect form</p>

                  {!isLoaded && !error && (

          {/* Backend processed frame overlay */}          <div className="text-blue-400 mt-2">Loading AI trainer...</div>

          <canvas        )}

            ref={canvasRef}        {error && (

            width={1280}          <div className="text-red-400 mt-2">Error: {error}</div>

            height={720}        )}

            className="absolute inset-0 w-full h-full pointer-events-none"      </div>

          />      

        </div>      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mb-4">

        <Webcam

        {/* Sidebar */}          ref={webcamRef}

        <div className="w-80 bg-gray-900 p-6 space-y-6">          width={640}

          {/* Live Feedback */}          height={480}

          <div>          mirrored={true}

            <h3 className="text-xl font-bold mb-4">Live Feedback</h3>          style={{ 

                        position: "absolute", 

            {/* Score Display */}            top: 0, 

            <div className="text-center p-4 bg-blue-900/30 rounded-lg mb-4">            left: 0, 

              <div className="text-3xl font-bold text-blue-400">{poseScore}%</div>            opacity: 1,

              <div className="text-sm text-gray-400">Form Score</div>            pointerEvents: "none"

            </div>          }}

          videoConstraints={{ 

            {/* Feedback Messages */}            facingMode: "user",

            <div className="space-y-2">            width: 640,

              {feedback.map((item, index) => (            height: 480

                <p key={index} className="text-sm bg-gray-800 p-2 rounded">{item}</p>          }}

              ))}        />

            </div>        <canvas

          </div>          ref={canvasRef}

        </div>          width={640}

      </div>          height={480}

    </div>          style={{ 

  );            position: "absolute", 

}            top: 0, 
            left: 0,
            display: "block"
          }}
        />
      </div>

      {/* Feedback Panel */}
      <div className="bg-gray-800 rounded-lg p-4 max-w-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        {feedback.map((message, index) => (
          <p key={index} className="text-gray-300 text-sm">{message}</p>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-400 max-w-lg">
        <p>💡 Ensure good lighting and keep your full body in frame for best results</p>
      </div>
    </div>
  );
}
