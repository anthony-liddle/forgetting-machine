/** Create the fixed-position progress bar element at the bottom of the viewport. */
export function createProgressBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.style.width = '100%';
  bar.setAttribute('role', 'presentation');
  return bar;
}

/** Shrink the progress bar from right-to-left and dim its opacity as progress approaches 1. */
export function updateProgressBar(bar: HTMLElement, progress: number): void {
  const remaining = Math.max(0, 1 - progress);
  bar.style.width = `${remaining * 100}%`;
  bar.style.opacity = String(Math.max(0.2, remaining));
}

/** Remove the progress bar element from the DOM. */
export function removeProgressBar(bar: HTMLElement): void {
  bar.remove();
}
