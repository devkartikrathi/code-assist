import React from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";
import { DiffViewer } from "./DiffViewer";
import { FileText } from "lucide-react";

interface CodeEditorProps {
  file: FileItem | null;
  pendingChanges: {
    originalFiles: FileItem[];
    newFiles: FileItem[];
  } | null;
  onCloseDiff: () => void;
}

export function CodeEditor({
  file,
  pendingChanges,
  onCloseDiff,
}: CodeEditorProps) {
  // Helper function to find file in file structure
  const findFileInStructure = (
    files: FileItem[],
    path: string
  ): FileItem | null => {
    for (const item of files) {
      if (item.path === path) return item;
      if (item.children) {
        const found = findFileInStructure(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // Find matching files in pending changes
  let originalFile: FileItem | null = null;
  let newFile: FileItem | null = null;

  if (file && pendingChanges) {
    // For existing files
    originalFile = findFileInStructure(pendingChanges.originalFiles, file.path);
    newFile = findFileInStructure(pendingChanges.newFiles, file.path);

    // For new files that didn't exist in original
    if (!originalFile && newFile) {
      originalFile = {
        name: newFile.name,
        path: newFile.path,
        type: newFile.type,
        content: "", // Empty content for new files
      };
    }
  }

  // Determine if we should show diff view
  // If file is in pending changes, always show the diff view
  const showDiff = file && pendingChanges && (originalFile || newFile);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-gray-400 mb-2">No file selected</div>
        <div className="text-sm text-gray-400">
          Select a file from the explorer to view its contents
        </div>
      </div>
    );
  }

  if (showDiff) {
    return (
      <DiffViewer
        originalFile={originalFile}
        newFile={newFile || file}
        onClose={onCloseDiff}
      />
    );
  }

  // Determine language for Monaco Editor
  const getLanguageFromFilename = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "js":
        return "javascript";
      case "jsx":
        return "javascript";
      case "ts":
        return "typescript";
      case "tsx":
        return "typescript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      default:
        return "javascript";
    }
  };

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div className="flex items-center p-2 px-4 border-b border-gray-200">
        <FileText className="w-4 h-4 mr-2 text-gray-500" />
        <span className="font-mono text-sm">{file.path}</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={getLanguageFromFilename(file.name)}
          theme="light"
          value={file.content || ""}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "all",
            fontFamily: "JetBrains Mono, monospace",
            fontLigatures: true,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
