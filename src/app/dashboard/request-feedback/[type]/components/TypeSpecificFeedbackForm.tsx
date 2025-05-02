'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RequestType } from '~/types';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Input } from "~/components/ui/input";

interface TypeSpecificFeedbackFormProps {
  type: RequestType;
}

const typeConfigs = {
  resume: {
    title: 'Resume Feedback',
    description: 'Share your resume to get constructive feedback from the community.',
    urlPlaceholder: 'https://docs.google.com/document/...',
    textPlaceholder: 'Paste your resume content here...',
    contextPlaceholder: 'What specific aspects of your resume would you like feedback on?',
  },
  linkedin: {
    title: 'LinkedIn Profile Feedback',
    description: 'Share your LinkedIn profile to get feedback on your professional presence.',
    urlPlaceholder: 'https://www.linkedin.com/in/...',
    textPlaceholder: 'Paste your LinkedIn profile content here...',
    contextPlaceholder: 'What aspects of your LinkedIn profile would you like feedback on?',
  },
  portfolio: {
    title: 'Portfolio Feedback',
    description: 'Share your portfolio to get feedback on your work presentation.',
    urlPlaceholder: 'https://your-portfolio.com',
    textPlaceholder: 'Paste your portfolio content here...',
    contextPlaceholder: 'What aspects of your portfolio would you like feedback on?',
  },
  coverletter: {
    title: 'Cover Letter Feedback',
    description: 'Share your cover letter to get feedback on its effectiveness.',
    urlPlaceholder: 'https://docs.google.com/document/...',
    textPlaceholder: 'Paste your cover letter content here...',
    contextPlaceholder: 'What aspects of your cover letter would you like feedback on?',
  },
  email: {
    title: 'Cold Email Feedback',
    description: 'Share your cold email to get feedback on its impact.',
    urlPlaceholder: 'https://docs.google.com/document/...',
    textPlaceholder: 'Paste your cold email content here...',
    contextPlaceholder: 'What aspects of your cold email would you like feedback on?',
  },
};

export const TypeSpecificFeedbackForm: React.FC<TypeSpecificFeedbackFormProps> = ({ type }) => {
  const router = useRouter();
  const [contentUrl, setContentUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);

  const config = typeConfigs[type];

  const handleNext = () => {
    if (!contentUrl && !contentText) {
      setError("Please provide either a URL or text content for feedback.");
      return;
    }

    // Store the form data in session storage
    sessionStorage.setItem('feedbackRequest', JSON.stringify({
      type,
      contentUrl,
      contentText,
      context,
    }));

    // Navigate to community selection
    router.push(`/dashboard/request-feedback/${type}/communities`);
  };

  const handleContentUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentUrl(e.target.value);
    setError(null);
  };

  const handleContentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentText(e.target.value);
    setError(null);
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContext(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard/request-feedback">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      {/* Request Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Content URL Input */}
            <div className="space-y-2">
              <Label htmlFor="contentUrl">Content URL (if applicable)</Label>
              <Input
                id="contentUrl"
                type="url"
                placeholder={config.urlPlaceholder}
                value={contentUrl}
                onChange={handleContentUrlChange}
              />
            </div>

            {/* Content Text Input */}
            <div className="space-y-2">
              <Label htmlFor="contentText">Content Text (if applicable)</Label>
              <Textarea
                id="contentText"
                placeholder={config.textPlaceholder}
                value={contentText}
                onChange={handleContentTextChange}
                rows={6}
              />
            </div>

            {/* Context Input */}
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea
                id="context"
                placeholder={config.contextPlaceholder}
                value={context}
                onChange={handleContextChange}
                rows={4}
              />
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleNext}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                Next: Select Communities
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 