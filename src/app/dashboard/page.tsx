import { Dashboard } from "./components/dashboard";
import { createCaller } from "../../server/api/root"; // Relative path
import { createTRPCContext } from "../../server/api/trpc"; // Relative path
import { auth } from "@clerk/nextjs/server"; // Need auth to create context

export default async function DashboardPage() {
  // 1. Create context and caller for server-side tRPC
  // We need to pass the auth object to createTRPCContext
  // Note: If createTRPCContext internally calls auth(), this might be redundant,
  // but let's follow the pattern seen in create-t3-app for RSC callers.
  const context = await createTRPCContext({ auth: auth() });
  const caller = createCaller(context);

  // 2. Fetch initial data concurrently
  // We might need error handling here in a real app (try/catch)
  const [currentUser, communities, myRequests, availableRequests] = await Promise.all([
    caller.user.getCurrent(),
    caller.community.list(),
    caller.feedback.getMyRequests(),
    caller.feedback.getAvailableRequests(),
  ]);

  // 3. Render the client component, passing data as props
  // Note: The Dashboard component will need to be refactored to accept these props
  return (
    <Dashboard
      initialCurrentUser={currentUser}
      initialCommunities={communities}
      initialMyRequests={myRequests}
      initialAvailableRequests={availableRequests}
    />
  );
} 