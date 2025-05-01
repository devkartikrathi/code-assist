import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sparkles, Code2 } from 'lucide-react';
import axios from "axios";
import { BACKEND_URL } from '../config';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            AI Website Builder
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into reality with our AI-powered website builder. Just describe your vision, and we'll handle the rest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Describe your website</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'I want a modern e-commerce website with a dark theme, product carousel, and checkout system...'"
              className="w-full h-40 p-4 bg-gray-900/50 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500 transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
            >
              <div className="flex items-center justify-center gap-2">
                <Code2 className="w-5 h-5" />
                <span>Generate Website</span>
              </div>
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
            <div className="text-blue-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">AI-Powered</h3>
            <p className="text-gray-400">Advanced AI algorithms understand your requirements and generate perfect code.</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
            <div className="text-purple-400 mb-4">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Real-time Preview</h3>
            <p className="text-gray-400">See your website come to life as you describe it, with instant previews.</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
            <div className="text-blue-400 mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Clean Code</h3>
            <p className="text-gray-400">Get production-ready, well-structured code that follows best practices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}