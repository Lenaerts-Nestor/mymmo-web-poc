// src/app/components/debug/SocketDebugPanel.tsx - DEVELOPMENT ONLY
"use client";

import { useState, useEffect } from "react";
import { useSocketContext } from "../../contexts/SocketContext";

interface SocketDebugPanelProps {
  threadId?: string;
  personId?: string;
  zoneId?: string;
}

export function SocketDebugPanel({
  threadId,
  personId,
  zoneId,
}: SocketDebugPanelProps) {
  const { socket, status, isConnected, lastError, sendMessage } =
    useSocketContext();

  const [logs, setLogs] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    addLog(`Socket status changed: ${status}`);
  }, [status]);

  useEffect(() => {
    if (lastError) {
      addLog(`❌ Error: ${lastError}`);
    }
  }, [lastError]);

  const sendTestMessage = async () => {
    if (!threadId || !personId || !testMessage.trim()) return;

    const success = await sendMessage(
      threadId,
      testMessage,
      parseInt(personId)
    );
    addLog(`📤 Test message sent: ${success ? "SUCCESS" : "FAILED"}`);
    if (success) setTestMessage("");
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Open Socket Debug Panel"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 w-96 max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">🔧 Socket Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="text-gray-400">Status:</span>
          <span
            className={`ml-1 ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {status}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Socket ID:</span>
          <span className="ml-1 text-blue-400">{socket?.id || "None"}</span>
        </div>
        <div>
          <span className="text-gray-400">Person:</span>
          <span className="ml-1 text-yellow-400">{personId || "None"}</span>
        </div>
        <div>
          <span className="text-gray-400">Thread:</span>
          <span className="ml-1 text-purple-400">
            {threadId ? threadId.slice(-8) : "None"}
          </span>
        </div>
      </div>

      {/* Test Message */}
      {threadId && personId && (
        <div className="mb-3">
          <div className="flex gap-1">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Test message..."
              className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
              onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
            />
            <button
              onClick={sendTestMessage}
              disabled={!isConnected || !testMessage.trim()}
              className="px-2 py-1 text-xs bg-blue-600 disabled:bg-gray-600 rounded"
            >
              📤
            </button>
          </div>
        </div>
      )}

      {/* Connection Actions */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => socket?.connect()}
          disabled={isConnected}
          className="px-2 py-1 text-xs bg-green-600 disabled:bg-gray-600 rounded"
        >
          Connect
        </button>
        <button
          onClick={() => socket?.disconnect()}
          disabled={!isConnected}
          className="px-2 py-1 text-xs bg-red-600 disabled:bg-gray-600 rounded"
        >
          Disconnect
        </button>
        <button
          onClick={() => setLogs([])}
          className="px-2 py-1 text-xs bg-gray-600 rounded"
        >
          Clear
        </button>
      </div>

      {/* Logs */}
      <div className="bg-gray-900 rounded p-2 max-h-32 overflow-y-auto">
        <div className="text-xs text-gray-400 mb-1">Event Logs:</div>
        {logs.length === 0 ? (
          <div className="text-xs text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="text-xs text-gray-300 font-mono break-all"
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* Environment Check */}
      <div className="mt-2 text-xs">
        <div className="text-gray-400">Socket URL:</div>
        <div className="text-blue-400 break-all">
          {process.env.NEXT_PUBLIC_SOCKET_URL || "❌ NOT SET"}
        </div>
      </div>
    </div>
  );
}

// Add to your ChatContent or main layout during development
export function useSocketDebug() {
  useEffect(() => {
    const debugKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        console.log("🔧 Socket Debug Info:", {
          socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener("keydown", debugKey);
    return () => window.removeEventListener("keydown", debugKey);
  }, []);
}
