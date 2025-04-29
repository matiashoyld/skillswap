# SkillSwap - Peer-to-Peer Feedback Platform

[![Deploy with Vercel](https://vercel.com/button)](https://skillswap-bay.vercel.app/)

**Live Deployment:** [https://skillswap-bay.vercel.app/](https://skillswap-bay.vercel.app/)

**GitHub Repository:** [https://github.com/matiashoyld/skillswap](https://github.com/matiashoyld/skillswap)

## 1. Introduction

SkillSwap is a peer-to-peer feedback platform designed for job candidates. It allows users to request and provide feedback on job application materials like resumes, portfolios, LinkedIn profiles, cover letters, and cold emails within specific professional communities. The platform operates on a credit-based system to incentivize participation and quality feedback.

*(Based on [Product Requirements Document](prd.md))*

## 2. Goals

*   **Primary:** Help job candidates improve their application materials through peer feedback.
*   **Secondary:**
    *   Foster supportive professional communities.
    *   Incentivize high-quality, constructive feedback.
    *   Create a sustainable ecosystem where giving feedback is rewarded.

## 3. Core Technologies

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com)
*   **Authentication:** Clerk
*   **Database:** Supabase (PostgreSQL)
*   **ORM:** Prisma
*   **API Layer:** tRPC (integrated with Next.js App Router)
*   **Deployment:** Vercel

## 4. Project Structure Highlights

*   **`prisma/schema.prisma`**: Defines database models (User, Community, FeedbackRequest, etc.).
*   **`prisma/seed.ts`**: Seeds the database with initial community data.
*   **`src/app/`**: Next.js App Router structure.
    *   **`src/app/dashboard/`**: Main authenticated user dashboard.
    *   **`src/app/auth/`**: Clerk authentication pages (Login, Signup).
    *   **`src/app/api/webhooks/clerk/route.ts`**: Handles Clerk webhooks for user data synchronization.
    *   **`src/app/api/trpc/[trpc]/route.ts`**: tRPC API route handler.
*   **`src/components/`**: Shared UI components (built with shadcn/ui).
*   **`src/server/`**: Backend logic.
    *   **`src/server/db.ts`**: Prisma client instance.
    *   **`src/server/api/`**: tRPC routers, procedures, and context setup.
*   **`src/lib/`**: Utility functions, constants.
*   **`src/styles/globals.css`**: Global styles, Tailwind directives, CSS variables.
*   **`src/middleware.ts`**: Clerk authentication middleware.
*   **`public/`**: Static assets.
*   **`tailwind.config.js`**: Tailwind CSS configuration, including custom brand colors.
*   **`start-database.sh`**: Script to initialize the local development database using Docker/Podman.

## 5. Local Development Setup

### Prerequisites

*   Node.js (Check `package.json` for recommended version, e.g., via `nvm`)
*   `npm` (v10.9.2 or later, based on `packageManager` in `package.json`)
*   Git

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/matiashoyld/skillswap.git
    cd skillswap
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    *   Create a `.env` file in the root directory.
    *   Add the necessary variables. You will *at least* need:
        *   `DATABASE_URL`: Your **Supabase** PostgreSQL connection string (pooling). Find this in your Supabase project settings (Database -> Connection Pooling -> Connection string).
        *   `DIRECT_URL`: Your **Supabase** direct PostgreSQL connection string. Find this in your Supabase project settings (Database -> Settings -> Connection string -> URI). **Important:** Prisma uses this for migrations.
        *   Clerk Environment Variables (obtain these from your Clerk dashboard):
            *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
            *   `CLERK_SECRET_KEY`
            *   `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login`
            *   `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup`
            *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
            *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding`
        *   `CLERK_WEBHOOK_SECRET`: Obtain this from the Clerk dashboard when setting up the webhook.

4.  **Run Database Migrations:**
    *   Apply the schema to your Supabase database:
        ```bash
        npm run db:push
        ```
    *   Or, if you prefer creating migration files (recommended for production workflows):
        ```bash
        npm run db:generate
        ```
        Then apply:
        ```bash
        npm run db:migrate
        ```

5.  **Seed the Database (Optional):**
    *   If you want to populate your Supabase database with initial data (e.g., communities):
        ```bash
        npm run db:seed
        ```

6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *   The application should now be running at [http://localhost:3000](http://localhost:3000), connected to your Supabase database.

### Other Useful Commands

*   **Lint:** `npm run lint` / `npm run lint:fix`
*   **Format:** `npm run format:write`
*   **Type Check:** `npm run typecheck`
*   **Build:** `npm run build`
*   **Prisma Studio (GUI for DB):** `npm run db:studio`

## 6. Conventions & Patterns

*   **T3 Stack Principles:** Follows the core tenets (Next.js, TypeScript, Tailwind CSS, tRPC, Prisma).
*   **Server Components:** Data fetching primarily performed in Server Components using tRPC server-side callers.
*   **Client Components:** Receive data as props or use tRPC React Query hooks for client-side interactions/mutations.
*   **Authentication:** Clerk middleware (`src/middleware.ts`) protects routes and provides auth context to tRPC.
*   **Database Sync:** Clerk webhooks (`src/app/api/webhooks/clerk/route.ts`) keep the Supabase user data synchronized with Clerk authentication events.
*   **Database Migrations:** Managed via `prisma migrate`.
*   **Styling:** Tailwind CSS utility classes with `shadcn/ui` components. Custom brand colors defined in `tailwind.config.js`.
*   **Types:** Centralized types, including derived types from tRPC procedures, are often placed in `src/types/index.ts` (or similar) to ensure type safety in components.
*   **Development DB Query:** The `user.getCurrent` tRPC procedure queries by `email` for local development due to potential discrepancies in Clerk `userId` between dev/prod environments when webhooks aren't tunnelled locally.
