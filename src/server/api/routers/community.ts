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

    // Let's also check the UserCommunity table directly
    const allUserCommunities = await ctx.db.userCommunity.findMany();
    console.log("All UserCommunity entries:", allUserCommunities);

    const joinedCommunityIds = new Set(userCommunities.map(uc => uc.communityId));
    console.log("Joined community IDs:", Array.from(joinedCommunityIds));

    // Separate communities into joined and available
    const joinedCommunities = allCommunities.filter(c => joinedCommunityIds.has(c.id));
    const availableCommunities = allCommunities.filter(c => !joinedCommunityIds.has(c.id));

    return {
      userCommunities,
      joinedCommunities,
      availableCommunities,
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