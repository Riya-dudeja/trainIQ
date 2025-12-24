
"use client";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { gymFitAPI, poseUtils } from "../utils/gymFitApi";

// Simple Toast component
function Toast({ message, position = "top", onClose }) {
  return (
    <div
      className={`fixed z-50 ${position === "top" ? "top-6" : "bottom-6"} left-1/2 transform -translate-x-1/2 bg-gray-900 text-yellow-200 border border-yellow-400 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}
      style={{ minWidth: 220 }}
    >
      {/* Icon removed for professional look */}
      <span className="font-medium text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-yellow-400 hover:text-yellow-200 text-lg">&times;</button>
      )}
    </div>
  );
}

// const VALID_BODYPARTS = [
//   "back", "cardio", "chest", "lower arms", "lower legs", "neck", 
//   "shoulders", "upper arms", "upper legs", "waist"
// ];
// const VALID_EQUIPMENT = [
//   "assisted", "band", "barbell", "body weight", "bosu ball", "cable", 
//   "dumbbell", "elliptical machine", "ez barbell", "hammer", "kettlebell", 
//   "leverage machine", "medicine ball", "olympic barbell", "resistance band", 
//   "roller", "rope", "skierg machidne", "sled machine", "smith machine", 
//   "stability ball", "stationary bike", "stepmill machine", "tire", "trap bar", "upper body ergometer", "weighted"
// ];

export default function GymAPIPage() {
    // Debug state for missing landmarks and confidence
    const [missingLandmarks, setMissingLandmarks] = useState([]);
    const [debugConfidence, setDebugConfidence] = useState(null);
  // Feedback state must be declared before useEffect that uses it
  const [feedback, setFeedback] = useState([]);
  const [feedbackIndex, setFeedbackIndex] = useState(0);
  useEffect(() => {
    if (feedback.length <= 1) return;
    const interval = setInterval(() => {
      setFeedbackIndex((prev) => (prev + 1) % feedback.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [feedback]);
  // Ensure hydration state is set on client mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const [showModeToast, setShowModeToast] = useState(false);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [squatState, setSquatState] = useState('up');
  const [showAudioToast, setShowAudioToast] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
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
  const [isDemoMode, setIsDemoMode] = useState(true); // Start in demo mode
  const [holdTimer, setHoldTimer] = useState(0);
  const [holdStartTime, setHoldStartTime] = useState(null);
  const [isGoodFormHold, setIsGoodFormHold] = useState(false);
  // UI State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastSpokenFeedback, setLastSpokenFeedback] = useState("");
  const [lastSpeechTime, setLastSpeechTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [squatRepCount, setSquatRepCount] = useState(0);
  const [jackState, setJackState] = useState('together');
  const [jackRepCount, setJackRepCount] = useState(0);
  const [pushupState, setPushupState] = useState('up');
  const [pushupRepCount, setPushupRepCount] = useState(0);

  // Auto-switch to real mode when MediaPipe is loaded
  useEffect(() => {
    if (isLoaded && isDemoMode) {
      setIsDemoMode(false);
      setPoseScore(0);
      setFeedback(["Real Mode: Actual pose detection"]);
    }
  }, [isLoaded, isDemoMode]);

  // Show mode switch toast when in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setShowModeToast(true);
      const t = setTimeout(() => setShowModeToast(false), 6000);
      return () => clearTimeout(t);
    }
  }, [isDemoMode]);

  // Show audio enable toast when audio is off and not in demo mode
  useEffect(() => {
    if (!isAudioEnabled && !isDemoMode) {
      setShowAudioToast(true);
      const t = setTimeout(() => setShowAudioToast(false), 6000);
      return () => clearTimeout(t);
    }
  }, [isAudioEnabled, isDemoMode]);
  
  // (Removed duplicate useState hooks for holdTimer, isFullScreen, isAudioEnabled, etc.)

  // Helper function to check if selected exercise is a yoga pose
  const isYogaPose = (exerciseId) => {
    return ['mountain-pose', 'downward-dog', 'child-pose', 'cobra-pose', 'triangle-pose', 'warrior-pose', 'tree-pose'].includes(exerciseId);
  };

  // Reset exercise states when exercise changes
  useEffect(() => {
    setSquatState('up');
    setSquatRepCount(0);
    setJackState('together');
    setJackRepCount(0);
    setPushupState('up');
    setPushupRepCount(0);
    setPushupCount(0); // Also reset the main counter
  }, [selectedExercise?.id]);

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

  // Enhanced audio coaching with exercise-specific instructions
  const getDetailedFormFeedback = (angles, confidence, selectedExercise = null) => {
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

    // Yoga pose specific feedback
    if (selectedExercise?.id === 'mountain-pose') {
      const mountainTips = [
        "Stand tall with feet hip-width apart",
        "Let your arms hang naturally at your sides",
        "Engage your thigh muscles and lift your kneecaps",
        "Lengthen through the crown of your head",
        "Breathe deeply and feel grounded like a mountain",
        "Keep your shoulders relaxed and away from your ears",
        "Distribute weight evenly across both feet"
      ];
      const randomTip = mountainTips[Math.floor(Math.random() * mountainTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'downward-dog') {
      const dogTips = [
        "Press your palms firmly into the ground",
        "Lift your hips up and back to create an inverted V",
        "Straighten your arms and legs as much as possible",
        "Keep your head between your arms",
        "Press your heels toward the ground",
        "Engage your core and breathe steadily",
        "Create length through your spine"
      ];
      const randomTip = dogTips[Math.floor(Math.random() * dogTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'child-pose') {
      const childTips = [
        "Kneel on your mat with big toes touching",
        "Sit back on your heels and widen your knees",
        "Extend your arms forward and rest your forehead down",
        "Allow your body to completely relax",
        "Breathe deeply and let go of tension",
        "Stay here as long as feels comfortable",
        "Use this pose to rest and restore energy"
      ];
      const randomTip = childTips[Math.floor(Math.random() * childTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'cobra-pose') {
      const cobraTips = [
        "Lie on your belly with palms under your shoulders",
        "Press your pubic bone into the ground",
        "Slowly lift your chest using your back muscles",
        "Keep your elbows close to your body",
        "Only lift as high as feels comfortable",
        "Breathe steadily and avoid straining your neck",
        "Keep your shoulders away from your ears"
      ];
      const randomTip = cobraTips[Math.floor(Math.random() * cobraTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'triangle-pose') {
      const triangleTips = [
        "Stand with your feet wide apart",
        "Turn your front foot out 90 degrees",
        "Reach forward and then down to your shin or floor",
        "Extend your top arm toward the ceiling",
        "Keep both sides of your torso equally long",
        "Breathe deeply and hold the stretch",
        "Keep your front thigh engaged and strong"
      ];
      const randomTip = triangleTips[Math.floor(Math.random() * triangleTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'warrior-pose') {
      const warriorTips = [
        "Step your back foot 3 to 4 feet behind you",
        "Turn your back foot out 45 degrees",
        "Bend your front knee directly over your ankle",
        "Keep your back leg straight and strong",
        "Reach your arms overhead with intention",
        "Ground through your feet and lift through your crown",
        "Breathe deeply and hold the pose with strength"
      ];
      const randomTip = warriorTips[Math.floor(Math.random() * warriorTips.length)];
      instructions.push(randomTip);
    }
    else if (selectedExercise?.id === 'tree-pose') {
      const treeTips = [
        "Press your standing foot firmly into the ground",
        "Place your lifted foot on your inner thigh, not your knee",
        "Keep your hips square and facing forward",
        "Bring your palms together at your heart center",
        "Find a focal point to help with balance",
        "Engage your core for stability",
        "Breathe calmly and grow tall like a tree"
      ];
      const randomTip = treeTips[Math.floor(Math.random() * treeTips.length)];
      instructions.push(randomTip);
    }
    
    // Traditional exercise feedback (squats, pushups, etc.)
    else {
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
    }
    
    // General posture reminders
    if (instructions.length === 0) {
      let motivational;
      if (isYogaPose(selectedExercise?.id)) {
        motivational = [
          "Breathe deeply and find your center",
          "Stay present and focused on your pose", 
          "Feel the strength and stability in your body",
          "Hold with intention and mindfulness"
        ];
      } else {
        motivational = [
          "Keep your core tight and back straight",
          "Good form! Control the movement", 
          "Breathe steadily throughout the movement",
          "Focus on quality over speed"
        ];
      }
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
              
              const instructions = getDetailedFormFeedback(angles, confidence, selectedExercise);
              
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
            return { score: 0, feedback: "Position your legs clearly in the camera view", phase: squatState, reps: squatRepCount };
          }

          console.log(`🔍 Squat Analysis - Knee: ${kneeAngle.toFixed(0)}°, State: ${squatState}`);

          // Natural language feedback
          if (squatState === 'up') {
            if (kneeAngle < 140) {
              setSquatState('down');
              return { score: 70, feedback: "Lower down into your squat", phase: 'down', reps: squatRepCount };
            }
            return { score: 50, feedback: "Bend your knees and begin to lower down", phase: squatState, reps: squatRepCount };
          } else { // squatState === 'down'
            if (kneeAngle > 160) {
              const newRepCount = squatRepCount + 1;
              setSquatState('up');
              setSquatRepCount(newRepCount);

              let repFeedback = `Rep ${newRepCount} completed! 🎉`;
              if (newRepCount === 1) {
                repFeedback = "First rep done! Great start!";
              } else if (newRepCount === 5) {
                repFeedback = "5 reps! You're doing amazing! 🔥";
              } else if (newRepCount === 10) {
                repFeedback = "10 reps! Outstanding! Keep it up!";
              } else if (newRepCount % 5 === 0) {
                repFeedback = `${newRepCount} reps! Fantastic work!`;
              }

              return { score: 90, feedback: repFeedback, phase: 'up', reps: newRepCount, justCompleted: true };
            }

            const depth = 180 - kneeAngle;
            if (kneeAngle < 120) {
              let score = 85;
              let feedback = "Great depth! Now drive up through your heels";
              if (depth > 80) {
                score = 95;
                feedback = "Excellent deep squat! Push up to stand tall";
              }
              return { score, feedback, phase: squatState, reps: squatRepCount };
            } else {
              return { score: 60, feedback: "Go deeper by lowering your hips, then drive up", phase: squatState, reps: squatRepCount };
            }
          }

          if (kneeAngle > 170) {
            return { score: 20, feedback: "Stand tall and prepare to squat down", phase: squatState, reps: squatRepCount };
          } else {
            return { score: 0, feedback: "Position your legs clearly in the camera view", phase: squatState, reps: squatRepCount };
          }
        }

        // Jumping Jacks Analysis - Simple position-based detection
        function analyzeJumpingJackForm(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: jackState, reps: jackRepCount };
          }
          
          const leftWrist = landmarks[15];
          const rightWrist = landmarks[16];
          const leftAnkle = landmarks[27];
          const rightAnkle = landmarks[28];
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          
          if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) {
            return { score: 0, feedback: "Move fully into camera view", phase: jackState, reps: jackCount };
          }
          
          // Calculate distances for arms and legs
          const armDistance = Math.abs(leftWrist.x - rightWrist.x);
          const legDistance = Math.abs(leftAnkle.x - rightAnkle.x);
          const armHeight = Math.min(leftWrist.y, rightWrist.y);
          const shoulderHeight = Math.min(leftShoulder.y, rightShoulder.y);
          
          // Determine if arms are up (wrists above shoulders) and legs are apart
          const armsUp = armHeight < shoulderHeight - 0.1; // Arms raised above shoulders
          const legsApart = legDistance > 0.3; // Legs spread apart
          
          console.log(`🔍 Jumping Jack Analysis - Arms Up: ${armsUp}, Legs Apart: ${legsApart}, State: ${jackState}`);
          
          // Simple binary state machine
          if (jackState === 'together') {
            if (armsUp && legsApart) {
              setJackState('apart');
              return { score: 80, feedback: "Jump up, lift your arms and spread your legs", phase: 'apart', reps: jackRepCount };
            }
            return { score: 50, feedback: "Prepare to jump by raising your arms and spreading your legs", phase: jackState, reps: jackRepCount };
          } else { // jackState === 'apart'
            if (!armsUp && !legsApart) {
              const newRepCount = jackRepCount + 1;
              setJackState('together');
              setJackRepCount(newRepCount);

              let repFeedback = `Jumping Jack ${newRepCount} completed! 🎉`;
              if (newRepCount === 1) {
                repFeedback = "First jumping jack! Keep it up!";
              } else if (newRepCount === 10) {
                repFeedback = "10 jumping jacks! Great cardio! 🔥";
              } else if (newRepCount === 20) {
                repFeedback = "20 jumping jacks! Excellent stamina!";
              }

              return { score: 95, feedback: repFeedback, phase: 'together', reps: newRepCount, justCompleted: true };
            }
            return { score: 75, feedback: "Bring your arms down and bring your legs together to finish the rep", phase: jackState, reps: jackRepCount };
          }
        }

        // Push-up Analysis - Simple elbow angle detection
        function analyzePushupForm(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: pushupState, reps: pushupRepCount };
          }
          
          const leftShoulder = landmarks[11];
          const leftElbow = landmarks[13];
          const leftWrist = landmarks[15];
          const rightShoulder = landmarks[12];
          const rightElbow = landmarks[14];
          const rightWrist = landmarks[16];
          
          if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
            return { score: 0, feedback: "Position arms in camera view", phase: pushupState, reps: pushupRepCount };
          }
          
          // Calculate elbow angles (based on reference implementation)
          const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
          const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
          
          console.log(`🔍 Push-up Analysis - Elbow: ${avgElbowAngle.toFixed(0)}°, State: ${pushupState}`);
          
          // Simple binary state machine similar to reference
          if (pushupState === 'up') {
            if (avgElbowAngle < 90) {
              setPushupState('down');
              return { score: 70, feedback: "Lower your chest down by bending your elbows", phase: 'down', reps: pushupRepCount };
            }
            return { score: 50, feedback: "Begin to lower down, keep your body straight", phase: pushupState, reps: pushupRepCount };
          } else { // pushupState === 'down'
            if (avgElbowAngle > 160) {
              const newRepCount = pushupRepCount + 1;
              setPushupState('up');
              setPushupRepCount(newRepCount);

              let repFeedback = `Push-up ${newRepCount} completed!`;
              if (newRepCount === 1) {
                repFeedback = "First push-up! Great start! 🔥";
              } else if (newRepCount === 5) {
                repFeedback = "5 push-ups! Strong work!";
              } else if (newRepCount === 10) {
                repFeedback = "10 push-ups! Excellent strength!";
              }

              return { score: 90, feedback: repFeedback, phase: 'up', reps: newRepCount, justCompleted: true };
            }

            if (avgElbowAngle < 60) {
              return { score: 85, feedback: "Great depth! Now drive up and straighten your arms", phase: pushupState, reps: pushupRepCount };
            } else {
              return { score: 60, feedback: "Push up by extending your arms fully", phase: pushupState, reps: pushupRepCount };
            }
          }
        }

        // Helper function to calculate angle between three points
        function calculateAngle(a, b, c) {
          // Calculate angle at point b using points a, b, c
          const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
          let angle = Math.abs(radians * 180.0 / Math.PI);
          
          // Ensure angle is between 0 and 180 degrees
          if (angle > 180.0) {
            angle = 360 - angle;
          }
          
          return angle;
        }

        // Yoga pose analysis functions
        function analyzeWarriorPose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          
          // Key landmarks for Warrior I
          const leftHip = lm[23];
          const rightHip = lm[24];
          const leftKnee = lm[25];
          const rightKnee = lm[26];
          const leftAnkle = lm[27];
          const rightAnkle = lm[28];
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftElbow = lm[13];
          const rightElbow = lm[14];
          const leftWrist = lm[15];
          const rightWrist = lm[16];
          const nose = lm[0];

          let score = 0;
          let feedback = [];

          // Enhanced foot positioning analysis
          const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);
          if (ankleDistance > 0.25) {
            score += 20;
            feedback.push("Wide stance, strong warrior foundation");
          } else if (ankleDistance > 0.15) {
            score += 15;
            feedback.push("Good stance, step your back foot a bit wider");
          } else {
            feedback.push("Step your back foot further to widen your stance");
          }

          // Enhanced front knee analysis
          const frontKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
          const backKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
          
          if (frontKneeAngle >= 85 && frontKneeAngle <= 95) {
            score += 25;
            feedback.push("Front knee is bent at 90°, excellent alignment");
          } else if (frontKneeAngle < 120) {
            score += 20;
            feedback.push("Good knee bend, try to reach 90°");
          } else {
            feedback.push("Bend your front knee deeper to reach 90°");
          }

          // Enhanced back leg analysis
          if (backKneeAngle > 170) {
            score += 25;
            feedback.push("Back leg is straight and strong");
          } else if (backKneeAngle > 160) {
            score += 20;
            feedback.push("Good back leg, try to straighten it fully");
          } else {
            feedback.push("Engage and straighten your back leg for stability");
          }

          // Enhanced arm positioning analysis
          const averageArmHeight = (leftWrist.y + rightWrist.y) / 2;
          const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
          const armDistance = Math.abs(leftWrist.x - rightWrist.x);
          
          if (averageArmHeight < shoulderHeight - 0.15 && armDistance < 0.3) {
            score += 25;
            feedback.push("Arms are reaching up, powerful and tall");
          } else if (averageArmHeight < shoulderHeight - 0.1) {
            score += 20;
            feedback.push("Good arm raise, bring your arms closer together");
          } else {
            feedback.push("Lift your arms high overhead and reach up");
          }

          // Check spine alignment and posture
          const spineAlignment = Math.abs(nose.x - ((leftHip.x + rightHip.x) / 2));
          if (spineAlignment < 0.05) {
            score += 5;
            feedback.push("Beautiful centered posture");
          }

          // Hip alignment check
          const hipAlignment = Math.abs(leftHip.y - rightHip.y);
          if (hipAlignment < 0.03) {
            score += 5;
            feedback.push("Hips perfectly level");
          }

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'holding', 
            reps: score > 80 ? 1 : 0 
          };
        }

        function analyzeTreePose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          
          // Key landmarks for Tree Pose
          const leftHip = lm[23];
          const rightHip = lm[24];
          const leftKnee = lm[25];
          const rightKnee = lm[26];
          const leftAnkle = lm[27];
          const rightAnkle = lm[28];
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftElbow = lm[13];
          const rightElbow = lm[14];
          const leftWrist = lm[15];
          const rightWrist = lm[16];
          const nose = lm[0];

          let score = 0;
          let feedback = [];

          // Enhanced single leg balance analysis
          const leftFootHeight = leftAnkle.y;
          const rightFootHeight = rightAnkle.y;
          const footHeightDiff = Math.abs(leftFootHeight - rightFootHeight);
          
          if (footHeightDiff > 0.15) {
            score += 30;
            feedback.push("Single-leg balance is strong, well done");
          } else if (footHeightDiff > 0.08) {
            score += 25;
            feedback.push("Good balance, lift your foot higher on your thigh");
          } else {
            feedback.push("Lift one foot and place it on your inner thigh, not the knee");
          }

          // Enhanced hip alignment analysis  
          const hipLevel = Math.abs(leftHip.y - rightHip.y);
          if (hipLevel < 0.03) {
            score += 25;
            feedback.push("Hips are level and facing forward");
          } else if (hipLevel < 0.06) {
            score += 20;
            feedback.push("Good hip alignment, keep them level");
          } else {
            feedback.push("Level your hips and keep them facing forward");
          }

          // Enhanced hand position analysis
          const handsDistance = Math.sqrt(
            Math.pow(leftWrist.x - rightWrist.x, 2) + 
            Math.pow(leftWrist.y - rightWrist.y, 2)
          );
          
          const handsAtChest = (leftWrist.y + rightWrist.y) / 2;
          const chestLevel = (leftShoulder.y + rightShoulder.y) / 2;
          
          if (handsDistance < 0.08 && Math.abs(handsAtChest - chestLevel) < 0.08) {
            score += 25;
            feedback.push("Palms together at your heart, perfect focus");
          } else if (handsDistance < 0.12) {
            score += 20;
            feedback.push("Good hand position, bring your palms closer together");
          } else {
            feedback.push("Bring your palms together at your heart center");
          }

          // Check spine alignment (straight standing posture)
          const spineAlignment = Math.abs(nose.x - ((leftShoulder.x + rightShoulder.x) / 2));
          if (spineAlignment < 0.04) {
            score += 10;
            feedback.push("Beautiful tall spine");
          }

          // Check shoulder alignment
          const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
          if (shoulderLevel < 0.03) {
            score += 10;
            feedback.push("Shoulders relaxed and level");
          }

          // Enhanced stability scoring based on overall form
          if (score >= 75) {
            feedback.push("Rooted like a strong tree - hold with breath");
          } else if (score >= 60) {
            feedback.push("Finding your balance - keep breathing");
          }

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'balancing', 
            reps: score > 75 ? 1 : 0 
          };
        }

        function analyzeMountainPose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          let score = 0;
          const feedback = [];

          // Check spine alignment
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftHip = lm[23];
          const rightHip = lm[24];

          // Shoulders should be level
          const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y);
          if (shoulderAlignment < 0.05) {
            score += 25;
            feedback.push("Perfect shoulder alignment");
          } else {
            feedback.push("Level your shoulders");
          }

          // Hips should be level
          const hipAlignment = Math.abs(leftHip.y - rightHip.y);
          if (hipAlignment < 0.05) {
            score += 25;
            feedback.push("Great hip alignment");
          } else {
            feedback.push("Balance your hips");
          }

          // Check feet positioning
          const leftAnkle = lm[27];
          const rightAnkle = lm[28];
          const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
          if (feetDistance > 0.1 && feetDistance < 0.2) {
            score += 25;
            feedback.push("Good feet positioning");
          } else {
            feedback.push("Place feet hip-width apart");
          }

          // Check arm positioning (should be at sides)
          const leftElbow = lm[13];
          const rightElbow = lm[14];
          const armPosition = (leftElbow.x < leftShoulder.x) && (rightElbow.x > rightShoulder.x);
          if (armPosition) {
            score += 25;
            feedback.push("Arms perfectly at your sides");
          } else {
            feedback.push("Let your arms rest naturally at your sides");
          }

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'holding', 
            reps: score > 70 ? 1 : 0 
          };
        }

        function analyzeDownwardDog(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          let score = 0;
          const feedback = [];

          // Check inverted V shape
          const leftWrist = lm[15];
          const rightWrist = lm[16];
          const leftHip = lm[23];
          const rightHip = lm[24];
          const leftAnkle = lm[27];
          const rightAnkle = lm[28];

          // Hips should be highest point
          const avgHipY = (leftHip.y + rightHip.y) / 2;
          const avgWristY = (leftWrist.y + rightWrist.y) / 2;
          const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

          if (avgHipY < avgWristY && avgHipY < avgAnkleY) {
            score += 30;
            feedback.push("Perfect inverted V shape");
          } else {
            feedback.push("Lift your hips higher");
          }

          // Check arm straightness
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftElbow = lm[13];
          const rightElbow = lm[14];

          const leftArmAngle = calculateAngle(leftWrist, leftElbow, leftShoulder);
          const rightArmAngle = calculateAngle(rightWrist, rightElbow, rightShoulder);

          if (leftArmAngle > 160 && rightArmAngle > 160) {
            score += 25;
            feedback.push("Arms are beautifully straight");
          } else {
            feedback.push("Straighten your arms");
          }

          // Check leg position
          const leftKnee = lm[25];
          const rightKnee = lm[26];
          
          const leftLegAngle = calculateAngle(leftAnkle, leftKnee, leftHip);
          const rightLegAngle = calculateAngle(rightAnkle, rightKnee, rightHip);

          if (leftLegAngle > 150 && rightLegAngle > 150) {
            score += 25;
            feedback.push("Legs are well extended");
          } else {
            feedback.push("Try to straighten your legs");
          }

          // Base stability score
          score += 20;

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'holding', 
            reps: score > 75 ? 1 : 0 
          };
        }

        function analyzeChildPose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          let score = 0;
          const feedback = [];

          // Check if person is low to ground (kneeling position)
          const leftHip = lm[23];
          const rightHip = lm[24];
          const leftKnee = lm[25];
          const rightKnee = lm[26];
          const nose = lm[0];

          // Hips should be close to heels
          const avgHipY = (leftHip.y + rightHip.y) / 2;
          const avgKneeY = (leftKnee.y + rightKnee.y) / 2;

          if (avgHipY > avgKneeY - 0.1) {
            score += 30;
            feedback.push("Great sitting position");
          } else {
            feedback.push("Sit back on your heels");
          }

          // Forehead should be low (near ground level)
          if (nose.y > avgHipY + 0.2) {
            score += 25;
            feedback.push("Perfect forward fold");
          } else {
            feedback.push("Lower your forehead toward the ground");
          }

          // Arms should be extended forward
          const leftWrist = lm[15];
          const rightWrist = lm[16];
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];

          const armsExtended = (leftWrist.y > leftShoulder.y) && (rightWrist.y > rightShoulder.y);
          if (armsExtended) {
            score += 25;
            feedback.push("Arms beautifully extended");
          } else {
            feedback.push("Extend your arms forward");
          }

          // Relaxation bonus
          score += 20;

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'relaxing', 
            reps: score > 70 ? 1 : 0 
          };
        }

        function analyzeCobraPose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          let score = 0;
          const feedback = [];

          // Check chest lift
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftHip = lm[23];
          const rightHip = lm[24];
          const nose = lm[0];

          // Shoulders should be higher than hips
          const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          const avgHipY = (leftHip.y + rightHip.y) / 2;

          if (avgShoulderY < avgHipY - 0.1) {
            score += 30;
            feedback.push("Excellent chest lift");
          } else {
            feedback.push("Lift your chest higher");
          }

          // Check arm positioning
          const leftElbow = lm[13];
          const rightElbow = lm[14];
          const leftWrist = lm[15];
          const rightWrist = lm[16];

          // Elbows should be close to body
          const elbowSpread = Math.abs(leftElbow.x - rightElbow.x);
          if (elbowSpread < 0.3) {
            score += 25;
            feedback.push("Good elbow positioning");
          } else {
            feedback.push("Keep elbows close to your body");
          }

          // Head should be in neutral position
          if (nose.y < avgShoulderY) {
            score += 25;
            feedback.push("Perfect head alignment");
          } else {
            feedback.push("Lift your head gently");
          }

          // Base form score
          score += 20;

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'backbending', 
            reps: score > 70 ? 1 : 0 
          };
        }

        function analyzeTrianglePose(landmarks) {
          if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "Position yourself in camera view", phase: 'setup', reps: 0 };
          }

          const lm = landmarks;
          let score = 0;
          const feedback = [];

          // Check wide leg stance
          const leftAnkle = lm[27];
          const rightAnkle = lm[28];
          const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);

          if (feetDistance > 0.3) {
            score += 25;
            feedback.push("Good wide stance");
          } else {
            feedback.push("Step your feet wider apart");
          }

          // Check lateral bend
          const leftShoulder = lm[11];
          const rightShoulder = lm[12];
          const leftWrist = lm[15];
          const rightWrist = lm[16];

          const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
          if (shoulderTilt > 0.1) {
            score += 30;
            feedback.push("Beautiful side stretch");
          } else {
            feedback.push("Reach further to the side");
          }

          // Check arm extension (one up, one down)
          const armExtension = Math.abs(leftWrist.y - rightWrist.y);
          if (armExtension > 0.3) {
            score += 25;
            feedback.push("Perfect arm positioning");
          } else {
            feedback.push("Extend one arm up, one arm down");
          }

          // Stability bonus
          score += 20;

          return { 
            score, 
            feedback: feedback.join(" • "), 
            phase: 'stretching', 
            reps: score > 75 ? 1 : 0 
          };
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
            // Debug: check for missing key yoga landmarks
            if (selectedExercise && isYogaPose(selectedExercise.id)) {
              const required = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
              const missing = required.filter(idx => !lm[idx] || lm[idx].visibility <= 0.5);
              setMissingLandmarks(missing);
              setDebugConfidence(overallConfidence);
            }
            
            // Update confidence state for UI display
            setCurrentConfidence(overallConfidence);
            
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
            console.log('Confidence:', overallConfidence.toFixed(2));

            // ENHANCED analysis based on selected exercise
            let analysis;
            if (selectedExercise?.id === 'mountain-pose') {
              analysis = analyzeMountainPose(lm);
            } else if (selectedExercise?.id === 'downward-dog') {
              analysis = analyzeDownwardDog(lm);
            } else if (selectedExercise?.id === 'child-pose') {
              analysis = analyzeChildPose(lm);
            } else if (selectedExercise?.id === 'cobra-pose') {
              analysis = analyzeCobraPose(lm);
            } else if (selectedExercise?.id === 'triangle-pose') {
              analysis = analyzeTrianglePose(lm);
            } else if (selectedExercise?.id === 'warrior-pose') {
              analysis = analyzeWarriorPose(lm);
            } else if (selectedExercise?.id === 'tree-pose') {
              analysis = analyzeTreePose(lm);
            } else if (selectedExercise?.id === 'jumping-jacks') {
              analysis = analyzeJumpingJackForm(lm);
            } else if (selectedExercise?.id === 'pushup') {
              analysis = analyzePushupForm(lm);
            } else {
              // Default to squat analysis
              analysis = analyzeSquatForm(smoothedAngles);
            }
            
            // Get intelligent feedback
            const smartFeedback = intelligentFeedback.updateFeedback(smoothedAngles, overallConfidence);
            
            // Only update UI if we have sufficient confidence AND not in demo mode
            if (overallConfidence > 0.3 && !isDemoMode) {
                          console.log('DEBUG: overallConfidence =', overallConfidence);
                          console.log('DEBUG: poseLandmarks =', results.poseLandmarks);
              setPoseScore(analysis.score);
              // Handle Hold Timer for Yoga Poses vs Reps for Traditional Exercises
              if (isYogaPose(selectedExercise?.id)) {
                if (analysis.score >= 75) {
                  if (!isGoodFormHold) {
                    setIsGoodFormHold(true);
                    setHoldStartTime(Date.now());
                    setHoldTimer(0);
                  } else {
                    const holdDuration = Math.floor((Date.now() - holdStartTime) / 1000);
                    setHoldTimer(holdDuration);
                  }
                  setPushupCount(holdTimer);
                } else {
                  if (isGoodFormHold) {
                    setIsGoodFormHold(false);
                    setHoldStartTime(null);
                  }
                  setPushupCount(0);
                }
              } else {
                setPushupCount(analysis.reps);
              }
              // Feedback
              let currentFeedback;
              if (isYogaPose(selectedExercise?.id)) {
                const holdStatus = isGoodFormHold 
                  ? `Holding for ${holdTimer}s - Great form! 🧘‍♀️`
                  : 'Adjust your pose to start hold timer';
                // Always show some feedback, even for low scores
                let yogaFeedback = analysis.feedback;
                if (!yogaFeedback || yogaFeedback.trim() === "") {
                  // Fallback motivational/instructional message
                  const fallbackTips = getDetailedFormFeedback(null, 1, selectedExercise);
                  yogaFeedback = fallbackTips && fallbackTips.length > 0 ? fallbackTips[0] : "Keep breathing and focus on your posture.";
                }
                currentFeedback = [
                  `🧘 ${selectedExercise.name}: ${yogaFeedback}`,
                  `Score: ${analysis.score}/100`,
                  `Phase: ${analysis.phase.toUpperCase()}`,
                  holdStatus,
                  ...smartFeedback
                ];
                // Speak clear positive feedback if confidence is high and form is good
                if (isAudioEnabled && !isDemoMode && debugConfidence !== null && debugConfidence > 0.9 && analysis.score > 80) {
                  speakFeedback("Excellent! You are doing the pose correctly. Hold and breathe.");
                }
              } else {
                currentFeedback = [
                  `REPS: ${analysis.reps} | ${analysis.feedback}`,
                  `Phase: ${analysis.phase.toUpperCase()}`,
                  `Left Knee: ${smoothedAngles.leftKnee ? smoothedAngles.leftKnee.toFixed(0) + '°' : 'N/A'}`,
                  `Right Knee: ${smoothedAngles.rightKnee ? smoothedAngles.rightKnee.toFixed(0) + '°' : 'N/A'}`,
                  `Avg Knee: ${smoothedAngles.avgKnee ? smoothedAngles.avgKnee.toFixed(0) + '°' : 'N/A'}`,
                  ...smartFeedback
                ];
              }
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
                } else {
                  // For yoga poses, provide specific corrective audio feedback
                  if (isYogaPose(selectedExercise?.id)) {
                    if (analysis.feedback) {
                      const corrections = analysis.feedback.split(' • ');
                      const negativeCorrections = corrections.filter(c => 
                        c.includes('Step your back foot further') || 
                        c.includes('Bend your front knee more') || 
                        c.includes('Straighten your back leg') || 
                        c.includes('Raise your arms overhead') ||
                        c.includes('Lift one foot up') ||
                        c.includes('Keep your hips level') ||
                        c.includes('Bring palms together')
                      );
                      if (negativeCorrections.length > 0) {
                        speakFeedback(negativeCorrections[0]);
                      } else {
                        // Always speak a random yoga tip for conversation
                        const tips = getDetailedFormFeedback(null, 1, selectedExercise);
                        if (tips && tips.length > 0) {
                          speakFeedback(tips[0]);
                        } else if (analysis.score > 75) {
                          speakFeedback("Excellent pose! Hold this position and breathe deeply.");
                        } else if (analysis.score > 50) {
                          speakFeedback("Good form! Make small adjustments to perfect your pose.");
                        }
                      }
                    }
                  } else {
                    const audioInstruction = intelligentFeedback.getAudioInstructions(smoothedAngles, overallConfidence);
                    if (audioInstruction) {
                      speakFeedback(audioInstruction);
                    } else if (analysis.feedback) {
                      speakFeedback(getScoreBasedFeedback(analysis.score, [analysis.feedback]));
                    }
                  }
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
              // Always speak feedback if confidence is low or landmarks are missing
              if (isAudioEnabled && !isDemoMode) {
                let spoken = false;
                if (missingLandmarks && missingLandmarks.length > 0) {
                  speakFeedback("Please make sure your whole body is visible to the camera for pose detection.");
                  spoken = true;
                }
                if (!spoken) {
                  if (overallConfidence < 0.3) {
                    speakFeedback("Step back and center yourself in the camera view");
                  } else if (overallConfidence < 0.5) {
                    speakFeedback("Move a bit to get your full body in view");
                  } else if (overallConfidence < 0.7) {
                    speakFeedback("Adjust your position for better detection");
                  }
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
      initializePoseDetection();
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
  }, [isHydrated]);

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
            // Only set default feedback if no exercise is selected
            if (!selectedExercise) {
              setFeedback(['AI Trainer Ready!', 'Select an exercise to begin']);
            }
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
      // Always include yoga poses first
      const yogaPoses = [
        {
          id: 'mountain-pose',
          name: 'Mountain Pose',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'posture & alignment',
          instructions: ['Stand tall with feet hip-width apart', 'Arms at sides, palms facing forward', 'Engage core and lengthen spine', 'Breathe deeply', 'Hold for 1 minute']
        },
        {
          id: 'downward-dog',
          name: 'Downward Facing Dog',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'strength & flexibility',
          instructions: ['Start on hands and knees', 'Tuck toes under', 'Lift hips up and back', 'Straighten legs', 'Hold for 30-60 seconds']
        },
        {
          id: 'child-pose',
          name: 'Child\'s Pose',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'relaxation & flexibility',
          instructions: ['Kneel on mat', 'Sit back on heels', 'Extend arms forward', 'Rest forehead on ground', 'Hold for 1-2 minutes']
        },
        {
          id: 'cobra-pose',
          name: 'Cobra Pose',
          bodyPart: 'back',
          equipment: 'body weight',
          target: 'back strength & flexibility',
          instructions: ['Lie face down', 'Place palms under shoulders', 'Press chest up', 'Keep hips on ground', 'Hold for 15-30 seconds']
        },
        {
          id: 'triangle-pose',
          name: 'Triangle Pose',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'side body stretch',
          instructions: ['Stand with feet wide', 'Turn right foot out 90 degrees', 'Reach right hand to floor', 'Extend left arm up', 'Hold for 30 seconds each side']
        },
        {
          id: 'warrior-pose',
          name: 'Warrior I Pose',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'balance & flexibility',
          instructions: ['Step left foot back 3-4 feet', 'Turn left foot out 45 degrees', 'Bend right knee over ankle', 'Raise arms overhead', 'Hold for 30 seconds']
        },
        {
          id: 'tree-pose',
          name: 'Tree Pose',
          bodyPart: 'full body',
          equipment: 'body weight',
          target: 'balance & core',
          instructions: ['Stand on left foot', 'Place right foot on inner left thigh', 'Bring palms together at chest', 'Focus on a point ahead', 'Hold for 30 seconds']
        }
      ];

      try {
        setApiStatus("loading");
        const results = await gymFitAPI.searchExercises({
          query: searchTerm,
          bodyPart: selectedBodyPart,
          equipment: selectedEquipment,
        });
        
        // Combine yoga poses with API results
        const allExercises = [...yogaPoses, ...(results || [])];
        setExercises(allExercises);
        setApiStatus("connected");
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        setApiStatus("offline");
        
        // Set demo exercises for presentation (including yoga poses)
        setExercises([
          ...yogaPoses,
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

  // Update feedback when exercise is selected
  useEffect(() => {
    if (!selectedExercise) {
      setFeedback(['AI Trainer Ready!', 'Select an exercise to begin']);
      setPoseScore(0);
    } else {
      if (selectedExercise.id === 'warrior-pose') {
        setFeedback([
          `🧘 ${selectedExercise.name} selected`,
          'Step back foot 3-4 feet, bend front knee',
          'Raise arms overhead and hold strong',
          'Get in position to begin pose analysis'
        ]);
        setPoseScore(20); // Set initial score
        
        // Immediate audio instruction
        if (isAudioEnabled) {
          setTimeout(() => {
            speakFeedback("Warrior pose selected. Step your back foot 3 to 4 feet behind you, bend your front knee, and raise your arms overhead.");
          }, 500);
        }
      } else if (selectedExercise.id === 'tree-pose') {
        setFeedback([
          `🧘 ${selectedExercise.name} selected`, 
          'Stand on one foot, place other on inner thigh',
          'Bring palms together at chest and balance',
          'Get in position to begin pose analysis'
        ]);
        setPoseScore(20); // Set initial score
        
        // Immediate audio instruction
        if (isAudioEnabled) {
          setTimeout(() => {
            speakFeedback("Tree pose selected. Stand on one foot, place the other on your inner thigh, and bring your palms together at your chest.");
          }, 500);
        }
      } else {
        // If exercise has instructions, show them as tips/feedback
        const tips = selectedExercise.instructions && selectedExercise.instructions.length > 0
          ? [
              `${selectedExercise.name} selected`,
              ...selectedExercise.instructions,
              'Position yourself in camera view',
              'Begin the exercise when ready',
              'AI will track your form in real-time'
            ]
          : [
              `${selectedExercise.name} selected`,
              'Position yourself in camera view',
              'Begin the exercise when ready',
              'AI will track your form in real-time'
            ];
        setFeedback(tips);
        setPoseScore(15); // Set initial score
        // Immediate audio instruction
        if (isAudioEnabled) {
          setTimeout(() => {
            speakFeedback(`${selectedExercise.name} selected. Position yourself in the camera view and begin when ready.`);
          }, 500);
        }
      }
    }
  }, [selectedExercise, isAudioEnabled]);

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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
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

        {/* Debug UI for yoga pose detection */}
        {isYogaPose(selectedExercise?.id) && (
          <div className="fixed top-2 right-2 bg-black bg-opacity-80 text-xs p-2 rounded z-50 border border-yellow-400">
            <div>Detection Confidence: {debugConfidence !== null ? (debugConfidence * 100).toFixed(1) + '%' : 'N/A'}</div>
            <div>Missing Landmarks: {missingLandmarks.length > 0 ? missingLandmarks.join(', ') : 'None'}</div>
          </div>
        )}

        {/* Overlay Controls & Frequent Feedback */}
        {isFullScreen && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {/* AI Feedback Panel */}
            <div className="bg-black/80 backdrop-blur rounded-lg p-4 max-w-md">
              <h3 className="text-lg font-bold mb-2 text-green-400">AI Feedback</h3>
              {feedback.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {feedback.map((msg, idx) => (
                    <div key={idx} className={`flex items-start ${idx === feedbackIndex ? 'opacity-100' : 'opacity-60'}`}>
                      {/* Icon removed for professional look */}
                      <div className="text-xs md:text-sm text-yellow-100 leading-tight">{msg}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No feedback yet</div>
              )}
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
            className="absolute bottom-4 right-4 bg-slate-600 hover:bg-slate-700 px-3 py-2 rounded-lg font-medium z-10 text-sm"
          >
            📺 Enter Full Screen
          </button>
        )}
      </div>

      {/* Sidebar - Mobile Responsive */}
      <div className="w-full lg:w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex-shrink-0 overflow-y-auto sidebar-scroll max-h-60 lg:max-h-none">
        {/* Live Feedback Section */}
        <div className="p-3 lg:p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-base lg:text-lg font-bold text-white">Live Feedback</h3>
          </div>

          {/* Selected Exercise Display */}
          {selectedExercise && (
            <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-gradient-to-r from-purple-500/20 to-slate-500/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1 lg:mb-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs lg:text-sm text-purple-300 font-medium">Active Exercise</span>
              </div>
              <div className="text-white font-bold text-xs lg:text-sm">{selectedExercise.name}</div>
              <div className="text-xs text-gray-400 capitalize mt-1">
                {selectedExercise.target} • {selectedExercise.equipment}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 rounded-lg p-2 lg:p-3 text-center">
              <div className="text-lg lg:text-xl font-bold text-blue-200 mb-1">{poseScore}%</div>
              <div className="text-xs text-blue-200/70 uppercase tracking-wide">Form Score</div>
            </div>

            {/* Rep Counter / Hold Timer */}
            {isYogaPose(selectedExercise?.id) ? (
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border border-yellow-500/30 rounded-lg p-2 lg:p-3 text-center">
                <div className="text-lg lg:text-xl font-bold text-yellow-400 mb-1">{holdTimer}s</div>
                <div className="text-xs text-yellow-300/70 uppercase tracking-wide">
                  {isGoodFormHold ? "Holding" : "Hold Timer"}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 rounded-lg p-2 lg:p-3 text-center">
                <div className="text-lg lg:text-xl font-bold text-blue-200 mb-1">{pushupCount}</div>
                <div className="text-xs text-blue-200/70 uppercase tracking-wide">Reps</div>
              </div>
            )}
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
            {/* Icon removed for professional look */}
            Exercise Selection
          </h3>
          
          {/* Quick Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-sm focus:border-blue-200/50 focus:outline-none text-white"
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
              className="px-2 py-1 text-xs bg-slate-600/20 hover:bg-slate-600/30 rounded-md text-blue-200 hover:text-blue-100 transition-colors"
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
            
            {/* Confidence Indicator */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Detection:</span>
                <span className={`flex items-center gap-1 ${
                  currentConfidence > 0.7 ? 'text-green-400' : 
                  currentConfidence > 0.5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    currentConfidence > 0.7 ? 'bg-green-400' : 
                    currentConfidence > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  {(currentConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            {/* Audio Control */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50 relative">
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
              {/* Audio Toast (inline, right above audio toggle) */}
              {showAudioToast && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-yellow-200 border border-yellow-400 px-3 py-1 rounded shadow-lg text-xs animate-fade-in z-50">
                  Enable audio for voice coaching!
                </div>
              )}
            </div>

            {/* Demo Mode Toggle */}
            <div className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50 relative">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Mode:</span>
                <button
                  onClick={() => {
                    setIsDemoMode(!isDemoMode);
                    if (!isDemoMode) {
                      setPoseScore(85);
                      setFeedback(['Demo Mode: High scores for presentation']);
                    } else {
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
              {/* Mode Toast (inline, right above mode toggle) */}
              {showModeToast && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-yellow-200 border border-yellow-400 px-3 py-1 rounded shadow-lg text-xs animate-fade-in z-50">
                  Switch to Real Mode for live feedback!
                </div>
              )}
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