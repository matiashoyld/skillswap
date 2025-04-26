import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-10">
      {/* Centers the Clerk SignIn component */}
      <SignIn path="/auth/login" routing="path" signUpUrl="/auth/signup" />
    </div>
  );
} 