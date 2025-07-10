"use client";

import React, { useState, useEffect } from "react";

interface ObjectTrackerProps {
  isStreaming: boolean;
}

const ObjectTracker: React.FC<ObjectTrackerProps> = ({ isStreaming }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const videoFeedUrl = "http://localhost:8000/video_feed";

  useEffect(() => {
    if (isStreaming) {
      setImageError(false);
      setImageLoading(true);
      setLastUpdate(new Date());
    }
  }, [isStreaming]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    setLastUpdate(new Date());
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error("Failed to load video feed");
  };

  const StatusOverlay = () => {
    if (!isStreaming) {
      return (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Waiting for Stream</h3>
            <p className="text-gray-300 mb-6">
              Start camera streaming to see real-time object detection results
            </p>
            <div className="flex items-center justify-center gap-2">
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
        </div>
      );
    }

    if (imageLoading) {
      return (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="loading-dots mb-6">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Loading Detection Stream
            </h3>
            <p className="text-gray-300">Connecting to video feed...</p>
          </div>
        </div>
      );
    }

    if (imageError) {
      return (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-400"
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
            <h3 className="text-2xl font-bold mb-3">Connection Error</h3>
            <p className="text-gray-300 mb-6">
              Cannot connect to video feed. Please ensure the backend is
              running.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary-enhanced"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Video Stream Container */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl glow-effect">
        {/* Live Indicator */}
        {isStreaming && !imageError && !imageLoading && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>LIVE DETECTION</span>
          </div>
        )}

        {/* Timestamp */}
        {lastUpdate && !imageError && !imageLoading && (
          <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium">
            {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* Video Feed */}
        <div className="relative w-full h-64 md:h-80">
          {isStreaming && (
            <img
              src={`${videoFeedUrl}?t=${Date.now()}`}
              alt="Object Detection Stream"
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          <StatusOverlay />
        </div>
      </div>

      {/* Detection Info */}
      {isStreaming && !imageError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">Detection Active</h4>
            </div>
            <p className="text-sm text-gray-600">
              AI model is analyzing your video stream in real-time
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">YOLO 12 Nano</h4>
            </div>
            <p className="text-sm text-gray-600">
              Latest object detection model with high accuracy
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">
                Real-time Processing
              </h4>
            </div>
            <p className="text-sm text-gray-600">
              Low latency object tracking and classification
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isStreaming && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                How to Use Object Detection
              </h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Make sure your camera is connected and accessible</li>
                <li>2. Click "Access Camera & Start" to begin streaming</li>
                <li>3. Wait for the AI model to process your video feed</li>
                <li>
                  4. Objects will be highlighted with bounding boxes and labels
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectTracker;
