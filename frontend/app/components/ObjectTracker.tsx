"use client";

import { useState, useEffect, useRef } from "react";

interface ObjectTrackerProps {
  isStreaming: boolean;
}

export default function ObjectTracker({ isStreaming }: ObjectTrackerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset states when streaming status changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
  }, [isStreaming]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setRetryCount(0);
  };

  // Handle image error with retry logic
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);

    // Auto retry with exponential backoff
    if (retryCount < 3 && isStreaming) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        if (imgRef.current) {
          // Force reload by adding timestamp
          const currentSrc = imgRef.current.src.split("?")[0];
          imgRef.current.src = `${currentSrc}?t=${Date.now()}`;
        }
      }, delay);
    }
  };

  // Manual retry function
  const handleRetry = () => {
    setImageError(false);
    setRetryCount(0);
    if (imgRef.current) {
      const currentSrc = imgRef.current.src.split("?")[0];
      imgRef.current.src = `${currentSrc}?t=${Date.now()}`;
    }
  };

  const videoFeedUrl = `http://localhost:8000/video_feed?t=${Date.now()}`;

  return (
    <div className="space-y-4">
      {/* Detection Results Display */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
        {isStreaming ? (
          <>
            <img
              ref={imgRef}
              src={videoFeedUrl}
              alt="Object Detection Results"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Loading overlay */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="loading-dots mx-auto mb-4">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <p className="text-gray-600">Loading detection results...</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-red-600 font-medium mb-2">
                    Failed to load stream
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    {retryCount < 3
                      ? `Retrying... (${retryCount + 1}/3)`
                      : `Max retry attempts reached`}
                  </p>
                  <button onClick={handleRetry} className="btn-primary text-sm">
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Stream indicator */}
            {imageLoaded && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>DETECTING</span>
              </div>
            )}

            {/* Stream info */}
            {imageLoaded && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                Real-time Object Detection
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                Object detection results will appear here
              </p>
              <p className="text-gray-500 text-sm">
                Start streaming to see real-time detection
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detection Info */}
      {isStreaming && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800">Model</span>
            </div>
            <p className="text-blue-700 text-sm">YOLO 12 Nano</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Status</span>
            </div>
            <p className="text-green-700 text-sm">
              {imageLoaded ? "Active" : imageError ? "Error" : "Loading..."}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-purple-800">Mode</span>
            </div>
            <p className="text-purple-700 text-sm">Real-time Detection</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isStreaming && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">How to Use:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Ensure backend is running</li>
                <li>• Click "Start Streaming" on camera panel</li>
                <li>• Object detection results will appear in real-time</li>
                <li>• Detected objects will be marked with bounding boxes</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
