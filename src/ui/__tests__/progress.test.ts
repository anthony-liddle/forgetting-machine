import { describe, it, expect } from 'vitest';
import { createProgressBar, updateProgressBar, removeProgressBar } from '../progress';

describe('createProgressBar', () => {
  it('creates a fixed-position element with full width', () => {
    const bar = createProgressBar();
    expect(bar.classList.contains('progress')).toBe(true);
    expect(bar.style.width).toBe('100%');
  });
});

describe('updateProgressBar', () => {
  it('shrinks width based on progress', () => {
    const bar = createProgressBar();
    updateProgressBar(bar, 0.5);
    expect(bar.style.width).toBe('50%');
  });

  it('reaches 0% at progress 1', () => {
    const bar = createProgressBar();
    updateProgressBar(bar, 1);
    expect(bar.style.width).toBe('0%');
  });

  it('fades opacity as progress increases', () => {
    const bar = createProgressBar();
    updateProgressBar(bar, 0.8);
    const opacity = parseFloat(bar.style.opacity);
    expect(opacity).toBeLessThan(1);
  });
});

describe('removeProgressBar', () => {
  it('removes the element from its parent', () => {
    const parent = document.createElement('div');
    const bar = createProgressBar();
    parent.appendChild(bar);
    removeProgressBar(bar);
    expect(parent.children.length).toBe(0);
  });
});
