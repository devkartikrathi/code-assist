import React, { useState } from "react";
import { Diff, Hunk, parseDiff } from "react-diff-view";
import "react-diff-view/style/index.css";
import { FileItem } from "../types";
import { FileText, Code } from "lucide-react";

// Helper function to generate a more accurate diff between two strings
function generateDiff(oldContent, newContent, filename) {
  // Generate unified diff format
  const oldLines = (oldContent || "").split("\n");
  const newLines = (newContent || "").split("\n");

  // This is a simplified diff algorithm that compares line by line
  // For real applications, use a proper diff algorithm like diff-match-patch

  // Find common prefix and suffix
  let i = 0;
  while (
    i < oldLines.length &&
    i < newLines.length &&
    oldLines[i] === newLines[i]
  ) {
    i++;
  }

  let j = 0;
  while (
    j < oldLines.length - i &&
    j < newLines.length - i &&
    oldLines[oldLines.length - 1 - j] === newLines[newLines.length - 1 - j]
  ) {
    j++;
  }

  // Create a simplified unified diff format
  const prefixLines = i;
  const suffixLines = j;
  const oldChangedLines = oldLines.length - prefixLines - suffixLines;
  const newChangedLines = newLines.length - prefixLines - suffixLines;

  let diffText = `--- a/${filename}\n+++ b/${filename}\n`;

  // If there are changes
  if (oldChangedLines > 0 || newChangedLines > 0) {
    diffText += `@@ -${prefixLines + 1},${oldChangedLines} +${
      prefixLines + 1
    },${newChangedLines} @@\n`;

    // Add context lines before (up to 3)
    for (let k = Math.max(0, prefixLines - 3); k < prefixLines; k++) {
      diffText += ` ${oldLines[k]}\n`;
    }

    // Add removed lines
    for (let k = prefixLines; k < oldLines.length - suffixLines; k++) {
      diffText += `-${oldLines[k]}\n`;
    }

    // Add added lines
    for (let k = prefixLines; k < newLines.length - suffixLines; k++) {
      diffText += `+${newLines[k]}\n`;
    }

    // Add context lines after (up to 3)
    for (
      let k = oldLines.length - suffixLines;
      k < Math.min(oldLines.length, oldLines.length - suffixLines + 3);
      k++
    ) {
      diffText += ` ${oldLines[k]}\n`;
    }
  } else {
    // No changes
    diffText += `@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
    for (let k = 0; k < oldLines.length; k++) {
      diffText += ` ${oldLines[k]}\n`;
    }
  }

  return diffText;
}

export function DiffViewer({ originalFile, newFile, onClose }) {
  const [viewType, setViewType] = useState("unified");

  if (!originalFile || !newFile) return null;

  const filename = originalFile.name;
  const oldContent = originalFile.content || "";
  const newContent = newFile.content || "";

  // Check if content is actually different
  if (oldContent === newContent) {
    // For new files, show them as pure additions
    if (!originalFile.content && newFile.content) {
      // Continue with diff for new files
    } else {
      return (
        <div className="w-full h-full overflow-auto bg-white p-4 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white p-2 border-b border-gray-200 z-10">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              {filename}
            </h3>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md"
            >
              Close
            </button>
          </div>
          <div className="p-4 bg-gray-50 text-gray-500 rounded">
            No changes detected for this file
          </div>
        </div>
      );
    }
  }

  // Generate diff
  const diffText = generateDiff(oldContent, newContent, filename);
  const files = parseDiff(diffText);

  if (files.length === 0) return null;
  const file = files[0];

  const hasChanges = file.hunks && file.hunks.length > 0;

  return (
    <div className="w-full h-full overflow-auto bg-white rounded-lg border border-gray-300 flex flex-col">
      <div className="flex justify-between items-center sticky top-0 bg-white p-3 border-b border-gray-200 z-10">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-500" />
          <span className="mr-2">Changes to</span>
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {filename}
          </span>
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setViewType("unified")}
              className={`px-3 py-1 text-sm ${
                viewType === "unified"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewType("split")}
              className={`px-3 py-1 text-sm ${
                viewType === "split"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Split
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {hasChanges ? (
          <div className="diff-container">
            <Diff viewType={viewType} diffType={file.type} hunks={file.hunks}>
              {(hunks) =>
                hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
              }
            </Diff>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 text-gray-500 rounded">
            {oldContent ? "No significant changes detected" : "New file added"}
          </div>
        )}
      </div>
    </div>
  );
}
