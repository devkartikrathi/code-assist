import React, { useState } from "react";
import { FileItem } from "../types";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  highlightPaths?: string[];
}

export function FileExplorer({
  files,
  onFileSelect,
  highlightPaths = [],
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => {
      const isFolder = item.type === "folder";
      const isExpanded = expandedFolders[item.path];
      const isHighlighted = highlightPaths.includes(item.path);

      return (
        <div key={item.path}>
          <div
            className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
              isHighlighted ? "bg-blue-50 border-l-2 border-blue-500" : ""
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              } else {
                onFileSelect(item);
              }
            }}
          >
            {isFolder ? (
              <>
                <span className="mr-1 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
                <Folder className="w-4 h-4 mr-2 text-gray-500" />
              </>
            ) : (
              <>
                <span className="mr-1 w-4 flex-shrink-0"></span>
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
              </>
            )}
            <span
              className={`text-sm truncate ${
                isHighlighted ? "font-medium text-blue-700" : "text-gray-700"
              }`}
            >
              {item.name}
            </span>
            {isHighlighted && (
              <span className="ml-auto text-xs text-blue-500 font-medium">
                Modified
              </span>
            )}
          </div>
          {isFolder && isExpanded && item.children && (
            <div>{renderFileTree(item.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Files</h2>
      <div className="file-tree">{renderFileTree(files)}</div>
    </div>
  );
}
