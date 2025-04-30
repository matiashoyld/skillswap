import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { GiveFeedbackForm } from "~/app/dashboard/give-feedback/[requestId]/components/GiveFeedbackForm";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { RequestDetailsItem } from "~/types"; // Import the specific type

// interface GiveFeedbackPageProps {
//   params: {
//     requestId: string;
//   };
// }

// Let Next.js infer the props type
// For dynamic routes, params might be { requestId: string }
export default async function GiveFeedbackPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params; // Await the params Promise

  // Create context and caller for server-side tRPC
  // Note: createTRPCContext might need adjustments if it expects specific headers/request objects
  const context = await createTRPCContext(); 
  const caller = createCaller(context);

  let requestData: RequestDetailsItem | null = null;
  let errorMessage: string | null = null;

  try {
    // Fetch the specific request details
    requestData = await caller.feedback.getRequestById({ requestId });

  } catch (error) {
    console.error("Failed to fetch request data:", error);
    errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
  }

  if (errorMessage || !requestData) {
    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Request</AlertTitle>
            <AlertDescription>
              Could not load the feedback request details: {errorMessage ?? "Request data is unavailable."}
              <br />
              Please check the ID or try again later.
            </AlertDescription>
          </Alert>
        </div>
      );
  }

  // Render the client component with the fetched data
  return <GiveFeedbackForm request={requestData} />;

} 