import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Sparkles, Code2, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            AI Website Builder
            <span className="text-blue-500">.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into reality with our AI-powered website
            builder. Just describe your vision, and we'll handle the rest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Describe your website</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'I want a modern e-commerce website with a clean design, product carousel, and checkout system...'"
              className="w-full h-40 p-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full mt-6 bg-blue-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Generate Website</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-blue-500 mb-6">
              <Sparkles className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced AI algorithms understand your requirements and generate
              perfect code that matches your vision.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-blue-500 mb-6">
              <Wand2 className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Real-time Preview
            </h3>
            <p className="text-gray-600 leading-relaxed">
              See your website come to life as you describe it, with instant
              previews and live updates.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-blue-500 mb-6">
              <Code2 className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Clean Code
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get production-ready, well-structured code that follows modern
              best practices and standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
