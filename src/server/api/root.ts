import { createCallerFactory, createTRPCRouter } from "./trpc";

// Import routers
import { userRouter } from "./routers/user";
import { communityRouter } from "./routers/community";
import { feedbackRouter } from "./routers/feedback";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  community: communityRouter,
  feedback: feedbackRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const caller = createCaller(createContext());
 * const res = await caller.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
