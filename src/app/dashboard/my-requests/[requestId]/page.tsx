"use client";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ChevronLeft, UserCircle, FileText, Link as LinkIcon, Mail, Briefcase, FileCheck } from "lucide-react";
import Link from "next/link";
import { RequestContentDisplay } from "~/app/dashboard/give-feedback/[requestId]/components/RequestContentDisplay";

// Helper function to map RequestType to icon
const getRequestTypeIcon = (type: string) => {
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
const getRequestTypeLabel = (type: string) => {
  switch (type) {
    case 'linkedin': return 'LinkedIn Profile';
    case 'email': return 'Cold Email';
    case 'resume': return 'Resume';
    case 'portfolio': return 'Portfolio';
    case 'coverletter': return 'Cover Letter';
    default: return 'Unknown Type';
  }
};

export default function MyRequestDetailsPage() {
  const { requestId } = useParams() as { requestId: string };
  const { data: request, isLoading, error } = api.feedback.getRequestById.useQuery({ requestId });

  if (isLoading) return <div>Loading...</div>;
  if (error || !request) return <div>Request not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/dashboard?tab=my-requests" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to My Requests
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-md bg-brand-subtle-bg text-brand-primary">
                {getRequestTypeIcon(request.type)}
              </span>
              <CardTitle>{getRequestTypeLabel(request.type)} Request</CardTitle>
            </div>
          </div>
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
    </div>
  );
} 