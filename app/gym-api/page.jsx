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
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // UI State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastSpokenFeedback, setLastSpokenFeedback] = useState("");
  const [lastSpeechTime, setLastSpeechTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Audio feedback functions with improved reliability
  const speakFeedback = (text) => {
    if (!isAudioEnabled || !speechSupported) return;
    
    // Cancel any existing speech to prevent queue buildup
    window.speechSynthesis.cancel();
    
    // Only prevent exact same text if spoken very recently (within 2 seconds)
    const now = Date.now();
    if (text === lastSpokenFeedback && now - lastSpeechTime < 2000) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Add error handling and restart speech synthesis if needed
    utterance.onerror = (event) => {
      console.log('Speech synthesis error:', event);
      // Reset speech synthesis
      window.speechSynthesis.cancel();
    };
    
    utterance.onend = () => {
      setLastSpokenFeedback("");
    };
    
    window.speechSynthesis.speak(utterance);
    setLastSpokenFeedback(text);
    setLastSpeechTime(now);
  };

  const getScoreBasedFeedback = (score, feedback) => {
    if (score > 85) return "Excellent form!";
    if (score > 70) return "Good form, keep it up!";
    if (score > 50) return feedback[0] || "Adjust your form";
    return "Check your form - " + (feedback[0] || "focus on your posture");
  };

  // Enhanced audio coaching with specific form instructions for full squat cycle
  const getDetailedFormFeedback = (angles, confidence) => {
    const instructions = [];
    
    // Prioritize positioning feedback for low confidence
    if (!angles || confidence < 0.7) {
      if (confidence < 0.3) {
        return ["Step back and center yourself in the camera view"];
      } else if (confidence < 0.5) {
        return ["Move to get your full body in the camera view"];
      } else if (confidence < 0.7) {
        return ["Adjust your position for better pose detection"];
      }
    }

    // Knee angle analysis for squats - full movement cycle
    if (angles.leftKnee && angles.rightKnee) {
      const avgKnee = (angles.leftKnee + angles.rightKnee) / 2;
      const kneeImbalance = Math.abs(angles.leftKnee - angles.rightKnee);
      
      // Progressive depth instructions throughout the movement
      if (avgKnee > 170) {
        instructions.push("Get ready - prepare to squat down");
      } else if (avgKnee > 160) {
        instructions.push("Start squatting - bend your knees now");
      } else if (avgKnee > 150) {
        instructions.push("Good start - keep bending your knees");
      } else if (avgKnee > 140) {
        instructions.push("Keep going down - squat deeper");
      } else if (avgKnee > 130) {
        instructions.push("Almost there - go a bit deeper");
      } else if (avgKnee > 120) {
        instructions.push("Good depth - now you can come back up");
      } else if (avgKnee > 110) {
        instructions.push("Excellent depth - drive up through your heels");
      } else if (avgKnee > 100) {
        instructions.push("Perfect squat - push up strong");
      } else if (avgKnee < 90) {
        instructions.push("Very deep - now explode upward");
      }
      
      // Continuous balance and form instructions
      if (kneeImbalance > 25) {
        instructions.push("Major imbalance - balance your weight evenly");
      } else if (kneeImbalance > 20) {
        instructions.push("Keep both knees aligned, balance your weight");
      } else if (kneeImbalance > 15) {
        instructions.push("Try to keep your knees more even");
      } else if (kneeImbalance > 10) {
        instructions.push("Good balance - minor knee adjustment needed");
      }
      
      // Hip angle analysis
      if (angles.leftHip && angles.rightHip) {
        const avgHip = (angles.leftHip + angles.rightHip) / 2;
        
        if (avgHip > 170) {
          instructions.push("Sit back more, push your hips back");
        } else if (avgHip < 120) {
          instructions.push("Keep your chest up, don't lean too far forward");
        }
      }
    }
    
    // Single knee analysis if only one visible
    else if (angles.leftKnee || angles.rightKnee) {
      const kneeAngle = angles.leftKnee || angles.rightKnee;
      
      if (kneeAngle > 160) {
        instructions.push("Bend your knee more to squat down");
      } else if (kneeAngle > 140) {
        instructions.push("Keep going down, bend your knee more");
      } else if (kneeAngle < 90) {
        instructions.push("Excellent depth! Now stand back up");
      } else if (kneeAngle < 120) {
        instructions.push("Perfect squat! Push up strong");
      }
    }
    
    // General posture reminders
    if (instructions.length === 0) {
      const motivational = [
        "Keep your core tight and back straight",
        "Good form! Control the movement", 
        "Breathe steadily throughout the movement",
        "Focus on quality over speed"
      ];
      instructions.push(motivational[Math.floor(Math.random() * motivational.length)]);
    }
    
    return instructions;
  };

  // Check for speech synthesis support and keep it alive
  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      setSpeechSupported(true);
      
      // Keep speech synthesis alive - some browsers pause it after inactivity
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 5000);
      
      return () => clearInterval(keepAlive);
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

        // Smoothing and Intelligence Systems
        let angleHistory = {};
        let confidenceHistory = [];
        let feedbackHistory = [];
        let lastStableAngles = {};
        
        // Moving average filter for smoothing
        class MovingAverageFilter {
          constructor(windowSize = 5) {
            this.windowSize = windowSize;
            this.values = [];
          }
          
          update(value) {
            if (value === null || value === undefined || isNaN(value)) {
              return this.getAverage();
            }
            
            this.values.push(value);
            if (this.values.length > this.windowSize) {
              this.values.shift();
            }
            return this.getAverage();
          }
          
          getAverage() {
            if (this.values.length === 0) return 0;
            return this.values.reduce((sum, val) => sum + val, 0) / this.values.length;
          }
        }
        
        // Create smoothing filters for each angle
        const angleFilters = {
          leftKnee: new MovingAverageFilter(7),
          rightKnee: new MovingAverageFilter(7),
          leftHip: new MovingAverageFilter(7),
          rightHip: new MovingAverageFilter(7),
          avgKnee: new MovingAverageFilter(5)
        };
        
        // Confidence-based filtering
        function isLandmarkVisible(landmark, minConfidence = 0.5) {
          return landmark && landmark.visibility > minConfidence;
        }
        
        // Outlier detection and rejection
        function isAngleRealistic(angle, previousAngle, maxChange = 30) {
          if (!previousAngle) return true;
          return Math.abs(angle - previousAngle) <= maxChange;
        }
        
        // Intelligent feedback system with enhanced audio coaching
        class IntelligentFeedback {
          constructor() {
            this.lastFeedback = [];
            this.feedbackCooldown = {};
            this.audioInstructionCooldown = {};
            this.stabilityThreshold = 3; // frames
            this.confidenceThreshold = 0.7;
          }
          
          updateFeedback(angles, confidence) {
            if (confidence < this.confidenceThreshold) {
              return this.lastFeedback;
            }
            
            const newFeedback = [];
            const currentTimestamp = Date.now();
            
            // Knee angle analysis with stability check
            if (angles.avgKnee && angles.avgKnee < 160) {
              if (!this.feedbackCooldown.kneeForm || currentTimestamp - this.feedbackCooldown.kneeForm > 3000) {
                if (angles.avgKnee < 90) {
                  newFeedback.push("Great squat depth!");
                  this.feedbackCooldown.kneeForm = currentTimestamp;
                } else if (angles.avgKnee < 130) {
                  newFeedback.push("Good squat form");
                  this.feedbackCooldown.kneeForm = currentTimestamp;
                }
              }
            }
            
            // Balance check
            if (angles.leftKnee && angles.rightKnee) {
              const imbalance = Math.abs(angles.leftKnee - angles.rightKnee);
              if (imbalance > 15 && (!this.feedbackCooldown.balance || currentTimestamp - this.feedbackCooldown.balance > 4000)) {
                newFeedback.push("Keep knees aligned");
                this.feedbackCooldown.balance = currentTimestamp;
              }
            }
            
            // Only update if we have stable readings
            if (newFeedback.length > 0) {
              this.lastFeedback = newFeedback;
            }
            
            return this.lastFeedback;
          }

          // Get specific audio coaching instructions
          getAudioInstructions(angles, confidence) {
            if (confidence < 0.5) return null;
            
            const instructionTime = Date.now();
            
            // Get detailed form feedback with balanced cooldown for stable coaching
            if (!this.audioInstructionCooldown.lastInstruction || 
                instructionTime - this.audioInstructionCooldown.lastInstruction > 2000) {
              
              const instructions = getDetailedFormFeedback(angles, confidence);
              
              if (instructions && instructions.length > 0) {
                this.audioInstructionCooldown.lastInstruction = instructionTime;
                return instructions[0]; // Return the first/most important instruction
              }
            }
            
            return null;
          }
        }
        
        const intelligentFeedback = new IntelligentFeedback();

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
          const { leftKnee, rightKnee, leftHip, rightHip, avgKnee } = angles;
          
          // Use pre-calculated avgKnee if available, otherwise calculate it
          let kneeAngle;
          if (avgKnee !== undefined) {
            kneeAngle = avgKnee;
          } else if (leftKnee && rightKnee) {
            kneeAngle = (leftKnee + rightKnee) / 2;
          } else if (leftKnee) {
            kneeAngle = leftKnee;
          } else if (rightKnee) {
            kneeAngle = rightKnee;
          } else {
            return { score: 0, feedback: "Position legs in camera view", phase: squatPhase, reps: repCount };
          }

          console.log(`🔍 Squat Analysis - Knee: ${kneeAngle.toFixed(0)}°, Phase: ${squatPhase}`);
          
            const currentTime = Date.now();
          const timeSinceLastChange = currentTime - lastPhaseChange;          // State machine for squat phases with hysteresis
          if (squatPhase === 'standing') {
            // Start squat when knees begin to bend significantly
            if (kneeAngle < 160 && timeSinceLastChange > 500) {
              squatPhase = 'descending';
              lastPhaseChange = currentTime;
              return { score: 60, feedback: "Good, keep going down", phase: squatPhase, reps: repCount };
            }
            // Provide feedback while standing
            return { score: 30, feedback: "Ready to squat - bend your knees to begin", phase: squatPhase, reps: repCount };
          }
          
          else if (squatPhase === 'descending') {
            // Reached bottom position
            if (kneeAngle < 120) {
              squatPhase = 'bottom';
              lastPhaseChange = currentTime;
              const depth = 180 - kneeAngle;
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
            // Provide continuous feedback while descending
            if (kneeAngle > 140) {
              return { score: 50, feedback: "Keep going down - squat deeper", phase: squatPhase, reps: repCount };
            } else {
              return { score: 70, feedback: "Good depth - keep going", phase: squatPhase, reps: repCount };
            }
          }
          
          else if (squatPhase === 'bottom') {
            // Start ascending when knees extend
            if (kneeAngle > 130 && timeSinceLastChange > 300) {
              squatPhase = 'ascending';
              lastPhaseChange = currentTime;
              return { score: 75, feedback: "Good, push up!", phase: squatPhase, reps: repCount };
            }
            // Provide feedback while at bottom
            return { score: 80, feedback: "Hold the position - now drive up", phase: squatPhase, reps: repCount };
          }
          
          else if (squatPhase === 'ascending') {
            // Complete rep when back to standing
            if (kneeAngle > 160 && timeSinceLastChange > 500) {
              squatPhase = 'standing';
              repCount++;
              lastPhaseChange = currentTime;
              
              // Add motivational feedback based on rep count
              let repFeedback = `Rep ${repCount} completed! 🎉`;
              if (repCount === 1) {
                repFeedback = "First rep done! Great start! 💪";
              } else if (repCount === 5) {
                repFeedback = "5 reps! You're doing amazing! 🔥";
              } else if (repCount === 10) {
                repFeedback = "10 reps! Outstanding! Keep it up! ⚡";
              } else if (repCount % 5 === 0) {
                repFeedback = `${repCount} reps! Fantastic work! 🚀`;
              }
              
              return { score: 90, feedback: repFeedback, phase: squatPhase, reps: repCount, justCompleted: true };
            }
            // Provide continuous feedback while ascending
            if (kneeAngle < 140) {
              return { score: 60, feedback: "Push up stronger - drive through your heels", phase: squatPhase, reps: repCount };
            } else {
              return { score: 75, feedback: "Almost up - complete the movement", phase: squatPhase, reps: repCount };
            }
          }
          
          // Default state feedback
          if (kneeAngle > 170) {
            return { score: 20, feedback: "Stand ready, then squat down", phase: squatPhase, reps: repCount };
          } else {
            return { score: 0, feedback: "Position legs in camera view", phase: squatPhase, reps: repCount };
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

            // Calculate REAL angles with proper landmark indices
            const lm = results.poseLandmarks;
            
            // Check if leg landmarks are visible (key for squat detection)
            const leftHipVisible = lm[23]?.visibility > 0.5;
            const rightHipVisible = lm[24]?.visibility > 0.5;
            const leftKneeVisible = lm[25]?.visibility > 0.5;
            const rightKneeVisible = lm[26]?.visibility > 0.5;
            const leftAnkleVisible = lm[27]?.visibility > 0.5;
            const rightAnkleVisible = lm[28]?.visibility > 0.5;
            
            console.log('👁️ Leg visibility:', {
              leftHip: leftHipVisible,
              rightHip: rightHipVisible, 
              leftKnee: leftKneeVisible,
              rightKnee: rightKneeVisible,
              leftAnkle: leftAnkleVisible,
              rightAnkle: rightAnkleVisible
            });

            const rawAngles = {};
            let totalConfidence = 0;
            let validAngles = 0;
            
            // Calculate raw angles for visible landmarks
            if (leftKneeVisible && leftHipVisible && leftAnkleVisible) {
              rawAngles.leftKnee = calcAngle(lm[23], lm[25], lm[27]); // hip-knee-ankle
              totalConfidence += (lm[23].visibility + lm[25].visibility + lm[27].visibility) / 3;
              validAngles++;
            }
            
            if (rightKneeVisible && rightHipVisible && rightAnkleVisible) {
              rawAngles.rightKnee = calcAngle(lm[24], lm[26], lm[28]); // hip-knee-ankle  
              totalConfidence += (lm[24].visibility + lm[26].visibility + lm[28].visibility) / 3;
              validAngles++;
            }
            
            // Hip angles: torso-hip-thigh (using shoulder-hip-knee)
            if (leftHipVisible && lm[11]?.visibility > 0.5) {
              rawAngles.leftHip = calcAngle(lm[11], lm[23], lm[25]); // shoulder-hip-knee
              totalConfidence += (lm[11].visibility + lm[23].visibility + lm[25].visibility) / 3;
              validAngles++;
            }
            
            if (rightHipVisible && lm[12]?.visibility > 0.5) {
              rawAngles.rightHip = calcAngle(lm[12], lm[24], lm[26]); // shoulder-hip-knee
              totalConfidence += (lm[12].visibility + lm[24].visibility + lm[26].visibility) / 3;
              validAngles++;
            }

            // Calculate overall confidence
            const overallConfidence = validAngles > 0 ? totalConfidence / validAngles : 0;
            
            // Apply smoothing filters with outlier rejection
            const smoothedAngles = {};
            
            if (rawAngles.leftKnee && isAngleRealistic(rawAngles.leftKnee, lastStableAngles.leftKnee)) {
              smoothedAngles.leftKnee = angleFilters.leftKnee.update(rawAngles.leftKnee);
              lastStableAngles.leftKnee = smoothedAngles.leftKnee;
            } else if (lastStableAngles.leftKnee) {
              smoothedAngles.leftKnee = lastStableAngles.leftKnee;
            }
            
            if (rawAngles.rightKnee && isAngleRealistic(rawAngles.rightKnee, lastStableAngles.rightKnee)) {
              smoothedAngles.rightKnee = angleFilters.rightKnee.update(rawAngles.rightKnee);
              lastStableAngles.rightKnee = smoothedAngles.rightKnee;
            } else if (lastStableAngles.rightKnee) {
              smoothedAngles.rightKnee = lastStableAngles.rightKnee;
            }
            
            if (rawAngles.leftHip && isAngleRealistic(rawAngles.leftHip, lastStableAngles.leftHip)) {
              smoothedAngles.leftHip = angleFilters.leftHip.update(rawAngles.leftHip);
              lastStableAngles.leftHip = smoothedAngles.leftHip;
            } else if (lastStableAngles.leftHip) {
              smoothedAngles.leftHip = lastStableAngles.leftHip;
            }
            
            if (rawAngles.rightHip && isAngleRealistic(rawAngles.rightHip, lastStableAngles.rightHip)) {
              smoothedAngles.rightHip = angleFilters.rightHip.update(rawAngles.rightHip);
              lastStableAngles.rightHip = smoothedAngles.rightHip;
            } else if (lastStableAngles.rightHip) {
              smoothedAngles.rightHip = lastStableAngles.rightHip;
            }
            
            // Calculate average knee angle with smoothing
            if (smoothedAngles.leftKnee && smoothedAngles.rightKnee) {
              const avgKneeRaw = (smoothedAngles.leftKnee + smoothedAngles.rightKnee) / 2;
              smoothedAngles.avgKnee = angleFilters.avgKnee.update(avgKneeRaw);
            } else if (smoothedAngles.leftKnee) {
              smoothedAngles.avgKnee = angleFilters.avgKnee.update(smoothedAngles.leftKnee);
            } else if (smoothedAngles.rightKnee) {
              smoothedAngles.avgKnee = angleFilters.avgKnee.update(smoothedAngles.rightKnee);
            }

            console.log('📐 Raw angles:', rawAngles);
            console.log('🔄 Smoothed angles:', smoothedAngles);
            console.log('📊 Confidence:', overallConfidence.toFixed(2));

            // ENHANCED squat analysis with smoothed angles
            const analysis = analyzeSquatForm(smoothedAngles);
            
            // Get intelligent feedback
            const smartFeedback = intelligentFeedback.updateFeedback(smoothedAngles, overallConfidence);
            
            // Only update UI if we have sufficient confidence AND not in demo mode
            if (overallConfidence > 0.6 && !isDemoMode) {
              setPoseScore(analysis.score);
              setPushupCount(analysis.reps);
              
              const currentFeedback = [
                `🏋️ REPS: ${analysis.reps} | ${analysis.feedback}`,
                `Phase: ${analysis.phase.toUpperCase()}`,
                `Left Knee: ${smoothedAngles.leftKnee ? smoothedAngles.leftKnee.toFixed(0) + '°' : 'N/A'}`,
                `Right Knee: ${smoothedAngles.rightKnee ? smoothedAngles.rightKnee.toFixed(0) + '°' : 'N/A'}`,
                `Avg Knee: ${smoothedAngles.avgKnee ? smoothedAngles.avgKnee.toFixed(0) + '°' : 'N/A'}`,
                ...smartFeedback
              ];
              
              setFeedback(currentFeedback);
              
              // Enhanced Audio Feedback System with Detailed Instructions (Real Mode Only)
              if (isAudioEnabled && !isDemoMode) {
                // Special celebration for completed reps
                if (analysis.justCompleted) {
                  speakFeedback(analysis.feedback);
                  
                  // Add motivational milestone messages
                  if (analysis.reps === 1) {
                    setTimeout(() => speakFeedback("Perfect! Now let's keep that form consistent"), 1500);
                  } else if (analysis.reps === 5) {
                    setTimeout(() => speakFeedback("You're building great strength! Keep going!"), 1500);
                  } else if (analysis.reps === 10) {
                    setTimeout(() => speakFeedback("Incredible endurance! Your form is improving!"), 1500);
                  }
                }
                // Prioritize detailed form coaching instructions
                else {
                  const audioInstruction = intelligentFeedback.getAudioInstructions(smoothedAngles, overallConfidence);
                  if (audioInstruction) {
                    // Use our detailed instructions as PRIMARY feedback
                    speakFeedback(audioInstruction);
                  }
                  // Only use generic feedback if no detailed instructions available
                  else if (analysis.feedback) {
                    speakFeedback(getScoreBasedFeedback(analysis.score, [analysis.feedback]));
                  }
                  
                  // Smart coaching tips as secondary feedback
                  if (smartFeedback.length > 0) {
                    setTimeout(() => {
                      speakFeedback(smartFeedback[0]);
                    }, 3000);
                  }
                }
              }
              
            } else if (!isDemoMode) {
              const lowConfidenceFeedback = [
                "📍 Move into camera view for better detection",
                `Confidence: ${(overallConfidence * 100).toFixed(0)}%`
              ];
              
              setFeedback(lowConfidenceFeedback);
              
              // Enhanced audio feedback for positioning (Real Mode Only)
              if (isAudioEnabled && !isDemoMode) {
                if (overallConfidence < 0.3) {
                  speakFeedback("Step back and center yourself in the camera view");
                } else if (overallConfidence < 0.5) {
                  speakFeedback("Move a bit to get your full body in view");
                } else if (overallConfidence < 0.7) {
                  speakFeedback("Adjust your position for better detection");
                }
              }
            }

            // Draw angle labels - BIGGER and MORE VISIBLE
            ctx.font = "20px Arial bold";
            ctx.fillStyle = "#FFFF00"; // Bright yellow
            ctx.strokeStyle = "#000000"; // Black outline
            ctx.lineWidth = 3;
            
            console.log('🎨 Drawing angles on canvas...'); // Debug log
            
            if (smoothedAngles.leftKnee && lm[25] && leftKneeVisible) {
              const x = lm[25].x * canvasElement.width;
              const y = lm[25].y * canvasElement.height;
              const text = "L-Knee: " + smoothedAngles.leftKnee.toFixed(0) + "°";
              ctx.strokeText(text, x + 10, y - 15);
              ctx.fillText(text, x + 10, y - 15);
            }
            
            if (smoothedAngles.rightKnee && lm[26] && rightKneeVisible) {
              const x = lm[26].x * canvasElement.width;
              const y = lm[26].y * canvasElement.height;
              const text = "R-Knee: " + smoothedAngles.rightKnee.toFixed(0) + "°";
              ctx.strokeText(text, x + 10, y - 15);
              ctx.fillText(text, x + 10, y - 15);
            }

            // Draw hip angles only if calculated and visible
            if (smoothedAngles.leftHip && lm[23] && leftHipVisible) {
              const x = lm[23].x * canvasElement.width;
              const y = lm[23].y * canvasElement.height;
              const text = `L-Hip: ${smoothedAngles.leftHip.toFixed(0)}°`;
              ctx.strokeText(text, x - 80, y);
              ctx.fillText(text, x - 80, y);
            }
            
            if (smoothedAngles.rightHip && lm[24] && rightHipVisible) {
              const x = lm[24].x * canvasElement.width;
              const y = lm[24].y * canvasElement.height;
              const text = `R-Hip: ${smoothedAngles.rightHip.toFixed(0)}°`;
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

  // Demo-ready initialization - only as fallback when real pose detection fails
  useEffect(() => {
    if (typeof window === "undefined" || isLoaded || isDemoMode) return;

    // Wait a bit to see if real pose detection initializes
    const demoTimeout = setTimeout(() => {
      if (!isLoaded) {
        console.log('🎯 Real pose detection failed, falling back to Demo Mode');
        setIsDemoMode(true);
        
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
      }
    }, 3000); // Wait 3 seconds for real pose detection

    return () => clearTimeout(demoTimeout);
  }, []);  // Fetch exercises
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
            id: 'pushup',
            name: 'Push-up',
            bodyPart: 'chest',
            equipment: 'body weight',
            target: 'pectorals',
            instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up']
          },
          {
            id: 'squat',
            name: 'Bodyweight Squat',
            bodyPart: 'legs',
            equipment: 'body weight',
            target: 'quadriceps',
            instructions: ['Stand with feet shoulder-width apart', 'Lower into squat', 'Return to standing']
          },
          {
            id: 'plank',
            name: 'Plank',
            bodyPart: 'waist',
            equipment: 'body weight',
            target: 'core',
            instructions: ['Hold plank position', 'Keep core tight', 'Maintain straight line']
          },
          {
            id: 'jumping-jacks',
            name: 'Jumping Jacks',
            bodyPart: 'cardio',
            equipment: 'body weight',
            target: 'full body',
            instructions: ['Jump feet apart while raising arms', 'Return to starting position', 'Repeat rhythm']
          },
          {
            id: 'lunges',
            name: 'Forward Lunges',
            bodyPart: 'legs',
            equipment: 'body weight',
            target: 'quadriceps',
            instructions: ['Step forward into lunge', 'Lower back knee', 'Return to standing']
          },
          {
            id: 'mountain-climbers',
            name: 'Mountain Climbers',
            bodyPart: 'cardio',
            equipment: 'body weight',
            target: 'core',
            instructions: ['Start in plank position', 'Alternate knee to chest', 'Keep fast pace']
          },
          {
            id: 'burpees',
            name: 'Burpees',
            bodyPart: 'cardio',
            equipment: 'body weight',
            target: 'full body',
            instructions: ['Squat down, jump back to plank', 'Do push-up', 'Jump feet forward, jump up']
          },
          {
            id: 'wall-sit',
            name: 'Wall Sit',
            bodyPart: 'legs',
            equipment: 'body weight',
            target: 'quadriceps',
            instructions: ['Lean back against wall', 'Slide down to squat position', 'Hold position']
          },
          {
            id: 'high-knees',
            name: 'High Knees',
            bodyPart: 'cardio',
            equipment: 'body weight',
            target: 'legs',
            instructions: ['Run in place', 'Bring knees to chest level', 'Maintain fast pace']
          },
          {
            id: 'calf-raises',
            name: 'Calf Raises',
            bodyPart: 'lower legs',
            equipment: 'body weight',
            target: 'calves',
            instructions: ['Stand on balls of feet', 'Raise heels up', 'Lower slowly']
          },
          {
            id: 'tricep-dips',
            name: 'Tricep Dips',
            bodyPart: 'upper arms',
            equipment: 'body weight',
            target: 'triceps',
            instructions: ['Sit on edge of chair/bench', 'Lower body down', 'Push back up']
          },
          {
            id: 'bicycle-crunches',
            name: 'Bicycle Crunches',
            bodyPart: 'waist',
            equipment: 'body weight',
            target: 'abs',
            instructions: ['Lie on back', 'Alternate elbow to opposite knee', 'Keep core engaged']
          }
        ]);
      }
    };

    fetchExercises();
  }, [isHydrated, searchTerm, selectedBodyPart, selectedEquipment]);

