import { createElement } from '@/ui/dom';
import { TIMING } from '@/timing';

/**
 * Render the silence phase: display "Gone." with a fade-in, hold for
 * SILENCE_HOLD ms, then fade out and call `onReset` to return to invitation.
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
  text.style.setProperty('--silence-fade-in', `${TIMING.SILENCE_FADE_IN_CSS}ms`);

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

  // Early interaction during the initial hold — uses a fast fade so skipping
  // feels responsive rather than making the user wait for the slow fade-out.
  const earlyInteraction = () => {
    if (hasReset) return;
    cleanup();
    text.classList.add('fade-out');
    setTimeout(onReset, TIMING.SILENCE_SKIP_FADE_OUT);
  };

  // Early interaction after the fade-out begins
  const earlyReset = () => {
    doReset();
  };

  // After hold duration, fade "Gone." and return to invitation
  const fadeTimeout = setTimeout(() => {
    if (hasReset) return;
    text.classList.add('fade-out');

    document.addEventListener('keydown', earlyReset, { once: true });
    document.addEventListener('click', earlyReset, { once: true });

    setTimeout(doReset, TIMING.SILENCE_FADE_OUT);
  }, TIMING.SILENCE_HOLD);

  // Allow any keypress/click during the initial hold
  // Only listen after a brief delay to prevent accidental triggers
  setTimeout(() => {
    if (hasReset) return;
    document.addEventListener('keydown', earlyInteraction, { once: true });
    document.addEventListener('click', earlyInteraction, { once: true });
  }, 500);
}
