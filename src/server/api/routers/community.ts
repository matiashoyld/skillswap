import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const communityRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const communities = await ctx.db.community.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { members: true }, // Count members in each community
        },
      },
      orderBy: {
        name: "asc", // Optional: order communities alphabetically
      },
    });

    // Map the result to include memberCount directly
    return communities.map(community => ({
      ...community,
      memberCount: community._count.members,
    }));
  }),
  // Add other community procedures later (e.g., joinCommunity)
}); 