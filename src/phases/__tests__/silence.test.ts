import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderSilence } from '../silence';
import { TIMING } from '../../timing';

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

  it('announces "Gone." via aria-live only after the music fade and a beat of silence', () => {
    vi.useFakeTimers();
    renderSilence(container, vi.fn());
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    // Should be silent during the music fade
    expect(live!.textContent).toBe('');
    vi.advanceTimersByTime(TIMING.SILENCE_ANNOUNCE_DELAY - 1);
    expect(live!.textContent).toBe('');
    vi.advanceTimersByTime(1);
    expect(live!.textContent).toBe('Gone.');
    vi.useRealTimers();
  });
});
