import { createElement } from '../ui/dom';

export function renderSilence(
  container: HTMLElement,
  onReset: () => void,
): void {
  const phase = createElement('div', 'phase silence');

  const text = createElement('span', 'silence__text', 'Gone.');

  // Aria-live for screen readers
  const liveRegion = createElement('div', 'sr-only');
  liveRegion.setAttribute('aria-live', 'assertive');
  liveRegion.textContent = 'Gone.';

  phase.appendChild(text);
  phase.appendChild(liveRegion);
  container.appendChild(phase);

  // Trigger fade-in on next frame so the transition runs
  requestAnimationFrame(() => {
    text.classList.add('fade-in');
  });

  // After ~3 seconds, fade "Gone." and return to invitation
  const fadeTimeout = setTimeout(() => {
    text.classList.add('fade-out');

    const resetTimeout = setTimeout(() => {
      onReset();
    }, 1000);

    // Listen for early interaction to reset sooner
    const earlyReset = () => {
      clearTimeout(resetTimeout);
      onReset();
    };

    document.addEventListener('keydown', earlyReset, { once: true });
    document.addEventListener('click', earlyReset, { once: true });
  }, 3000);

  // Also allow any keypress/click during the initial 3s hold
  // Only listen after a brief delay to prevent accidental triggers
  setTimeout(() => {
    const earlyInteraction = () => {
      clearTimeout(fadeTimeout);
      text.classList.add('fade-out');
      setTimeout(onReset, 500);
    };

    document.addEventListener('keydown', earlyInteraction, { once: true });
    document.addEventListener('click', earlyInteraction, { once: true });
  }, 500);
}
