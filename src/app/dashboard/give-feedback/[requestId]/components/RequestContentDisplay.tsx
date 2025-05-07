"use client";

import React, { useEffect, useState } from "react";
import type { RequestDetailsItem, RequestType } from "~/types"; // Assuming RequestDetailsItem includes type, contentUrl, contentText
// import { Button } from "~/components/ui/button"; // Removed unused import
import { Link2 } from "lucide-react";

// Helper function to map RequestType to label (kept local as it's specific to display)
const getRequestTypeLabel = (type: RequestType) => {
  switch (type) {
    case "linkedin":
      return "LinkedIn Profile";
    case "email":
      return "Cold Email";
    case "resume":
      return "Resume";
    case "portfolio":
      return "Portfolio";
    case "coverletter":
      return "Cover Letter";
    default:
      return "Unknown Type";
  }
};

interface RequestContentDisplayProps {
  request: Pick<RequestDetailsItem, "type" | "contentUrl" | "contentText">;
}

export const RequestContentDisplay: React.FC<RequestContentDisplayProps> = ({
  request,
}) => {
  const [url, setUrl] = useState(request.contentUrl);
  const [text, setText] = useState(request.contentText);

  useEffect(() => {
    setUrl(request.contentUrl);
    setText(request.contentText);

    console.log(request);
  }, [request]);

  switch (request.type) {
    case "linkedin":
      return (
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-700">LinkedIn Profile</h3>
          <div className="rounded-md bg-gray-50 p-3 break-words">
            {url ? (
              <div className="mb-4 flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3">
                <Link2 className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary text-sm break-all hover:underline"
                >
                  {url}
                </a>
              </div>
            ) : (
              <span className="text-gray-500 italic">No URL provided</span>
            )}
          </div>
        </div>
      );
    case "email":
      return (
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-700">Cold Email</h3>
          <div className="rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-700">
            {text ?? (
              <span className="text-gray-500 italic">No text provided</span>
            )}
          </div>
        </div>
      );
    case "resume":
    case "coverletter":
    case "portfolio":
      return (
        <div>
          <h3 className="mb-1 text-sm font-medium text-gray-700">{getRequestTypeLabel(request.type)}</h3>
          {url && (
            <>
              <h4 className="mb-1 text-sm font-medium text-gray-700">Link</h4>
              <div className="mb-4 flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3">
                <Link2 className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline break-all text-sm"
                >
                  {url}
                </a>
              </div>
            </>
          )}
          {text && (
            <>
              <h4 className="mb-1 text-sm font-medium text-gray-700">Content</h4>
              <div className="rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-700">
                {text}
              </div>
            </>
          )}
          {!url && !text && (
            <span className="text-gray-500 italic">No content provided</span>
          )}
        </div>
      );
    default:
      return (
        <p className="text-gray-500 italic">
          Cannot display content for this request type ({request.type}).
        </p>
      );
  }
};
