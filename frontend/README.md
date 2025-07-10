# CamSight Frontend

Frontend Next.js untuk sistem object tracking real-time CamSight.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Components**: React 18
- **WebSocket**: Native WebSocket API
- **Camera**: MediaDevices API

## Features

### Real-time Camera Capture

- Akses kamera menggunakan `getUserMedia`
- Pilihan multiple kamera devices
- Preview real-time dengan kontrol start/stop
- Frame capture dengan interval configurable

### WebSocket Integration

- Koneksi real-time ke backend
- Auto-reconnect pada disconnect
- Status indicator untuk connection state
- Frame streaming dengan base64 encoding

### Object Detection Display

- MJPEG stream dari backend untuk hasil deteksi
- Auto-retry mechanism pada error
- Loading states dan error handling
- Real-time status indicators

### Modern UI/UX

- Glass morphism design
- Responsive layout (mobile & desktop)
- Tailwind CSS untuk styling
- Smooth animations dan transitions
- Status indicators dengan animasi

## API Integration

Frontend berkomunikasi dengan backend melalui:

1. **WebSocket** (`ws://localhost:8000/ws`)

   - Mengirim frame kamera ke backend
   - Real-time bidirectional communication

2. **HTTP** (`http://localhost:8000/video_feed`)

   - MJPEG stream untuk hasil deteksi objek
   - Auto-refresh untuk real-time display

3. **Health Check** (`http://localhost:8000/status`)
   - Monitoring status backend
   - Auto-polling setiap 5 detik

## Components

### `CameraCapture`

- Akses dan kontrol kamera
- Frame capture dan WebSocket transmission
- Device selection dan permission handling

### `ObjectTracker`

- Display hasil deteksi dari backend
- MJPEG stream handling dengan error recovery
- Status dan info display

### `StatusIndicator`

- Monitoring koneksi backend, WebSocket, dan streaming
- Visual indicators dengan animasi
- Warning dan tips untuk user

## Styling

Menggunakan Tailwind CSS dengan:

- Custom color palette (primary, dark themes)
- Glass morphism effects
- Custom animations (pulse, float, glow)
- Responsive design utilities
- Component classes untuk reusability

## State Management

Menggunakan React hooks untuk:

- Camera access dan control
- WebSocket connection state
- Streaming status
- Backend health monitoring
- UI states (loading, error, success)

## Browser Compatibility

Minimum requirements:

- Modern browsers dengan WebRTC support
- Camera/microphone permissions
- WebSocket support
- Canvas API support
