"use client";

import * as React from "react";

export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, onCheckedChange, disabled = false, className = "", ...props },
    ref
  ) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        tabIndex={0}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-400"
        } ${className}`}
        onClick={() => !disabled && onCheckedChange(!checked)}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
