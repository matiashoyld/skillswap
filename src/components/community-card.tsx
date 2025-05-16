import { Button } from "~/components/ui/button";
import { Users, UserPlus, UserMinus, ChevronRight } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-2">
          <Link 
            href={`/communities/${community.id}`}
            className="inline-block text-xl font-semibold text-gray-900 hover:text-gray-700"
          >
            {community.name}
          </Link>
          <Link href={`/communities/${community.id}`} className="text-gray-500 hover:text-gray-700">
            <ChevronRight className="h-6 w-6" />
          </Link>
        </div>
        <hr className="my-4" />
        <p className="text-gray-600 mb-4">{community.description}</p>
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{community._count.members} members</span>
          </div>
          {isJoined ? (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLeave}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Joined
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
    </div>
  );
} 