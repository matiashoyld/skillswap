import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const communityRouter = createTRPCRouter({
  getAllCommunities: protectedProcedure.query(async ({ ctx }) => {
    // First get the database user ID from the Clerk user ID
    const user = await ctx.db.user.findUnique({
      where: {
        clerkUserId: ctx.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      console.log("No user found for Clerk ID:", ctx.userId);
      return {
        userCommunities: [],
        joinedCommunities: [],
        availableCommunities: [],
      };
    }

    const dbUserId = user.id;
    console.log("Database userId:", dbUserId);
    
    // Get all communities with their member counts
    const allCommunities = await ctx.db.community.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { members: true }, // Count members in each community
        },
      },
      orderBy: {
        name: "asc", // Optional: order communities alphabetically
      },
    });
    console.log("All communities:", allCommunities);

    // Get user's joined communities using the database user ID
    const userCommunities = await ctx.db.userCommunity.findMany({
      where: {
        userId: dbUserId,
      },
      select: {
        communityId: true,
        userId: true, // Add this to verify the userId
      },
    });
    console.log("Raw userCommunities query result:", userCommunities);

    const joinedCommunityIds = new Set(userCommunities.map(uc => uc.communityId));
    console.log("Joined community IDs:", Array.from(joinedCommunityIds));

    // Separate communities into joined and available
    const joinedCommunities = allCommunities.filter(c => joinedCommunityIds.has(c.id));
    const availableCommunities = allCommunities.filter(c => !joinedCommunityIds.has(c.id));

    return {
      joinedCommunities,
      availableCommunities,
    };
  }),

  getCommunityDetails: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get community details
      const community = await ctx.db.community.findUnique({
        where: { id: input.communityId },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      if (!community) {
        throw new Error("Community not found");
      }

      // Get all members of this community
      const communityMembers = await ctx.db.userCommunity.findMany({
        where: { communityId: input.communityId },
        select: {
          userId: true,
          joinedAt: true,
        },
      });

      // Get detailed user information for each member
      const memberDetails = await Promise.all(
        communityMembers.map(async (member) => {
          // Get user details
          const user = await ctx.db.user.findUnique({
            where: { id: member.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          });

          if (!user) return null;

          // Get feedback count
          const feedbackCount = await ctx.db.feedbackResponse.count({
            where: { responderId: member.userId },
          });

          // Get user's communities
          const userCommunities = await ctx.db.userCommunity.findMany({
            where: { userId: member.userId },
            select: {
              community: {
                select: {
                  name: true,
                },
              },
            },
          });

          return {
            ...user,
            feedbackGiven: feedbackCount,
            memberSince: member.joinedAt,
            communities: userCommunities.map((uc) => uc.community.name),
          };
        }),
      );

      // Filter out any null values from memberDetails
      const validMembers = memberDetails.filter((member): member is NonNullable<typeof member> => member !== null);

      return {
        ...community,
        members: validMembers,
      };
    }),

  joinCommunity: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          clerkUserId: ctx.userId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return ctx.db.userCommunity.create({
        data: {
          userId: user.id,
          communityId: input.communityId,
        },
      });
    }),

  leaveCommunity: protectedProcedure
    .input(z.object({ communityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          clerkUserId: ctx.userId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return ctx.db.userCommunity.delete({
        where: {
          userId_communityId: {
            userId: user.id,
            communityId: input.communityId,
          },
        },
      });
    }),
}); 