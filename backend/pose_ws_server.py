
import asyncio
import base64
import cv2
import numpy as np
import websockets
import json
from cvzone.PoseModule import PoseDetector

# Camera and pose detector setup
cap = cv2.VideoCapture(0)
detector = PoseDetector()

# Push-up logic state
push_ups = 0
direction = 0  # 0 = down, 1 = up

async def process_and_send(websocket):
    global push_ups, direction
    print("WebSocket client connected!")
    try:
        while True:
            success, img = cap.read()
            if not success or img is None or img.size == 0:
                await websocket.send(json.dumps({"frame_base64": ""}))
                await asyncio.sleep(0.05)
                continue
            img = cv2.flip(img, 1)
            img = detector.findPose(img, draw=True)
            lmlist, bbox = detector.findPosition(img, draw=False)
            a1 = a2 = per_val1 = per_val2 = 0
            if lmlist:
                a1 = detector.findAngle(img, 12, 14, 16, draw=True)
                a2 = detector.findAngle(img, 15, 13, 11, draw=True)
                per_val1 = int(np.interp(a1, (90, 170), (100, 0)))
                per_val2 = int(np.interp(a2, (90, 170), (100, 0)))
                per_val1 = max(0, min(100, per_val1))
                per_val2 = max(0, min(100, per_val2))
                # Push-up logic
                if per_val1 == 100 and per_val2 == 100:
                    if direction == 0:
                        push_ups += 0.5
                        direction = 1
                elif per_val1 <= 10 and per_val2 <= 10:
                    if direction == 1:
                        push_ups += 0.5
                        direction = 0
            # Encode frame as JPEG
            _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 80])
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            # Send all data as JSON
            data = {
                "frame_base64": img_base64,
                "push_ups": int(push_ups),
                "left_percentage": per_val2,
                "right_percentage": per_val1,
                "direction": direction,
                "angles": {"right_arm": a1, "left_arm": a2}
            }
            await websocket.send(json.dumps(data))
            await asyncio.sleep(0.03)  # ~30 FPS
    except websockets.ConnectionClosed:
        print("WebSocket client disconnected!")

async def main():
    async with websockets.serve(process_and_send, "0.0.0.0", 8765):
        print("WebSocket server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
