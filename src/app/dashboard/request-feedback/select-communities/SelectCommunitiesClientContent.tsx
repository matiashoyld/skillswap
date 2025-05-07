"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

// Renamed from SelectCommunitiesPage, contains the original page logic
export default function SelectCommunitiesClientContent() { 
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read request data from URL params
  const requestType = searchParams.get("type") ?? "";
  const contentUrl = searchParams.get("contentUrl") ?? "";
  const contentText = searchParams.get("contentText") ?? "";
  const context = searchParams.get("context") ?? "";

  // Fetch only joined communities
  const { data: communities, isLoading } =
    api.community.getAllCommunities.useQuery();

  const [selected, setSelected] = useState<string[]>([]);

  const submitRequestMutation = api.feedback.createRequest.useMutation({
    onSuccess: () => router.push("/dashboard?tab=my-requests"),
    onError: (error) => {
      // Parse the error message if it's a JSON string
      try {
        const errors = JSON.parse(error.message) as Array<{ message: string }>;
        // Display the first error message in a user-friendly way
        if (Array.isArray(errors) && errors.length > 0 && errors[0]?.message) {
          console.log(errors[0].message)
          toast.error(errors[0].message);
        } else {
          toast.error(error.message);
        }
      } catch {
        // If parsing fails, show the original error message
        toast.error(error.message);
      }
    },
  });

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend to create the feedback request
    submitRequestMutation.mutate({
      requestType: requestType as
        | "linkedin"
        | "email"
        | "resume"
        | "portfolio"
        | "coverletter",
      contentUrl: contentUrl || undefined,
      contentText: contentText || undefined,
      context,
      communityIds: selected,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add check for empty communities
  if (!communities?.joinedCommunities.length) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Communities Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven&apos;t joined any communities yet. Join a community to
              request feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Select Communities</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              {communities?.joinedCommunities.map((community) => (
                <label
                  key={community.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    checked={selected.includes(community.id)}
                    onCheckedChange={() => handleToggle(community.id)}
                    disabled={submitRequestMutation.isPending}
                  />
                  <span>{community.name}</span>
                </label>
              ))}
            </div>
            <Button 
              type="submit" 
              disabled={selected.length === 0 || submitRequestMutation.isPending}
            >
              {submitRequestMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 