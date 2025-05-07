import { notFound } from "next/navigation";
import { ResumeFeedbackForm } from "../resume/ResumeFeedbackForm";
import { LinkedinFeedbackForm } from "../linkedin/LinkedinFeedbackForm";
import { PortfolioFeedbackForm } from "../portfolio/PortfolioFeedbackForm";
import { CoverLetterFeedbackForm } from "../coverletter/CoverLetterFeedbackForm";
import { EmailFeedbackForm } from "../email/EmailFeedbackForm";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TypeSpecificFeedbackPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : undefined;

  switch (params.type) {
    case "resume":
      return <ResumeFeedbackForm />;
    case "linkedin":
      return <LinkedinFeedbackForm />;
    case "portfolio":
      return <PortfolioFeedbackForm />;
    case "coverletter":
      return <CoverLetterFeedbackForm />;
    case "email":
      return <EmailFeedbackForm />;
    default:
      notFound();
  }
} 