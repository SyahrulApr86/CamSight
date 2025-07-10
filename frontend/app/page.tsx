"use client";

import { useState, useRef, useEffect } from "react";
import CameraCapture from "./components/CameraCapture";
import ObjectTracker from "./components/ObjectTracker";
import StatusIndicator from "./components/StatusIndicator";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<
    "online" | "offline" | "connecting"
  >("connecting");
  const [isStreaming, setIsStreaming] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  // Check backend status with optimized interval
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/status", {
          method: "GET",
          cache: "no-cache",
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        setBackendStatus("offline");
      }
    };

    checkBackendStatus();
    // Reduced check interval for better responsiveness
    const interval = setInterval(checkBackendStatus, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Pre-initialize WebSocket connection when backend is online
  useEffect(() => {
    if (backendStatus === "online" && !wsConnection) {
      connectWebSocket();
    } else if (backendStatus === "offline" && wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
  }, [backendStatus, wsConnection]);

  // Initialize WebSocket connection with retry logic
  const connectWebSocket = () => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus("Connecting");
      const ws = new WebSocket("ws://localhost:8000/ws");
      setWsConnection(ws);

      ws.onopen = () => {
        setConnectionStatus("Connected");
        console.log("WebSocket connected successfully");
      };

      ws.onclose = (event) => {
        setConnectionStatus("Disconnected");
        setIsStreaming(false);
        console.log("WebSocket disconnected", event.code, event.reason);

        // Auto-reconnect if backend is still online
        if (backendStatus === "online" && !event.wasClean) {
          setTimeout(() => {
            console.log("Attempting WebSocket reconnection...");
            connectWebSocket();
          }, 2000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Disconnected");
        setIsStreaming(false);
      };

      // Set connection timeout
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setConnectionStatus("Disconnected");
          console.error("WebSocket connection timeout");
        }
      }, 5000);
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      setConnectionStatus("Disconnected");
    }
  };

  // Optimized frame sending with error handling
  const sendFrame = (frameData: string) => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      try {
        wsConnection.send(frameData);
      } catch (error) {
        console.error("Failed to send frame:", error);
        setConnectionStatus("Disconnected");
      }
    } else if (wsConnection?.readyState === WebSocket.CONNECTING) {
      console.warn("WebSocket still connecting, frame dropped");
    }
  };

  const handleStartStreaming = () => {
    if (backendStatus === "online") {
      if (wsConnection?.readyState === WebSocket.OPEN) {
        setIsStreaming(true);
      } else {
        // If WebSocket is not ready, connect first then start streaming
        setConnectionStatus("Connecting");
        connectWebSocket();
        // Wait a bit for connection to establish
        setTimeout(() => {
          setIsStreaming(true);
        }, 1000);
      }
    }
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    // Keep WebSocket connection alive for faster restart
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-8 floating-animation">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl glow-effect">
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-5xl md:text-7xl font-black gradient-text gradient-shift">
              CamSight
            </h1>
          </div>
          <div className="glass-enhanced rounded-3xl px-8 py-6 max-w-3xl mx-auto shadow-3xl">
            <p className="text-xl md:text-2xl text-gray-900 font-semibold leading-relaxed">
              Real-time object tracking system using YOLO 12 nano for live
              object detection from your camera.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </header>

        {/* Status Indicator */}
        <div className="max-w-7xl mx-auto mb-8">
          <StatusIndicator
            backendStatus={backendStatus}
            connectionStatus={connectionStatus}
            streamingStatus={isStreaming ? "Active" : "Inactive"}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Input */}
          <div className="space-y-6">
            <div className="card-enhanced glow-effect">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl pulse-glow">
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
                <div>
                  <h2 className="text-3xl font-bold gradient-text">
                    Camera Input
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Capture live video stream
                  </p>
                </div>
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
            <div className="card-enhanced glow-effect">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl pulse-glow">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold gradient-text">
                    Detection Results
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    AI-powered object recognition
                  </p>
                </div>
              </div>

              <ObjectTracker isStreaming={isStreaming} />
            </div>
          </div>
        </div>

        {/* Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div
            className="card-enhanced glow-effect floating-animation"
            style={{ animationDelay: "0s" }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl pulse-glow">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-bold gradient-text mb-3">
                Real-time
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Live object detection with low latency using WebSocket
                communication for instant results.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 font-medium">
                  Ultra Low Latency
                </span>
              </div>
            </div>
          </div>

          <div
            className="card-enhanced glow-effect floating-animation"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl pulse-glow">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-bold gradient-text mb-3">
                YOLO 12 Nano
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Using the latest YOLO model for high accuracy object detection
                with optimal performance.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-600 font-medium">
                  AI Powered
                </span>
              </div>
            </div>
          </div>

          <div
            className="card-enhanced glow-effect floating-animation"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl pulse-glow">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-bold gradient-text mb-3">
                User-Friendly
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Easy-to-use interface with modern design and responsive layout
                for all devices.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">
                  Intuitive Design
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-16 text-center">
          <div className="glass-enhanced rounded-2xl px-6 py-4">
            <p className="text-gray-700 font-medium">
              © 2024 CamSight - Real-time Object Detection System
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
