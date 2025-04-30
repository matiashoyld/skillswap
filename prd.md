# SkillSwap - Product Requirements Document

## 1. Introduction

SkillSwap is a peer-to-peer feedback platform designed for job candidates. It allows users to request and provide feedback on job application materials like resumes, portfolios, LinkedIn profiles, cover letters, and cold emails within specific professional communities. The platform operates on a credit-based system to incentivize participation and quality feedback.

## 2. Goals

*   **Primary:** Help job candidates improve their application materials through peer feedback.
*   **Secondary:**
    *   Foster supportive professional communities.
    *   Incentivize high-quality, constructive feedback.
    *   Create a sustainable ecosystem where giving feedback is rewarded.

## 3. User Personas

*   **Job Seeker:** Actively looking for a job, needs feedback on application materials to increase chances of success. Wants timely and relevant advice from peers or those slightly ahead in their careers.
*   **Career Changer:** Transitioning to a new field, needs feedback tailored to the new industry's expectations.
*   **Helper/Mentor:** Willing to share their experience and provide feedback to others, potentially looking to build reputation or simply help out.

## 4. Features

### 4.1 User Accounts & Onboarding
*   **[F-Account-01] Account Creation/Login:** Users can sign up or log in using Google or LinkedIn OAuth.
*   **[F-Onboarding-01] Welcome & Community Selection:** Upon first login, users are welcomed and prompted to join relevant professional communities (e.g., "Software Engineering Bootcamp Grads", "UX/UI Designers Network", "Digital Marketing Professionals"). Multiple selections allowed.
*   **[F-Onboarding-02] App Introduction & Free Credits:** After community selection, a welcome dialogue explains the app's purpose (requesting/giving feedback) and grants the user 3 initial credits.

### 4.2 Dashboard
*   **[F-Dash-01] Main Layout:** A two-column layout. Left panel contains navigation tabs, right panel displays user info and credits.
*   **[F-Dash-02] Left Panel - "My Requests" Tab (Default):**
    *   Displays a list of feedback requests created by the user.
    *   Each request is shown as a card containing the type of feedback requested (e.g., "Resume Feedback", "LinkedIn Profile Review").
    *   Each card includes a status indicator (Pill/Tag): "Pending", "In Progress", "Completed".
    *   Each card has a button/link to view details/feedback received.
    *   Contains a prominent "Request Feedback" button.
*   **[F-Dash-03] Left Panel - "Give Feedback" Tab:**
    *   Displays a list of feedback requests from other users within the communities the current user belongs to.
    *   Requests are displayed as cards, showing the type of feedback needed and potentially the requesting user (or anonymous).
    *   Cards are ordered chronologically, with the oldest requests appearing first (FIFO).
    *   Users can click on a card to view the request details and provide feedback.
*   **[F-Dash-04] Right Panel - User Information:**
    *   Displays the user's name.
    *   Includes an "Invite a Friend" button (functionality TBD).
*   **[F-Dash-05] Right Panel - Credit Balance:**
    *   Displays the user's current credit balance.

### 4.3 Requesting Feedback
*   **[F-ReqFeed-01] Initiate Request:** User clicks the "Request Feedback" button from the "My Requests" tab.
*   **[F-ReqFeed-02] Select Feedback Type:** User chooses the type of item they want feedback on from a predefined list:
    *   LinkedIn Profile
    *   Cold Email
    *   Resume
    *   Portfolio
    *   Cover Letter
*   **[F-ReqFeed-03] Provide Content:** Based on the selected type, the user provides the necessary content:
    *   LinkedIn Profile: URL input field.
    *   Cold Email: Text area input.
    *   Resume: File upload (e.g., PDF) or text area.
    *   Portfolio: URL input field.
    *   Cover Letter: File upload or text area.
*   **[F-ReqFeed-04] Select Target Communities:** User selects one or more of their joined communities to broadcast the request to.
*   **[F-ReqFeed-05] Credit Check & Submission:**
    *   The system checks if the user has enough credits for the requested feedback type (see Credit System below).
    *   If sufficient credits exist, the user can submit the request. Credits are deducted upon submission.
    *   If insufficient credits, the submission button is disabled or shows an error message.
*   **[F-ReqFeed-06] Request Visibility:** Submitted requests appear in the user's "My Requests" list and in the "Give Feedback" list for users in the selected target communities.

### 4.4 Giving Feedback
*   **[F-GiveFeed-01] Select Request:** User navigates to the "Give Feedback" tab and clicks on a request card.
*   **[F-GiveFeed-02] View Request Details:** User sees the content provided by the requester (URL, text, file). A link/viewer should be provided for URLs and files.
*   **[F-GiveFeed-03] Submit Feedback:** User provides feedback in a dedicated text area.
*   **[F-GiveFeed-04] Earn Credits:** Upon submitting feedback, the user earns credits based on the feedback type (see Credit System). The request status (for the requester) might change to "In Progress" or "Completed" depending on the flow.

### 4.5 Receiving & Evaluating Feedback
*   **[F-RecFeed-01] Notification/View:** User is notified (TBD mechanism) or sees updated status/content in their "My Requests" tab when feedback is received.
*   **[F-RecFeed-02] View Feedback:** User can view the feedback text provided by other users. Multiple feedback entries per request should be supported.
*   **[F-RecFeed-03] Evaluate Feedback:** For each piece of feedback received, the user can provide an evaluation rating:
    *   Super Insightful
    *   Helpful
    *   Okay
    *   Not Helpful
    *   Harmful / Not Useful
