"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ChevronLeft, AlertCircle } from "lucide-react";

export const LinkedinFeedbackForm: React.FC = () => {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl) {
      setError("Please provide your LinkedIn profile URL.");
      return;
    }
    setError(null);
    // TODO: handle submit
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
          <CardTitle>LinkedIn Profile Feedback</CardTitle>
          <CardDescription>Share your LinkedIn profile to get feedback on your professional presence.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="profileUrl">LinkedIn Profile URL</Label>
              <Input id="profileUrl" value={profileUrl} onChange={e => setProfileUrl(e.target.value)} placeholder="https://www.linkedin.com/in/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea id="context" value={context} onChange={e => setContext(e.target.value)} placeholder="What aspects of your LinkedIn profile would you like feedback on?" rows={4} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 