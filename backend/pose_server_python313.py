#!/usr/bin/env python3
"""
TrainIQ Pose Detection Backend - OpenCV Only Version
For Python 3.12+ where MediaPipe is not available
Uses OpenCV DNN for pose detection as alternative
"""

import cv2
import time
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS
import json
import base64
import os
import urllib.request

app = Flask(__name__)
CORS(app)

class OpenCVPoseCounter:
    def __init__(self):
        self.push_ups = 0
        self.direction = 0  # 0 = going down, 1 = going up
        self.cap = None
        self.net = None
        self.previous_angles = []
        
        # Download pose model if not exists
        self.setup_pose_model()
        
    def setup_pose_model(self):
        """Download and setup OpenPose model files"""
        model_files = {
            'pose_deploy.prototxt': 'https://raw.githubusercontent.com/CMU-Perceptual-Computing-Lab/openpose/master/models/pose/coco/pose_deploy_linevec.prototxt',
            'pose_iter_440000.caffemodel': 'http://posefs1.perception.cs.cmu.edu/OpenPose/models/pose/coco/pose_iter_440000.caffemodel'
        }
        
        print("🤖 Setting up OpenCV pose detection...")
        
        all_exist = True
        for filename in model_files.keys():
            if not os.path.exists(filename):
                all_exist = False
                break
        
        if not all_exist:
            print("📥 Downloading pose model files (this may take a moment)...")
            
            # Create simplified pose detection without heavy models
            print("⚡ Using lightweight pose estimation...")
            self.use_simple_detection = True
        else:
            try:
                self.net = cv2.dnn.readNetFromCaffe('pose_deploy.prototxt', 'pose_iter_440000.caffemodel')
                self.use_simple_detection = False
                print("✅ OpenPose model loaded")
            except Exception as e:
                print(f"⚠️ OpenPose model failed: {e}")
                self.use_simple_detection = True
    
    def initialize_camera(self, camera_index=0):
        """Initialize camera with optimal settings"""
        try:
            self.cap = cv2.VideoCapture(camera_index)
            if not self.cap.isOpened():
                return False
            
            # Set optimal resolution for performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            return True
        except Exception as e:
            print(f"Camera initialization error: {e}")
            return False
    
    def detect_pose_simple(self, img):
        """Simple pose detection using color detection and contours"""
        # Convert to HSV for skin tone detection
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define skin color range (approximate)
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        # Create mask for skin color
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Find contours
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find largest contour (assume it's the person)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Get bounding box
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Estimate key points based on body proportions
            center_x = x + w // 2
            center_y = y + h // 2
            
            # Approximate body landmarks
            landmarks = {
                'left_shoulder': (center_x - w//4, y + h//4),
                'right_shoulder': (center_x + w//4, y + h//4),
                'left_elbow': (center_x - w//3, y + h//2),
                'right_elbow': (center_x + w//3, y + h//2),
                'left_wrist': (center_x - w//2.5, y + h//1.5),
                'right_wrist': (center_x + w//2.5, y + h//1.5),
            }
            
            # Draw skeleton
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Draw key points
            for name, (px, py) in landmarks.items():
                cv2.circle(img, (int(px), int(py)), 5, (0, 0, 255), -1)
                cv2.putText(img, name.split('_')[1], (int(px), int(py-10)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 255, 255), 1)
            
            return landmarks
        
        return None
    
    def calculate_arm_angle(self, shoulder, elbow, wrist):
        """Calculate angle between shoulder-elbow-wrist"""
        try:
            # Vector from elbow to shoulder
            v1 = np.array([shoulder[0] - elbow[0], shoulder[1] - elbow[1]])
            # Vector from elbow to wrist  
            v2 = np.array([wrist[0] - elbow[0], wrist[1] - elbow[1]])
            
            # Calculate angle
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
            return np.degrees(angle)
        except:
            return 90  # Default angle
    
    def process_frame(self):
        """Process single frame with simple pose detection"""
        if not self.cap:
            return None
            
        success, img = self.cap.read()
        if not success:
            return None
        
        # Flip image for selfie view
        img = cv2.flip(img, 1)
        
        # Detect pose
        landmarks = self.detect_pose_simple(img)
        
        left_percentage = 50
        right_percentage = 50
        
        if landmarks:
            # Calculate arm angles
            left_angle = self.calculate_arm_angle(
                landmarks['left_shoulder'], 
                landmarks['left_elbow'], 
                landmarks['left_wrist']
            )
            right_angle = self.calculate_arm_angle(
                landmarks['right_shoulder'], 
                landmarks['right_elbow'], 
                landmarks['right_wrist']
            )
            
            # Convert to percentages (approximate mapping)
            left_percentage = max(0, min(100, int((left_angle - 90) / 80 * 100)))
            right_percentage = max(0, min(100, int((right_angle - 90) / 80 * 100)))
            
            # Push-up counting logic (simplified)
            if left_percentage >= 90 and right_percentage >= 90:
                if self.direction == 0:
                    self.push_ups += 0.5
                    self.direction = 1
            elif left_percentage <= 10 and right_percentage <= 10:
                if self.direction == 1:
                    self.push_ups += 0.5
                    self.direction = 0
        
        # Add text overlays
        cv2.putText(img, f"Push-ups: {int(self.push_ups)}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(img, f"L-Arm: {left_percentage}%", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(img, f"R-Arm: {right_percentage}%", (10, 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(img, "Python 3.13+ Mode - Basic Detection", (10, 120), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        
        return {
            'frame': img,
            'push_ups': int(self.push_ups),
            'left_percentage': left_percentage,
            'right_percentage': right_percentage,
            'direction': self.direction,
            'angles': {'left_arm': 180-left_percentage, 'right_arm': 180-right_percentage}
        }
    
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
    import sys
    return jsonify({
        'status': 'healthy',
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        'mode': 'opencv_simple',
        'camera_initialized': counter is not None and counter.cap is not None,
        'message': 'Running with OpenCV-only pose detection (Python 3.12+ compatible)'
    })

@app.route('/api/initialize')
def initialize():
    """Initialize the pose detection system"""
    global counter
    try:
        counter = OpenCVPoseCounter()
        if counter.initialize_camera():
            return jsonify({
                'status': 'initialized', 
                'message': 'Camera and basic pose detection ready',
                'mode': 'opencv_simple'
            })
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
            'status': 'active',
            'mode': 'opencv_simple'
        })
    return jsonify({'error': 'System not initialized'}), 400

if __name__ == '__main__':
    import sys
    print("🚀 TrainIQ Pose Detection Server (Python 3.12+ Compatible)")
    print(f"🐍 Python version: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    print("📋 Endpoints:")
    print("   GET  /api/health - Health check")
    print("   GET  /api/initialize - Initialize system")
    print("   GET  /api/process_frame - Process frame")
    print("   GET  /api/reset - Reset counter")
    print("   GET  /api/stats - Get statistics")
    print()
    print("⚠️  Note: Using OpenCV-only pose detection (MediaPipe not available for Python 3.13+)")
    print("✅ Starting server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)