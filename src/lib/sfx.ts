let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType, gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.stop(ac.currentTime + duration);
}

export function sfxCorrect() {
  beep(660, 0.08, "triangle");
  setTimeout(() => beep(880, 0.1, "triangle"), 70);
}

export function sfxWrong() {
  beep(180, 0.18, "sawtooth", 0.04);
}

export function sfxCombo() {
  [523, 659, 784, 1046].forEach((f, i) => {
    setTimeout(() => beep(f, 0.12, "square", 0.06), i * 70);
  });
}

export function sfxTick() {
  beep(920, 0.04, "square", 0.03);
}
