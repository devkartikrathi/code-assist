import { WebContainer } from "@webcontainer/api";
import React, { useEffect, useState } from "react";
import { Loader } from "./Loader";

interface PreviewFrameProps {
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function main() {
    try {
      const installProcess = await webContainer.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        })
      );

      await webContainer.spawn("npm", ["run", "dev"]);

      webContainer.on("server-ready", (port, url) => {
        console.log("Server ready at:", url);
        setUrl(url);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Preview error:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    main();
  }, []);

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : url ? (
        <iframe
          title="Preview"
          src={url}
          className="w-full h-full"
          style={{ border: "none" }}
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="text-gray-500 mb-2">Preview not available</div>
          <div className="text-sm text-gray-400">
            There was an error loading the preview
          </div>
        </div>
      )}
    </div>
  );
}
