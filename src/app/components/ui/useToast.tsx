import { useState } from "react";

export interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(type: Toast["type"], message: string) {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type, message },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3500);
  }

  return {
    toasts,
    showToast,
  };
}

export function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded shadow text-sm min-w-[220px] max-w-xs font-medium flex items-center gap-2
            ${
              toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : ""
            }
            ${
              toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : ""
            }
            ${
              toast.type === "info"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : ""
            }
          `}
        >
          {toast.type === "success" && <span>✔️</span>}
          {toast.type === "error" && <span>❌</span>}
          {toast.type === "info" && <span>ℹ️</span>}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
