"use client";

interface StatusIndicatorProps {
  backendStatus: "checking" | "online" | "offline";
  isConnected: boolean;
  isStreaming: boolean;
}

export default function StatusIndicator({
  backendStatus,
  isConnected,
  isStreaming,
}: StatusIndicatorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        );
      case "offline":
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case "checking":
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
        );
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Backend Online";
      case "offline":
        return "Backend Offline";
      case "checking":
        return "Checking Backend...";
      default:
        return "Unknown Status";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "offline":
        return "text-red-600";
      case "checking":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="glass p-4 rounded-xl">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {/* Backend Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(backendStatus)}
            <span className={`font-medium ${getStatusColor(backendStatus)}`}>
              {getStatusText(backendStatus)}
            </span>
          </div>

          {/* WebSocket Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            )}
            <span
              className={`font-medium ${
                isConnected ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {isConnected ? "WebSocket Terhubung" : "WebSocket Terputus"}
            </span>
          </div>

          {/* Streaming Status */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            )}
            <span
              className={`font-medium ${
                isStreaming ? "text-purple-600" : "text-gray-600"
              }`}
            >
              {isStreaming ? "Streaming Aktif" : "Streaming Tidak Aktif"}
            </span>
          </div>
        </div>

        {/* Warning untuk backend offline */}
        {backendStatus === "offline" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
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
              <span className="text-red-700 text-sm font-medium">
                Backend tidak dapat dijangkau. Pastikan server backend berjalan
                di http://localhost:8000
              </span>
            </div>
          </div>
        )}

        {/* Tips untuk menggunakan aplikasi */}
        {backendStatus === "online" && !isStreaming && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
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
              <span className="text-blue-700 text-sm font-medium">
                Klik "Mulai Streaming" untuk memulai deteksi objek real-time
                dari kamera Anda.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
