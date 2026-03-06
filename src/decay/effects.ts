/**
 * Drift phase: gently reduce opacity (1.0 → 0.7) and shift colour
 * from warm cream toward a desaturated grey.
 */
export function applyDriftEffect(
  span: HTMLSpanElement,
  intensity: number,
): void {
  // Opacity: 1.0 → 0.7
  const opacity = 1 - intensity * 0.3;
  span.style.opacity = String(opacity);

  // Color: warm cream shifts toward desaturated grey
  // Start: rgb(232, 224, 212) → End: rgb(160, 155, 148)
  const colorShift = Math.round(intensity * 72);
  const r = 232 - colorShift;
  const g = 224 - Math.round(intensity * 69);
  const b = 212 - Math.round(intensity * 64);
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

/**
 * Dissolve phase: continue fading opacity (0.7 → 0.15) and shift
 * colour from desaturated grey toward the dark background.
 */
export function applyDissolveEffect(
  span: HTMLSpanElement,
  intensity: number,
): void {
  // Opacity: 0.7 → 0.15
  const opacity = 0.7 - intensity * 0.55;
  span.style.opacity = String(Math.max(0, opacity));

  // Color: continues from drift end toward background
  // Start: rgb(160, 155, 148) → End: rgb(40, 38, 35)
  const r = 160 - Math.round(intensity * 120);
  const g = 155 - Math.round(intensity * 117);
  const b = 148 - Math.round(intensity * 113);
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

/**
 * Vanish phase: final fade to invisible (0.15 → 0) with a subtle
 * blur (max 1px) as the character merges into the background.
 */
export function applyVanishEffect(
  span: HTMLSpanElement,
  intensity: number,
): void {
  // Opacity: 0.15 → 0
  const opacity = 0.15 * (1 - intensity);
  span.style.opacity = String(Math.max(0, opacity));

  // Blur: 0 → 1px — a whisper of softness
  const blur = intensity * 1;
  span.style.filter = `blur(${blur}px)`;

  // Color: approaches background
  const r = 40 - Math.round(intensity * 30);
  const g = 38 - Math.round(intensity * 28);
  const b = 35 - Math.round(intensity * 25);
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}
