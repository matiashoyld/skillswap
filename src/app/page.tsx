import Link from "next/link";
import { MessageSquare, Star, Users } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-[var(--indigo-50)] to-white text-gray-900">
        <header className="py-6 px-4 bg-[var(--skillswap-light)]">
          <nav className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-gray-900">SkillSwap</span>
              </Link>
            </div>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </nav>
        </header>

        <main>
          <section className="py-20 px-4 bg-[var(--skillswap-light)] relative overflow-hidden">
            <div className="container mx-auto text-center relative z-10">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Level Up Your Career with Peer Feedback
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join a community of professionals helping each other improve through actionable feedback on resumes, portfolios, and more.
              </p>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Start Now
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--skillswap-dark)] flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Expert Feedback</h3>
                    <p className="text-gray-600">
                      Get detailed feedback from professionals in your field
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--skillswap-dark)] flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Credit System</h3>
                    <p className="text-gray-600">
                      Earn credits by helping others, spend them on feedback
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--skillswap-dark)] flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Active Community</h3>
                    <p className="text-gray-600">
                      Join specialized communities for targeted feedback
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-[var(--indigo-50)]">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-gray-900">
                  Latest Activity
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See the latest posts and interactions within the community.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 mt-4">
                {/* Placeholder for latest activity or remove this section */}
              </div>
            </div>
          </section>

        </main>

        <footer className="bg-white py-12 px-4">
          <div className="container mx-auto text-center text-gray-600">
            <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}
