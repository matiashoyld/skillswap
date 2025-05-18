'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import type { RequestType } from '~/types';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { toast } from "sonner";
import { FileText, Link as LinkIcon, Mail, Briefcase, FileCheck, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";

interface RequestFeedbackFormProps {
  communities: Array<{ id: string; name: string }>;
}

export const RequestFeedbackForm: React.FC<RequestFeedbackFormProps> = ({ communities }) => {
  const router = useRouter();
  const [requestType, setRequestType] = useState<RequestType>('resume');
  const [contentUrl, setContentUrl] = useState('');
  const [contentText, setContentText] = useState('');
  const [context, setContext] = useState('');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  const submitRequestMutation = api.feedback.createRequest.useMutation({
    onSuccess: () => {
      toast.success("Request Submitted!", {
        description: "Your feedback request has been created successfully.",
      });
      router.push('/dashboard?tab=my-requests');
    },
    onError: (error) => {
      toast.error("Submission Failed", {
        description: error.message || "Could not submit request. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedCommunities.length === 0) {
      toast.warning("No Communities Selected", {
        description: "Please select at least one community to request feedback from.",
      });
      return;
    }

    if (!contentUrl && !contentText) {
      toast.warning("No Content Provided", {
        description: "Please provide either a URL or text content for feedback.",
      });
      return;
    }

    submitRequestMutation.mutate({
      requestType,
      contentUrl: contentUrl || undefined,
      contentText: contentText || undefined,
      context,
      communityIds: selectedCommunities,
    });
  };

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleContentUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentUrl(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* Request Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Request Feedback</CardTitle>
          <CardDescription>Submit your content for review by community members.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="requestType">What would you like feedback on?</Label>
              <Select
                value={requestType}
                onValueChange={(value) => setRequestType(value as RequestType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Resume
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      LinkedIn Profile
                    </div>
                  </SelectItem>
                  <SelectItem value="portfolio">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Portfolio
                    </div>
                  </SelectItem>
                  <SelectItem value="coverletter">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Cover Letter
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Cold Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content URL Input */}
            <div className="space-y-2">
              <Label htmlFor="contentUrl">Content URL (if applicable)</Label>
              <Input
                id="contentUrl"
                type="url"
                placeholder="https://..."
                value={contentUrl}
                onChange={handleContentUrlChange}
                disabled={submitRequestMutation.isPending}
              />
            </div>

            {/* Content Text Input */}
            <div className="space-y-2">
              <Label htmlFor="contentText">Content Text (if applicable)</Label>
              <Textarea
                id="contentText"
                placeholder="Paste your content here..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={6}
                disabled={submitRequestMutation.isPending}
              />
            </div>

            {/* Context Input */}
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea
                id="context"
                placeholder="What specific aspects would you like feedback on?"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                disabled={submitRequestMutation.isPending}
              />
            </div>

            {/* Community Selection */}
            <div className="space-y-2">
              <Label>Select Communities</Label>
              <div className="space-y-2">
                {communities.map((community) => (
                  <div key={community.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`community-${community.id}`}
                      checked={selectedCommunities.includes(community.id)}
                      onCheckedChange={() => handleCommunityToggle(community.id)}
                      disabled={submitRequestMutation.isPending}
                    />
                    <Label htmlFor={`community-${community.id}`} className="text-sm font-normal">
                      {community.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Display mutation error if any */}
            {submitRequestMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Submission Error</AlertTitle>
                <AlertDescription>{submitRequestMutation.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitRequestMutation.isPending}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                {submitRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 