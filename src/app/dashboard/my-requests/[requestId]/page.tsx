"use client";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ChevronLeft,
  UserCircle,
  FileText,
  Link as LinkIcon,
  Mail,
  Briefcase,
  FileCheck,
  Star as StarIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { RequestContentDisplay } from "~/app/dashboard/give-feedback/[requestId]/components/RequestContentDisplay";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import React, { useState } from "react";
import type { FeedbackRating, RequestDetailsItem as PageRequestDetailsItem } from "~/types";
import { mapPrismaToRating } from "~/types";
import type { mapPrismaToRequestType, mapPrismaToRequestStatus } from "~/types";
import { Badge } from "~/components/ui/badge";
import type { FeedbackEvaluation, FeedbackResponse, User as PrismaUser, Community as PrismaCommunity } from "@prisma/client";

// Helper function to map RequestType to icon
const getRequestTypeIcon = (type: string) => {
  switch (type) {
    case "linkedin":
      return <LinkIcon className="h-5 w-5" />;
    case "email":
      return <Mail className="h-5 w-5" />;
    case "resume":
      return <FileText className="h-5 w-5" />;
    case "portfolio":
      return <Briefcase className="h-5 w-5" />;
    case "coverletter":
      return <FileCheck className="h-5 w-5" />;
    default:
      return null;
  }
};

