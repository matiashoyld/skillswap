import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { GiveFeedbackForm } from "~/app/dashboard/give-feedback/[requestId]/components/GiveFeedbackForm";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

// interface GiveFeedbackPageProps {
//   params: {
//     requestId: string;
//   };
// }

// Let Next.js infer the props type
// In Next.js 15, params are a Promise for async Server Components in dynamic routes
export default async function GiveFeedbackPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params; // Await the params Promise

  // Create context and caller for server-side tRPC
  const context = await createTRPCContext();
  const caller = createCaller(context);

  try {
    // Fetch the specific request details
    const requestData = await caller.feedback.getRequestById({ requestId });

    // Render the client component with the fetched data
    return <GiveFeedbackForm request={requestData} />;

  } catch (error) {
    console.error("Failed to fetch request data:", error);
    // Handle specific errors (e.g., not found) or show a generic error message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Request</AlertTitle>
          <AlertDescription>
            Could not load the feedback request details: {errorMessage}
            <br />
            Please check the ID or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
} 