"use client"

import { useState } from "react"
// Keep these imports as they might be used elsewhere or in future features
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
// Path updated
import { RequestList } from "./request-list"
// Path updated
import { CreditBalance } from "./credit-balance"
// Path updated
import { OnboardingFlow } from "./onboarding-flow"
// Use corrected relative paths for UI components
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Dialog, DialogContent } from "../../../components/ui/dialog"
// Use correct relative path for Avatar components
// Try using the ~/ alias for the src directory
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  MessageSquare,
  Plus,
  FileText,
  LinkIcon,
  Mail,
  Briefcase,
  FileCheck,
  MoreVertical,
  Settings,
  UserCircle,
  UserPlus,
} from "lucide-react"
// Use relative path for types
import type {
  RequestType,
  MyRequestItem,
  AvailableRequestItem,
  // Import the new specific types
  DashboardUser,
  DashboardCommunity,
} from "../../../types";
import { AvailableRequestsFeed } from "./AvailableRequestsFeed"

// Define simpler component props for now
type DashboardProps = {
  initialCurrentUser: DashboardUser; // Use specific dashboard type
  initialCommunities: DashboardCommunity[]; // Use specific dashboard type
  initialMyRequests: MyRequestItem[];
  initialAvailableRequests: AvailableRequestItem[];
}

// Renamed from FeedDashboard
export function Dashboard({
  initialCurrentUser,
  initialCommunities,
  initialMyRequests,
  initialAvailableRequests,
}: DashboardProps) {
  const currentUser = initialCurrentUser
  const communities = initialCommunities
  const myRequests = initialMyRequests
  const availableRequests = initialAvailableRequests

  const searchParams = useSearchParams()
  const router = useRouter()
  const showOnboarding = searchParams.get("onboarding") === "true" && communities.length > 0

  const [activeTab, setActiveTab] = useState<"my-requests" | "available-requests">("my-requests")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger a tRPC mutation to send an invitation email
    alert(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
    setShowInviteModal(false)
  }

  const handleOnboardingComplete = () => {
    // TODO: Add tRPC mutation call here to mark onboarding as complete if needed
    router.push("/dashboard") // Navigate to dashboard (no query param)
  }

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
    <>
      {showOnboarding && (
        <OnboardingFlow
          communities={communities}
        />
      )}

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite a Friend</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your friend will receive 5 credits when they join (3 starter credits + 2 bonus credits for being invited
              by you)!
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Friend&apos;s Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your friend&apos;s email"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button variant="default" type="submit" className="bg-[#0E3638] hover:bg-[#0E3638]/90">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("my-requests")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "my-requests" ? "bg-[#D5E8E9] text-[#0E3638]" : "text-gray-600 hover:text-gray-900"}`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab("available-requests")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "available-requests" ? "bg-[#D5E8E9] text-[#0E3638]" : "text-gray-600 hover:text-gray-900"}`}
              >
                Give Feedback
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5">
              {activeTab === "my-requests" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Your Feedback Requests</h2>
                    <Link href="/request">
                      <Button variant="default" className="flex items-center bg-[#0E3638] hover:bg-[#0E3638]/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Feedback
                      </Button>
                    </Link>
                  </div>

                  {myRequests.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first feedback request
                        </p>
                        <div className="mt-6">
                          <Link href="/request">
                            <Button variant="default" className="bg-[#0E3638] hover:bg-[#0E3638]/90">
                              Request Feedback
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    myRequests.map((request) => {
                      const feedbackCount = request.feedbackCount
                      return (
                        <Card key={request.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded-md bg-[#D5E8E9] text-[#0E3638]">
                                  {getRequestTypeIcon(request.type)}
                                </div>
                                <span className="font-medium text-gray-900">{getRequestTypeLabel(request.type)}</span>
                                <Badge
                                  variant={
                                    request.status === "pending"
                                      ? "outline"
                                      : request.status === "completed"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className={
                                    request.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                      : request.status === "completed"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  }
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(request.createdAt)}</span>
                            </div>

                            {request.context && <p className="mt-2 text-sm text-gray-600">{request.context}</p>}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {feedbackCount} {feedbackCount === 1 ? "feedback" : "feedbacks"}
                              </div>
                              <Link href={`/request/${request.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              ) : (
                <RequestList
                  availableRequests={availableRequests}
                  communities={communities}
                />
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={currentUser?.imageUrl ?? undefined} alt={`${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}'s avatar`} />
                          <AvatarFallback>
                            {(currentUser?.firstName?.[0] ?? '') + (currentUser?.lastName?.[0] ?? '')}
                            {!currentUser?.firstName && !currentUser?.lastName && <UserCircle className="h-full w-full" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{`${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim() || "Anonymous User"}</h3>
                          <p className="text-sm text-gray-500">{currentUser?.email ?? 'No Email'}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>

                        {showUserMenu && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu">
                              <Link
                                href={`/user/${currentUser.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <UserCircle className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                              <Link
                                href="/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      &quot;Hi, I&apos;m a professional looking to give and receive feedback!&quot;
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite a Friend
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <CreditBalance currentUser={currentUser} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 