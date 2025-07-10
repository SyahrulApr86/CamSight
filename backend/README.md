# CamSight Backend

FastAPI backend for real-time object tracking system using YOLO 12 nano.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Server

```bash
python run.py
```

Or:

```bash
python main.py
```

## Endpoints

### WebSocket

- **`/ws`** - WebSocket endpoint to receive frames from frontend

### HTTP

- **`/`** - Health check
- **`/status`** - System and model status
- **`/video_feed`** - MJPEG stream of object detection results

## Model

Backend uses YOLO 12 nano model (`yolo12n.pt`) for object detection. The model will be downloaded automatically on first run.

If YOLO 12 nano is not available, it will use YOLOv8n as fallback.

## Technical Details

- **Framework**: FastAPI
- **WebSocket**: For real-time communication
- **Object Detection**: Ultralytics YOLO
- **Image Processing**: OpenCV
- **MJPEG Streaming**: To send results to frontend

## CORS

Backend is configured to accept requests from all origins for development purposes.
