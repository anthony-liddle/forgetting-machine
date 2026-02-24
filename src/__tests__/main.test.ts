import { describe, it, expect, beforeEach, vi } from 'vitest';

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

describe('app initialization', () => {
  beforeEach(() => {
    document.body.textContent = '';
    const appDiv = document.createElement('div');
    appDiv.id = 'app';
    document.body.appendChild(appDiv);
  });

  it('renders invitation phase on startup', async () => {
    await import('../main');
    const appDiv = document.getElementById('app')!;
    const invitation = appDiv.querySelector('.invitation');
    expect(invitation).not.toBeNull();
  });
});
