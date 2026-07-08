import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { GoogleSignIn } from "./auth-ui.jsx";
import { isClerkEnabled, syncClerkSession } from "./lib/clerk.js";
import { t } from "./lib/i18n.js";

function ClerkSessionSync({ onSynced, onError }) {
  const { isSignedIn, getToken } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;
    syncClerkSession(getToken)
      .then(u => { if (u) onSynced(u); })
      .catch(() => { syncedRef.current = false; onError?.(); });
  }, [isSignedIn, getToken, onSynced, onError]);

  return null;
}

/** Clerk when configured; legacy Google GSI otherwise. */
export function CouncilSignIn({ onCredential, onClerkUser, onClerkError, language }) {
  if (!isClerkEnabled()) {
    return <GoogleSignIn onCredential={onCredential} />;
  }

  return (
    <>
      <ClerkSessionSync onSynced={onClerkUser} onError={onClerkError} />
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="btn primary" style={{ width: "100%", maxWidth: 320 }}>
            {t(language, "sign_in_google")}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 36, height: 36 } } }} />
      </SignedIn>
    </>
  );
}

export { ClerkSessionSync };
