# CamSight Backend

Backend FastAPI untuk sistem object tracking real-time menggunakan YOLO 12 nano.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run Server

```bash
python run.py
```

Atau:

```bash
python main.py
```

## 📋 Endpoints

### WebSocket

- **`/ws`** - WebSocket endpoint untuk menerima frame dari frontend

### HTTP

- **`/`** - Health check
- **`/status`** - Status sistem dan model
- **`/video_feed`** - MJPEG stream hasil deteksi objek

## 🧠 Model

Backend menggunakan model YOLO 12 nano (`yolo12n.pt`) untuk object detection. Model akan didownload otomatis saat pertama kali dijalankan.

Jika YOLO 12 nano tidak tersedia, akan menggunakan YOLOv8n sebagai fallback.

## 🔧 Technical Details

- **Framework**: FastAPI
- **WebSocket**: Untuk real-time communication
- **Object Detection**: Ultralytics YOLO
- **Image Processing**: OpenCV
- **MJPEG Streaming**: Untuk mengirim hasil ke frontend

## 🌐 CORS

Backend dikonfigurasi untuk menerima request dari semua origin untuk keperluan development.
