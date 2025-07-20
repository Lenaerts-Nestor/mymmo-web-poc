// src/app/components/ui/SocketStatus.tsx - Socket Connection Status Component
"use client";

import { useSocketContext } from "../../contexts/SocketContext";

interface SocketStatusProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SocketStatus({
  showLabel = false,
  size = "md",
  className = "",
}: SocketStatusProps) {
  const { status, isConnected, lastError } = useSocketContext();

  const sizeClasses = {
    sm: "w-2 h-2 text-xs",
    md: "w-3 h-3 text-sm",
    lg: "w-4 h-4 text-base",
  };

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          label: "Live",
          textColor: "text-green-600",
          animate: "animate-pulse",
        };
      case "connecting":
      case "reconnecting":
        return {
          color: "bg-yellow-500",
          label: status === "connecting" ? "Verbinden..." : "Herverbinden...",
          textColor: "text-yellow-600",
          animate: "animate-pulse",
        };
      case "disconnected":
      case "error":
        return {
          color: "bg-red-500",
          label: lastError || "Offline",
          textColor: "text-red-600",
          animate: "",
        };
      default:
        return {
          color: "bg-gray-500",
          label: "Onbekend",
          textColor: "text-gray-600",
          animate: "",
        };
    }
  };

  const config = getStatusConfig();

  if (!showLabel) {
    // Just the status dot
    return (
      <div className={`flex items-center ${className}`}>
        <div
          className={`${sizeClasses[size].split(" ")[0]} ${
            sizeClasses[size].split(" ")[1]
          } ${config.color} rounded-full ${config.animate}`}
          title={config.label}
        />
      </div>
    );
  }

  // Status dot with label
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${sizeClasses[size].split(" ")[0]} ${
          sizeClasses[size].split(" ")[1]
        } ${config.color} rounded-full mr-2 ${config.animate}`}
      />
      <span
        className={`${sizeClasses[size].split(" ")[2]} ${
          config.textColor
        } font-medium`}
      >
        {config.label}
      </span>
    </div>
  );
}

// Global socket status for debugging (can be placed in dev tools or footer)
export function SocketDebugStatus() {
  const { socket, status, isConnected, lastError } = useSocketContext();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
      <div className="flex items-center space-x-2">
        <SocketStatus showLabel size="sm" />
        <span>|</span>
        <span>ID: {socket?.id || "None"}</span>
        <span>|</span>
        <span>Status: {status}</span>
        {lastError && (
          <>
            <span>|</span>
            <span className="text-red-300">Error: {lastError}</span>
          </>
        )}
      </div>
    </div>
  );
}
