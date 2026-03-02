import { createElement } from '../ui/dom';

/**
 * Render the silence phase: display "Gone." with a fade-in, hold for
 * 3 seconds, then fade out and call `onReset` to return to invitation.
 * The user can click or press any key to skip ahead at any point
 * (after a 500ms debounce to avoid accidental triggers).
 */
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

  let hasReset = false;

  const cleanup = () => {
    hasReset = true;
    clearTimeout(fadeTimeout);
    document.removeEventListener('keydown', earlyInteraction);
    document.removeEventListener('click', earlyInteraction);
    document.removeEventListener('keydown', earlyReset);
    document.removeEventListener('click', earlyReset);
  };

  const doReset = () => {
    if (hasReset) return;
    cleanup();
    onReset();
  };

  // Trigger fade-in — double RAF ensures the browser has painted the
  // initial opacity: 0 before the transition to opacity: 1 begins.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      text.classList.add('fade-in');
    });
  });

  // Early interaction during the initial 3s hold
  const earlyInteraction = () => {
    if (hasReset) return;
    cleanup();
    text.classList.add('fade-out');
    setTimeout(onReset, 500);
  };

  // Early interaction after the 3s fade-out begins
  const earlyReset = () => {
    doReset();
  };

  // After ~3 seconds, fade "Gone." and return to invitation
  const fadeTimeout = setTimeout(() => {
    if (hasReset) return;
    text.classList.add('fade-out');

    document.addEventListener('keydown', earlyReset, { once: true });
    document.addEventListener('click', earlyReset, { once: true });

    setTimeout(doReset, 1000);
  }, 3000);

  // Allow any keypress/click during the initial 3s hold
  // Only listen after a brief delay to prevent accidental triggers
  setTimeout(() => {
    if (hasReset) return;
    document.addEventListener('keydown', earlyInteraction, { once: true });
    document.addEventListener('click', earlyInteraction, { once: true });
  }, 500);
}
