"use client";

import { useRef, useEffect, useState, useCallback } from "react";

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
  const [fps, setFps] = useState(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    setErrorMessage("");

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice || undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      };

      console.log("Requesting camera access with constraints:", constraints);

      // Set a timeout for the entire operation
      timeoutId = setTimeout(() => {
        console.error("Camera access operation timed out");
        setCameraStatus("denied");
        setErrorMessage("Camera access timed out. Please try again.");
      }, 15000); // 15 second timeout

      console.log("Calling getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log("Camera stream received:", stream);
      console.log("Stream active:", stream.active);
      console.log("Stream tracks:", stream.getTracks());

      if (!stream || !stream.active || stream.getTracks().length === 0) {
        throw new Error("Invalid or inactive camera stream received");
      }

      streamRef.current = stream;

      if (!videoRef.current) {
        console.error("Video reference is null");
        console.log("Attempting to wait for video element...");

        // Wait a bit for the video element to be available
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!videoRef.current) {
          console.error("Video element still not available after waiting");
          throw new Error("Video element not found");
        }
      }

      console.log("Video element found:", videoRef.current);

      console.log("Setting video source...");
      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      console.log("Waiting for video to load...");
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!;

        const onLoadedMetadata = () => {
          console.log("Video metadata loaded");
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          resolve();
        };

        const onError = (error: Event) => {
          console.error("Video error:", error);
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          reject(new Error("Video failed to load"));
        };

        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("error", onError);

        // If metadata is already loaded
        if (video.readyState >= 1) {
          onLoadedMetadata();
        }
      });

      console.log("Playing video...");
      try {
        await videoRef.current.play();
      } catch (playError) {
        console.warn("Video play failed, trying without await:", playError);
        videoRef.current.play(); // Try without await
      }

      console.log("Video is playing, setting status to granted");
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      setCameraStatus("granted");
      console.log("Camera access granted successfully");
      return true;
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setCameraStatus("denied");

      // Set specific error messages
      const err = error as Error;
      if (err.name === "NotAllowedError") {
        setErrorMessage(
          "Camera permission denied. Please allow camera access and try again."
        );
      } else if (err.name === "NotFoundError") {
        setErrorMessage(
          "No camera found. Please connect a camera and try again."
        );
      } else if (err.name === "NotReadableError") {
        setErrorMessage("Camera is already in use by another application.");
      } else if (err.message === "Camera access timeout") {
        setErrorMessage("Camera access timed out. Please try again.");
      } else {
        setErrorMessage(
          `Camera error: ${err.message || "Unknown error occurred"}`
        );
      }

      throw error;
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
  const captureFrame = useCallback(() => {
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

    // Calculate FPS
    const currentTime = performance.now();
    if (lastFrameTimeRef.current > 0) {
      const interval = currentTime - lastFrameTimeRef.current;
      const currentFps = 1000 / interval; // Convert ms to FPS

      // Add to history for smoothing (keep last 10 values)
      fpsHistoryRef.current.push(currentFps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift();
      }

      // Calculate average FPS for smoother display
      const avgFps =
        fpsHistoryRef.current.reduce((sum, fps) => sum + fps, 0) /
        fpsHistoryRef.current.length;
      setFps(Math.round(avgFps * 10) / 10); // Round to 1 decimal place
    }
    lastFrameTimeRef.current = currentTime;

    // Send frame to backend
    onFrame(frameData);
  }, [isStreaming, onFrame]);

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
  }, [isStreaming, cameraStatus, captureFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartStreaming = async () => {
    // Reset FPS tracking when starting
    setFps(0);
    lastFrameTimeRef.current = 0;
    fpsHistoryRef.current = [];

    if (cameraStatus === "granted") {
      onStartStreaming();
    } else {
      try {
        const success = await startCamera();
        if (success) {
          onStartStreaming();
        }
      } catch (error) {
        console.error("Failed to start camera:", error);
        // Status sudah di-set ke "denied" di startCamera()
      }
    }
  };

  const handleStopStreaming = () => {
    onStopStreaming();
    stopCamera();
    // Reset FPS tracking
    setFps(0);
    lastFrameTimeRef.current = 0;
    fpsHistoryRef.current = [];
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
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        {/* Video element - always rendered but hidden when not granted */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            cameraStatus === "granted" ? "block" : "hidden"
          }`}
        />

        {/* Overlay for non-granted states */}
        {cameraStatus !== "granted" && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
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

        {/* FPS counter */}
        {isStreaming && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono">
            FPS: {fps}
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

      {/* Error message */}
      {errorMessage && cameraStatus === "denied" && (
        <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="font-medium">Camera Error</span>
          </div>
          <p>{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage("");
              setCameraStatus("idle");
            }}
            className="mt-2 text-xs text-red-700 underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Backend offline message */}
      {!isBackendOnline && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Backend is not online. Please ensure backend server is running first.
        </div>
      )}
    </div>
  );
}
