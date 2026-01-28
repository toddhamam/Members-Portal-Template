/**
 * Sound notification utility for the chat system
 * Uses Web Audio API to generate a subtle notification chime
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn("[Sounds] Web Audio API not supported:", e);
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a subtle notification chime
 * Creates a pleasant two-tone sound that's not intrusive
 */
export function playMessageNotification(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume audio context if it was suspended (required by browsers)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const duration = 0.15;
  const volume = 0.3;

  // Create a pleasant two-tone chime (like a soft "ding-dong")
  const frequencies = [880, 660]; // A5 and E5 - pleasant interval

  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, now);

    // Envelope: quick attack, smooth decay
    const startTime = now + i * 0.08;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

/**
 * Check if notifications are enabled (user preference)
 */
export function areSoundNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("chat_sound_enabled");
    // Default to enabled if not set
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

/**
 * Enable or disable sound notifications
 */
export function setSoundNotificationsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("chat_sound_enabled", String(enabled));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Play notification sound if enabled
 */
export function notifyNewMessage(): void {
  if (areSoundNotificationsEnabled()) {
    playMessageNotification();
  }
}
