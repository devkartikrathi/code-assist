import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { FileSystemTree } from "@webcontainer/api";
import { Loader } from "../components/Loader";
import { Sparkles, Send, MessageSquare } from "lucide-react";

interface LocationState {
  prompt: string;
}

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as LocationState;
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => ({
          ...s,
          status: "completed",
        }))
      );
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): FileSystemTree => {
      const mountStructure: FileSystemTree = {};

      const processFile = (file: FileItem): FileSystemTree[string] => {
        if (file.type === "folder") {
          return {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [child.name, processFile(child)])
                )
              : {},
          };
        } else {
          return {
            file: {
              contents: file.content || "",
            },
          };
        }
      };

      files.forEach((file) => {
        mountStructure[file.name] = processFile(file);
      });

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    if (webcontainer) {
      webcontainer.mount(mountStructure);
    }
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      }))
    );

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });

    setLoading(false);

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }))
    );

    setLlmMessages((prev) => [
      ...prev,
      { role: "assistant", content: stepsResponse.data.response },
    ]);
  }

  useEffect(() => {
    init();
  }, [prompt]);

  const handleChatSubmit = async () => {
    if (!userPrompt.trim()) return;

    const newMessage = {
      role: "user",
      content: userPrompt,
    } as const;

    setLoading(true);
    try {
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage],
      });

      setLlmMessages((prev) => [...prev, newMessage]);
      setLlmMessages((prev) => [
        ...prev,
        { role: "assistant", content: stepsResponse.data.response },
      ]);

      setSteps((currentSteps) => [
        ...currentSteps,
        ...parseXml(stepsResponse.data.response).map((step) => ({
          ...step,
          status: "pending",
        })),
      ]);

      setPrompt("");
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Building Your Website
            </h1>
            <div className="text-sm text-gray-600">
              {loading
                ? "Generating..."
                : templateSet
                ? "Template ready"
                : "Initializing..."}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Left Sidebar - Steps and Chat */}
            <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Build Progress
                  </h2>
                  <StepsList
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={(step) => setCurrentStep(step)}
                  />
                </div>
              </div>

              {/* Chat Section */}
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">AI Assistant</h3>
                  </div>
                  {loading || !templateSet ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader />
                    </div>
                  ) : (
                    <div className="relative">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask for modifications or clarifications..."
                        className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 pr-12 min-h-[100px]"
                      />
                      <button
                        onClick={handleChatSubmit}
                        disabled={loading || !templateSet}
                        className="absolute bottom-3 right-3 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Explorer */}
            <div className="w-64 border-r border-gray-200 bg-white p-4">
              <FileExplorer files={files} onFileSelect={setSelectedFile} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              <div className="p-4">
                <TabView activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              <div className="flex-1 p-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader />
                  </div>
                ) : activeTab === "code" ? (
                  <div className="h-full">
                    <CodeEditor file={selectedFile} />
                  </div>
                ) : webcontainer ? (
                  <div className="h-full">
                    <PreviewFrame webContainer={webcontainer} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500">Loading preview...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
