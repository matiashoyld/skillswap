"use client"

import { TrendingUp, Plus, FileText, LucideLink, Mail, Briefcase, FileCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { CREDIT_COSTS, RATING_REWARDS, type RequestType, type User, type FeedbackRating } from "../../../types"
import NextLink from "next/link"

type CreditBalanceProps = {
  currentUser: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'credits' | 'imageUrl'> | null | undefined;
};

export function CreditBalance({ currentUser }: CreditBalanceProps) {
  const requestTypes: { type: RequestType; icon: typeof FileText; label: string }[] = [
    { type: "linkedin", icon: LucideLink, label: "LinkedIn Profile" },
    { type: "email", icon: Mail, label: "Cold Email" },
    { type: "resume", icon: FileText, label: "Resume" },
    { type: "portfolio", icon: Briefcase, label: "Portfolio" },
    { type: "coverletter", icon: FileCheck, label: "Cover Letter" },
  ]

  if (!currentUser) {
    return (
      <Card className="transition-all duration-300 overflow-hidden">
        <CardHeader className="p-0">
          <div className="bg-brand-subtle-bg text-brand-primary p-4">
            <CardTitle>Credit Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg overflow-hidden pt-0">
      <CardHeader className="p-0">
        <div className="bg-brand-subtle-bg text-brand-primary p-4">
          <div className="flex justify-between items-center">
            <CardTitle>Credit Balance</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available Credits</span>
            <span className="text-3xl font-bold text-brand-primary">{currentUser.credits}</span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-brand-primary mb-2">Request Cost and Rewards</h4>
              <div className="space-y-2">
                {requestTypes.map(({ type, icon: Icon, label }) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 text-brand-primary mr-2" />
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <span className="font-medium text-brand-primary">{CREDIT_COSTS[type]} credits</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-brand-primary mb-2">Feedback Rewards</h4>
              <div className="space-y-2">
                {Object.entries(RATING_REWARDS)
                  .reverse()
                  .map(([ratingKey, reward]) => {
                    const rating = parseInt(ratingKey, 10) as FeedbackRating
                    let ratingLabel = ""
                    switch (rating) {
                      case 5:
                        ratingLabel = "Super Insightful"
                        break
                      case 4:
                        ratingLabel = "Helpful"
                        break
                      case 3:
                        ratingLabel = "Okay"
                        break
                    }

                    if (!ratingLabel) return null;

                    return (
                      <div key={rating} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full mr-2 text-xs font-semibold ${rating >= 4 ? "bg-green-100 text-green-700" : rating === 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                          >
                            {rating}
                          </span>
                          <span className="text-gray-600">{ratingLabel}</span>
                        </div>
                        <span
                          className={`font-medium ${reward > 0 ? "text-green-600" : reward < 0 ? "text-red-600" : "text-gray-600"}`}
                        >
                          {reward > 0 ? `+${reward}` : reward} credits
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 