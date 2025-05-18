'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Removed unused import
import { api } from '~/trpc/react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { RouterOutputs } from '~/trpc/react';
import { 
  FileText, 
  Link as LinkIcon, 
  Mail, 
  Briefcase, 
  FileCheck, 
  Filter, 
  AlertCircle, 
} from 'lucide-react';
import type { RequestType, RequestStatus } from '~/types';
import { formatDistanceToNow } from 'date-fns';

// Helper function to map RequestType (lowercase string from API) to icon
const getRequestTypeIcon = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return <LinkIcon className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'resume': return <FileText className="h-4 w-4" />;
    case 'portfolio': return <Briefcase className="h-4 w-4" />;
    case 'coverletter': return <FileCheck className="h-4 w-4" />;
    default: return <Mail className="h-4 w-4" />;
  }
};

// Helper function to map RequestType (lowercase string from API) to label
const getRequestTypeLabel = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return 'LinkedIn';
    case 'email': return 'Cold Email';
    case 'resume': return 'Resume';
    case 'portfolio': return 'Portfolio';
    case 'coverletter': return 'Cover Letter';
    default: return 'Unknown Type';
  }
};

// Helper function to map RequestStatus (lowercase string from API) to badge classes
// Returns a string of Tailwind classes
// const getStatusBadgeClasses = (status: RequestStatus): string => { // Removed unused function
//   switch (status) {
//     case 'pending': 
//       return 'bg-status-pending text-brand-dark';
//     case 'in_progress': 
//       return 'bg-status-inprogress text-brand-dark';
//     case 'completed': 
//       return 'bg-status-completed text-brand-dark';
//     default: 
//       return 'bg-ui-gray text-brand-dark';
//   }
// };

// Define the type for a single request item based on the tRPC output
type AvailableRequestItem = RouterOutputs['feedback']['getAvailableRequests'][number];

// Inner Card Component based on user's example
interface RequestCardProps {
  request: AvailableRequestItem;
}

const SingleRequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const typeLabel = getRequestTypeLabel(request.type);
  const daysAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });
  const requesterName = `${request.requester.firstName ?? ''} ${request.requester.lastName ?? ''}`.trim() || 'User';
  const requesterInitial = (request.requester.firstName ? request.requester.firstName.charAt(0) : requesterName.charAt(0)).toUpperCase();

  const getStatusColorClass = (status: RequestStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-status-pending text-brand-dark';
      case 'in_progress':
        return 'bg-status-in-progress text-brand-dark';
      case 'completed':
        return 'bg-status-completed text-brand-dark';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  let statusLabel: string;
  const statusColorClass = getStatusColorClass(request.status);

  switch (request.status) {
    case 'pending':
      statusLabel = "Awaiting Feedback";
      break;
    case 'in_progress':
      statusLabel = "Awaiting Feedback Rating";
      break;
    case 'completed':
      statusLabel = "Feedback Rated";
      break;
    default:
      statusLabel = request.status;
      break;
  }

  return (
    <Card
      className="py-0 overflow-hidden transition-all duration-200 hover:shadow-md border-neutral-100"
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-50 text-neutral-700">
              {getRequestTypeIcon(request.type)}
            </div>
            <span className="text-sm font-medium text-neutral-900">{typeLabel}</span>
            <Badge
              variant="outline"
              className="ml-1 text-xs font-normal text-neutral-500 bg-neutral-50 hover:bg-neutral-100 border-neutral-100"
            >
              {request.communityName}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              {daysAgo}
            </span>
          </div>
        </div>

        {request.context && (
          <div className="text-sm text-neutral-700 line-clamp-2">
            {request.context}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={request.status === "pending" || request.status === "in_progress" ? "outline" : "default"}
              className={statusColorClass}
            >
              {statusLabel}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Requested by</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  {request.requester.imageUrl ? (
                    <AvatarImage src={request.requester.imageUrl} alt={requesterName} />
                  ) : null}
                  <AvatarFallback className="bg-neutral-200 text-[10px] font-medium text-neutral-700">
                    {requesterInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-neutral-900">{requesterName}</span>
              </div>
            </div>
          </div>

          {request.status === 'pending' ? (
          <Button
            asChild
            className={`text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-900 hover:text-white`}
            size="sm"
          >
            <Link href={`/dashboard/give-feedback/${request.id}`}>Give Feedback</Link>
          </Button>
          ) : request.status === 'in_progress' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium cursor-default"
              disabled
            >
              Feedback Submitted
            </Button>
          ) : request.status === 'completed' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium cursor-default text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
              disabled
            >
              Feedback Rated
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export const AvailableRequestsFeed: React.FC = () => {
  const { data: requests, isLoading: requestsLoading, error: requestsError } = api.feedback.getAvailableRequests.useQuery();
  const { data: communitiesData, isLoading: communitiesLoading, error: communitiesError } = api.community.getAllCommunities.useQuery();

  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const communities = useMemo(() => {
    if (!communitiesData) return [];
    return [...communitiesData.joinedCommunities, ...communitiesData.availableCommunities];
  }, [communitiesData]);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter((request: AvailableRequestItem) => {
      const communityMatch = selectedCommunityId === 'all' || request.communityId === selectedCommunityId;
      const typeMatch = selectedType === 'all' || request.type === selectedType;
      return communityMatch && typeMatch;
    });
  }, [requests, selectedCommunityId, selectedType]);

  if (requestsLoading || communitiesLoading) {
    return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
  }

  if (requestsError) {
    return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Requests</AlertTitle>
          <AlertDescription>
            Failed to load available requests: {requestsError.message}
          </AlertDescription>
        </Alert>
      );
  }

  if (communitiesError) {
    return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Communities</AlertTitle>
          <AlertDescription>
            Failed to load communities: {communitiesError.message}
          </AlertDescription>
        </Alert>
      );
  }

  if (!requests || requests.length === 0) {
     return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">No Requests Available</h3>
              <p className="text-gray-500 mt-1">There are currently no feedback requests available in your communities.</p>
            </div>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedCommunityId} onValueChange={(value: string) => setSelectedCommunityId(value)}>
            <SelectTrigger className="w-[180px] pl-8">
              <SelectValue placeholder="Filter Community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(value: string) => setSelectedType(value)}>
            <SelectTrigger className="w-[150px] pl-8">
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Cold Email</SelectItem>
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="coverletter">Cover Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
         <Card>
           <CardContent className="py-8">
             <div className="text-center">
               <p className="text-gray-500">No requests match your current filters.</p>
             </div>
           </CardContent>
         </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request: AvailableRequestItem) => (
            <SingleRequestCard 
              key={request.id} 
              request={request} 
            />
          ))}
        </div>
      )}
    </div>
  );
}; 