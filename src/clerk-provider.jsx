import { ClerkProvider } from "@clerk/clerk-react";
import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from "./lib/clerk.js";

export function AppProviders({ children }) {
  if (!isClerkEnabled()) return children;
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
