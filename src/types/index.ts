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
export const feedbackRatingValues = [5, 4, 3, 2, 1] as const;
export type FeedbackRating = (typeof feedbackRatingValues)[number]; // 5: Super Insightful, ..., 1: Harmful

export function mapRatingToPrisma(rating: FeedbackRating): PrismaFeedbackEvaluationRating {
    switch (rating) {
      case 5: return PrismaFeedbackEvaluationRating.SUPER_INSIGHTFUL;
      case 4: return PrismaFeedbackEvaluationRating.HELPFUL;
      case 3: return PrismaFeedbackEvaluationRating.OKAY;
      case 2: return PrismaFeedbackEvaluationRating.NOT_HELPFUL;
      case 1: return PrismaFeedbackEvaluationRating.HARMFUL;
    }
  }

export function mapPrismaToRating(rating: PrismaFeedbackEvaluationRating): FeedbackRating {
  switch (rating) {
    case PrismaFeedbackEvaluationRating.SUPER_INSIGHTFUL: return 5;
    case PrismaFeedbackEvaluationRating.HELPFUL: return 4;
    case PrismaFeedbackEvaluationRating.OKAY: return 3;
    case PrismaFeedbackEvaluationRating.NOT_HELPFUL: return 2;
    case PrismaFeedbackEvaluationRating.HARMFUL: return 1;
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
  2: -1, // Not Helpful
  1: -2, // Harmful / Not Useful
}; 