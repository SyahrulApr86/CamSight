"use client";

import { useRef, useEffect, useState } from "react";

interface CameraCaptureProps {
  onFrame: (frameData: string) => void;
  isStreaming: boolean;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  isBackendOnline: boolean;
}

export default function CameraCapture({
  onFrame,
  isStreaming,
  onStartStreaming,
  onStopStreaming,
  isBackendOnline,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [frameCount, setFrameCount] = useState(0);

  // Get available camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getDevices();
  }, [selectedDevice]);

  // Start camera access
  const startCamera = async () => {
    setCameraStatus("requesting");

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice || undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStatus("granted");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraStatus("denied");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStatus("idle");
  };

  // Capture and send frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG
    const frameData = canvas.toDataURL("image/jpeg", 0.8);

    // Send frame to backend
    onFrame(frameData);
    setFrameCount((prev) => prev + 1);
  };

  // Start/stop frame capture interval
  useEffect(() => {
    if (isStreaming && cameraStatus === "granted") {
      intervalRef.current = setInterval(captureFrame, 100); // 10 FPS
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, cameraStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartStreaming = () => {
    if (cameraStatus === "granted") {
      onStartStreaming();
    } else {
      startCamera().then(() => {
        onStartStreaming();
      });
    }
  };

  const handleStopStreaming = () => {
    onStopStreaming();
    stopCamera();
    setFrameCount(0);
  };

  return (
    <div className="space-y-4">
      {/* Camera Device Selection */}
      {devices.length > 1 && cameraStatus === "idle" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Camera:
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
        {cameraStatus === "granted" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              {cameraStatus === "requesting" ? (
                <>
                  <div className="loading-dots mx-auto mb-4">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <p className="text-gray-600">Accessing camera...</p>
                </>
              ) : cameraStatus === "denied" ? (
                <>
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                    />
                  </svg>
                  <p className="text-red-600 font-medium mb-2">
                    Camera access denied
                  </p>
                  <p className="text-gray-600 text-sm">
                    Please grant camera permission to continue
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600">Click button to access camera</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && cameraStatus === "granted" && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        )}

        {/* Frame counter */}
        {isStreaming && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Frames: {frameCount}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isStreaming ? (
          <button
            onClick={handleStartStreaming}
            disabled={!isBackendOnline}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isBackendOnline
                ? "btn-primary hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {cameraStatus === "granted"
              ? "Start Streaming"
              : "Access Camera & Start"}
          </button>
        ) : (
          <button
            onClick={handleStopStreaming}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10h6v4H9z"
              />
            </svg>
            Stop Streaming
          </button>
        )}

        {cameraStatus === "granted" && !isStreaming && (
          <button onClick={stopCamera} className="btn-secondary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Status Messages */}
      {!isBackendOnline && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Backend is not online. Please ensure backend server is running first.
        </div>
      )}
    </div>
  );
}
