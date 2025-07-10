"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface CameraCaptureProps {
  onFrame: (imageData: string) => void;
  isStreaming: boolean;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  isBackendOnline: boolean;
}

type CameraStatus = "idle" | "requesting" | "granted" | "denied" | "timeout";

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onFrame,
  isStreaming,
  onStartStreaming,
  onStopStreaming,
  isBackendOnline,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Get available camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getDevices();
  }, [selectedDeviceId]);

  // Start camera access
  const startCamera = async () => {
    setCameraStatus("requesting");
    setError("");

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId || undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      };

      console.log("Requesting camera access with constraints:", constraints);

      // Set a timeout for the entire operation
      timeoutId = setTimeout(() => {
        console.error("Camera access operation timed out");
        setCameraStatus("timeout");
        setError("Camera access timed out. Please try again.");
      }, 15000); // 15 second timeout

      console.log("Calling getUserMedia...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log("Camera stream received:", stream);
      console.log("Stream active:", stream.active);
      console.log("Stream tracks:", stream.getTracks());

      if (!stream || !stream.active || stream.getTracks().length === 0) {
        throw new Error("Invalid or inactive camera stream received");
      }

      setStream(stream);

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
    } catch (err: any) {
      console.error("Error accessing camera:", err);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setCameraStatus("denied");

      // Set specific error messages
      if (err.name === "NotAllowedError") {
        setError(
          "Camera permission denied. Please allow camera access and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please connect a camera and try again.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else if (err.message === "Camera access timeout") {
        setError("Camera access timed out. Please try again.");
      } else {
        setError(`Camera error: ${err.message || "Unknown error occurred"}`);
      }

      throw err;
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStatus("idle");
  };

  // Capture frame from video
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const frameData = canvas.toDataURL("image/jpeg", 0.8);

    // Send frame to backend
    onFrame(frameData);
  };

  // Start frame capture
  useEffect(() => {
    if (isStreaming && cameraStatus === "granted") {
      intervalRef.current = setInterval(captureFrame, 100); // 10 FPS
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming, cameraStatus, onFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle start streaming
  const handleStartStreaming = async () => {
    try {
      if (cameraStatus !== "granted") {
        await startCamera();
      }
      onStartStreaming();
    } catch (error) {
      console.error("Failed to start streaming:", error);
    }
  };

  // Handle stop streaming
  const handleStopStreaming = () => {
    onStopStreaming();
    stopCamera();
  };

  const StatusIndicator = () => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            cameraStatus === "granted"
              ? "bg-green-500 animate-pulse"
              : cameraStatus === "denied" || cameraStatus === "timeout"
              ? "bg-red-500"
              : cameraStatus === "requesting"
              ? "bg-yellow-500 animate-pulse"
              : "bg-gray-400"
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          Camera:{" "}
          {cameraStatus === "granted"
            ? "Active"
            : cameraStatus === "denied"
            ? "Access denied"
            : cameraStatus === "timeout"
            ? "Access timeout"
            : cameraStatus === "requesting"
            ? "Requesting access..."
            : "Not active"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isBackendOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          Backend: {isBackendOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <StatusIndicator />

      {/* Device Selection */}
      {devices.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Select Camera Device:
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-lg"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Container */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 md:h-80 object-cover"
        />

        {/* Status Overlays */}
        {cameraStatus !== "granted" && (
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white p-6">
              {cameraStatus === "requesting" ? (
                <LoadingSpinner />
              ) : cameraStatus === "denied" ? (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Camera Access Denied
                  </p>
                  <p className="text-sm text-gray-300">
                    Please allow camera access and try again
                  </p>
                </>
              ) : cameraStatus === "timeout" ? (
                <>
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">Request Timeout</p>
                  <p className="text-sm text-gray-300">
                    Camera access request timed out
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">Camera Ready</p>
                  <p className="text-sm text-gray-300">
                    Click "Access Camera & Start" to begin
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isStreaming ? (
          <button
            onClick={
              cameraStatus === "granted" ? onStartStreaming : startCamera
            }
            disabled={
              cameraStatus === "requesting" ||
              (cameraStatus === "idle" && !isBackendOnline)
            }
            className="btn-primary-enhanced disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            <div className="flex items-center justify-center gap-3">
              {cameraStatus === "requesting" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              <span className="font-semibold">
                {cameraStatus === "granted"
                  ? "Start Streaming"
                  : "Access Camera & Start"}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onStopStreaming}
            className="btn-secondary-enhanced flex-1"
          >
            <div className="flex items-center justify-center gap-3">
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
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              <span className="font-semibold">Stop Streaming</span>
            </div>
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
