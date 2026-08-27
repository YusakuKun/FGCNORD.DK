import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";

import { clerkPublishableKey, isClerkConfigured } from "@/lib/clerk";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={clerkPublishableKey}>
      {children}
    </BaseClerkProvider>
  );
}
