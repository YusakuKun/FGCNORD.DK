export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function isClerkConfigured(): boolean {
  return typeof clerkPublishableKey === "string" && clerkPublishableKey.length > 0 && !clerkPublishableKey.includes("pk_test_...");
}
