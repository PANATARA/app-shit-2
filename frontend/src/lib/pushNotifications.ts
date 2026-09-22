import {
  registerDevice,
  unregisterDevice,
  sendTestNotification,
  type NotificationTestResponse,
  type DeviceResponse,
} from "$api/notifications";

const FCM_TOKEN_STORAGE_KEY = "fcm_device_token";

/**
 * Retrieve stored FCM device token from localStorage
 */
export function getStoredFcmToken(): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Could not read FCM token from localStorage:", e);
  }
  return null;
}

/**
 * Save FCM device token to localStorage
 */
export function setStoredFcmToken(token: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      if (token) {
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.warn("Could not save FCM token to localStorage:", e);
  }
}

/**
 * Determine a human-readable device name
 */
export function getDeviceName(): string {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    const ua = navigator.userAgent;
    const match = ua.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const parts = match[1].split(";");
      const androidPart = parts.find((p) => p.includes("Android"));
      if (androidPart) {
        const model = parts[parts.length - 1].trim();
        return model || "Android Device";
      }
    }
  }
  return "Android Device";
}

/**
 * Register or update device token with backend
 */
export async function registerPushToken(
  customToken?: string
): Promise<DeviceResponse | null> {
  let token = customToken || getStoredFcmToken();

  // Try checking native Android bridge if available
  if (!token && typeof window !== "undefined") {
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.getFcmToken === "function") {
      try {
        token = bridge.getFcmToken();
      } catch (e) {
        console.warn("Error getting FCM token from AndroidBridge:", e);
      }
    }
  }

  if (!token) {
    return null;
  }

  setStoredFcmToken(token);

  try {
    const deviceName = getDeviceName();
    const result = await registerDevice(token, "android", deviceName);
    console.log("Device push token successfully registered:", result.id);
    return result;
  } catch (err) {
    console.error("Failed to register device push token:", err);
    throw err;
  }
}

/**
 * Unregister device token from backend and remove from storage
 */
export async function unregisterPushToken(): Promise<void> {
  const token = getStoredFcmToken();
  if (token) {
    try {
      await unregisterDevice(token);
      console.log("Device push token unregistered successfully");
    } catch (err) {
      console.warn("Error unregistering device push token:", err);
    }
    setStoredFcmToken("");
  }
}

/**
 * Send test push notification to user devices
 */
export async function sendTestPush(): Promise<NotificationTestResponse> {
  return sendTestNotification({
    title: "Тестовое уведомление",
    body: "Тестовое push-уведомление от приложения Household успешно получено!",
    data: {
      type: "test",
      timestamp: String(Date.now()),
    },
  });
}

/**
 * Initialize global native callbacks and auto-register if token is cached
 */
export function initPushNotifications(): void {
  if (typeof window === "undefined") return;

  // Expose hook for Android native code / FirebaseMessagingService
  (window as any).onNativeFcmToken = async (token: string) => {
    console.log("Received native FCM token:", token);
    if (token) {
      setStoredFcmToken(token);
      try {
        await registerPushToken(token);
      } catch (e) {
        console.warn("Failed to auto-register native FCM token:", e);
      }
    }
  };

  // If token is already known, register it
  const token = getStoredFcmToken();
  if (token) {
    registerPushToken(token).catch((e) => {
      console.warn("Auto-register on init failed:", e);
    });
  }
}
