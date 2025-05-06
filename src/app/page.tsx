import Link from "next/link";
import { MessageSquare, Star, Users } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  let currentUserData = null;
  if (user) {
    const context = await createTRPCContext();
    const caller = createCaller(context);
    currentUserData = await caller.user.getCurrent();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--indigo-50)] to-white text-gray-900">
      <header className="bg-brand-subtle-bg px-4 py-6">
        <nav className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-xl font-bold text-gray-900">SkillSwap</span>
            </Link>
          </div>
          <div className="space-x-4">
            {currentUserData ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <SignOutButton redirectUrl="/" />
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="bg-brand-subtle-bg relative overflow-hidden px-4 py-20">
          <div className="relative z-10 container mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              Level Up Your Career with Peer Feedback
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
              Join a community of professionals helping each other improve
              through actionable feedback on resumes, portfolios, and more.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Now
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-white px-4 py-16">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-dark mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Expert Feedback
                  </h3>
                  <p className="text-gray-600">
                    Get detailed feedback from professionals in your field
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-dark mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Credit System</h3>
                  <p className="text-gray-600">
                    Earn credits by helping others, spend them on feedback
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-brand-dark mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Active Community
                  </h3>
                  <p className="text-gray-600">
                    Join specialized communities for targeted feedback
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full bg-gradient-to-b from-white to-[var(--indigo-50)] py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter text-gray-900 md:text-4xl/tight">
                Latest Activity
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See the latest posts and interactions within the community.
              </p>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4">
              {/* Placeholder for latest activity or remove this section */}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white px-4 py-12">
        <div className="container mx-auto text-center text-gray-600">
          <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
