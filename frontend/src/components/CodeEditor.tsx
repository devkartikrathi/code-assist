import React from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
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

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-200 bg-white">
      <Editor
        height="100%"
        defaultLanguage="typescript"
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
  );
}
