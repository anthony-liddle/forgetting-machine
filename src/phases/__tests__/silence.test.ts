import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderSilence } from '../silence';

describe('renderSilence', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders "Gone." in italic serif', () => {
    renderSilence(container, vi.fn());
    const text = container.querySelector('.silence__text');
    expect(text).not.toBeNull();
    expect(text!.textContent).toBe('Gone.');
  });

  it('announces "Gone." to screen readers via aria-live', () => {
    renderSilence(container, vi.fn());
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live!.textContent).toBe('Gone.');
  });
});
