import { format } from "date-fns";
import Image from 'next/image';

interface ProfileCardProps {
  imageUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  aboutMe?: string;
  communities: string[];
  feedbackGiven: number;
  memberSince: Date;
}

export function ProfileCard({
  imageUrl,
  firstName,
  lastName,
  email,
  aboutMe = "Hi, I'm a professional looking to give and receive feedback!", // TODO: replace with user's about me when we have that implemented
  communities,
  feedbackGiven,
  memberSince,
}: ProfileCardProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Anonymous";
  const formattedDate = format(memberSince, "MMM yyyy");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
      {/* Profile Picture */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
        <Image
          src={imageUrl ?? "/default-avatar.png"}
          alt={`${fullName}'s profile picture`}
          width={96}
          height={96}
          className="rounded-full"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Name and Contact */}
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{fullName}</h3>
      <p className="text-gray-600 mb-4">{email}</p>

      {/* About Me */}
      <p className="text-gray-600 text-center mb-4">{aboutMe}</p>

      {/* Communities */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {communities.map((community) => (
          <span
            key={community}
            className="px-3 py-1 bg-orange-100 text-gray-900 rounded-full text-sm"
          >
            {community}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Feedback Given</span>
          <span className="text-gray-900">{feedbackGiven}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Member Since</span>
          <span className="text-gray-900">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
} 