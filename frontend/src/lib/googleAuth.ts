/**
 * Google Identity Services (GIS) integration helper
 */

export interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
  clientId?: string;
}

// Fallback or environment Google Client ID
export const DEFAULT_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "210492988239-google-client-id.apps.googleusercontent.com";

/**
 * Ensures Google Identity Services script is loaded and ready
 */
export async function loadGoogleIdentityScript(): Promise<any> {
  if (typeof window === "undefined") return null;

  if ((window as any).google?.accounts?.id) {
    return (window as any).google.accounts.id;
  }

  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(checkInterval);
        resolve((window as any).google.accounts.id);
      }
    }, 50);

    script.onerror = (err) => {
      clearInterval(checkInterval);
      reject(new Error("Failed to load Google Identity Services script"));
    };

    // Timeout after 8 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if ((window as any).google?.accounts?.id) {
        resolve((window as any).google.accounts.id);
      } else {
        reject(new Error("Google Identity Services script load timeout"));
      }
    }, 8000);
  });
}

/**
 * Initialize Google Identity Services with client ID and callback
 */
export async function initGoogleIdentity(
  onCredential: (credential: string) => void,
  clientId: string = DEFAULT_GOOGLE_CLIENT_ID
): Promise<any> {
  const googleId = await loadGoogleIdentityScript();
  if (!googleId) return null;

  googleId.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => {
      if (response && response.credential) {
        onCredential(response.credential);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  return googleId;
}

/**
 * Render the official Google Sign-In button into a container element
 */
export async function renderGoogleButton(
  container: HTMLElement,
  onCredential: (credential: string) => void,
  clientId: string = DEFAULT_GOOGLE_CLIENT_ID,
  options: Record<string, any> = {}
): Promise<void> {
  if (!container) return;

  const googleId = await initGoogleIdentity(onCredential, clientId);
  if (!googleId) return;

  container.innerHTML = "";

  googleId.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "pill",
    logo_alignment: "left",
    width: Math.min(Math.max(container.clientWidth || 320, 240), 380),
    ...options,
  });
}

/**
 * Trigger Google One Tap prompt if supported
 */
export function promptGoogleOneTap(): void {
  if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
    try {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap not displayed:", notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.log("One Tap skipped:", notification.getSkippedReason());
        }
      });
    } catch (e) {
      console.warn("Error prompting One Tap:", e);
    }
  }
}
