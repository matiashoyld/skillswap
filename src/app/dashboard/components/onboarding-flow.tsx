"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
// Remove useApp import
// import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Users, Sparkles, ChevronRight, Check, CheckCircle } from "lucide-react"
// Use relative path for types
// Import the specific DashboardCommunity type
import type { DashboardCommunity } from "../../../types"
import { api } from "../../../trpc/react"; // Import tRPC API

// Define props
type OnboardingFlowProps = {
  communities: DashboardCommunity[]; // Expecting DashboardCommunity type
};

export function OnboardingFlow({ communities }: OnboardingFlowProps) {
  // Removed useApp hook
  // const { state, joinCommunity } = useApp()
  const router = useRouter(); // Initialize router
  const [step, setStep] = useState(1)
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([])

  // tRPC mutation hook
  const completeOnboardingMutation = api.user.completeOnboarding.useMutation({
    onSuccess: () => {
      // On successful mutation, refresh the page data
      router.refresh();
      // The page will re-render, and since hasCompletedOnboarding is now true,
      // the main dashboard will be shown instead of this dialog.
    },
    onError: (error) => {
      // Handle errors (e.g., show a toast notification)
      console.error("Failed to complete onboarding:", error);
      // Consider adding user-facing error feedback here
      alert(`Error completing onboarding: ${error.message}`); // Simple alert for now
    },
  });

  const handleCommunityToggle = (communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId) ? prev.filter((id) => id !== communityId) : [...prev, communityId],
    )
  }

  const handleComplete = () => {
    // Call the tRPC mutation
    completeOnboardingMutation.mutate({ communityIds: selectedCommunities });
  }

  // Use communities prop directly for loading state check
  if (!communities) { // Or check communities.length === 0 if it should always be an array
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 text-center text-gray-500">
            Loading communities...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center text-2xl">
            <Sparkles className="h-6 w-6 text-brand-primary mr-2" />
            Welcome to SkillSwap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Join Communities</h3>
                <p className="text-gray-600">Connect with peers who share your interests and career goals</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Use communities prop */}
                {communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => handleCommunityToggle(community.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedCommunities.includes(community.id) ? "border-brand-primary" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-brand-primary mr-2" />
                        <h4 className="font-medium">{community.name}</h4>
                      </div>
                      {selectedCommunities.includes(community.id) && <Check className="h-5 w-5 text-brand-primary" />}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{community.description}</p>
                    <div className="mt-2">
                      {/* Assuming memberCount is available, otherwise remove or adjust */}
                      {/* <Badge variant="secondary">{community.memberCount} members</Badge> */}
                      <Badge variant="secondary">Members: {community.memberCount ?? "N/A"}</Badge>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-500">Selected: {selectedCommunities.length} communities</p>
                <Button
                  variant="default"
                  onClick={() => setStep(2)}
                  disabled={selectedCommunities.length === 0}
                  className="flex items-center bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50"
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">You&apos;re All Set!</h3>
                <p className="text-gray-600">We&apos;ve added 3 credits to your account to help you get started</p>
              </div>

              <div className="bg-brand-primary rounded-lg p-6 text-white text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">3 Free Credits</h4>
                <p className="text-white/80">
                  Use your credits to request feedback on your resume, portfolio, or LinkedIn profile
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">What you can do:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Request feedback on your professional materials</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Give feedback to earn more credits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Connect with community members</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Leave feedback on things like:</h4>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Resumes &amp; Portfolios</li>
                  <li>LinkedIn Profiles</li>
                  <li>Cover Letters &amp; Cold Emails</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">How to get started:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Join communities relevant to your industry or function to get tailored feedback.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Receive credits for giving quality feedback, which you&apos;ll use to request your own.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Ready to level up your job application? Let&apos;s go!
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="default"
                  onClick={handleComplete}
                  disabled={completeOnboardingMutation.isPending}
                  className="flex items-center bg-brand-primary hover:bg-brand-primary/90"
                >
                  {completeOnboardingMutation.isPending ? "Saving..." : "Get Started"}
                  {!completeOnboardingMutation.isPending && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 