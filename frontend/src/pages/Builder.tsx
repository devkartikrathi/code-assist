import { useEffect, useState } from "react";
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
import { Sparkles, Send, MessageSquare, Check, X } from "lucide-react";

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
  const [pendingChanges, setPendingChanges] = useState<{
    originalFiles: FileItem[];
    newFiles: FileItem[];
    steps: Step[];
  } | null>(null);
  const [diffMode, setDiffMode] = useState(false);
  const [affectedFiles, setAffectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!pendingChanges) {
      const stepsToProcess = steps.filter(({ status }) => status === "pending");
      if (stepsToProcess.length > 0) {
        const originalFiles = JSON.parse(JSON.stringify(files));
        const newFiles = JSON.parse(JSON.stringify(files));
        let updateHappened = false;
        const affected = new Set<string>();

        stepsToProcess.forEach((step) => {
          updateHappened = true;
          if (step?.type === StepType.CreateFile) {
            let parsedPath = step.path?.split("/") ?? [];
            let currentFileStructure = newFiles;

            let currentFolder = "";
            while (parsedPath.length) {
              currentFolder = `${currentFolder}/${parsedPath[0]}`;
              const currentFolderName = parsedPath[0];
              parsedPath = parsedPath.slice(1);

              if (!parsedPath.length) {
                affected.add(currentFolder);
                const file = currentFileStructure.find(
                  (x: FileItem) => x.path === currentFolder
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
                const folder = currentFileStructure.find(
                  (x: FileItem) => x.path === currentFolder
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
                  (x: FileItem) => x.path === currentFolder
                )!.children!;
              }
            }
          }
        });

        if (updateHappened) {
          setPendingChanges({
            originalFiles,
            newFiles,
            steps: stepsToProcess,
          });
          setAffectedFiles(Array.from(affected));

          setDiffMode(true);
          setActiveTab("code");

          if (affected.size > 0) {
            const affectedPath = Array.from(affected)[0];
            const affectedFile = findFileByPath(newFiles, affectedPath);
            if (affectedFile) {
              setSelectedFile(affectedFile);
            }
          }
        }
      }
    }
  }, [steps, files]);

  const findFileByPath = (
    fileList: FileItem[],
    path: string
  ): FileItem | null => {
    for (const file of fileList) {
      if (file.path === path) return file;
      if (file.children) {
        const found = findFileByPath(file.children, path);
        if (found) return found;
      }
    }
    return null;
  };

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
        status: "pending" as const,
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

    const newMessage = { role: "user", content: userPrompt } as const;

    setLoading(true);
    try {
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage],
      });

      setLlmMessages((prev) => [...prev, newMessage]);
      setLlmMessages((prev) => [
        ...prev,
        { role: "assistant", content: stepsResponse.data.response } as const,
      ]);

      setSteps((currentSteps) => [
        ...currentSteps,
        ...parseXml(stepsResponse.data.response).map(
          (step) =>
            ({
              ...step,
              status: "pending",
            } as const)
        ),
      ]);

      setPrompt("");
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChanges = () => {
    if (pendingChanges) {
      if (!diffMode) {
        setDiffMode(true);
        return;
      }

      setFiles(JSON.parse(JSON.stringify(pendingChanges.newFiles)));
      setSteps((steps) =>
        steps.map((s) => ({
          ...s,
          status: s.status === "pending" ? "completed" : s.status,
        }))
      );
      setPendingChanges(null);
      setDiffMode(false);
      setAffectedFiles([]);
    }
  };

  const handleRejectChanges = () => {
    if (pendingChanges) {
      if (!diffMode) {
        setDiffMode(true);
        return;
      }

      setSteps((steps) =>
        steps.filter((s) => !pendingChanges.steps.find((ps) => ps.id === s.id))
      );
      setPendingChanges(null);
      setDiffMode(false);
      setAffectedFiles([]);
    }
  };

  const handleCloseDiff = () => {
    setDiffMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Building Your Website
            </h1>
            <div className="flex items-center gap-4">
              {pendingChanges && diffMode && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200 mr-2">
                    <span className="font-medium">Review Changes</span>
                    <span className="ml-1 text-sm">
                      ({affectedFiles.length} file
                      {affectedFiles.length !== 1 ? "s" : ""} affected)
                    </span>
                  </div>
                  <button
                    onClick={handleAcceptChanges}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept All Changes
                  </button>
                  <button
                    onClick={handleRejectChanges}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject All Changes
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {loading
                  ? "Generating..."
                  : templateSet
                  ? "Template ready"
                  : "Initializing..."}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
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

            <div className="w-64 border-r border-gray-200 bg-white p-4">
              <FileExplorer
                files={pendingChanges ? pendingChanges.newFiles : files}
                onFileSelect={setSelectedFile}
                highlightPaths={diffMode ? affectedFiles : []}
              />
            </div>

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
                    <CodeEditor
                      file={selectedFile}
                      pendingChanges={diffMode ? pendingChanges : null}
                      onCloseDiff={handleCloseDiff}
                    />
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
