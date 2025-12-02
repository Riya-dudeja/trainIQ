#!/usr/bin/env python3
"""
TrainIQ Pose Detection Backend
Using the same libraries as the reference repo for maximum reliability
"""

import cv2
import time
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS
import json
import base64
from cvzone.PoseModule import PoseDetector
from cvzone.Utils import overlayPNG

def check_dependencies():
    try:
        import cvzone
        print("✅ cvzone imported successfully")
        
        try:
            # Try to create a PoseDetector to verify both cvzone and mediapipe work
            temp_detector = PoseDetector()
            print("✅ mediapipe and PoseDetector working correctly")
            return True
        except Exception as e:
            print(f"❌ Error initializing PoseDetector: {str(e)}")
            print("Please install all required packages:")
            print("pip install cvzone mediapipe==0.10.8 opencv-python numpy flask flask-cors")
            return False
            
    except ImportError:
        print("❌ cvzone not available - install with: pip install cvzone")
        return False

CVZONE_AVAILABLE = check_dependencies()

app = Flask(__name__)
CORS(app)

class PushupCounter:
    def __init__(self):
        if not CVZONE_AVAILABLE:
            raise ImportError("cvzone is required. Install with: pip install cvzone")
        
        # Initialize PoseDetector with default settings like reference
        self.detector = PoseDetector(staticMode=False,
                                    modelComplexity=1,
                                    smoothLandmarks=True,
                                    enableSegmentation=False,
                                    smoothSegmentation=True,
                                    detectionCon=0.5,
                                    trackCon=0.5)
        self.direction = 0  # 0 = going down, 1 = going up
        self.count = 0  # Generic counter for exercises
        self.exercise_type = 'squat'  # or 'pushup'
        self.cap = None
        
        # Thresholds for exercises
        self.squat_threshold = {
            'down': 80,  # Angle when squatting down
            'up': 160    # Angle when standing up
        }
        self.pushup_threshold = {
            'down': 90,  # Angle when arms bent
            'up': 160    # Angle when arms straight
        }
        
        # Colors (same as reference repo)
        self.b_color = (0, 0, 0)
        self.blue_color = (190, 150, 37)  # BGR format
        
        # Performance tracking
        self.ptime = 0
        self.ctime = 0
        
    def initialize_camera(self, camera_index=0):
        """Initialize camera with optimal settings"""
        try:
            print(f"🎥 Attempting to initialize camera {camera_index}")
            self.cap = cv2.VideoCapture(camera_index)
            print(f"📷 VideoCapture object created")
            
            if not self.cap.isOpened():
                print("❌ Failed to open camera")
                return False
            
            print("✅ Camera opened successfully")
            
            # Set optimal resolution for performance
            width_success = self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            height_success = self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            fps_success = self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            print(f"📊 Camera settings:")
            print(f"   Resolution: {self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)}x{self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)}")
            print(f"   FPS: {self.cap.get(cv2.CAP_PROP_FPS)}")
            
            if not all([width_success, height_success, fps_success]):
                print("⚠️ Some camera settings could not be applied")
            
            return True
        except Exception as e:
            print(f"❌ Camera initialization error: {str(e)}")
            print(f"🔍 Error details: {type(e).__name__}")
            return False
    
    def process_frame(self):
        """Process single frame - exact logic from reference repo"""
        if not self.cap:
            print("❌ Camera not initialized")
            return None
            
        try:
            success, img = self.cap.read()
            if not success:
                print("❌ Failed to read frame from camera")
                return None
                
            if img is None or img.size == 0:
                print("❌ Empty frame received from camera")
                return None
                
            print(f"✅ Frame read successfully: {img.shape}")
            
            # Flip image for selfie view
            img = cv2.flip(img, 1)
            
            # Find pose
            img = self.detector.findPose(img, draw=True)
            lmlist, bbox = self.detector.findPosition(img, draw=False)
            
            if lmlist:  # Only process if landmarks are detected
                try:
                    if self.exercise_type == 'squat':
                        # Calculate angles for squat detection
                        # Right leg: hip(24) -> knee(26) -> ankle(28)
                        # Left leg: hip(23) -> knee(25) -> ankle(27)
                        # We'll also track hip angles for better accuracy
                        right_knee = self.detector.findAngle(img, 24, 26, 28, draw=True)
                        left_knee = self.detector.findAngle(img, 23, 25, 27, draw=True)
                        
                        # Add hip angles
                        right_hip = self.detector.findAngle(img, 12, 24, 26, draw=True)
                        left_hip = self.detector.findAngle(img, 11, 23, 25, draw=True)
                        
                        # Use combined angle (average of knee and hip) for better accuracy
                        right_combined = (right_knee + right_hip) / 2
                        left_combined = (left_knee + left_hip) / 2
                        
                        # Convert to percentage with adjusted thresholds for squats
                        per_val1 = int(np.interp(right_combined, (170, 90), (0, 100)))
                        per_val2 = int(np.interp(left_combined, (170, 90), (0, 100)))
                        
                        # Debug info
                        print(f"Right Knee: {right_knee:.1f}°, Left Knee: {left_knee:.1f}°")
                        print(f"Right Hip: {right_hip:.1f}°, Left Hip: {left_hip:.1f}°")
                        print(f"Combined R: {right_combined:.1f}°, L: {left_combined:.1f}°")
                        
                    else:  # pushup mode
                        a1 = self.detector.findAngle(img, 12, 14, 16, draw=True)
                        a2 = self.detector.findAngle(img, 15, 13, 11, draw=True)
                        per_val1 = int(np.interp(a1, (90, 170), (100, 0)))
                        per_val2 = int(np.interp(a2, (90, 170), (100, 0)))
                    
                    # Ensure percentages are within bounds
                    per_val1 = max(0, min(100, per_val1))
                    per_val2 = max(0, min(100, per_val2))
                    
                    # Draw progress bars
                    self.draw_progress_bars(img, per_val1, per_val2)
                    
                    # Exercise counting logic
                    color = (0, 0, 255)  # Default red
                    
                    if self.exercise_type == 'squat':
                        # Down position (squat)
                        if per_val1 >= 90 and per_val2 >= 90:  # When person is in squat position
                            if self.direction == 0:  # Going down
                                self.count += 0.5
                                self.direction = 1
                                color = (0, 255, 0)  # Green
                                print(f"⬇️ Squat down detected! Count: {self.count}")
                                
                        # Up position (standing)
                        elif per_val1 <= 10 and per_val2 <= 10:  # When person is standing up
                            if self.direction == 1:  # Was in squat, now standing
                                self.count += 0.5
                                self.direction = 0
                                color = (0, 255, 0)  # Green
                                print(f"⬆️ Squat up detected! Count: {self.count}")
                    else:  # pushup mode
                        # Down position (arms bent)
                        if per_val1 == 100 and per_val2 == 100:
                            if self.direction == 0:
                                self.count += 0.5
                                self.direction = 1
                                color = (0, 255, 0)
                                
                        # Up position (arms straight)
                        elif per_val1 <= 10 and per_val2 <= 10:
                            if self.direction == 1:
                                self.count += 0.5
                                self.direction = 0
                                color = (0, 255, 0)
                    
                    # Add text overlays (same as reference repo)
                    self.add_text_overlays(img, per_val1, per_val2, color)
                    
                    # Prepare angles data based on exercise type
                    angles_data = {}
                    if self.exercise_type == 'squat':
                        angles_data = {
                            'right_knee': right_knee,
                            'left_knee': left_knee,
                            'right_hip': right_hip,
                            'left_hip': left_hip
                        }
                    else:  # pushup
                        angles_data = {
                            'right_arm': a1,
                            'left_arm': a2
                        }
                    
                    return {
                        'frame': img,
                        'count': int(self.count),
                        'exercise_type': self.exercise_type,
                        'left_percentage': per_val2,
                        'right_percentage': per_val1,
                        'direction': self.direction,
                        'angles': angles_data
                    }
                    
                except Exception as e:
                    print(f"Angle calculation error: {e}")
                    return {'frame': img, 'push_ups': int(self.push_ups), 'error': str(e)}
            
            return {'frame': img, 'push_ups': int(self.push_ups)}
            
        except Exception as e:
            print(f"❌ Error processing frame: {str(e)}")
            return None
    
    def draw_progress_bars(self, img, per_val1, per_val2):
        """Draw progress bars exactly like reference repo"""
        h, w, _ = img.shape
        
        # Calculate bar heights (using exact reference values)
        bar_val1 = int(np.interp(per_val1, (0, 100), (40+350, 40)))
        bar_val2 = int(np.interp(per_val2, (0, 100), (40+350, 40)))
        
        # Right hand bar (matching reference positions exactly)
        cv2.rectangle(img, (570, bar_val1), (570 + 35, 40 + 350), (0, 0, 255), cv2.FILLED)
        cv2.rectangle(img, (570, 40), (570 + 35, 40 + 350), (), 2)
        
        # Left hand bar (matching reference positions exactly)
        cv2.rectangle(img, (35, bar_val2), (35 + 35, 40 + 350), (0, 0, 255), cv2.FILLED)
        cv2.rectangle(img, (35, 40), (35 + 35, 40 + 350), (), 2)
    
    def add_text_overlays(self, img, per_val1, per_val2, color):
        """Add text overlays exactly like reference repo"""
        try:
            # Helper function to add text with background
            def putTextRect(img, text, pos, scale_factor, thickness):
                font = cv2.FONT_HERSHEY_PLAIN
                font_scale = scale_factor
                font_thickness = thickness
                
                text_size = cv2.getTextSize(text, font, font_scale, font_thickness)[0]
                text_w, text_h = text_size
                
                # Draw background rectangle
                cv2.rectangle(img, pos, 
                            (pos[0] + text_w + 20, pos[1] + text_h + 20),
                            (255, 255, 255), cv2.FILLED)
                
                # Draw text
                cv2.putText(img, text, 
                          (pos[0] + 10, pos[1] + text_h + 10),
                          font, font_scale, self.blue_color, font_thickness)
            
            # Add all text overlays
            putTextRect(img, f"{per_val1} %", (570, 25), 1.3, 2)
            putTextRect(img, f"{per_val2} %", (25, 25), 1.3, 2)
            putTextRect(img, f"Push-ups: {int(self.push_ups)}", (200, 35), 2, 2)
            putTextRect(img, "Left Hand", (15, 350+100), 1.5, 2)
            putTextRect(img, "Right Hand", (485, 350+100), 1.5, 2)
                             
        except Exception as e:
            print(f"Text overlay error: {e}")
    
    def reset_counter(self):
        """Reset push-up counter"""
        self.push_ups = 0
        self.direction = 0
    
    def release_camera(self):
        """Clean up camera resources"""
        if self.cap:
            self.cap.release()

