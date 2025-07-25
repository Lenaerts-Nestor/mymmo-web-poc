import React from "react";

export function ConversationListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#ffffff] rounded-2xl shadow-sm p-6 animate-pulse border border-[#cfc4c7]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#cfc4c7] rounded-full"></div>{" "}
              <div>
                <div className="h-4 bg-[#cfc4c7] rounded w-24 mb-1"></div>{" "}
                <div className="h-3 bg-[#cfc4c7] rounded w-16"></div>{" "}
              </div>
            </div>
            <div className="w-6 h-6 bg-[#cfc4c7] rounded-full"></div>{" "}
          </div>
          {/* Message content skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-[#cfc4c7] rounded w-full mb-2"></div>{" "}
            <div className="h-4 bg-[#cfc4c7] rounded w-3/4"></div>{" "}
            {/* gravel-100 */}
          </div>
          {/* Footer skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#cfc4c7] rounded-full"></div>{" "}
              {/* gravel-100 */}
              <div className="h-3 bg-[#cfc4c7] rounded w-20"></div>{" "}
              {/* gravel-100 */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