return (
  <div className="h-screen bg-black text-white overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-slate-900 to-gray-900 px-6 py-3 flex-shrink-0">
      <h1 className="text-2xl font-bold">TrainIQ AI Trainer</h1>
      <div
        className={
          apiStatus === "connected"
            ? "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-green-900 text-green-300"
            : apiStatus === "loading"
            ? "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-yellow-900 text-yellow-300"
            : "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 bg-red-900 text-red-300"
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
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Main Camera View */}
      <div className="flex-1 relative bg-black overflow-hidden">
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
          <div className="bg-black/80 backdrop-blur rounded-lg p-3 text-center border border-gray-600/50">
            <div className="text-2xl font-bold mb-1">{poseScore}%</div>
            <div className="text-xs text-gray-400">Form Score</div>
            {pushupCount > 0 && (
              <div className="mt-2 text-sm font-semibold text-green-400">
                Reps: {pushupCount}
              </div>
            )}
          </div>
        </div>

        {/* Full Screen Button */}
        {!isFullScreen && (
          <button
            onClick={() => setIsFullScreen(true)}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-medium z-10 text-sm"
          >
            📺 Enter Full Screen
          </button>
        )}
      </div>

      {/* Sidebar - Redesigned for better UX */}
      <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-gray-700 flex-shrink-0 overflow-y-auto sidebar-scroll">
        {/* Live Feedback Section */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-white">Live Feedback</h3>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400 mb-1">{poseScore}%</div>
              <div className="text-xs text-blue-300/70 uppercase tracking-wide">Form Score</div>
            </div>

            {/* Rep Counter */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400 mb-1">{pushupCount}</div>
              <div className="text-xs text-green-300/70 uppercase tracking-wide">Reps</div>
            </div>
          </div>

          {/* Feedback Messages */}
          <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
            {feedback.slice(0, 3).map((item, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-xs text-gray-300 backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Selection Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🎯</span>
            Exercise Selection
          </h3>
          
          {/* Quick Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-sm focus:border-blue-500/50 focus:outline-none text-white"
            />
          </div>
          
          {/* Quick Filter Tags */}
          <div className="mb-3 flex flex-wrap gap-1">
            {['chest', 'legs', 'cardio', 'waist', 'arms'].map((category) => (
              <button
                key={category}
                onClick={() => setSearchTerm(category)}
                className="px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 rounded-md text-gray-300 hover:text-white transition-colors"
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => setSearchTerm('')}
              className="px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 rounded-md text-blue-300 hover:text-blue-200 transition-colors"
            >
              All
            </button>
          </div>
          
          <div className="space-y-2">
            {exercises
              .filter(exercise => {
                const matchesSearch = searchTerm === '' || 
                  exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  exercise.target.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch;
              })
              .slice(0, 5)
              .map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                  selectedExercise?.id === exercise.id
                    ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'border-gray-600/50 bg-gray-800/30 hover:bg-gray-700/50 hover:border-gray-500/50'
                }`}
              >
                <div className="font-medium text-white group-hover:text-blue-300 transition-colors text-sm">
                  {exercise.name}
                </div>
                <div className="text-xs text-gray-400 mt-1 capitalize">
                  {exercise.bodyPart} • {exercise.equipment}
                </div>
              </button>
            ))}
            
            {/* Show count of available exercises */}
            {searchTerm && (
              <div className="text-xs text-gray-500 text-center mt-2">
                {exercises.filter(exercise => {
                  const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exercise.target.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesSearch;
                }).length} exercises found
              </div>
            )}
          </div>
          
          {/* Quick Status & Controls */}
          <div className="mt-4 space-y-2">
            {/* Status */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className={`flex items-center gap-1 ${
                  apiStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    apiStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  {apiStatus === 'connected' ? 'AI Ready' : 'Loading...'}
                </span>
              </div>
            </div>
            
            {/* Audio Control */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Audio:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      isAudioEnabled
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600/70'
                    }`}
                  >
                    <span>{isAudioEnabled ? "🔊" : "🔇"}</span>
                    <span>{isAudioEnabled ? "On" : "Off"}</span>
                  </button>
                  <button
                    onClick={() => {
                      // Test audio function
                      window.speechSynthesis.cancel();
                      const testUtterance = new SpeechSynthesisUtterance("Audio test - TrainIQ is working");
                      testUtterance.rate = 0.9;
                      testUtterance.volume = 0.8;
                      window.speechSynthesis.speak(testUtterance);
                    }}
                    className="px-1 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    title="Test Audio"
                  >
                    🔧
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Mode Toggle */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Mode:</span>
                <button
                  onClick={() => {
                    setIsDemoMode(!isDemoMode);
                    if (!isDemoMode) {
                      // Switch to demo mode
                      setPoseScore(85);
                      setFeedback(['Demo Mode: High scores for presentation']);
                    } else {
                      // Switch to real mode
                      setPoseScore(0);
                      setFeedback(['Real Mode: Actual pose detection']);
                    }
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    isDemoMode
                      ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  <span>{isDemoMode ? "🎭" : "🎯"}</span>
                  <span>{isDemoMode ? "Demo" : "Real"}</span>
                </button>
              </div>
            </div>
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