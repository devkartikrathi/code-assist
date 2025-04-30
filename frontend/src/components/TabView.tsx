import React from 'react';
import { Code2, Eye } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
  codeContent: React.ReactNode;
  previewContent: React.ReactNode;
}

export function TabView({ activeTab, onTabChange, codeContent, previewContent }: TabViewProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onTabChange('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'code'
              ? 'bg-cursor-active text-cursor-text'
              : 'text-cursor-text/70 hover:text-cursor-text hover:bg-cursor-hover'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Code
        </button>
        <button
          onClick={() => onTabChange('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'preview'
              ? 'bg-cursor-active text-cursor-text'
              : 'text-cursor-text/70 hover:text-cursor-text hover:bg-cursor-hover'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'code' ? codeContent : previewContent}
      </div>
    </div>
  );
}