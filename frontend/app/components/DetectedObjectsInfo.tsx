"use client";

import { useState, useEffect } from "react";

interface DetectedObject {
  name: string;
  confidence: number;
  count: number;
}

interface DetectedObjectsInfoProps {
  isStreaming: boolean;
}

export default function DetectedObjectsInfo({
  isStreaming,
}: DetectedObjectsInfoProps) {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulasi data deteksi - nanti bisa diganti dengan data real dari backend
  useEffect(() => {
    if (!isStreaming) {
      setDetectedObjects([]);
      setTotalObjects(0);
      setLastUpdated(null);
      return;
    }

    // Simulasi update deteksi setiap 2 detik
    const interval = setInterval(() => {
      // Data simulasi - nanti diganti dengan API call ke backend
      const mockDetections: DetectedObject[] = [
        { name: "person", confidence: 0.92, count: 2 },
        { name: "chair", confidence: 0.87, count: 1 },
        { name: "laptop", confidence: 0.95, count: 1 },
        { name: "cup", confidence: 0.78, count: 1 },
      ].filter(() => Math.random() > 0.3); // Random simulation

      setDetectedObjects(mockDetections);
      setTotalObjects(mockDetections.reduce((sum, obj) => sum + obj.count, 0));
      setLastUpdated(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return "🟢";
    if (confidence >= 0.7) return "🟡";
    return "🔴";
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            Detected Objects
          </h3>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {totalObjects}
              </div>
              <div className="text-sm text-gray-600">Total Objects</div>
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>

      {!isStreaming ? (
        <div className="text-center py-8">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-600 mb-2">Object detection inactive</p>
          <p className="text-gray-500 text-sm">
            Start streaming to see detected objects in real-time
          </p>
        </div>
      ) : detectedObjects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">Scanning for objects...</p>
          <p className="text-gray-500 text-sm">
            Detection results will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {detectedObjects.map((obj, index) => (
            <div
              key={`${obj.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {getConfidenceIcon(obj.confidence)}
                </span>
                <div>
                  <div className="font-medium text-gray-800 capitalize">
                    {obj.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Count: {obj.count}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                    obj.confidence
                  )}`}
                >
                  {Math.round(obj.confidence * 100)}% confident
                </div>
              </div>
            </div>
          ))}

          {detectedObjects.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-500 mt-0.5"
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
                <div className="text-sm text-blue-700">
                  <div className="font-medium">Detection Legend:</div>
                  <div className="mt-1 space-y-1">
                    <div>🟢 High confidence (≥90%)</div>
                    <div>🟡 Medium confidence (70-89%)</div>
                    <div>🔴 Low confidence (&lt;70%)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
