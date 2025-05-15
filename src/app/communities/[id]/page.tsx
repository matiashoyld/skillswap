"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ProfileCard } from "~/components/profile-card";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "~/components/navbar";

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: community, isLoading } = api.community.getCommunityDetails.useQuery(
    { communityId: id },
    {
      enabled: !!id,
    },
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-12 w-96 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-72 bg-gray-200 rounded mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!community) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1>Community not found</h1>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link
              href="/communities"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
            <p className="text-gray-600">{community.description}</p>
          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {community.members.map((member) => (
            <ProfileCard
              key={member.id}
              imageUrl={member.imageUrl}
              firstName={member.firstName}
              lastName={member.lastName}
              email={member.email}
              communities={member.communities}
              feedbackGiven={member.feedbackGiven}
              memberSince={member.memberSince}
            />
          ))}
        </div>
      </main>
    </>
  );
} 