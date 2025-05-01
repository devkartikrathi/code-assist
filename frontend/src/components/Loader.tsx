import React from "react";

export function Loader() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center w-full py-8"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="mt-4 text-sm font-medium text-gray-600">Loading...</div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
