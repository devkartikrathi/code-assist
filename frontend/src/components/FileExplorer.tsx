import React, { useState } from "react";
import { FolderTree, File, ChevronRight, ChevronDown } from "lucide-react";
import { FileItem } from "../types";

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150
          ${
            item.type === "folder"
              ? "hover:bg-blue-50 text-gray-700"
              : "hover:bg-gray-50 text-gray-600"
          }`}
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {item.type === "folder" && (
          <span className="text-gray-400">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {item.type === "folder" ? (
          <FolderTree className="w-4 h-4 text-blue-500" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span
          className={`text-sm ${item.type === "folder" ? "font-medium" : ""}`}
        >
          {item.name}
        </span>
      </div>
      {item.type === "folder" && isExpanded && item.children && (
        <div className="animate-fadeIn">
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 px-2">
        <FolderTree className="w-5 h-5 text-blue-500" />
        File Explorer
      </h2>
      <div className="space-y-0.5">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