// Helper function to map RequestType to label
const getRequestTypeLabel = (type: string) => {
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

// Corrected type for individual response item
interface FeedbackResponseWithPopulatedDetails extends FeedbackResponse {
  responder: Pick<PrismaUser, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
  evaluation: (FeedbackEvaluation & { evaluator?: Pick<PrismaUser, 'id' | 'firstName' | 'lastName' | 'imageUrl'> }) | null;
}

// Type for the entire data object returned by the query
interface RequestPageData {
    id: string;
    type: ReturnType<typeof mapPrismaToRequestType>; 
    status: ReturnType<typeof mapPrismaToRequestStatus>; 
    createdAt: Date;
    requester: Pick<PrismaUser, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
    contentUrl: string | null;
    contentText: string | null;
    context: string | undefined | null;
    communities: Pick<PrismaCommunity, 'id' | 'name'>[];
    responses: FeedbackResponseWithPopulatedDetails[];
}

interface FeedbackEvaluationFormProps {
  feedbackResponseId: string;
  requestId: string; 
  currentRating: FeedbackRating | null;
  currentEvaluationText: string | null;
  isAlreadyEvaluated: boolean;
}

const FeedbackEvaluationForm: React.FC<FeedbackEvaluationFormProps> = ({
  feedbackResponseId,
  requestId,
  currentRating,
  currentEvaluationText,
  isAlreadyEvaluated,
}) => {
  const [rating, setRating] = useState<FeedbackRating | null>(currentRating);
  const [evaluationText, setEvaluationText] = useState(currentEvaluationText ?? "");
  const utils = api.useUtils();

  const submitEvaluationMutation = api.feedback.submitEvaluation.useMutation({
    onSuccess: (data) => {
      toast.success("Evaluation Submitted!", {
        description: `The feedback provider earned ${data.awardedCredits} bonus credits.`,
      });
      void utils.feedback.getRequestWithResponsesAndEvaluations.invalidate({ requestId });
      void utils.user.getCurrent.invalidate();
    },
    onError: (error) => {
      toast.error("Evaluation Failed", {
        description: error.message || "Could not submit evaluation. Please try again.",
      });
    },
  });

  // RATING_OPTIONS for this form component
  const FORM_RATING_OPTIONS: { value: FeedbackRating; label: string; stars: number }[] = [
    { value: 5, label: "Super Insightful (+2)", stars: 5 }, 
    { value: 4, label: "Helpful (+1)", stars: 4 },
    { value: 3, label: "Okay (+0)", stars: 3 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.warning("Please select a rating.");
      return;
    }
    submitEvaluationMutation.mutate({
      feedbackResponseId,
      rating,
      responseText: evaluationText.trim() === "" ? null : evaluationText.trim(),
    });
  };

  if (isAlreadyEvaluated) {
    const displayRatingOption = FORM_RATING_OPTIONS.find(opt => opt.value === rating);
    return (
      <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800">Your Rating:</p>
        <div className="my-2 flex items-center">
          {FORM_RATING_OPTIONS.map((opt) => (
            <StarIcon
              key={opt.value}
              className={`h-6 w-6 ${opt.stars <= (FORM_RATING_OPTIONS.find(r => r.value === rating)?.stars ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
           {displayRatingOption && <span className="ml-2 text-sm text-green-700 font-medium">{displayRatingOption.label}</span>}
        </div>
        {currentEvaluationText && (
          <>
            <p className="mt-2 text-sm font-semibold text-green-800">Your Reply:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentEvaluationText}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-md border border-gray-200 p-4">
      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-700">Your Rating:</Label>
        <div className="flex space-x-1">
          {FORM_RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRating(opt.value)}
              className={`rounded-full p-1.5 hover:bg-gray-100 ${rating === opt.value ? "bg-yellow-50" : ""}`}
              aria-label={`Rate ${opt.stars} stars - ${opt.label}`}
            >
              <StarIcon
                className={`h-7 w-7 ${opt.stars <= (FORM_RATING_OPTIONS.find(r => r.value === rating)?.stars ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor={`evaluationText-${feedbackResponseId}`} className="mb-1 block text-sm font-medium text-gray-700">
          Reply to Feedback (Optional):
        </Label>
        <Textarea
          id={`evaluationText-${feedbackResponseId}`}
          value={evaluationText}
          onChange={(e) => setEvaluationText(e.target.value)}
          placeholder="Add a thank you or ask for clarification..."
          rows={3}
          disabled={submitEvaluationMutation.isPending}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!rating || submitEvaluationMutation.isPending} className="bg-brand-primary hover:bg-brand-primary/90">
          {submitEvaluationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Evaluation
        </Button>
      </div>
    </form>
  );
};

export default function MyRequestDetailsPage() {
  const { requestId }: { requestId: string } = useParams();
  const {
    data: requestData,
    isLoading,
    error,
  } = api.feedback.getRequestWithResponsesAndEvaluations.useQuery({ requestId });

  // Cast data to the more specific type after loading and error checks
  const typedRequestData = requestData as RequestPageData | undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-4 w-24" /> 
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="mb-2 h-4 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="mt-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !typedRequestData) { // Use typedRequestData here
        return (
          <div className="container mx-auto max-w-3xl px-4 py-8">
            <Link
              href="/dashboard?tab=my-requests"
              className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to My Requests
            </Link>
            <Card className="py-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Request Not Found
                  </h2>
                  <p className="text-gray-600">
                    {error?.message ?? "The request you're looking for doesn't exist or you don't have permission to view it."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
  }
  
  const { responses, ...request } = typedRequestData;

  // Prepare props for RequestContentDisplay, ensuring it matches RequestDetailsItem or a compatible subset
  const requestDisplayProps: Pick<PageRequestDetailsItem, 'type' | 'contentUrl' | 'contentText'> = {
    type: request.type,
    contentUrl: request.contentUrl,
    contentText: request.contentText,
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard?tab=my-requests"
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to My Requests
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-brand-subtle-bg text-brand-primary rounded-md p-2">
                {getRequestTypeIcon(request.type)}
              </span>
              <CardTitle>{getRequestTypeLabel(request.type)} Request</CardTitle>
            </div>
             <Badge variant={request.status === 'completed' ? 'default' : request.status === 'in_progress' ? 'secondary' : 'outline'}
                className={
                    request.status === 'completed' ? "bg-green-100 text-green-800" :
                    request.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                }
             >
                {request.status === 'pending' ? 'Awaiting Feedback' :
                 request.status === 'in_progress' ? 'Awaiting Your Rating' :
                 request.status === 'completed' ? 'Feedback Rated' : request.status}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <h3 className="mb-1 text-sm font-medium text-gray-700">Original Request Content:</h3>
          <RequestContentDisplay request={requestDisplayProps} /> 
          {request.context && (
            <div>
              <h3 className="mt-4 mb-1 text-sm font-medium text-gray-700">
                Context provided:
              </h3>
              <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 whitespace-pre-wrap">
                {request.context}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold text-gray-900">Feedback Received</h2>
      {responses.length === 0 && request.status === 'pending' && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No feedback has been submitted for this request yet. Still awaiting feedback.</p>
          </CardContent>
        </Card>
      )}
      {responses.length === 0 && request.status !== 'pending' && (
         <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No feedback was submitted for this request.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {responses.map((responseItem) => (
          <Card key={responseItem.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={responseItem.responder.imageUrl ?? undefined} />
                  <AvatarFallback>
                    {responseItem.responder.firstName?.[0]}
                    {responseItem.responder.lastName?.[0]}
                    {!responseItem.responder.firstName && !responseItem.responder.lastName && <UserCircle size={20}/>}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {responseItem.responder.firstName ?? 'Anonymous'} {responseItem.responder.lastName ?? 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Feedback given on {new Date(responseItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-gray-700">{responseItem.feedbackText}</p>
              
              <FeedbackEvaluationForm 
                feedbackResponseId={responseItem.id}
                requestId={request.id}
                currentRating={responseItem.evaluation ? mapPrismaToRating(responseItem.evaluation.rating) : null}
                currentEvaluationText={responseItem.evaluation?.evaluationText ?? null}
                isAlreadyEvaluated={!!responseItem.evaluation}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
