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
} from "lucide-react";
import Link from "next/link";
import { RequestContentDisplay } from "~/app/dashboard/give-feedback/[requestId]/components/RequestContentDisplay";
import { Skeleton } from "~/components/ui/skeleton";

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

export default function MyRequestDetailsPage() {
  const { requestId }: { requestId: string } = useParams();
  const {
    data: request,
    isLoading,
    error,
  } = api.feedback.getRequestById.useQuery({ requestId });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-4 w-24" /> {/* Back button skeleton */}
        <Card>
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
            <div>
              <Skeleton className="mb-2 h-4 w-36" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (error || !request) {
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
                The request you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          </div>
          <div className="flex items-center space-x-2 pt-3 text-sm text-gray-600">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.requester.imageUrl ?? undefined} />
              <AvatarFallback className="text-xs">
                {request.requester.firstName?.[0]}
                {request.requester.lastName?.[0]}
                {!request.requester.firstName &&
                  !request.requester.lastName && <UserCircle size={16} />}
              </AvatarFallback>
            </Avatar>
            <span>Requested by {request.requester.firstName ?? "User"}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <RequestContentDisplay request={request} />
          </div>
          {request.context && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-700">
                Context provided by requester:
              </h3>
              <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                {request.context}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
