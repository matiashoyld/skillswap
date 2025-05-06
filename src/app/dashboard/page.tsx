import { Dashboard } from "./components/dashboard";
import { createCaller } from "../../server/api/root"; // Relative path
import { createTRPCContext } from "../../server/api/trpc"; // Relative path
import { OnboardingFlow } from "./components/onboarding-flow"; // Import the actual component
import { Navbar } from "~/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    const communities = await caller.community.getAllCommunities();

    // Render the Onboarding Flow component
    return <OnboardingFlow communities={communities} />;
  }

  // 4. If onboarded, fetch the rest of the dashboard data
  const [communities, myRequests] = await Promise.all([
    caller.community.getAllCommunities(), // This might be fetched again, could optimize if needed
    caller.feedback.getMyRequests(),
  ]);

  // 5. Render the main Dashboard component
  return (
    <>
      <Navbar />
      <Dashboard
        initialCurrentUser={dbUser} // Already fetched
        initialCommunities={communities}
        initialMyRequests={myRequests}
      />
    </>
  );
}
