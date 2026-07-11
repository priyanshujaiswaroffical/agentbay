/**
 * soundService.ts
 * Windows XP-style sound effects using Web Audio API.
 * No audio files required — all sounds are synthesized in code.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  return ctx;
}

function isEnabled(): boolean {
  try {
    const s = localStorage.getItem("agentbay_sound_enabled");
    if (s !== null) return s === "true";
  } catch { /* ignore */ }
  return true;
}

export function setSoundEnabled(val: boolean) {
  localStorage.setItem("agentbay_sound_enabled", String(val));
}

function beep(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.3,
  startTime = 0,
  audioCtx?: AudioContext,
) {
  const c = audioCtx ?? getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startTime);
  gain.gain.setValueAtTime(gainVal, c.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startTime + duration);
  osc.start(c.currentTime + startTime);
  osc.stop(c.currentTime + startTime + duration + 0.05);
}

/** Windows XP startup-style login chime */
export function playLoginSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  const notes = [261.6, 329.6, 392, 523.3];
  notes.forEach((freq, i) => { beep(freq, 0.35, "sine", 0.25, i * 0.18, c); });
}

/** MSN Messenger "ding" — new message received */
export function playMessageSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  beep(880, 0.12, "sine", 0.28, 0, c);
  beep(1100, 0.12, "sine", 0.2, 0.13, c);
}

/** Short pop for notification balloon */
export function playNotificationSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  beep(660, 0.08, "sine", 0.2, 0, c);
  beep(880, 0.12, "sine", 0.18, 0.09, c);
}

/** Success fanfare — deal closed / purchase complete */
export function playSuccessSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  const seq: [number, number, number][] = [
    [523.3, 0.1, 0],
    [659.3, 0.1, 0.12],
    [783.9, 0.1, 0.24],
    [1046.5, 0.35, 0.36],
  ];
  seq.forEach(([freq, dur, start]) => beep(freq, dur, "sine", 0.3, start, c));
}

/** Error/failure buzzer */
export function playErrorSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  beep(220, 0.15, "sawtooth", 0.3, 0, c);
  beep(180, 0.25, "sawtooth", 0.25, 0.18, c);
}

/** MSN Nudge — vibration buzz */
export function playNudgeSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  for (let i = 0; i < 5; i++) {
    beep(80, 0.07, "sawtooth", 0.35, i * 0.09, c);
  }
  beep(440, 0.08, "sine", 0.2, 0.55, c);
}

/** Buyer offer submitted */
export function playOfferSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  beep(440, 0.08, "sine", 0.2, 0, c);
  beep(550, 0.1, "sine", 0.18, 0.09, c);
}

/** Seller counter-offer */
export function playCounterSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  beep(330, 0.1, "sine", 0.2, 0, c);
  beep(440, 0.1, "sine", 0.18, 0.12, c);
}

/** Logout / session end */
export function playLogoutSound() {
  if (!isEnabled()) return;
  const c = getCtx();
  const notes = [523.3, 392, 329.6, 261.6];
  notes.forEach((freq, i) => beep(freq, 0.25, "sine", 0.2, i * 0.15, c));
}

/** Window open click */
export function playClickSound() {
  if (!isEnabled()) return;
  beep(700, 0.05, "sine", 0.12);
}
