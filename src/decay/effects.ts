import { getRandomStaticChar } from './characters';

export function applyDriftEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 1 - intensity * 0.3;
  const jitterX = (Math.random() - 0.5) * intensity * 3;
  const jitterY = (Math.random() - 0.5) * intensity * 1;

  span.style.opacity = String(opacity);
  span.style.transform = `translateX(${jitterX}px) translateY(${jitterY}px)`;

  // Subtle color shift toward background
  const colorShift = Math.round(intensity * 30);
  const r = 232 - colorShift;
  const g = 224 - colorShift;
  const b = 212 - colorShift;
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

export function applyDissolveEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 0.7 - intensity * 0.5;
  const blur = intensity * 2.5;
  const jitterX = (Math.random() - 0.5) * 4;
  const jitterY = (Math.random() - 0.5) * 3;

  span.style.opacity = String(Math.max(0, opacity));
  span.style.filter = `blur(${blur}px)`;
  span.style.transform = `translateX(${jitterX}px) translateY(${jitterY}px)`;

  // Character replacement — more likely as intensity increases
  if (Math.random() < intensity * 0.6) {
    span.textContent = getRandomStaticChar();
  }

  // Color fades toward background
  const colorShift = Math.round(30 + intensity * 60);
  const r = 232 - colorShift;
  const g = 224 - colorShift;
  const b = 212 - colorShift;
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

export function applyVanishEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 0.2 * (1 - intensity);
  const blur = 2 + intensity * 2;

  span.style.opacity = String(Math.max(0, opacity));
  span.style.filter = `blur(${blur}px)`;
  span.style.transform = `translateX(${(Math.random() - 0.5) * 2}px)`;

  // Replace remaining characters with spaces
  if (Math.random() < intensity) {
    span.textContent = ' ';
  }

  span.style.color = `rgb(${42 + Math.round((1 - intensity) * 30)}, ${37 + Math.round((1 - intensity) * 25)}, ${32 + Math.round((1 - intensity) * 20)})`;
}
