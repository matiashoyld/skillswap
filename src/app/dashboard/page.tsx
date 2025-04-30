import { Dashboard } from "./components/dashboard";
import { createCaller } from "../../server/api/root"; // Relative path
import { createTRPCContext } from "../../server/api/trpc"; // Relative path
import { OnboardingFlow } from "./components/onboarding-flow"; // Import the actual component

export default async function DashboardPage() {
  // 1. Create context and caller for server-side tRPC
  const context = await createTRPCContext();
  const caller = createCaller(context);

  // 2. Fetch current user
  const currentUser = await caller.user.getCurrent();

  // 3. Check onboarding status
  if (!currentUser.hasCompletedOnboarding) {
    // Fetch communities needed for the onboarding flow
    const communities = await caller.community.list();

    // Render the Onboarding Flow component
    return (
        <OnboardingFlow communities={communities} />
    );
  }

  // 4. If onboarded, fetch the rest of the dashboard data
  const [communities, myRequests] = await Promise.all([
    caller.community.list(), // This might be fetched again, could optimize if needed
    caller.feedback.getMyRequests(),
  ]);

  // 5. Render the main Dashboard component
  return (
    <Dashboard
      initialCurrentUser={currentUser} // Already fetched
      initialCommunities={communities}
      initialMyRequests={myRequests}
    />
  );
} 