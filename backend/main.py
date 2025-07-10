import cv2
import numpy as np
import base64
import asyncio
import io
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import threading
import time

app = FastAPI(title="CamSight Backend", version="1.0.0")

# CORS middleware untuk mengizinkan frontend mengakses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
latest_frame = None
frame_lock = threading.Lock()
model = None

# Load YOLO model saat startup
@app.on_event("startup")
async def startup_event():
    global model
    try:
        # Download dan load model YOLO 12 nano
        model = YOLO("yolo12n.pt")
        print("Model YOLO 12 nano berhasil dimuat")
    except Exception as e:
        print(f"Error loading YOLO model: {e}")
        # Fallback ke YOLOv8n jika YOLO12n tidak tersedia
        try:
            model = YOLO("yolov8n.pt")
            print("Fallback: Model YOLOv8n berhasil dimuat")
        except Exception as e2:
            print(f"Error loading fallback model: {e2}")

def process_frame(frame_data):
    """Proses frame dengan YOLO dan return annotated frame"""
    global model, latest_frame
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(frame_data.split(',')[1])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return
        
        # Jalankan deteksi YOLO
        if model is not None:
            results = model(frame, verbose=False)
            
            # Annotate frame dengan bounding boxes
            annotated_frame = results[0].plot()
        else:
            annotated_frame = frame
            # Jika model tidak tersedia, tampilkan pesan
            cv2.putText(annotated_frame, "Model tidak tersedia", (50, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        # Simpan frame terbaru
        with frame_lock:
            latest_frame = annotated_frame.copy()
            
    except Exception as e:
        print(f"Error processing frame: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint untuk menerima frame dari frontend"""
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        while True:
            # Terima frame dari frontend
            data = await websocket.receive_text()
            
            # Process frame di background thread
            thread = threading.Thread(target=process_frame, args=(data,))
            thread.daemon = True
            thread.start()
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")

def generate_frames():
    """Generator untuk MJPEG stream"""
    global latest_frame
    
    while True:
        with frame_lock:
            if latest_frame is not None:
                # Encode frame ke JPEG
                ret, buffer = cv2.imencode('.jpg', latest_frame, 
                                         [cv2.IMWRITE_JPEG_QUALITY, 80])
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS

@app.get("/video_feed")
async def video_feed():
    """Endpoint untuk MJPEG stream hasil deteksi objek"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "CamSight Backend is running!",
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.get("/status")
async def get_status():
    """Get system status"""
    return {
        "model_loaded": model is not None,
        "has_latest_frame": latest_frame is not None,
        "model_type": type(model).__name__ if model else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 