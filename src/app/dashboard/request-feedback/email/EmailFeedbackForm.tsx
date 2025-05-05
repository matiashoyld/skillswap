"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChevronLeft, AlertCircle } from "lucide-react";

export const EmailFeedbackForm: React.FC = () => {
  const router = useRouter();
  const [emailText, setEmailText] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText) {
      setError("Please provide your cold email content.");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      type: "email",
      contentText: emailText,
      context,
    });
    router.push(`/dashboard/request-feedback/select-communities?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard/request-feedback">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cold Email Feedback</CardTitle>
          <CardDescription>Share your cold email to get feedback on its impact.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="emailText">Email Text</Label>
              <Textarea id="emailText" value={emailText} onChange={e => setEmailText(e.target.value)} placeholder="Paste your cold email content here..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea id="context" value={context} onChange={e => setContext(e.target.value)} placeholder="What aspects of your cold email would you like feedback on?" rows={4} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">Next: Select Communities</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 