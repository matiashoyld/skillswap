'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import type { RequestDetailsItem, RequestType } from '~/types';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { toast } from "sonner";
import { FileText, Link as LinkIcon, Mail, Briefcase, FileCheck, ChevronLeft, UserCircle, AlertCircle, Loader2 } from 'lucide-react';
import { RequestContentDisplay } from './RequestContentDisplay';
import { CreditsEarnedDialog } from './CreditsEarnedDialog';

// Use RequestDetailsItem defined in types/index.ts
// type FeedbackRequestDetails = NonNullable<RouterOutputs['feedback']['getRequestById']>;

interface GiveFeedbackFormProps {
  request: RequestDetailsItem;
}

// Helper function to map RequestType to icon
const getRequestTypeIcon = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return <LinkIcon className="h-5 w-5" />;
    case 'email': return <Mail className="h-5 w-5" />;
    case 'resume': return <FileText className="h-5 w-5" />;
    case 'portfolio': return <Briefcase className="h-5 w-5" />;
    case 'coverletter': return <FileCheck className="h-5 w-5" />;
    default: return null;
  }
};

// Helper function to map RequestType to label
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

// Component to render the request content based on type
// const RequestContentDisplay: React.FC<{ request: RequestDetailsItem }> = ({ request }) => {
//     // Use request.contentUrl and request.contentText directly
//     const url = request.contentUrl;
//     const text = request.contentText;

//     switch (request.type) {
//       case 'linkedin':
//       case 'portfolio':
//         return (
//           <div className="bg-gray-50 p-3 rounded-md break-words">
//             {url ? (
//               <a
//                 href={url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-brand-primary hover:underline"
//               >
//                 {url}
//               </a>
//             ) : (
//               <span className="text-gray-500 italic">No URL provided</span>
//             )}
//           </div>
//         );
//       case 'email':
//       case 'coverletter': // Assuming cover letter might also be text
//           return (
//             <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-sm text-gray-700">
//               {text ?? <span className="text-gray-500 italic">No text provided</span>}
//             </div>
//           );
//       case 'resume': // Assuming resume uses contentUrl for a file link
//          return (
//            <div className="bg-gray-50 p-3 rounded-md text-center">
//              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//              {url ? (
//                  <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
//                     <Button variant="outline" size="sm">View Resume</Button>
//                  </a>
//              ) : (
//                  <p className="text-sm text-gray-600 italic">No resume file link provided.</p>
//              )}
//              {/* Optionally display contextText if relevant for resumes */}
//              {/* Handled in the main component now */}
//              {/* {text && <p className="text-sm text-gray-500 mt-2">Context: {text}</p>} */}
//            </div>
//          );
//       default:
//         return <p className="text-gray-500 italic">Cannot display content for this request type.</p>;
//     }
//   };

export const GiveFeedbackForm: React.FC<GiveFeedbackFormProps> = ({ request }) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [feedbackText, setFeedbackText] = useState('');
  const [showCreditsEarnedDialog, setShowCreditsEarnedDialog] = useState(false);
  const [creditsEarned, setCreditsEarned] = useState(0);

  const submitFeedbackMutation = api.feedback.submitResponse.useMutation({
    onSuccess: (data) => {
      toast.success("Feedback Submitted!", {
         description: "Thank you for contributing to the community.",
      });
      
      if (data.creditsEarned && data.creditsEarned > 0) {
        setCreditsEarned(data.creditsEarned);
        setShowCreditsEarnedDialog(true);
      }
      
      // Invalidate user query to update credit balance display
      void utils.user.getCurrent.invalidate();

      // Optionally delay navigation or handle it after dialog close
      // For now, let's keep the navigation but it might close the dialog prematurely
      // Consider closing the dialog first then navigating, or navigating from the dialog's close button
      // router.push('/dashboard?tab=give-feedback'); 
    },
    onError: (error) => {
      toast.error("Submission Failed", {
        description: error.message || "Could not submit feedback. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim().length < 10) {
       toast.warning("Feedback Too Short", {
          description: "Please provide at least 10 characters of feedback.",
       });
      return;
    }
    submitFeedbackMutation.mutate({ requestId: request.id, feedbackText });
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Link href="/dashboard?tab=give-feedback">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Available Requests
                </Link>
            </Button>
        </div>

      {/* Request Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-md bg-brand-subtle-bg text-brand-primary">
                 {getRequestTypeIcon(request.type)}
              </span>
              <CardTitle>{getRequestTypeLabel(request.type)} Request</CardTitle>
            </div>
            {/* Optional: Display time ago - consider a utility function */}
            {/* <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span> */}
          </div>
          {/* Requester Info */}
          <div className="flex items-center space-x-2 pt-3 text-sm text-gray-600">
             <Avatar className="h-6 w-6">
                <AvatarImage src={request.requester.imageUrl ?? undefined} />
                <AvatarFallback className="text-xs">
                  {request.requester.firstName?.[0]}{request.requester.lastName?.[0]}
                  {!request.requester.firstName && !request.requester.lastName && <UserCircle size={16}/>}
                </AvatarFallback>
              </Avatar>
              <span>Requested by {request.requester.firstName ?? 'User'}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.context && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">Context provided by requester:</h3>
              <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">{request.context}</p>
            </div>
          )}
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-700">Content to Review:</h3>
            <RequestContentDisplay request={request} />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Submission Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Provide Your Feedback</CardTitle>
          <CardDescription>Share your insights to help the requester improve.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedbackText" className="sr-only">Feedback</Label>
              <Textarea
                id="feedbackText"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your constructive feedback here (min. 10 characters)..."
                rows={8}
                required
                minLength={10}
                className="w-full"
                disabled={submitFeedbackMutation.isPending}
              />
            </div>

            {/* Display mutation error inline if desired */}
            {submitFeedbackMutation.error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission Error</AlertTitle>
                    <AlertDescription>{submitFeedbackMutation.error.message}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitFeedbackMutation.isPending || feedbackText.trim().length < 10}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                {submitFeedbackMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card className="mt-8">
        <CardContent>
          <p className="text-base font-medium text-gray-600 mb-2">
            Tips for providing feedback
          </p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Be specific and actionable</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Be respectful and constructive</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Provide examples where possible</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
      <CreditsEarnedDialog
        isOpen={showCreditsEarnedDialog}
        onOpenChange={(isOpen) => {
          setShowCreditsEarnedDialog(isOpen);
          if (!isOpen) {
            // Navigate when dialog is closed
            router.push('/dashboard?tab=give-feedback');
          }
        }}
        creditsEarned={creditsEarned}
      />
    </>
  );
}; 