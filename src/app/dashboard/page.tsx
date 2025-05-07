import { Dashboard } from "./components/dashboard";
import { createCaller } from "../../server/api/root"; // Relative path
import { createTRPCContext } from "../../server/api/trpc"; // Relative path
import { OnboardingFlow } from "./components/onboarding-flow"; // Import the actual component
import { Navbar } from "~/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { DashboardCommunity } from "~/types"; // Import DashboardCommunity type

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  // 1. Create context and caller for server-side tRPC
  const context = await createTRPCContext();
  const caller = createCaller(context);

  // 2. Fetch current user from your database
  const dbUser = await caller.user.getCurrent();

  // 3. Check onboarding status
  if (!dbUser.hasCompletedOnboarding) {
    // Fetch communities needed for the onboarding flow
    const allCommunitiesData = await caller.community.getAllCommunities();
    const communitiesForOnboarding: DashboardCommunity[] = allCommunitiesData.availableCommunities.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description, // Assuming DashboardCommunity.description can be string | null
      memberCount: c._count.members,
    }));

    // Render the Onboarding Flow component
    return <OnboardingFlow communities={communitiesForOnboarding} />;
  }

  // 4. If onboarded, fetch the rest of the dashboard data
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

  // 5. Render the main Dashboard component
  return (
    <>
      <Navbar />
      <Dashboard
        initialCurrentUser={dbUser} // Already fetched
        initialCommunities={communitiesForDashboard}
        initialMyRequests={myRequests}
      />
    </>
  );
}
