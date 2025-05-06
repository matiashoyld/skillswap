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
import { api } from "~/trpc/react";
import { Checkbox } from "~/components/ui/checkbox";

export const ResumeFeedbackForm: React.FC = () => {
  const router = useRouter();
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl && !resumeText) {
      setError("Please provide either a URL or text content for feedback.");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      type: "resume",
      contentUrl: resumeUrl,
      contentText: resumeText,
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
          <CardTitle>Resume Feedback</CardTitle>
          <CardDescription>Share your resume to get constructive feedback from the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL (if applicable)</Label>
              <Input id="resumeUrl" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://docs.google.com/document/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeText">Resume Text (if applicable)</Label>
              <Textarea id="resumeText" value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={12} className="h-[500px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea id="context" value={context} onChange={e => setContext(e.target.value)} placeholder="What specific aspects of your resume would you like feedback on?" rows={4} />
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