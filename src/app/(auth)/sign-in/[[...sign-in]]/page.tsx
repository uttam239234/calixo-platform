import { SignIn } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "../../clerkAppearance";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn appearance={CLERK_APPEARANCE} />
    </div>
  );
}
