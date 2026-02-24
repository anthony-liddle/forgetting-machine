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

export function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

export function fadeOut(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add('fade-out');
    element.addEventListener('transitionend', () => resolve(), { once: true });
    // Fallback if transition doesn't fire
    setTimeout(resolve, 400);
  });
}

export function fadeIn(element: HTMLElement): void {
  element.classList.remove('fade-out');
}
