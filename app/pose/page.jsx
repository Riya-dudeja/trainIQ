"use client";

import { useEffect, useRef } from "react";
import Webcam from "react-webcam";

export default function PosePage() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

  const poseUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
  const drawingUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
  const assetsBase = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.6.1635989132/";

    const loadScriptOnce = (url, globalCheck) => {
      return new Promise((resolve, reject) => {
        try {
          if (globalCheck()) return resolve();
          const existing = document.querySelector(`script[src='${url}']`);
          if (existing) {
            existing.addEventListener("load", resolve);
            existing.addEventListener("error", reject);
            return;
          }
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        } catch (e) {
          reject(e);
        }
      });
    };

    const loadScripts = async () => {
      await loadScriptOnce(poseUrl, () => !!window.Pose);
      await loadScriptOnce(drawingUrl, () => !!window.drawConnectors);
    };


    let poseInstance;
    let animationId;

    loadScripts()
      .then(() => {
        if (!window.Pose) return;

        // Use the latest CDN API: window.Pose.Pose
        const Pose = window.Pose.Pose || window.Pose;
        poseInstance = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const canvasElement = canvasRef.current;
        const ctx = canvasElement.getContext("2d");

        function calcAngle(a, b, c) {
          const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
          const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
          const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
          const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
          const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
          const angleRad = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
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

            const lm = results.poseLandmarks;
            const leftElbow = calcAngle(lm[11], lm[13], lm[15]);
            const rightElbow = calcAngle(lm[12], lm[14], lm[16]);
            const leftKnee = calcAngle(lm[23], lm[25], lm[27]);
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

        const sendFrame = async () => {
          try {
            if (
              webcamRef.current?.video &&
              webcamRef.current.video.readyState === 4
            ) {
              await poseInstance.send({ image: webcamRef.current.video });
            }
          } catch (e) {
            console.error("Pose send error:", e);
          }
          animationId = requestAnimationFrame(sendFrame);
        };

        sendFrame();
      })
      .catch((e) => {
        console.error("Failed to load MediaPipe scripts/assets:", e, e?.message, e?.stack);
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
          style={{ position: "absolute", top: 0, left: 0, opacity: 1, pointerEvents: "none" }}
          videoConstraints={{ facingMode: "user" }}
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