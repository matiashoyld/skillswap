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
import { CREDIT_COSTS } from "~/types";
import { mapRequestTypeToPrisma } from "~/types";
import { FeedbackRequestStatus } from "@prisma/client";

// Removed intermediate type definitions - they should be defined and imported from ~/types

export const feedbackRouter = createTRPCRouter({
  getMyRequests: protectedProcedure.query(async ({ ctx }): Promise<MyRequestItem[]> => {
    const requestsWithData = await ctx.db.feedbackRequest.findMany({
      where: {
        requesterId: ctx.internalUserId, // Use internalUserId directly
      },
      select: { // Explicitly select all required fields
        id: true,
        requestType: true,
        status: true,
        createdAt: true,
        context: true, // Ensure context is selected
        // Select any other fields from FeedbackRequest needed by mapPrismaToRequestType or mapPrismaToRequestStatus
        // For now, assuming they only need the direct enum value
        _count: {
          select: { responses: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requestsWithData.map(req => ({
      id: req.id,
      type: mapPrismaToRequestType(req.requestType), // Relies on req.requestType
      status: mapPrismaToRequestStatus(req.status),   // Relies on req.status
      createdAt: req.createdAt,
      feedbackCount: req._count.responses,
      context: req.context ?? undefined, // Convert null to undefined
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
        requester: { select: { id: true, firstName: true, lastName: true, imageUrl: true } }, // MODIFIED: Added imageUrl
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
            id: req.requester.id, 
            firstName: req.requester.firstName,
            lastName: req.requester.lastName,
            imageUrl: req.requester.imageUrl, // ADDED: Pass imageUrl to the mapped response
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
          context: true,
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
        contentUrl: request.contentUrl,
        contentText: request.contentText,
        communities: request.targetCommunities.map((tc: { community: Pick<Community, 'id' | 'name'> }) => tc.community),
        context: request.context ?? undefined,
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
      // Ensure request is PENDING or IN_PROGRESS (if multiple feedbacks are allowed later)
      // For now, strict PENDING for first feedback, IN_PROGRESS implies feedback already given.
      // If the goal is to award credits for *each* feedback, this logic might change.
      // Based on "when someone already has given feedback" moves to IN_PROGRESS,
      // it seems one feedback moves it to IN_PROGRESS.
      // For awarding credits, we should allow feedback if PENDING.
      if (request.status !== PrismaStatus.PENDING) {
        throw new Error("This request is no longer accepting feedback or has already received initial feedback.");
      }

      // 2. Verify user is allowed to give feedback (part of target community)
      const userMemberCommunities = await ctx.db.userCommunity.findMany({
        where: { userId: ctx.internalUserId },
        select: { communityId: true }
      });
      const userMemberCommunityIds = userMemberCommunities.map((c) => c.communityId);
      const requestTargetCommunityIds = request.targetCommunities.map((c) => c.communityId);
      const isAllowed = requestTargetCommunityIds.some((id) => userMemberCommunityIds.includes(id));
      if (!isAllowed) {
        throw new Error("Unauthorized: You are not a member of any community this request was sent to.");
      }

      const requestTypeKey = mapPrismaToRequestType(request.requestType);
      const creditsToAward = CREDIT_COSTS[requestTypeKey];

      // 3. Perform operations in a transaction
      const result = await ctx.db.$transaction(async (prisma) => {
        // Create the feedback response
        const newResponse = await prisma.feedbackResponse.create({
          data: {
            feedbackText: input.feedbackText,
            requestId: input.requestId,
            responderId: ctx.internalUserId,
          },
          select: { id: true },
        });

        // Update request status to IN_PROGRESS
        await prisma.feedbackRequest.update({
          where: { id: input.requestId },
          data: { status: PrismaStatus.IN_PROGRESS },
        });

        // Award credits to the feedback provider
        await prisma.user.update({
          where: { id: ctx.internalUserId },
          data: {
            credits: {
              increment: creditsToAward,
            },
          },
        });

        return { responseId: newResponse.id, creditsAwarded: creditsToAward };
      });

      return { success: true, responseId: result.responseId, creditsEarned: result.creditsAwarded };
    }),

  createRequest: protectedProcedure
    .input(
      z.object({
        requestType: z.enum(['resume', 'linkedin', 'portfolio', 'coverletter', 'email'] as const),
        contentUrl: z.string().url().optional(),
        contentText: z.string().optional(),
        context: z.string(),
        communityIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has enough credits
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.internalUserId },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const creditCost = CREDIT_COSTS[input.requestType];
      if (user.credits < creditCost) {
        throw new Error(`Insufficient credits. You need ${creditCost} credits to request ${input.requestType} feedback.`);
      }

      // Verify all communities exist and user is a member
      // const communities = await ctx.db.community.findMany({
      //   where: {
      //     id: { in: input.communityIds },
      //     members: {
      //       some: { userId: ctx.internalUserId },
      //     },
      //   },
      // });

      // if (communities.length !== input.communityIds.length) {
      //   throw new Error("One or more communities do not exist or you are not a member");
      // }

      // Create the feedback request
      const request = await ctx.db.feedbackRequest.create({
        data: {
          requestType: mapRequestTypeToPrisma(input.requestType),
          contentUrl: input.contentUrl,
          contentText: input.contentText,
          context: input.context,
          status: FeedbackRequestStatus.PENDING,
          requesterId: ctx.internalUserId,
          targetCommunities: {
            create: input.communityIds.map(communityId => ({
              communityId,
            })),
          },
        },
      });

      // Deduct credits from user
      await ctx.db.user.update({
        where: { id: ctx.internalUserId },
        data: {
          credits: {
            decrement: creditCost,
          },
        },
      });

      return { success: true, requestId: request.id };
    }),
}); 