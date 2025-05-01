import { Button } from "~/components/ui/button";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { type Community } from "@prisma/client";
import Link from "next/link";

interface CommunityCardProps {
  community: Community & {
    _count: {
      members: number;
    };
  };
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export function CommunityCard({ community, isJoined, onJoin, onLeave }: CommunityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href={`/communities/${community.id}`}
            className="inline-block text-xl font-semibold mb-2 text-gray-900 hover:text-gray-700"
          >
            {community.name}
          </Link>
          <p className="text-gray-600 mb-4">{community.description}</p>
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{community._count.members} members</span>
          </div>
        </div>
        {isJoined ? (
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLeave}
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Unjoin
          </Button>
        ) : (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onJoin}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join
          </Button>
        )}
      </div>
    </div>
  );
} 