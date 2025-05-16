import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <Link 
              href={`/communities/${community.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              {community.name}
            </Link>
            <Link href={`/communities/${community.id}`} className="text-gray-500 hover:text-gray-700">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-600 mb-4 flex-grow">{community.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{community._count.members} members</span>
            </Badge>
            
            {isJoined ? (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={onLeave}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-brand-primary hover:bg-brand-primary/90"
                onClick={onJoin}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 