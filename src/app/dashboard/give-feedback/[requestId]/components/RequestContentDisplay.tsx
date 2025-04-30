'use client';

import React from 'react';
import type { RequestDetailsItem, RequestType } from '~/types'; // Assuming RequestDetailsItem includes type, contentUrl, contentText
import { Button } from '~/components/ui/button';
import { FileText } from 'lucide-react';

// Helper function to map RequestType to label (kept local as it's specific to display)
const getRequestTypeLabel = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return 'LinkedIn Profile';
    case 'email': return 'Cold Email';
    case 'resume': return 'Resume';
    case 'portfolio': return 'Portfolio';
    case 'coverletter': return 'Cover Letter';
    default: return 'Unknown Type';
  }
};

interface RequestContentDisplayProps {
  request: Pick<RequestDetailsItem, 'type' | 'contentUrl' | 'contentText'>;
}

export const RequestContentDisplay: React.FC<RequestContentDisplayProps> = ({ request }) => {
  const url = request.contentUrl;
  const text = request.contentText;

  switch (request.type) {
    case 'linkedin':
    case 'portfolio':
      return (
        <div className="rounded-md bg-gray-50 p-3 break-words">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline"
            >
              {url}
            </a>
          ) : (
            <span className="text-gray-500 italic">No URL provided</span>
          )}
        </div>
      );
    case 'email':
    case 'coverletter': // Assuming cover letter might also be text
      return (
        <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          {text ?? <span className="text-gray-500 italic">No text provided</span>}
        </div>
      );
    case 'resume': // Assuming resume uses contentUrl for a file link
      return (
        <div className="rounded-md bg-gray-50 p-3 text-center">
          <FileText className="mx-auto mb-2 h-12 w-12 text-gray-400" />
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
              <Button variant="outline" size="sm">View Resume</Button>
            </a>
          ) : (
            <p className="text-sm italic text-gray-600">No resume file link provided.</p>
          )}
          {/* Optionally display contextText if relevant for resumes (handled in parent) */}
        </div>
      );
    default:
      return <p className="italic text-gray-500">Cannot display content for this request type ({request.type}).</p>;
  }
}; 