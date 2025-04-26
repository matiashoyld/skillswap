import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-10">
      {/* Centers the Clerk SignUp component */}
      <SignUp path="/auth/signup" routing="path" signInUrl="/auth/login" />
    </div>
  );
} 