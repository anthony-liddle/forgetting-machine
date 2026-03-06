import { TIMING } from '@/timing';

/** Create a DOM element with an optional CSS class and text content. */
export function createElement(
  tag: string,
  className?: string,
  textContent?: string,
): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

/** Remove all child nodes from a container element. */
export function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Animate an element to opacity 0 via the `.fade-out` CSS class.
 * Resolves when the CSS transition ends, with a 400ms fallback timeout
 * in case the `transitionend` event never fires.
 */
export function fadeOut(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.style.setProperty('--fade-duration', `${TIMING.PHASE_FADE_OUT}ms`);
    element.classList.add('fade-out');
    element.addEventListener('transitionend', () => resolve(), { once: true });
    setTimeout(resolve, TIMING.PHASE_FADE_OUT + 50);
  });
}

/** Restore an element's opacity by removing the `.fade-out` class. */
export function fadeIn(element: HTMLElement): void {
  element.classList.remove('fade-out');
}
