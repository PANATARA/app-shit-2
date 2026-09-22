import { apiFetch } from "./client.js";

export interface DeviceRegisterPayload {
  token: string;
  device_type?: string;
  device_name?: string | null;
}

export interface DeviceResponse {
  id: string;
  user_id: string;
  token: string;
  device_type: string;
  device_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationTestPayload {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface NotificationTestResponse {
  fcm_available: boolean;
  delivery: {
    total: number;
    success: number;
    failure: number;
    pruned: number;
    reason?: string;
  };
}

/**
 * Register or update device push token
 */
export async function registerDevice(
  token: string,
  deviceType: string = "android",
  deviceName?: string | null
): Promise<DeviceResponse> {
  return apiFetch("/api/notifications/devices", {
    method: "POST",
    body: {
      token,
      device_type: deviceType,
      device_name: deviceName || null,
    },
  });
}

/**
 * Unregister device push token
 */
export async function unregisterDevice(token: string): Promise<void> {
  return apiFetch(`/api/notifications/devices/${encodeURIComponent(token)}`, {
    method: "DELETE",
  });
}

/**
 * List registered devices for current user
 */
export async function getUserDevices(): Promise<DeviceResponse[]> {
  return apiFetch("/api/notifications/devices", {
    method: "GET",
  });
}

/**
 * Send test push notification to current user's registered devices
 */
export async function sendTestNotification(
  payload: NotificationTestPayload = {}
): Promise<NotificationTestResponse> {
  return apiFetch("/api/notifications/test", {
    method: "POST",
    body: {
      title: payload.title || "Тестовое уведомление",
      body: payload.body || "Тестовое уведомление из приложения Household",
      data: payload.data || {},
    },
  });
}
