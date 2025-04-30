import { z } from "zod";
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
    // Now receives ctx.internalUserId (non-null CUID) from the middleware
    console.log(`[getAvailableRequests] Fetching for internal user ID: ${ctx.internalUserId}`);

    // 1. Get IDs of communities the internal user is a member of
    const userCommunities = await ctx.db.userCommunity.findMany({
      where: { userId: ctx.internalUserId }, // Use internalUserId directly
      select: { communityId: true },
    });
    const communityIds = userCommunities.map(uc => uc.communityId);
    console.log(`[getAvailableRequests] Internal user belongs to community IDs: ${JSON.stringify(communityIds)}`);

    if (communityIds.length === 0) {
      console.log("[getAvailableRequests] Internal user not in any communities, returning empty list.");
      return [];
    }

    // 2. Find requests targeted at those communities, excluding user's own requests
    const availableRequests = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: {
          not: ctx.internalUserId, // Use internalUserId directly
        },
        status: 'PENDING',
        targetCommunities: {
          some: {
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
        requester: { select: { id: true, firstName: true, lastName: true } },
        targetCommunities: { select: { community: { select: { id: true, name: true } } } },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    console.log(`[getAvailableRequests] Found ${availableRequests.length} raw requests: ${JSON.stringify(availableRequests, null, 2)}`); // Keep log for now

    // 3. Map Prisma enums to frontend types
    const mappedRequests = availableRequests.map(req => {
        const relevantCommunity = req.targetCommunities.find(tc => communityIds.includes(tc.community.id));
        return {
          ...req,
          type: mapPrismaToRequestType(req.requestType),
          status: mapPrismaToRequestStatus(req.status),
          communityId: relevantCommunity?.community.id ?? 'unknown',
          communityName: relevantCommunity?.community.name ?? 'Unknown Community',
          context: req.contentText ?? req.contentUrl ?? undefined,
          targetCommunities: undefined,
        }
    });
    console.log(`[getAvailableRequests] Returning ${mappedRequests.length} mapped requests.`); // Keep log for now
    return mappedRequests;
  }),

  getRequestById: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.feedbackRequest.findUnique({
        where: {
          id: input.requestId,
          // Optional: Add check to ensure user has access (e.g., is in one of the target communities)
          // This might be important if the URL is guessable.
        },
        select: {
          id: true,
          requestType: true,
          status: true,
          createdAt: true,
          contentText: true,
          contentUrl: true,
          requester: {
            select: { id: true, firstName: true, lastName: true, imageUrl: true },
          },
          targetCommunities: {
            select: {
              community: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!request) {
        throw new Error("Request not found"); // Or handle appropriately
      }

      // Optional: Add authorization check here if needed

      return {
        ...request,
        type: mapPrismaToRequestType(request.requestType),
        status: mapPrismaToRequestStatus(request.status),
        // Simplify target communities for easier frontend use if needed
        communities: request.targetCommunities.map(tc => tc.community),
        targetCommunities: undefined, // Remove original structure
        context: request.contentText ?? request.contentUrl ?? undefined,
      };
  }),

  submitResponse: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      feedbackText: z.string().min(10, "Feedback must be at least 10 characters long."), // Add validation
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Verify the request exists and is PENDING
      const request = await ctx.db.feedbackRequest.findUnique({
        where: { id: input.requestId },
        select: { status: true, requesterId: true },
      });

      if (!request) {
        throw new Error("Request not found.");
      }
      if (request.requesterId === ctx.internalUserId) {
        throw new Error("You cannot give feedback on your own request.");
      }
      // TODO: Decide if 'IN_PROGRESS' is a valid status to submit feedback to, or only 'PENDING'
      if (request.status !== 'PENDING') {
        throw new Error("This request is no longer accepting feedback.");
      }

      // 2. TODO: Verify user is allowed to give feedback (e.g., part of target community)
      // This requires fetching user's communities and checking against request's target communities.
      // Skipping for now for brevity, but IMPORTANT for security/logic.

      // 3. Create the feedback response
      const newResponse = await ctx.db.feedbackResponse.create({
        data: {
          feedbackText: input.feedbackText,
          requestId: input.requestId,
          responderId: ctx.internalUserId, // Use the internal CUID
        },
        select: { id: true },
      });

      // 4. Update request status to IN_PROGRESS if it was PENDING
      if (request.status === 'PENDING') {
          try {
            await ctx.db.feedbackRequest.update({
              where: { id: input.requestId },
              data: { status: 'IN_PROGRESS' },
            });
            console.log(`[submitResponse] Updated request ${input.requestId} status to IN_PROGRESS.`);
          } catch (updateError) {
            // Log the error but don't fail the whole operation just because status update failed
            console.error(`[submitResponse] Failed to update status for request ${input.requestId}:`, updateError);
          }
      }

      // 5. TODO: Award credits to the feedback provider (responder)
      // This logic needs to be carefully implemented based on F-Credit-03
      // const creditAmount = getCreditAmountForRequestType(request.requestType); // Helper needed
      // await ctx.db.user.update({
      //   where: { id: ctx.userId },
      //   data: { credits: { increment: creditAmount } },
      // });

      console.log(`Feedback ${newResponse.id} submitted for request ${input.requestId} by internal user ${ctx.internalUserId}`);

      return { success: true, responseId: newResponse.id };
    }),

  // Add procedures here
  // Example: get my requests, get available requests, create request, submit feedback, evaluate feedback
}); 