*   **[F-RecFeed-04] Evaluation Impact:** This evaluation directly impacts the credit balance of the user who *gave* the feedback (see Credit System).

### 4.6 Credit System
*   **[F-Credit-01] Initial Grant:** 3 free credits upon completing onboarding.
*   **[F-Credit-02] Spending Credits (Cost per Request):**
    *   LinkedIn Profile: 1 credit
    *   Cold Email: 2 credits
    *   Resume: 3 credits
    *   Portfolio: 4 credits
    *   Cover Letter: 5 credits
*   **[F-Credit-03] Earning Credits (Reward for Giving Feedback):**
    *   LinkedIn Profile Feedback Provided: +1 credit
    *   Cold Email Feedback Provided: +2 credits
    *   Resume Feedback Provided: +3 credits
    *   Portfolio Feedback Provided: +4 credits
    *   Cover Letter Feedback Provided: +5 credits
*   **[F-Credit-04] Feedback Quality Modifier (Applied to Feedback Giver based on Receiver's Evaluation):**
    *   Evaluation = "Super Insightful": +2 additional credits
    *   Evaluation = "Helpful": +1 additional credit
    *   Evaluation = "Okay": +0 additional credits
    *   Evaluation = "Not Helpful": -1 credit (penalty)
    *   Evaluation = "Harmful / Not Useful": -2 credits (penalty)

## 5. Non-Functional Requirements

*   **[NFR-01] Usability:** Intuitive interface, easy navigation.
*   **[NFR-02] Performance:** Dashboard loads quickly, feedback submission is responsive.
*   **[NFR-03] Security:** Secure authentication (OAuth), protection against spam/abuse.
*   **[NFR-04] Scalability:** System should handle a growing number of users, communities, and requests.

## 6. Future Considerations

*   Direct messaging between users.
*   Gamification elements (badges, leaderboards).
*   Premium features (e.g., expert reviews).
*   Admin panel for managing communities and users.
*   Reporting/Analytics on feedback quality and community activity.
*   Mobile application.
*   Integration with job boards.
*   "Invite a Friend" functionality implementation (referral credits?).
*   Notification system details (in-app, email).

## 7. Core Technologies

*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** [shadcn/ui](mdc:https:/ui.shadcn.com) (e.g., Button, Card). Add components using `npx shadcn@latest add <component-name>`.
*   **Authentication:** Clerk
*   **Database:** Supabase (PostgreSQL)
*   **ORM:** Prisma

### tRPC Procedure Details & Data Shapes

*   **Context (`[src/server/api/trpc.ts](mdc:src/server/api/trpc.ts)`):** Provides `db` (Prisma client), `auth` (Clerk auth object), `user` (Clerk user object or null), `userId` (Clerk user ID or null), `internalUserId` (the corresponding internal DB User CUID, or null if not authenticated/found), and `primaryEmail` (user's primary email or null) to procedures. Protected procedures (`protectedProcedure`) guarantee that both `userId` and `internalUserId` are non-null and represent the currently authenticated user.
*   **`feedback.getMyRequests` (`[src/server/api/routers/feedback.ts](mdc:src/server/api/routers/feedback.ts)`):** Uses `ctx.internalUserId` to filter requests. Returns an array matching the `MyRequestItem` type: `{ id, type, status, createdAt, feedbackCount, context }`.
*   **`feedback.getAvailableRequests` (`[src/server/api/routers/feedback.ts](mdc:src/server/api/routers/feedback.ts)`):** Uses `ctx.internalUserId` to find the user's communities and exclude their own requests. Returns an array matching the `AvailableRequestItem` type: `{ id, type, status, createdAt, requester: { id, firstName, lastName }, communityId, communityName, context }`. Note that `requester.id` here is the *internal CUID* of the requester.
*   **`user.getCurrent` (`[src/server/api/routers/user.ts](mdc:src/server/api/routers/user.ts)`):** Still uses `email` lookup (see Development Workaround). Returns `DashboardUser` type: `{ id, clerkUserId, email, firstName, lastName, imageUrl, credits, name }`.
*   **`community.list` (`[src/server/api/routers/community.ts](mdc:src/server/api/routers/community.ts)`):** Returns an array of `DashboardCommunity` objects: `{ id, name, description, memberCount }`.

### User ID Handling (Clerk vs. Internal DB)

*   **Clerk User ID:** Provided by Clerk authentication (format `user_...`). Available in tRPC context as `ctx.userId`.
*   **Internal Database User ID:** Generated by Prisma (CUID format `cl...`). Primary key `User.id`.
*   **Context Enhancement:** The tRPC context (`src/server/api/trpc.ts`) now automatically attempts to find the internal user record matching the Clerk user ID and makes the internal CUID available as `ctx.internalUserId`. 
*   **Protected Procedures:** When using `protectedProcedure`, both `ctx.userId` (Clerk ID) and `ctx.internalUserId` (Internal CUID) are guaranteed to be available and non-null.
*   **Relational Queries:** Database relationships (e.g., `UserCommunity.userId`, `FeedbackRequest.requesterId`) always use the internal database User ID (`User.id`). Protected procedures should now **directly use `ctx.internalUserId`** for these queries, simplifying the logic compared to the previous manual lookup pattern.
    *   Example: See the refactored `feedback.getAvailableRequests`.
*   **Exception:** `user.getCurrent` still uses email lookup.

### Common Linting/Typing Patterns 