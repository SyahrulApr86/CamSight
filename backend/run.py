#!/usr/bin/env python3
"""
CamSight Backend Runner
Run FastAPI server for real-time object tracking system
"""
import uvicorn

if __name__ == "__main__":
    print("Starting CamSight Backend...")
    print("Server will run at: http://0.0.0.0:8000")
    print("WebSocket endpoint: ws://0.0.0.0:8000/ws")
    print("Video stream: http://0.0.0.0:8000/video_feed")
    print("\nPress Ctrl+C to stop server\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload during development
        log_level="info"
    ) 