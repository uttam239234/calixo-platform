import { redirect } from "next/navigation";

/**
 * The standalone AI Assistant module is removed per the Content Studio redesign — "AI is no
 * longer a destination, AI becomes the intelligence inside every studio." Creative Design Studio
 * is the new flagship surface, so the bare `/dashboard/content` route lands there.
 */
export default function ContentStudioRootPage() {
  redirect("/dashboard/content/creative");
}
