"use client";

import { useEffect, useRef } from "react";
import Webcam from "react-webcam";


export default function PosePage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    const loadScripts = async () => {
      // Use a specific, recent version for stability
  const poseUrl = "https://unpkg.com/@mediapipe/pose/pose.js";
  const drawingUrl = "https://unpkg.com/@mediapipe/drawing_utils/drawing_utils.js";

      // Helper to load a script only once
      const loadScriptOnce = (url, globalCheck) => {
        return new Promise((resolve) => {
          if (globalCheck()) return resolve();
          // Prevent duplicate script tags
          if (document.querySelector(`script[src='${url}']`)) {
            // Wait for it to load
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

    loadScripts().then(() => {
      if (!window.Pose) return;
      poseInstance = new window.Pose({
        locateFile: (file) =>
          `https://unpkg.com/@mediapipe/pose/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const canvasElement = canvasRef.current;
      const ctx = canvasElement.getContext("2d");


      // Utility: Calculate angle between three points (in degrees)
      function calcAngle(a, b, c) {
        const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
        const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
        const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
        const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
        const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
        const angleRad = Math.acos(dot / (magAB * magCB));
        return (angleRad * 180) / Math.PI;
      }

      poseInstance.onResults((results) => {
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

          // Calculate and overlay joint angles
          const lm = results.poseLandmarks;
          // Left Elbow: shoulder(11)-elbow(13)-wrist(15)
          const leftElbow = calcAngle(lm[11], lm[13], lm[15]);
          // Right Elbow: shoulder(12)-elbow(14)-wrist(16)
          const rightElbow = calcAngle(lm[12], lm[14], lm[16]);
          // Left Knee: hip(23)-knee(25)-ankle(27)
          const leftKnee = calcAngle(lm[23], lm[25], lm[27]);
          // Right Knee: hip(24)-knee(26)-ankle(28)
          const rightKnee = calcAngle(lm[24], lm[26], lm[28]);

          ctx.font = "20px Arial";
          ctx.fillStyle = "yellow";
          ctx.fillText(`L-Elbow: ${leftElbow.toFixed(0)}°`, lm[13].x * canvasElement.width, lm[13].y * canvasElement.height - 10);
          ctx.fillText(`R-Elbow: ${rightElbow.toFixed(0)}°`, lm[14].x * canvasElement.width, lm[14].y * canvasElement.height - 10);
          ctx.fillText(`L-Knee: ${leftKnee.toFixed(0)}°`, lm[25].x * canvasElement.width, lm[25].y * canvasElement.height - 10);
          ctx.fillText(`R-Knee: ${rightKnee.toFixed(0)}°`, lm[26].x * canvasElement.width, lm[26].y * canvasElement.height - 10);
        }
        ctx.restore();
      });

      // Use requestAnimationFrame for smooth, robust detection
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
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-xl mb-2">Pose Detection</h1>
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
  );
}
