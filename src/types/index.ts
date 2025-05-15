// Import enums (values)
import {
  FeedbackRequestType as PrismaFeedbackRequestType,
  FeedbackRequestStatus as PrismaFeedbackRequestStatus,
  FeedbackEvaluationRating as PrismaFeedbackEvaluationRating,
} from "@prisma/client";

// Import model types
import type {
  User as PrismaUser,
  Community as PrismaCommunity,
  FeedbackRequest as PrismaFeedbackRequest,
  FeedbackResponse as PrismaFeedbackResponse,
  FeedbackEvaluation as PrismaFeedbackEvaluation,
} from "@prisma/client";

// Re-export Prisma types or create enhanced/simplified versions if needed

export type User = PrismaUser & {
  // Add any frontend-specific fields if necessary
  // Example: isMemberOf?: (communityId: string) => boolean;
};

export type Community = PrismaCommunity & {
  memberCount?: number; // Add memberCount based on the list query
};

export type FeedbackRequest = PrismaFeedbackRequest & {
  // Example: feedbacks?: FeedbackResponse[];
  // Example: targetCommunities?: Community[];
  // Example: requester?: User;
};

export type FeedbackResponse = PrismaFeedbackResponse & {
  // Example: responder?: User;
  // Example: request?: FeedbackRequest;
  // Example: evaluation?: FeedbackEvaluation;
};

export type FeedbackEvaluation = PrismaFeedbackEvaluation & {
  // Example: evaluator?: User;
  // Example: response?: FeedbackResponse;
};

// --- Enums / Union Types (map from Prisma enums) ---

// Matches FeedbackRequestType enum in schema.prisma and F-ReqFeed-02
export const requestTypeValues = [
  "linkedin",
  "email",
  "resume",
  "portfolio",
  "coverletter",
] as const;
export type RequestType = (typeof requestTypeValues)[number];

export function mapRequestTypeToPrisma(type: RequestType): PrismaFeedbackRequestType {
  switch (type) {
    case "linkedin": return PrismaFeedbackRequestType.LINKEDIN;
    case "email": return PrismaFeedbackRequestType.COLD_EMAIL;
    case "resume": return PrismaFeedbackRequestType.RESUME;
    case "portfolio": return PrismaFeedbackRequestType.PORTFOLIO;
    case "coverletter": return PrismaFeedbackRequestType.COVER_LETTER;
  }
}

export function mapPrismaToRequestType(type: PrismaFeedbackRequestType): RequestType {
  switch (type) {
    case PrismaFeedbackRequestType.LINKEDIN: return "linkedin";
    case PrismaFeedbackRequestType.COLD_EMAIL: return "email";
    case PrismaFeedbackRequestType.RESUME: return "resume";
    case PrismaFeedbackRequestType.PORTFOLIO: return "portfolio";
    case PrismaFeedbackRequestType.COVER_LETTER: return "coverletter";
  }
}

// Matches FeedbackRequestStatus enum in schema.prisma and F-Dash-02
export const requestStatusValues = ["pending", "in_progress", "completed"] as const;
export type RequestStatus = (typeof requestStatusValues)[number];

export function mapRequestStatusToPrisma(status: RequestStatus): PrismaFeedbackRequestStatus {
  switch (status) {
    case "pending": return PrismaFeedbackRequestStatus.PENDING;
    case "in_progress": return PrismaFeedbackRequestStatus.IN_PROGRESS;
    case "completed": return PrismaFeedbackRequestStatus.COMPLETED;
  }
}

export function mapPrismaToRequestStatus(status: PrismaFeedbackRequestStatus): RequestStatus {
  switch (status) {
    case PrismaFeedbackRequestStatus.PENDING: return "pending";
    case PrismaFeedbackRequestStatus.IN_PROGRESS: return "in_progress";
    case PrismaFeedbackRequestStatus.COMPLETED: return "completed";
  }
}


// Matches FeedbackEvaluationRating enum in schema.prisma and F-RecFeed-03 / F-Credit-04
// Using numeric values for simplicity in potential calculations/sorting
export const feedbackRatingValues = [5, 4, 3] as const;
export type FeedbackRating = (typeof feedbackRatingValues)[number]; // 5: Super Insightful, 4: Helpful, 3: Okay

export function mapRatingToPrisma(rating: FeedbackRating): PrismaFeedbackEvaluationRating {
    switch (rating) {
      case 5: return PrismaFeedbackEvaluationRating.SUPER_INSIGHTFUL;
      case 4: return PrismaFeedbackEvaluationRating.HELPFUL;
      case 3: return PrismaFeedbackEvaluationRating.OKAY;
    }
    // Should not happen with proper type checking, but as a fallback:
    throw new Error("Invalid rating: " + String(rating));
  }

export function mapPrismaToRating(rating: PrismaFeedbackEvaluationRating): FeedbackRating {
  switch (rating) {
    case PrismaFeedbackEvaluationRating.SUPER_INSIGHTFUL: return 5;
    case PrismaFeedbackEvaluationRating.HELPFUL: return 4;
    case PrismaFeedbackEvaluationRating.OKAY: return 3;
    // If NOT_HELPFUL or HARMFUL are somehow still in the DB, map them to OKAY or handle as error
    // For now, let's throw an error if unexpected values are encountered from DB
    default: throw new Error(`Unexpected Prisma rating: ${rating}`);
  }
}


// --- Credit System Constants (from PRD 4.6) ---

// [F-Credit-02] Cost per Request Type
export const CREDIT_COSTS: Record<RequestType, number> = {
  linkedin: 1,
  email: 2,
  resume: 3,
  portfolio: 4,
  coverletter: 5,
};

// [F-Credit-03] Base Reward per Feedback Type (matches cost)
export const FEEDBACK_REWARDS: Record<RequestType, number> = { ...CREDIT_COSTS };

// [F-Credit-04] Additional Reward/Penalty based on Rating
export const RATING_REWARDS: Record<FeedbackRating, number> = {
  5: 2, // Super Insightful
  4: 1, // Helpful
  3: 0, // Okay
  // Removed NOT_HELPFUL (2) and HARMFUL (1) entries
};


// --- Dashboard Component Types ---

// Type for data shown in "My Requests" list on dashboard
export type MyRequestItem = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: Date;
  feedbackCount: number;
  context?: string;
};

// Type for data shown in "Available Requests" list (Give Feedback tab)
export type AvailableRequestItem = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: Date;
  requester: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  communityId: string;
  communityName: string;
  context?: string;
};

// Specific type for the user object returned by user.getCurrent and used in Dashboard
export type DashboardUser = {
  id: string;
  clerkUserId: string | null; // Allow null initially
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  credits: number;
  name: string | null; // Added computed name field
  hasCompletedOnboarding: boolean;
};

// Specific type for the community object returned by community.list and used in Dashboard/Onboarding
export type DashboardCommunity = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number; // Added computed memberCount field
};

// --- Component-Specific Data Shapes ---

// Type for data returned by feedback.getMyRequests
// // (Matches MyRequestItem in types/index.ts) // Removed redundant comment

// Type for data returned by feedback.getAvailableRequests
// // (Matches AvailableRequestItem in types/index.ts) // Removed redundant comment

// Type for data returned by feedback.getRequestById
export type RequestDetailsItem = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdAt: Date;
  requester: {
    id: string; // Internal CUID
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  communities: { id: string; name: string }[]; // Simplified community info
  context?: string;
  // Explicitly include contentUrl and contentText if needed by the component
  contentUrl?: string | null;
  contentText?: string | null;
}; 