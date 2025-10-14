"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function PosePage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadMediaPipe = async () => {
      try {
        // Load MediaPipe Pose with proper error handling
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
        script.crossOrigin = 'anonymous';
        
        const scriptPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load MediaPipe'));
        });
        
        document.head.appendChild(script);
        await scriptPromise;

        // Load drawing utilities
        const drawScript = document.createElement('script');
        drawScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js';
        drawScript.crossOrigin = 'anonymous';
        
        const drawPromise = new Promise((resolve, reject) => {
          drawScript.onload = resolve;
          drawScript.onerror = () => reject(new Error('Failed to load drawing utils'));
        });
        
        document.head.appendChild(drawScript);
        await drawPromise;

        // Wait a bit for globals to be available
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!window.Pose) {
          throw new Error('MediaPipe Pose not available');
        }

        const pose = new window.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
          }
        });

        // Set proper options for better detection
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.7,  // Higher confidence
          minTrackingConfidence: 0.7    // Higher confidence
        });

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');

        function calcAngle(a, b, c) {
          // Calculate angle between three points
          const ab = { x: a.x - b.x, y: a.y - b.y };
          const cb = { x: c.x - b.x, y: c.y - b.y };
          
          const dot = ab.x * cb.x + ab.y * cb.y;
          const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
          const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
          
          if (magAB === 0 || magCB === 0) return 0;
          
          const angleRad = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
          return (angleRad * 180) / Math.PI;
        }

        pose.onResults((results) => {
          // Clear canvas
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          // Draw the input image
          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

          // Only process if we have good quality landmarks
          if (results.poseLandmarks && results.poseLandmarks.length === 33) {
            // Draw pose connections
            if (window.drawConnectors && window.POSE_CONNECTIONS) {
              window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
              });
            }

            // Draw landmarks
            if (window.drawLandmarks) {
              window.drawLandmarks(canvasCtx, results.poseLandmarks, {
                color: '#FF0000',
                fillColor: '#FF0000',
                radius: 3
              });
            }

            const landmarks = results.poseLandmarks;
            
            // Check if we have valid body landmarks (not just hands/face)
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftElbow = landmarks[13];
            const rightElbow = landmarks[14];
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];
            const leftAnkle = landmarks[27];
            const rightAnkle = landmarks[28];

            // Only calculate angles if we have confidence in the landmarks
            const shoulderConfidence = (leftShoulder.visibility + rightShoulder.visibility) / 2;
            
            if (shoulderConfidence > 0.5) {
              // Calculate joint angles
              const leftElbowAngle = calcAngle(leftShoulder, leftElbow, leftWrist);
              const rightElbowAngle = calcAngle(rightShoulder, rightElbow, rightWrist);
              const leftKneeAngle = calcAngle(leftHip, leftKnee, leftAnkle);
              const rightKneeAngle = calcAngle(rightHip, rightKnee, rightAnkle);

              // Set text style
              canvasCtx.font = '16px Arial';
              canvasCtx.fillStyle = '#FFFF00';
              canvasCtx.strokeStyle = '#000000';
              canvasCtx.lineWidth = 3;

              // Draw angle labels with better positioning
              const drawLabel = (text, landmark, offset = { x: 10, y: -10 }) => {
                const x = landmark.x * canvasElement.width + offset.x;
                const y = landmark.y * canvasElement.height + offset.y;
                
                canvasCtx.strokeText(text, x, y);
                canvasCtx.fillText(text, x, y);
              };

              // Draw angles only for visible joints
              if (leftElbow.visibility > 0.5) {
                drawLabel(`L-Elbow: ${leftElbowAngle.toFixed(0)}°`, leftElbow);
              }
              if (rightElbow.visibility > 0.5) {
                drawLabel(`R-Elbow: ${rightElbowAngle.toFixed(0)}°`, rightElbow);
              }
              if (leftKnee.visibility > 0.5) {
                drawLabel(`L-Knee: ${leftKneeAngle.toFixed(0)}°`, leftKnee);
              }
              if (rightKnee.visibility > 0.5) {
                drawLabel(`R-Knee: ${rightKneeAngle.toFixed(0)}°`, rightKnee);
              }

              // Draw confidence indicator
              canvasCtx.fillStyle = shoulderConfidence > 0.8 ? '#00FF00' : '#FFA500';
              canvasCtx.fillText(`Confidence: ${(shoulderConfidence * 100).toFixed(0)}%`, 10, 30);
            } else {
              // Low confidence warning
              canvasCtx.fillStyle = '#FF0000';
              canvasCtx.font = '20px Arial';
              canvasCtx.fillText('Move into frame for better detection', 50, canvasElement.height / 2);
            }
          } else {
            // No pose detected
            canvasCtx.fillStyle = '#FF0000';
            canvasCtx.font = '20px Arial';
            canvasCtx.fillText('No pose detected - step back and face camera', 50, canvasElement.height / 2);
          }

          canvasCtx.restore();
        });

        // Start detection loop
        let animationId;
        const detect = async () => {
          try {
            if (webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
              await pose.send({ image: webcamRef.current.video });
            }
          } catch (err) {
            console.warn('Detection frame skipped:', err.message);
          }
          animationId = requestAnimationFrame(detect);
        };

        detect();
        setIsLoaded(true);

        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          pose.close();
        };

      } catch (err) {
        console.error('MediaPipe initialization error:', err);
        setError(err.message);
      }
    };

    loadMediaPipe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-stone-950 text-white p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold mb-2">Advanced Pose Analysis</h1>
        <p className="text-gray-400">Stand 3-6 feet from camera, face forward</p>
        {!isLoaded && !error && (
          <div className="text-blue-400 mt-2">Loading AI models...</div>
        )}
        {error && (
          <div className="text-red-400 mt-2">Error: {error}</div>
        )}
      </div>
      
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        <Webcam
          ref={webcamRef}
          width={640}
          height={480}
          mirrored={true}
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            opacity: 1,
            pointerEvents: "none"
          }}
          videoConstraints={{ 
            facingMode: "user",
            width: 640,
            height: 480
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
            display: "block"
          }}
        />
      </div>

      <div className="mt-6 text-center text-sm text-gray-400 max-w-lg">
        <p>💡 Tips for better detection:</p>
        <p>• Ensure good lighting • Wear contrasting colors • Keep full body in frame</p>
      </div>
    </div>
  );
}