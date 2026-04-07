type GoogleCredentialResponse = {
  credential?: string;
};

type AppleSignInResponse = {
  authorization?: { id_token?: string };
  user?: { email?: string; name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}

const loadScriptOnce = (id: string, src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export const getGoogleIdToken = async (
  clientId: string,
): Promise<{ idToken: string }> => {
  await loadScriptOnce(
    "google-identity",
    "https://accounts.google.com/gsi/client",
  );

  return new Promise((resolve, reject) => {
    const google = window.google;
    if (!google?.accounts?.id) {
      reject(new Error("Google Identity Services are unavailable"));
      return;
    }

    let settled = false;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        if (settled) return;
        settled = true;
        if (response?.credential) {
          resolve({ idToken: response.credential });
        } else {
          reject(new Error("Google did not return a credential"));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification: any) => {
      if (settled) return;

      const isNotDisplayed = notification?.isNotDisplayed?.();
      const isSkipped = notification?.isSkippedMoment?.();

      if (isNotDisplayed) {
        const reason = notification?.getNotDisplayedReason?.();
        // Some browsers/FedCM report unknown_reason for non-terminal states.
        if (reason && reason !== "unknown_reason") {
          settled = true;
          reject(new Error(`Google Sign-In was not completed: ${reason}`));
        }
      }

      if (isSkipped) {
        const reason = notification?.getSkippedReason?.();
        if (reason && reason !== "unknown_reason") {
          settled = true;
          reject(new Error(`Google Sign-In was not completed: ${reason}`));
        }
      }
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Google Sign-In timed out"));
      }
    }, 30000);
  });
};

export const getAppleIdToken = async (
  clientId: string,
  redirectUri: string,
): Promise<{ idToken: string; email?: string; name?: string }> => {
  await loadScriptOnce(
    "apple-signin",
    "https://appleid.apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
  );

  const AppleID = window.AppleID;
  if (!AppleID?.auth) {
    throw new Error("Apple Sign-In SDK is unavailable");
  }

  AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI: redirectUri,
    usePopup: true,
  });

  const response = (await AppleID.auth.signIn()) as AppleSignInResponse;
  const idToken = response?.authorization?.id_token;
  const email = response?.user?.email;
  const name = response?.user?.name
    ? `${response.user.name.firstName || ""} ${response.user.name.lastName || ""}`.trim() ||
      undefined
    : undefined;

  if (!idToken) {
    throw new Error("Apple did not return an identity token");
  }

  return { idToken, email, name };
};
