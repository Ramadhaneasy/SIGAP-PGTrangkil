"use client";

export type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

const NOTIF_STORAGE_KEY = "sigap_admin_notif_settings";

export interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return { pushEnabled: true, soundEnabled: true };
  }
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) return { pushEnabled: true, soundEnabled: true };
    return JSON.parse(raw);
  } catch {
    return { pushEnabled: true, soundEnabled: true };
  }
}

export function setNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  if (typeof window === "undefined") return { pushEnabled: true, soundEnabled: true };
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { pushEnabled: true, soundEnabled: true };
  }
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("Service Worker registration warning:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    // Also register service worker when permission is requested
    if ("serviceWorker" in navigator) {
      await registerServiceWorker();
    }
    const perm = await Notification.requestPermission();
    return perm as NotificationPermissionState;
  } catch {
    return "denied";
  }
}

// Synthesize pleasant chime using Web Audio API (Zero external file dependencies)
export function playNotificationSound(type: "new-report" | "status-change" = "new-report"): void {
  if (typeof window === "undefined") return;
  const settings = getNotificationSettings();
  if (!settings.soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Dual-tone harmonic bell (YouTube / Modern notification style)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    const baseFreq1 = type === "status-change" ? 587 : 740;
    const baseFreq2 = type === "status-change" ? 880 : 1108;

    osc1.frequency.setValueAtTime(baseFreq1, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq1 * 1.25, now + 0.12);

    osc2.frequency.setValueAtTime(baseFreq2, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq2 * 1.25, now + 0.12);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("Audio playback error:", err);
  }
}

export async function sendBrowserPushNotification(options: {
  title: string;
  body: string;
  iconUrl?: string;
  badgeUrl?: string;
  onClickUrl?: string;
}): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const settings = getNotificationSettings();
  if (!settings.pushEnabled) return false;

  // Play audio chime
  playNotificationSound("new-report");

  // Mobile physical vibration
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // Ignore vibration errors
    }
  }

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  const icon = options.iconUrl || "/assets/images/logo-pg-trangkil.png";
  const badge = options.badgeUrl || "/assets/images/logo-pg-trangkil.png";
  const url = options.onClickUrl || "/admin/riwayat";

  // 1. Mobile Android & modern browser: Use ServiceWorker showNotification
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon,
          badge,
          tag: "sigap-report-notification",
          data: { url },
        });
        return true;
      }
    } catch (err) {
      console.warn("ServiceWorker showNotification failed, trying fallback:", err);
    }
  }

  // 2. Desktop fallback: new Notification()
  try {
    const notif = new Notification(options.title, {
      body: options.body,
      icon,
      badge,
      tag: "sigap-report-notification",
    });

    if (url) {
      notif.onclick = () => {
        window.focus();
        window.location.href = url;
      };
    }
    return true;
  } catch (err) {
    console.warn("Desktop Notification fallback error:", err);
    return false;
  }
}
