import { createElement } from '../ui/dom';
import { TIMING } from '../timing';

const MAX_SECRET_LENGTH = 5000;

/**
 * Render the invitation phase with a splash intro animation:
 * 1. "The Forgetting Machine" fades in large and centered.
 * 2. After SPLASH_HOLD ms, the heading shrinks to its settled size.
 * 3. The form (subheading, textarea, button) fades in below it.
 *
 * Calls `onLetGo` with the trimmed text when the user submits.
 */
export function renderInvitation(
  container: HTMLElement,
  onLetGo: (secret: string) => void,
): void {
  const phase = createElement('div', 'phase invitation');

  const heading = createElement('h1', 'invitation__heading invitation__heading--splash', 'The Forgetting Machine');

  // Build form wrapper — present in DOM immediately (opacity: 0 via CSS)
  // so querySelector works synchronously in tests and the layout is stable.
  const form = createElement('div', 'invitation__form');
  form.setAttribute('aria-hidden', 'true');

  const subheading = createElement(
    'p',
    'invitation__subheading',
    'Nothing you write here will be saved.',
  );

  const textarea = document.createElement('textarea');
  textarea.className = 'invitation__textarea';
  textarea.setAttribute('spellcheck', 'false');
  textarea.setAttribute('autocomplete', 'off');
  textarea.setAttribute('autocorrect', 'off');
  textarea.setAttribute('autocapitalize', 'off');
  textarea.setAttribute('aria-label', 'Write something you want to let go of');
  textarea.rows = 1;

  const button = document.createElement('button');
  button.className = 'invitation__button';
  button.textContent = 'Let go';
  button.disabled = true;
  button.type = 'button';

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 150)}px`;
    button.disabled = textarea.value.trim().length === 0;
  });

  // Button click
  button.addEventListener('click', () => {
    const secret = textarea.value.slice(0, MAX_SECRET_LENGTH);
    if (secret.trim().length > 0) {
      onLetGo(secret);
    }
  });

  // Enter submits (Shift+Enter for newlines)
  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!button.disabled) {
        button.click();
      }
    }
  });

  form.appendChild(subheading);
  form.appendChild(textarea);
  form.appendChild(button);

  // Both heading and form are in the DOM immediately.
  // The form starts invisible (opacity: 0 via .invitation__form CSS).
  phase.appendChild(heading);
  phase.appendChild(form);
  container.appendChild(phase);

  // Step 1: Measure the invisible form's height to calculate how far down
  // to offset the heading so it appears vertically centered in the viewport.
  // (If the phase div is H tall and #app centers it, the heading sits at the
  // top of the phase div. translateY(formHeight / 2) pushes it to the visual
  // center. In jsdom formHeight is 0, so tests are unaffected.)
  requestAnimationFrame(() => {
    const formHeight = form.getBoundingClientRect().height;
    heading.style.transform = `translateY(${formHeight / 2}px)`;

    // Step 2: One more frame so the transform is painted before fade-in starts.
    requestAnimationFrame(() => {
      heading.classList.add('fade-in');
    });
  });

  // Step 3: After SPLASH_HOLD, animate heading up and shrink simultaneously,
  // then fade the form in below it.
  setTimeout(() => {
    // Apply transition inline so it fires for the coming property changes.
    // Done here (not in CSS) so the initial translateY snap is instant.
    const t = `${TIMING.SPLASH_HEADING_TRANSITION}ms ease`;
    heading.style.transition = `transform ${t}, font-size ${t}, letter-spacing ${t}`;

    // Animate heading to its natural position and settled font size.
    heading.style.transform = 'translateY(0)';
    heading.classList.remove('invitation__heading--splash');
    heading.classList.add('invitation__heading--settled');

    // Step 4: After a brief delay, fade the form in.
    setTimeout(() => {
      form.classList.add('fade-in');
      form.removeAttribute('aria-hidden');

      // Auto-focus on desktop after form finishes fading in.
      setTimeout(() => {
        if (!isMobile()) {
          textarea.focus();
        }
      }, TIMING.SPLASH_FORM_FADE_IN);
    }, TIMING.SPLASH_FORM_DELAY);
  }, TIMING.SPLASH_HOLD);
}

/** Detect mobile devices via user-agent to avoid auto-focusing the textarea. */
function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
