import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderBroadcast, wrapTextInSpans } from '../broadcast';

// jsdom doesn't implement matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('wrapTextInSpans', () => {
  it('wraps each character in a span with class "char"', () => {
    const container = document.createElement('div');
    const spans = wrapTextInSpans('Hi', container);
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('H');
    expect(spans[1].textContent).toBe('i');
    expect(spans[0].classList.contains('char')).toBe(true);
  });

  it('wraps words in word-level spans', () => {
    const container = document.createElement('div');
    wrapTextInSpans('Hello world', container);
    const words = container.querySelectorAll('.word');
    expect(words.length).toBe(2);
  });

  it('preserves spaces between words as char spans', () => {
    const container = document.createElement('div');
    const spans = wrapTextInSpans('a b', container);
    expect(spans.length).toBe(3);
    expect(spans[1].textContent).toBe(' ');
  });

  it('preserves newlines as br elements', () => {
    const container = document.createElement('div');
    wrapTextInSpans('a\nb', container);
    const brs = container.querySelectorAll('br');
    expect(brs.length).toBe(1);
  });
});

describe('renderBroadcast', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders the secret text as character spans', () => {
    renderBroadcast(container, 'Test', vi.fn());
    const chars = container.querySelectorAll('.char');
    expect(chars.length).toBe(4);
  });

  it('creates a progress bar', () => {
    renderBroadcast(container, 'Test', vi.fn());
    const bar = document.querySelector('.progress');
    expect(bar).not.toBeNull();
  });

  it('creates an aria-live region that announces the secret after a brief delay', () => {
    vi.useFakeTimers();
    renderBroadcast(container, 'My secret', vi.fn());
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live!.textContent).toBe('');
    vi.advanceTimersByTime(100);
    expect(live!.textContent).toBe('My secret');
    vi.useRealTimers();
  });
});
