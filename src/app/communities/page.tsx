"use client";

import { api } from "~/trpc/react";
import { CommunityCard } from "~/components/community-card";
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Navbar } from "~/components/navbar";

export default function CommunitiesPage() {
  const utils = api.useUtils();
  const { data, isLoading } = api.community.getAllCommunities.useQuery();
  const joinMutation = api.community.joinCommunity.useMutation({
    onSuccess: () => {
      void utils.community.getAllCommunities.invalidate();
      toast.success("Successfully joined community");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const leaveMutation = api.community.leaveCommunity.useMutation({
    onSuccess: () => {
      void utils.community.getAllCommunities.invalidate();
      toast.success("Successfully left community");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (data) {
      console.log("Joined Communities:", data.joinedCommunities.map(c => c.id));
      console.log("Available Communities:", data.availableCommunities.map(c => c.id));
      console.log("All Communities Data:", data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg" />
          ))}
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Communities</h1>
        <p className="text-gray-600">Failed to load communities</p>
      </main>
    );
  }

  const { joinedCommunities, availableCommunities } = data;

  return (
    <>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Communities</h1>
            </div>
            <Button variant="outline" className="bg-white text-black border-gray-300" asChild>
              <Link href="https://forms.gle/1ZwPtAwLGiuzqWaA7" target="_blank" rel="noopener noreferrer">
                <Plus className="mr-2 h-4 w-4" /> Propose New Community
              </Link>
            </Button>
          </div>
        </div>
        
        {joinedCommunities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Communities</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {joinedCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isJoined={true}
                  onJoin={() => { /* Already joined, no action */ }}
                  onLeave={() => leaveMutation.mutate({ communityId: community.id })}
                />
              ))}
            </div>
          </section>
        )}

        {availableCommunities.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Available Communities</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isJoined={false}
                  onJoin={() => joinMutation.mutate({ communityId: community.id })}
                  onLeave={() => { /* Not joined, no action to leave */ }}
                />
              ))}
            </div>
          </section>
        )}

        {joinedCommunities.length === 0 && availableCommunities.length === 0 && (
          <p className="text-gray-600">No communities available</p>
        )}
      </main>
    </>
  );
} 