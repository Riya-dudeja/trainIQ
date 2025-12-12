#!/usr/bin/env python3
"""
TrainIQ Pose Detection Backend
Using the libraries for maximum reliability
"""

import cv2
import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
import base64
from cvzone.PoseModule import PoseDetector

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
        self.detector = PoseDetector(staticMode=False,
                                    modelComplexity=1,
                                    smoothLandmarks=True,
                                    enableSegmentation=False,
                                    smoothSegmentation=True,
                                    detectionCon=0.5,
                                    trackCon=0.5)
        self.direction = 0  # 0 = going down, 1 = going up
        self.push_ups = 0
        self.cap = None
        self.blue_color = (190, 150, 37)  # BGR format
        
    def initialize_camera(self, camera_index=0):
        """Initialize camera with optimal settings"""
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
        self.push_ups = 0
        if not all([width_success, height_success, fps_success]):
            print("⚠️ Some camera settings could not be applied")
        return True
    
    def process_frame(self):
        """Process single frame for push-up detection only"""
        if not self.cap:
            print("❌ Camera not initialized")
            return None
        success, img = self.cap.read()
        if not success or img is None or img.size == 0:
            print("❌ Failed to read frame from camera")
            return None
        try:
            print(f"[DEBUG] Frame shape: {img.shape}, dtype: {img.dtype}, min: {img.min()}, max: {img.max()}")
            cv2.imwrite("test_frame.jpg", img)
        except Exception as e:
            print(f"[DEBUG] Error inspecting/saving frame: {e}")
        img = cv2.flip(img, 1)
        img = self.detector.findPose(img, draw=True)
        lmlist, bbox = self.detector.findPosition(img, draw=False)
        if lmlist:
            a1 = self.detector.findAngle(img, 12, 14, 16, draw=True)
            a2 = self.detector.findAngle(img, 15, 13, 11, draw=True)
            per_val1 = int(np.interp(a1, (90, 170), (100, 0)))
            per_val2 = int(np.interp(a2, (90, 170), (100, 0)))
            per_val1 = max(0, min(100, per_val1))
            per_val2 = max(0, min(100, per_val2))
            self.draw_progress_bars(img, per_val1, per_val2)
            color = (0, 0, 255)
            # Down position (arms bent)
            if per_val1 == 100 and per_val2 == 100:
                if self.direction == 0:
                    self.push_ups += 0.5
                    self.direction = 1
                    color = (0, 255, 0)
            # Up position (arms straight)
            elif per_val1 <= 10 and per_val2 <= 10:
                if self.direction == 1:
                    self.push_ups += 0.5
                    self.direction = 0
                    color = (0, 255, 0)
            self.add_text_overlays(img, per_val1, per_val2, color)
            angles_data = {
                'right_arm': a1,
                'left_arm': a2
            }
            return {
                'frame': img,
                'push_ups': int(self.push_ups),
                'left_percentage': per_val2,
                'right_percentage': per_val1,
                'direction': self.direction,
                'angles': angles_data
            }
        return {'frame': img, 'push_ups': int(self.push_ups)}
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