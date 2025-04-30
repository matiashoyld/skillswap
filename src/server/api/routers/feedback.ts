import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";
import {
  mapPrismaToRequestType,
  mapPrismaToRequestStatus,
  type MyRequestItem,
  type AvailableRequestItem,
  type RequestDetailsItem, // To be defined in types/index.ts
} from "../../../types";

// Import Prisma types needed for logic/checks
import { FeedbackRequestStatus as PrismaStatus } from '@prisma/client';
import type { UserCommunity, Community } from '@prisma/client';

// Removed intermediate type definitions - they should be defined and imported from ~/types

export const feedbackRouter = createTRPCRouter({
  getMyRequests: protectedProcedure.query(async ({ ctx }): Promise<MyRequestItem[]> => {
    const requests = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: ctx.internalUserId, // Use internal CUID
      },
      select: {
        id: true,
        requestType: true,
        status: true,
        createdAt: true,
        contentText: true, 
        contentUrl: true,  
        _count: { 
          select: { responses: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map(req => ({
      id: req.id,
      type: mapPrismaToRequestType(req.requestType),
      status: mapPrismaToRequestStatus(req.status),
      createdAt: req.createdAt,
      feedbackCount: req._count.responses,
      context: req.contentText ?? req.contentUrl ?? undefined,
    }));
  }),

  getAvailableRequests: protectedProcedure.query(async ({ ctx }): Promise<AvailableRequestItem[]> => {
    const userCommunities = await ctx.db.userCommunity.findMany({
      where: { userId: ctx.internalUserId }, 
      select: { communityId: true },
    });
    const communityIds = userCommunities.map((uc: Pick<UserCommunity, 'communityId'>) => uc.communityId);

    if (communityIds.length === 0) {
      return [];
    }

    const availableRequests = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: {
          not: ctx.internalUserId,
        },
        status: PrismaStatus.PENDING,
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
        requester: { select: { id: true, firstName: true, lastName: true } }, // Select internal CUID
        targetCommunities: { select: { community: { select: { id: true, name: true } } } },
      },
      orderBy: {
        createdAt: "asc", 
      },
    });

    const mappedRequests = availableRequests.map(req => {
        // Define type for tc explicitly
        type TargetCommunity = { community: Pick<Community, 'id' | 'name'> };
        const relevantCommunity = req.targetCommunities.find((tc: TargetCommunity) => communityIds.includes(tc.community.id));
        return {
          id: req.id,
          type: mapPrismaToRequestType(req.requestType),
          status: mapPrismaToRequestStatus(req.status),
          createdAt: req.createdAt,
          requester: {
            id: req.requester.id, // This is the internal CUID
            firstName: req.requester.firstName,
            lastName: req.requester.lastName,
          },
          communityId: relevantCommunity?.community.id ?? 'unknown',
          communityName: relevantCommunity?.community.name ?? 'Unknown Community',
          context: req.contentText ?? req.contentUrl ?? undefined,
        }
    });
    return mappedRequests;
  }),

  getRequestById: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }): Promise<RequestDetailsItem> => {
      // TODO: Add authorization check: ensure the user is part of at least one target community
      // Fetch user communities
      const userMemberCommunities = await ctx.db.userCommunity.findMany({
        where: { userId: ctx.internalUserId },
        select: { communityId: true }
      });
      const userMemberCommunityIds = userMemberCommunities.map((c: Pick<UserCommunity, 'communityId'>) => c.communityId);

      const request = await ctx.db.feedbackRequest.findUnique({
        where: {
          id: input.requestId,
          // Ensure the request targets a community the user is in
          targetCommunities: {
            some: {
              communityId: {
                in: userMemberCommunityIds
              }
            }
          }
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
        // Check if request exists at all, but user doesn't have access
        const requestExists = await ctx.db.feedbackRequest.findUnique({
          where: { id: input.requestId },
          select: { id: true }
        });
        if (requestExists) {
           throw new Error("Unauthorized: You are not part of the target community for this request.");
        } else {
           throw new Error("Request not found.");
        }
      }

      return {
        id: request.id,
        type: mapPrismaToRequestType(request.requestType),
        status: mapPrismaToRequestStatus(request.status),
        createdAt: request.createdAt,
        requester: {
            id: request.requester.id, // Internal CUID
            firstName: request.requester.firstName,
            lastName: request.requester.lastName,
            imageUrl: request.requester.imageUrl,
        },
        communities: request.targetCommunities.map((tc: { community: Pick<Community, 'id' | 'name'> }) => tc.community),
        context: request.contentText ?? request.contentUrl ?? undefined,
      };
  }),

  submitResponse: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      feedbackText: z.string().min(10, "Feedback must be at least 10 characters long."),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Verify the request exists and is PENDING
      const request = await ctx.db.feedbackRequest.findUnique({
        where: { id: input.requestId },
        select: { status: true, requesterId: true, requestType: true, targetCommunities: { select: { communityId: true } } },
      });

      if (!request) {
        throw new Error("Request not found.");
      }
      if (request.requesterId === ctx.internalUserId) {
        throw new Error("You cannot give feedback on your own request.");
      }
      if (request.status !== PrismaStatus.PENDING) { // Use Prisma enum for check
        throw new Error("This request is no longer accepting feedback.");
      }

      // 2. Verify user is allowed to give feedback (part of target community)
      const userMemberCommunities = await ctx.db.userCommunity.findMany({
        where: { userId: ctx.internalUserId },
        select: { communityId: true }
      });
      const userMemberCommunityIds = userMemberCommunities.map((c: Pick<UserCommunity, 'communityId'>) => c.communityId);
      const requestTargetCommunityIds = request.targetCommunities.map((c: { communityId: string }) => c.communityId);
      const isAllowed = requestTargetCommunityIds.some((id: string) => userMemberCommunityIds.includes(id));
      if (!isAllowed) {
        throw new Error("Unauthorized: You are not a member of any community this request was sent to.");
      }

      // 3. Create the feedback response
      const newResponse = await ctx.db.feedbackResponse.create({
        data: {
          feedbackText: input.feedbackText,
          requestId: input.requestId,
          responderId: ctx.internalUserId, // Use the internal CUID
        },
        select: { id: true },
      });

      // 4. Update request status to IN_PROGRESS
      try {
        await ctx.db.feedbackRequest.update({
          where: { id: input.requestId },
          data: { status: PrismaStatus.IN_PROGRESS }, // Use Prisma enum
        });
      } catch (updateError) {
        console.error(`[submitResponse] Failed to update status for request ${input.requestId}:`, updateError);
      }

      // 5. TODO: Award credits to the feedback provider (responder)
      // Implement logic based on F-Credit-03 & F-Credit-04
      // Needs: 
      // - Credit reward mapping from `request.requestType` (use FEEDBACK_REWARDS from types)
      // - `ctx.db.user.update` to increment responder's credits

      return { success: true, responseId: newResponse.id };
    }),
}); 