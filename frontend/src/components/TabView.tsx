import React from "react";
import { Code2, Eye } from "lucide-react";

interface TabViewProps {
  activeTab: "code" | "preview";
  onTabChange: (tab: "code" | "preview") => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex items-center p-1 bg-gray-50 rounded-lg">
      <button
        onClick={() => onTabChange("code")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          activeTab === "code"
            ? "bg-white text-blue-600 shadow-sm font-medium"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <Code2 className="w-4 h-4" />
        Code
      </button>
      <button
        onClick={() => onTabChange("preview")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          activeTab === "preview"
            ? "bg-white text-blue-600 shadow-sm font-medium"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>
    </div>
  );
}