# Global counter instance
counter = None

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'cvzone_available': CVZONE_AVAILABLE,
        'camera_initialized': counter is not None and counter.cap is not None
    })

@app.route('/api/initialize')
def initialize():
    """Initialize the pose detection system"""
    global counter
    try:
        if not CVZONE_AVAILABLE:
            return jsonify({'error': 'cvzone not installed'}), 500
        
        counter = PushupCounter()
        if counter.initialize_camera():
            return jsonify({'status': 'initialized', 'message': 'Camera and pose detection ready'})
        else:
            return jsonify({'error': 'Failed to initialize camera'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process_frame')
def process_frame():
    """Process single frame and return pose data"""
    global counter
    if not counter:
        return jsonify({'error': 'System not initialized'}), 400
    
    try:
        result = counter.process_frame()
        if result is None:
            return jsonify({'error': 'Failed to process frame'}), 500
        
        # Convert frame to base64 for transmission
        if 'frame' in result:
            _, buffer = cv2.imencode('.jpg', result['frame'], [cv2.IMWRITE_JPEG_QUALITY, 80])
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            result['frame_base64'] = img_base64
            del result['frame']  # Remove the raw frame data
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset')
def reset_counter():
    """Reset push-up counter"""
    global counter
    if counter:
        counter.reset_counter()
        return jsonify({'status': 'reset', 'push_ups': 0})
    return jsonify({'error': 'System not initialized'}), 400

@app.route('/api/stats')
def get_stats():
    """Get current statistics"""
    global counter
    if counter:
        return jsonify({
            'push_ups': int(counter.push_ups),
            'direction': counter.direction,
            'status': 'active'
        })
    return jsonify({'error': 'System not initialized'}), 400

if __name__ == '__main__':
    print("🚀 TrainIQ Pose Detection Server")
    print("📋 Endpoints:")
    print("   GET  /api/health - Health check")
    print("   GET  /api/initialize - Initialize system")
    print("   GET  /api/process_frame - Process frame")
    print("   GET  /api/reset - Reset counter")
    print("   GET  /api/stats - Get statistics")
    print()
    
    if not CVZONE_AVAILABLE:
        print("❌ Please install required packages:")
        print("   pip install cvzone opencv-python flask flask-cors numpy")
        exit(1)
    
    print("✅ Starting server on http://127.0.0.1:5000")
    print("🔍 Debug mode: ON")
    print("📦 Python packages:")
    import sys
    import flask
    print(f"   Python: {sys.version}")
    print(f"   Flask: {flask.__version__}")
    print(f"   OpenCV: {cv2.__version__}")
    print(f"   NumPy: {np.__version__}")
    print("🔒 Only accepting local connections")
    
    app.run(debug=True, host='127.0.0.1', port=5000, threaded=True)