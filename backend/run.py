#!/usr/bin/env python3
"""
CamSight Backend Runner
Menjalankan server FastAPI untuk sistem object tracking real-time
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Memulai CamSight Backend...")
    print("📍 Server akan berjalan di: http://localhost:8000")
    print("🔌 WebSocket endpoint: ws://localhost:8000/ws")
    print("📹 Video stream: http://localhost:8000/video_feed")
    print("\n⚡ Tekan Ctrl+C untuk menghentikan server\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload saat development
        log_level="info"
    ) 