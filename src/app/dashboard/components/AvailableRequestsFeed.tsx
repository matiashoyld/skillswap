'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '~/trpc/react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import type { RouterOutputs } from '~/trpc/react';
import { FileText, Link as LinkIcon, Mail, Briefcase, FileCheck, Filter, AlertCircle } from 'lucide-react';
import type { RequestType, RequestStatus } from '~/types';
import { formatDistanceToNow } from 'date-fns';

// Helper function to map RequestType (lowercase string from API) to icon
const getRequestTypeIcon = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return <LinkIcon className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />; // Use 'email'
    case 'resume': return <FileText className="h-4 w-4" />;
    case 'portfolio': return <Briefcase className="h-4 w-4" />;
    case 'coverletter': return <FileCheck className="h-4 w-4" />; // Use 'coverletter'
    default: return null;
  }
};

// Helper function to map RequestType (lowercase string from API) to label
const getRequestTypeLabel = (type: RequestType) => {
  switch (type) {
    case 'linkedin': return 'LinkedIn';
    case 'email': return 'Cold Email'; // Use 'email'
    case 'resume': return 'Resume';
    case 'portfolio': return 'Portfolio';
    case 'coverletter': return 'Cover Letter'; // Use 'coverletter'
    default: return 'Unknown Type';
  }
};

// Helper function to map RequestStatus (lowercase string from API) to badge classes
// Returns a string of Tailwind classes
const getStatusBadgeClasses = (status: RequestStatus): string => {
  switch (status) {
    case 'pending': 
      return 'bg-status-pending text-brand-dark'; // Yellow background, dark text
    case 'in_progress': 
      return 'bg-status-inprogress text-brand-dark'; // Blue background, dark text
    case 'completed': 
      return 'bg-status-completed text-brand-dark'; // Green background, dark text
    default: 
      return 'bg-ui-gray text-brand-dark'; // Default gray
  }
};

// Define the type for a single request item based on the tRPC output
type AvailableRequestItem = RouterOutputs['feedback']['getAvailableRequests'][number];

export const AvailableRequestsFeed: React.FC = () => {
  const { data: requests, isLoading: requestsLoading, error: requestsError } = api.feedback.getAvailableRequests.useQuery();
  const { data: communitiesData, isLoading: communitiesLoading, error: communitiesError } = api.community.getAllCommunities.useQuery();

  // State for filters - use string type only, as 'all' is included
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const communities = useMemo(() => {
    if (!communitiesData) return [];
    // Assuming joinedCommunities and availableCommunities items have id and name
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
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
        <h2 className="text-xl font-semibold text-gray-900">Available Requests</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedCommunityId} onValueChange={(value: string) => setSelectedCommunityId(value)}>
            <SelectTrigger className="w-[180px] pl-8">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
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
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Cold Email</SelectItem> {/* Use 'email' */}
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="coverletter">Cover Letter</SelectItem> {/* Use 'coverletter' */}
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
          {filteredRequests.map((request: AvailableRequestItem) => {
            // Log the request ID being used to generate the link
            console.log(`[AvailableRequestsFeed] Generating link for request ID: ${request.id}`); 
            return (
            <Card key={request.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="px-6">
                <div className="flex flex-col space-y-3">
                  {/* Top Row: Badges and Time */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Apply subtle orange background to type badge */}
                      <Badge variant="outline" className="border-transparent bg-ui-orange text-brand-dark flex items-center space-x-1">
                        {getRequestTypeIcon(request.type)}
                        <span>{getRequestTypeLabel(request.type)}</span>
                      </Badge>
                      {/* Community badge can remain secondary or use ui-gray */}
                      <Badge variant="secondary" className="bg-ui-gray text-brand-dark">
                         {request.communityName}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Middle Row: Context/Content Snippet */}
                  {request.context && (
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.context}
                      </p>
                    </div>
                  )}

                  {/* Bottom Row: Status and Action Button */}
                  <div className="flex justify-between items-center pt-2">
                     {/* Apply dynamic status colors */}
                     <Badge variant="outline" className={`border-transparent ${getStatusBadgeClasses(request.status)}`}>
                        {request.status.replace('_', ' ')} 
                     </Badge>

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/give-feedback/${request.id}`}>
                        Give Feedback
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}; 