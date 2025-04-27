import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const userRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    // We still need ctx.userId for the protectedProcedure middleware to pass.
    // But we use the primaryEmail from the context for the actual DB lookup.
    if (!ctx.primaryEmail) {
      console.error("[ERROR] No primary email found in context for authenticated user:", ctx.userId);
      throw new Error("User primary email not found.");
    }

    console.log("[DEBUG] Attempting to find user with email:", ctx.primaryEmail);
    const user = await ctx.db.user.findUnique({
      where: { email: ctx.primaryEmail }, // Query by email
      select: {
        id: true, // Supabase ID
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        credits: true,
      },
    });
    console.log("[DEBUG] Prisma findUnique result:", user);

    if (!user) {
      console.error("[ERROR] User not found in DB for email:", ctx.primaryEmail);
      throw new Error("User not found in database.");
    }

    return {
      ...user,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
    };
  }),
  // Add procedures here
  // Example: get current user profile, credits, etc.
}); 