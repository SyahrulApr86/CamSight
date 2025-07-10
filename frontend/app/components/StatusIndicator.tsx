"use client";

import React from "react";

interface StatusIndicatorProps {
  backendStatus: "online" | "offline" | "connecting";
  connectionStatus: string;
  streamingStatus: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  backendStatus,
  connectionStatus,
  streamingStatus,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "online":
      case "Online":
      case "Active":
        return "status-badge-online";
      case "offline":
      case "Offline":
      case "Inactive":
        return "status-badge-offline";
      case "connecting":
      case "Connecting":
      case "Requesting":
        return "status-badge-connecting";
      default:
        return "status-badge-neutral";
    }
  };

  const getIcon = (status: string) => {
    if (
      status.includes("online") ||
      status.includes("Online") ||
      status.includes("Active")
    ) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (
      status.includes("offline") ||
      status.includes("Offline") ||
      status.includes("Inactive")
    ) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  return (
    <div className="card-enhanced">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <svg
              className="w-6 h-6 text-white"
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
          <div>
            <h3 className="text-2xl font-bold gradient-text">System Status</h3>
            <p className="text-gray-600 text-sm mt-1">Real-time monitoring</p>
          </div>
        </div>

        <div className="pulse-glow rounded-xl bg-gradient-to-r from-green-500 to-blue-500 p-1">
          <div className="bg-white rounded-lg px-3 py-1">
            <span className="text-sm font-bold gradient-text">LIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Status */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v1z" />
              </svg>
            </div>
            <div
              className={`status-badge ${getStatusBadgeClass(backendStatus)}`}
            >
              {getIcon(backendStatus)}
              <span className="capitalize">{backendStatus}</span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Backend Server</h4>
          <p className="text-sm text-gray-600">FastAPI with YOLO model</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div
              className={`status-badge ${getStatusBadgeClass(
                connectionStatus
              )}`}
            >
              {getIcon(connectionStatus)}
              <span>{connectionStatus}</span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">WebSocket</h4>
          <p className="text-sm text-gray-600">Real-time communication</p>
        </div>

        {/* Streaming Status */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div
              className={`status-badge ${getStatusBadgeClass(streamingStatus)}`}
            >
              {getIcon(streamingStatus)}
              <span>{streamingStatus}</span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Camera Stream</h4>
          <p className="text-sm text-gray-600">Video capture & processing</p>
        </div>
      </div>

      {/* System Health Indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              System Health
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: backendStatus === "online" ? "100%" : "30%" }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {backendStatus === "online" ? "100%" : "30%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
