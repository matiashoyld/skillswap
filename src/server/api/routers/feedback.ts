import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";
import { mapPrismaToRequestType, mapPrismaToRequestStatus } from "../../../types"; // Going up one more level

export const feedbackRouter = createTRPCRouter({
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: ctx.userId,
      },
      select: {
        id: true,
        requestType: true,
        status: true,
        createdAt: true,
        contentText: true, // Include context if needed for display
        contentUrl: true,  // Include URL if needed
        _count: { // Count feedback responses for each request
          select: { responses: true },
        },
        // Add targetCommunities if needed for display
        // targetCommunities: { select: { community: { select: { id: true, name: true } } } }
      },
      orderBy: {
        createdAt: "desc", // Show newest requests first
      },
    });

    // Map Prisma enums to frontend types and include feedback count
    return requests.map(req => ({
      ...req,
      type: mapPrismaToRequestType(req.requestType),
      status: mapPrismaToRequestStatus(req.status),
      feedbackCount: req._count.responses,
      context: req.contentText ?? req.contentUrl ?? undefined, // Combine text/url for simpler display
    }));
  }),

  getAvailableRequests: protectedProcedure.query(async ({ ctx }) => {
    // 1. Get IDs of communities the user is a member of
    const userCommunities = await ctx.db.userCommunity.findMany({
      where: { userId: ctx.userId },
      select: { communityId: true },
    });
    const communityIds = userCommunities.map(uc => uc.communityId);

    if (communityIds.length === 0) {
      return []; // User is not in any communities, so no requests available
    }

    // 2. Find requests targeted at those communities, excluding user's own requests
    const availableRequests = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: {
          not: ctx.userId, // Exclude requests made by the current user
        },
        status: 'PENDING', // Only show pending requests (or filter based on status as needed)
        targetCommunities: {
          some: { // Request must be in at least one of the user's communities
            communityId: {
              in: communityIds,
            },
          },
        },
      },
      select: {
        id: true,
        requestType: true,
        status: true,
        createdAt: true,
        contentText: true,
        contentUrl: true,
        requester: { // Include minimal requester info if needed (e.g., name)
          select: { id: true, firstName: true, lastName: true },
        },
        targetCommunities: { // Include target community info
          select: {
            community: {
              select: { id: true, name: true },
            },
          },
        },
        // Do NOT include _count: { select: { responses: true } } here unless needed
      },
      orderBy: {
        createdAt: "asc", // Show oldest requests first (FIFO as per PRD F-Dash-03)
      },
    });

    // Map Prisma enums to frontend types
    // Note: A request might be targeted to multiple communities the user is in.
    // We might need to refine which community is displayed on the card.
    // For now, we'll just return the first target community found that the user is part of.
    return availableRequests.map(req => {
        const relevantCommunity = req.targetCommunities.find(tc => communityIds.includes(tc.community.id));
        return {
          ...req,
          type: mapPrismaToRequestType(req.requestType),
          status: mapPrismaToRequestStatus(req.status),
          communityId: relevantCommunity?.community.id ?? 'unknown',
          communityName: relevantCommunity?.community.name ?? 'Unknown Community',
          context: req.contentText ?? req.contentUrl ?? undefined,
          // Omit fields not needed for the list view like targetCommunities array
          targetCommunities: undefined,
        }
    });
  }),

  // Add procedures here
  // Example: get my requests, get available requests, create request, submit feedback, evaluate feedback
}); 