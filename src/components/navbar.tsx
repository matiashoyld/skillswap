import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              SkillSwap
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Button>
            </Link>
            <Link href="/communities">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Communities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 