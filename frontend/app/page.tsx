"use client";

import { useState, useEffect, useRef } from "react";
import CameraCapture from "./components/CameraCapture";
import ObjectTracker from "./components/ObjectTracker";
import StatusIndicator from "./components/StatusIndicator";
import DetectedObjectsInfo from "./components/DetectedObjectsInfo";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const wsRef = useRef<WebSocket | null>(null);

  // Get backend URL from environment variable
  const getBackendUrl = () => {
    // In production with nginx reverse proxy, use relative paths
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_BACKEND_URL || "";
    }
    return "";
  };

  // Check backend status
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const backendUrl = getBackendUrl();
        const url = backendUrl ? `${backendUrl}/status` : "/api/status";
        const response = await fetch(url);
        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize WebSocket connection
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const backendUrl = getBackendUrl();
    let wsUrl: string;

    if (backendUrl) {
      // Development mode with full URL
      wsUrl = backendUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://");
      wsUrl = `${wsUrl}/ws`;
    } else {
      // Production mode with nginx reverse proxy
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsStreaming(false);
        console.log("WebSocket disconnected");
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setIsStreaming(false);
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
    }
  };

  // Send frame to backend
  const sendFrame = (frameData: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(frameData);
    }
  };

  const handleStartStreaming = () => {
    if (backendStatus === "online") {
      connectWebSocket();
      setIsStreaming(true);
    }
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            CamSight
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-2xl mx-auto border border-white/30 shadow-lg">
          <p className="text-lg md:text-xl text-gray-900 font-medium leading-relaxed">
            Real-time object tracking system using YOLO 12 nano for live object
            detection from your camera.
          </p>
        </div>
      </header>

      {/* Status Indicators */}
      <StatusIndicator
        backendStatus={backendStatus}
        isConnected={isConnected}
        isStreaming={isStreaming}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Input */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Camera Input
                </h2>
              </div>

              <CameraCapture
                onFrame={sendFrame}
                isStreaming={isStreaming}
                onStartStreaming={handleStartStreaming}
                onStopStreaming={handleStopStreaming}
                isBackendOnline={backendStatus === "online"}
              />
            </div>
          </div>

          {/* Object Detection Results */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Detection Results
                </h2>
              </div>

              <ObjectTracker isStreaming={isStreaming} />
            </div>
          </div>
        </div>

        {/* Detected Objects Information */}
        <div className="mt-8">
          <DetectedObjectsInfo isStreaming={isStreaming} />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Real-time</h3>
            </div>
            <p className="text-gray-700">
              Live object detection with low latency using WebSocket
              communication.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                YOLO 12 Nano
              </h3>
            </div>
            <p className="text-gray-700">
              Using the latest YOLO model for high accuracy object detection.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                User-Friendly
              </h3>
            </div>
            <p className="text-gray-700">
              Easy-to-use interface with modern and responsive design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
