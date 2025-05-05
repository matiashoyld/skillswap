"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";

export default function SelectCommunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read request data from URL params
  const requestType = searchParams.get("type") ?? "";
  const contentUrl = searchParams.get("contentUrl") ?? "";
  const contentText = searchParams.get("contentText") ?? "";
  const context = searchParams.get("context") ?? "";

  // Fetch only joined communities
  const { data: communities, isLoading } = api.community.list.useQuery();

  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend to create the feedback request
    await api.feedback.createRequest.mutateAsync({
      requestType,
      contentUrl: contentUrl || undefined,
      contentText: contentText || undefined,
      context,
      communityIds: selected,
    });
    router.push("/dashboard?tab=my-requests");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Select Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              {communities?.map((community) => (
                <label key={community.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selected.includes(community.id)}
                    onCheckedChange={() => handleToggle(community.id)}
                  />
                  <span>{community.name}</span>
                </label>
              ))}
            </div>
            <Button type="submit" disabled={selected.length === 0}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 