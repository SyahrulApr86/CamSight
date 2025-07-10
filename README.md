# CamSight - Real-time Object Tracking System

**CamSight** adalah sistem web real-time object tracking yang menggunakan YOLO 12 nano untuk mendeteksi objek secara langsung dari kamera user. Sistem ini terdiri dari backend FastAPI dan frontend Next.js dengan UI modern.

## Fitur Utama

- **Real-time Object Detection**: Deteksi objek secara langsung menggunakan YOLO 12 nano
- **WebSocket Communication**: Komunikasi real-time dengan latency rendah
- **Modern UI**: Interface responsif dengan glass morphism design
- **Multi-camera Support**: Dukungan multiple kamera devices
- **Auto-retry Mechanism**: Handling error dengan auto-recovery
- **Status Monitoring**: Real-time monitoring koneksi dan status sistem

## Struktur Proyek

```
CamSight/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Server utama dengan WebSocket & MJPEG
│   ├── run.py                 # Script untuk menjalankan server
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Dokumentasi backend
│
├── frontend/                   # Next.js Frontend
│   ├── app/                   # Next.js App Router
│   │   ├── components/        # React Components
│   │   │   ├── CameraCapture.tsx    # Komponen kamera
│   │   │   ├── ObjectTracker.tsx    # Komponen hasil deteksi
│   │   │   └── StatusIndicator.tsx  # Komponen status
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Home page
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── README.md            # Dokumentasi frontend
│
└── README.md                 # Dokumentasi utama (file ini)
```

## Tech Stack

### Backend

- **FastAPI**: Web framework untuk Python
- **Ultralytics**: YOLO 12 nano model
- **OpenCV**: Image processing dan annotating
- **WebSocket**: Real-time communication
- **Uvicorn**: ASGI server

### Frontend

- **Next.js 14**: React framework dengan App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **WebSocket API**: Browser native WebSocket
- **MediaDevices API**: Camera access

## Quick Start

### 1. Setup Backend

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python run.py
```

Server akan berjalan di: `http://localhost:8000`

### 2. Setup Frontend

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

### 3. Akses Aplikasi

1. Buka browser dan kunjungi `http://localhost:3000`
2. Pastikan backend berjalan (status indicator hijau)
3. Klik "Akses Kamera & Mulai" untuk memulai streaming
4. Berikan izin akses kamera
5. Hasil deteksi objek akan muncul di panel kanan

## Konfigurasi

### Backend Configuration

Model YOLO akan didownload otomatis saat pertama kali dijalankan:

- **Primary**: YOLO 12 nano (`yolo12n.pt`)
- **Fallback**: YOLOv8 nano (`yolov8n.pt`)

### Frontend Configuration

Pengaturan default:

- Frame rate: 10 FPS
- Image quality: 80% JPEG
- Video resolution: 640x480 (ideal)
- Auto-retry: 3 attempts dengan exponential backoff

## API Endpoints

### Backend Endpoints

| Method    | Endpoint      | Description                  |
| --------- | ------------- | ---------------------------- |
| WebSocket | `/ws`         | Menerima frame dari frontend |
| GET       | `/video_feed` | MJPEG stream hasil deteksi   |
| GET       | `/`           | Health check                 |
| GET       | `/status`     | Status sistem dan model      |

### Frontend Integration

Frontend berkomunikasi dengan backend melalui:

1. **WebSocket**: Mengirim frame kamera (base64 JPEG)
2. **MJPEG Stream**: Menerima hasil deteksi teranotasi
3. **HTTP Polling**: Monitoring status backend

## UI Components

### CameraCapture

- Akses kamera dengan permission handling
- Multi-device selection
- Real-time preview dengan kontrol
- Frame capture dan transmission

### ObjectTracker

- MJPEG stream display
- Error handling dengan auto-retry
- Loading states dan indicators
- Real-time status info

### StatusIndicator

- Backend connection monitoring
- WebSocket status
- Streaming status
- Visual indicators dengan animasi

## Alur Sistem

```
1. Frontend → getUserMedia() → Akses Kamera
2. Frontend → Canvas → Capture Frame → Base64 JPEG
3. Frontend → WebSocket → Kirim Frame ke Backend
4. Backend → YOLO Model → Object Detection
5. Backend → OpenCV → Annotate dengan Bounding Box
6. Backend → MJPEG Stream → Kirim Hasil ke Frontend
7. Frontend → Display → Tampilkan Hasil Real-time
```

## Troubleshooting

### Backend Issues

- **Port 8000 sudah digunakan**: Ubah port di `main.py` dan `next.config.js`
- **Model download gagal**: Periksa koneksi internet
- **CUDA tidak tersedia**: Model akan berjalan di CPU (normal)

### Frontend Issues

- **Kamera tidak terdeteksi**: Periksa permission browser
- **WebSocket gagal connect**: Pastikan backend berjalan
- **Stream tidak muncul**: Refresh halaman atau restart backend

### Common Issues

- **CORS Error**: Pastikan CORS middleware aktif di backend
- **Performance issues**: Kurangi frame rate atau resolusi

## Security Notes

**Development Only**: Konfigurasi saat ini untuk development. Untuk production:

- Ubah CORS settings untuk domain spesifik
- Gunakan HTTPS/WSS untuk production
- Implement authentication jika diperlukan
- Review security headers

## Performance Tips

- **Optimal Frame Rate**: 10-15 FPS untuk balance antara real-time dan performance
- **Resolution**: 640x480 optimal untuk YOLO nano
- **Browser**: Chrome/Edge recommended untuk WebRTC performance
- **Hardware**: GPU akan meningkatkan performa detection

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail.

## Links

- [YOLO Documentation](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
