"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import type {
  RequestType,
  Community,
  FeedbackRequest,
  RequestStatus,
} from "../../../types"
import { FileText, LinkIcon, Mail, Briefcase, FileCheck, Filter } from "lucide-react"

// Define props
type RequestListProps = {
  // Expecting data fetched in the parent
  availableRequests: any[]
  communities: any[]
}

// Define a more specific type for the request item used in the map function
type AvailableRequestItem = any

// Renamed from RequestFeed
export function RequestList({ availableRequests, communities }: RequestListProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string | "all">("all")
  const [selectedType, setSelectedType] = useState<RequestType | "all">("all")

  // Use availableRequests prop directly - already sorted by backend (oldest first)
  const sortedRequests = availableRequests

  // Filter requests by community and type
  const filteredRequests = sortedRequests.filter((request: AvailableRequestItem) => {
    // communityId is now directly on the request object from the backend mapping
    const communityMatch = selectedCommunity === "all" || request.communityId === selectedCommunity
    const typeMatch = selectedType === "all" || request.type === selectedType
    return communityMatch && typeMatch
  })

  const getRequestTypeIcon = (type: RequestType) => {
    switch (type) {
      case "linkedin":
        return <LinkIcon className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "resume":
        return <FileText className="h-4 w-4" />
      case "portfolio":
        return <Briefcase className="h-4 w-4" />
      case "coverletter":
        return <FileCheck className="h-4 w-4" />
    }
  }

  const getRequestTypeLabel = (type: RequestType) => {
    switch (type) {
      case "linkedin":
        return "LinkedIn Profile"
      case "email":
        return "Cold Email"
      case "resume":
        return "Resume"
      case "portfolio":
        return "Portfolio"
      case "coverletter":
        return "Cover Letter"
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              className="pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3638]"
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value as string | "all")}
            >
              <option value="all">All Communities</option>
              {communities.map((community: any) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>

          <div className="relative">
            <select
              className="pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3638]"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as RequestType | "all")}
            >
              <option value="all">All Types</option>
              <option value="linkedin">LinkedIn</option>
              <option value="email">Cold Email</option>
              <option value="resume">Resume</option>
              <option value="portfolio">Portfolio</option>
              <option value="coverletter">Cover Letter</option>
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-500">No requests match your filters or available in your communities.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request: AvailableRequestItem) => (
            <Card key={request.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="flex items-center space-x-1 bg-[#0E3638]">
                        {getRequestTypeIcon(request.type)}
                        <span>{getRequestTypeLabel(request.type)}</span>
                      </Badge>
                      <Badge variant="secondary">{request.communityName}</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(request.createdAt)}</span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.context || "No additional context provided"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800"
                        : request.status === "completed" ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>

                    <Link href={`/feedback/${request.id}`}>
                      <Button variant="outline" size="sm">
                        Give Feedback
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 