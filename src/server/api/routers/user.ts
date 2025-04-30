import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

const INITIAL_CREDITS = 3; // From PRD [F-Credit-01]

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
        hasCompletedOnboarding: true,
      },
    });
    console.log("[DEBUG] Prisma findUnique result:", user);

    if (!user) {
      console.error("[ERROR] User not found in DB for email:", ctx.primaryEmail);
      throw new Error("User not found in database.");
    }

    // Explicitly check if the user has completed onboarding
    if (user.hasCompletedOnboarding === null || user.hasCompletedOnboarding === undefined) {
      console.warn(`[WARN] User ${user.id} has null/undefined hasCompletedOnboarding status.`);
      // Optionally default it here if needed, though Prisma should handle the default
    }

    return {
      ...user,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      hasCompletedOnboarding: user.hasCompletedOnboarding ?? false,
    };
  }),

  completeOnboarding: protectedProcedure
    .input(
      z.object({
        communityIds: z.array(z.string().cuid()).min(1, "Please select at least one community."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const userId = ctx.userId; // From protectedProcedure context - No longer directly used for lookup

      if (!ctx.primaryEmail) {
        console.error("[ERROR] No primary email found in context during onboarding for authenticated user:", ctx.userId);
        throw new Error("User primary email not found.");
      }

      console.log("[DEBUG] Attempting completeOnboarding for email:", ctx.primaryEmail);

      // 1. Fetch user by email to ensure they exist and haven't completed onboarding yet
      const user = await ctx.db.user.findUnique({
        where: { email: ctx.primaryEmail }, // Use primaryEmail for lookup
        select: { id: true, hasCompletedOnboarding: true, credits: true },
      });

      if (!user) {
        console.error("[ERROR] User not found in DB during onboarding for email:", ctx.primaryEmail);
        throw new Error("User not found.");
      }

      // Use the actual internal DB user ID found via email for subsequent operations
      const dbUserId = user.id;

      if (user.hasCompletedOnboarding) {
        console.warn(`[WARN] User ${dbUserId} (email: ${ctx.primaryEmail}) attempted to complete onboarding again.`);
        // Optionally return success or a specific message
        return { success: true, message: "Onboarding already completed." };
      }

      // 2. Perform updates in a transaction
      await ctx.db.$transaction(async (tx) => {
        // Update user: set onboarding complete and grant credits
        await tx.user.update({
          where: { id: dbUserId }, // Use the fetched database ID
          data: {
            hasCompletedOnboarding: true,
            credits: user.credits + INITIAL_CREDITS, // Add initial credits
          },
        });

        // Create UserCommunity entries for selected communities
        await tx.userCommunity.createMany({
          data: input.communityIds.map((communityId) => ({
            userId: dbUserId, // Use the fetched database ID
            communityId: communityId,
          })),
          skipDuplicates: true, // Avoid errors if somehow a duplicate is attempted
        });
      });

      console.log(`[INFO] User ${dbUserId} (email: ${ctx.primaryEmail}) completed onboarding and joined ${input.communityIds.length} communities.`);
      return { success: true };
    }),

  // Add procedures here
  // Example: get current user profile, credits, etc.
}); 