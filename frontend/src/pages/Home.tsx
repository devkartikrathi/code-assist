import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-cursor-hover">
              <Sparkles className="w-12 h-12 text-cursor-accent" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-cursor-text mb-6">AICade</h1>
          <p className="text-xl text-cursor-text/80">
            Describe your dream website, and we'll help you build it step by
            step
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-cursor-sidebar rounded-lg shadow-cursor p-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-40 p-6 bg-cursor-bg text-cursor-text border border-cursor-border rounded-lg focus:ring-2 focus:ring-cursor-accent focus:border-transparent resize-none placeholder-cursor-text/50 text-lg"
            />
            <button
              type="submit"
              className="w-full mt-6 bg-cursor-accent text-white py-4 px-8 rounded-lg font-medium hover:bg-cursor-accent/90 transition-colors text-lg"
            >
              Generate Website Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
