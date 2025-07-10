# CamSight Frontend

Next.js frontend for CamSight real-time object tracking system.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Application will run at: http://localhost:3000

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Components**: React 18
- **WebSocket**: Native WebSocket API
- **Camera**: MediaDevices API

## Features

### Real-time Camera Capture

- Camera access using `getUserMedia`
- Multiple camera device selection
- Real-time preview with start/stop controls
- Frame capture with configurable interval

### WebSocket Integration

- Real-time connection to backend
- Auto-reconnect on disconnect
- Status indicator for connection state
- Frame streaming with base64 encoding

### Object Detection Display

- MJPEG stream from backend for detection results
- Auto-retry mechanism on error
- Loading states and error handling
- Real-time status indicators

### Modern UI/UX

- Glass morphism design
- Responsive layout (mobile & desktop)
- Tailwind CSS for styling
- Smooth animations and transitions
- Status indicators with animations

## API Integration

Frontend communicates with backend through:

1. **WebSocket** (`ws://localhost:8000/ws`)

   - Send camera frames to backend
   - Real-time bidirectional communication

2. **HTTP** (`http://localhost:8000/video_feed`)

   - MJPEG stream for object detection results
   - Auto-refresh for real-time display

3. **Health Check** (`http://localhost:8000/status`)
   - Monitor backend status
   - Auto-polling every 5 seconds

## Components

### `CameraCapture`

- Camera access and control
- Frame capture and WebSocket transmission
- Device selection and permission handling

### `ObjectTracker`

- Display detection results from backend
- MJPEG stream handling with error recovery
- Status and info display

### `StatusIndicator`

- Monitor backend, WebSocket, and streaming connections
- Visual indicators with animations
- Warnings and tips for users

## Styling

Uses Tailwind CSS with:

- Custom color palette (primary, dark themes)
- Glass morphism effects
- Custom animations (pulse, float, glow)
- Responsive design utilities
- Component classes for reusability

## State Management

Uses React hooks for:

- Camera access and control
- WebSocket connection state
- Streaming status
- Backend health monitoring
- UI states (loading, error, success)

## Browser Compatibility

Minimum requirements:

- Modern browsers with WebRTC support
- Camera/microphone permissions
- WebSocket support
- Canvas API support
