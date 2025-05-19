import { Dashboard } from "./components/dashboard";
import { createCaller } from "../../server/api/root";
import { createTRPCContext } from "../../server/api/trpc";
import { OnboardingFlow } from "./components/onboarding-flow";
import { Navbar } from "~/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { DashboardCommunity } from "~/types";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const context = await createTRPCContext();
  const caller = createCaller(context);

  const dbUser = await caller.user.getCurrent();

  if (!dbUser.hasCompletedOnboarding) {
    const allCommunitiesData = await caller.community.getAllCommunities();
    const communitiesForOnboarding: DashboardCommunity[] = allCommunitiesData.availableCommunities.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      memberCount: c._count.members,
    }));

    return <OnboardingFlow communities={communitiesForOnboarding} />;
  }

  const [allCommunitiesData_main, myRequests] = await Promise.all([
    caller.community.getAllCommunities(),
    caller.feedback.getMyRequests(),
  ]);

  const communitiesForDashboard: DashboardCommunity[] = [
    ...allCommunitiesData_main.joinedCommunities.map(c => ({ 
      id: c.id, 
      name: c.name, 
      description: c.description, 
      memberCount: c._count.members 
    })),
    ...allCommunitiesData_main.availableCommunities.map(c => ({ 
      id: c.id, 
      name: c.name, 
      description: c.description, 
      memberCount: c._count.members 
    }))
  ];

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <Dashboard
            initialCurrentUser={dbUser}
            initialCommunities={communitiesForDashboard}
            initialMyRequests={myRequests}
          />
        </div>
      </main>
    </>
  );
}
