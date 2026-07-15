import { SignUp } from "@clerk/nextjs";
import { CLERK_APPEARANCE } from "../../clerkAppearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignUp appearance={CLERK_APPEARANCE} />
    </div>
  );
}
