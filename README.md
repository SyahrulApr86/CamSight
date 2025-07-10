# CamSight - Real-time Object Tracking System

**CamSight** is a web-based real-time object tracking system that uses YOLO 12 nano to detect objects directly from user's camera. The system consists of a FastAPI backend and Next.js frontend with modern UI.

## Key Features

- **Real-time Object Detection**: Live object detection using YOLO 12 nano
- **WebSocket Communication**: Real-time communication with low latency
- **Modern UI**: Responsive interface with glass morphism design
- **Multi-camera Support**: Support for multiple camera devices
- **Auto-retry Mechanism**: Error handling with auto-recovery
- **Status Monitoring**: Real-time monitoring of connection and system status

## Project Structure

```
CamSight/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main server with WebSocket & MJPEG
│   ├── run.py                 # Server runner script
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Backend documentation
│
├── frontend/                   # Next.js Frontend
│   ├── app/                   # Next.js App Router
│   │   ├── components/        # React Components
│   │   │   ├── CameraCapture.tsx    # Camera component
│   │   │   ├── ObjectTracker.tsx    # Detection results component
│   │   │   └── StatusIndicator.tsx  # Status component
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Home page
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── README.md            # Frontend documentation
│
└── README.md                 # Main documentation (this file)
```

## Tech Stack

### Backend

- **FastAPI**: Python web framework
- **Ultralytics**: YOLO 12 nano model
- **OpenCV**: Image processing and annotation
- **WebSocket**: Real-time communication
- **Uvicorn**: ASGI server

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **WebSocket API**: Browser native WebSocket
- **MediaDevices API**: Camera access

## Quick Start

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```

Server will run at: `http://localhost:8000`

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Application will run at: `http://localhost:3000`

### 3. Access Application

1. Open browser and visit `http://localhost:3000`
2. Ensure backend is running (green status indicator)
3. Click "Start Camera & Begin" to start streaming
4. Grant camera permission
5. Object detection results will appear in the right panel

## Configuration

### Backend Configuration

YOLO model will be downloaded automatically on first run:

- **Primary**: YOLO 12 nano (`yolo12n.pt`)
- **Fallback**: YOLOv8 nano (`yolov8n.pt`)

### Frontend Configuration

Default settings:

- Frame rate: 10 FPS
- Image quality: 80% JPEG
- Video resolution: 640x480 (ideal)
- Auto-retry: 3 attempts with exponential backoff

## API Endpoints

### Backend Endpoints

| Method    | Endpoint      | Description                       |
| --------- | ------------- | --------------------------------- |
| WebSocket | `/ws`         | Receive frames from frontend      |
| GET       | `/video_feed` | MJPEG stream of detection results |
| GET       | `/`           | Health check                      |
| GET       | `/status`     | System and model status           |

### Frontend Integration

Frontend communicates with backend through:

1. **WebSocket**: Send camera frames (base64 JPEG)
2. **MJPEG Stream**: Receive annotated detection results
3. **HTTP Polling**: Monitor backend status

## UI Components

### CameraCapture

- Camera access with permission handling
- Multi-device selection
- Real-time preview with controls
- Frame capture and transmission

### ObjectTracker

- MJPEG stream display
- Error handling with auto-retry
- Loading states and indicators
- Real-time status info

### StatusIndicator

- Backend connection monitoring
- WebSocket status
- Streaming status
- Visual indicators with animations

## System Flow

```
1. Frontend → getUserMedia() → Access Camera
2. Frontend → Canvas → Capture Frame → Base64 JPEG
3. Frontend → WebSocket → Send Frame to Backend
4. Backend → YOLO Model → Object Detection
5. Backend → OpenCV → Annotate with Bounding Box
6. Backend → MJPEG Stream → Send Results to Frontend
7. Frontend → Display → Show Real-time Results
```

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change port in `main.py` and `next.config.js`
- **Model download failed**: Check internet connection
- **CUDA not available**: Model will run on CPU (normal)

### Frontend Issues

- **Camera not detected**: Check browser permissions
- **WebSocket connection failed**: Ensure backend is running
- **Stream not showing**: Refresh page or restart backend

### Common Issues

- **CORS Error**: Ensure CORS middleware is active in backend
- **Performance issues**: Reduce frame rate or resolution

## Security Notes

**Development Only**: Current configuration is for development. For production:

- Change CORS settings for specific domains
- Use HTTPS/WSS for production
- Implement authentication if required
- Review security headers

## Performance Tips

- **Optimal Frame Rate**: 10-15 FPS for balance between real-time and performance
- **Resolution**: 640x480 optimal for YOLO nano
- **Browser**: Chrome/Edge recommended for WebRTC performance
- **Hardware**: GPU will improve detection performance

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project uses MIT License. See `LICENSE` file for details.

## Links

- [YOLO Documentation](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
