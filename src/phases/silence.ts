import { createElement } from '@/ui/dom';
import { TIMING } from '@/timing';

/**
 * Render the silence phase: display "Gone." with a fade-in, hold for
 * SILENCE_HOLD ms, then fade out and call `onReset` to return to invitation.
 * Early-interaction shortcuts are only registered after "Gone." has been
 * announced (~SILENCE_ANNOUNCE_DELAY + 500ms) to prevent the user from
 * clearing the phase before the announcement fires.
 */
export function renderSilence(
  container: HTMLElement,
  onReset: () => void,
): void {
  const phase = createElement('div', 'phase silence');

  const text = createElement('span', 'silence__text', 'Gone.');

  // Assertive live region for the "Gone." announcement.
  // Must be in the DOM empty first so VoiceOver is already monitoring it
  // when the content is injected, guaranteeing the announcement fires.
  const liveRegion = createElement('div', 'sr-only');
  liveRegion.setAttribute('aria-live', 'assertive');

  phase.appendChild(text);
  phase.appendChild(liveRegion);
  container.appendChild(phase);

  text.style.setProperty(
    '--silence-fade-in',
    `${TIMING.SILENCE_FADE_IN_CSS}ms`,
  );

  let hasReset = false;

  const cleanup = () => {
    hasReset = true;
    clearTimeout(announceTimeout);
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

  // Trigger fade-in after the pre-hold pause.
  setTimeout(() => {
    text.classList.add('fade-in');
  }, TIMING.SILENCE_PRE_HOLD);

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

  // Announce "Gone." after music fades and a beat of silence. Early-interaction
  // listeners are registered AFTER the announcement so the user cannot race
  // the announce timer and clear the phase before "Gone." fires.
  const announceTimeout = setTimeout(() => {
    if (hasReset) return;
    liveRegion.textContent = 'Gone.';

    // Allow skipping only after the announcement has fired and a brief
    // settling window has passed (500ms), ensuring the word lands before
    // any interaction can clear the phase.
    setTimeout(() => {
      if (hasReset) return;
      document.addEventListener('keydown', earlyInteraction, { once: true });
      document.addEventListener('click', earlyInteraction, { once: true });
    }, 500);
  }, TIMING.SILENCE_ANNOUNCE_DELAY);

  // After hold duration, fade "Gone." and return to invitation
  const fadeTimeout = setTimeout(() => {
    if (hasReset) return;
    text.classList.add('fade-out');

    document.addEventListener('keydown', earlyReset, { once: true });
    document.addEventListener('click', earlyReset, { once: true });

    setTimeout(doReset, TIMING.SILENCE_FADE_OUT);
  }, TIMING.SILENCE_HOLD);
}
