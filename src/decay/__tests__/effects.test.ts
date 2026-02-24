import { describe, it, expect, beforeEach } from 'vitest';
import { applyDriftEffect, applyDissolveEffect, applyVanishEffect } from '../effects';

describe('applyDriftEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'A';
  });

  it('reduces opacity', () => {
    applyDriftEffect(span, 0.5);
    const opacity = parseFloat(span.style.opacity);
    expect(opacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThan(0);
  });

  it('applies horizontal jitter via transform', () => {
    applyDriftEffect(span, 0.8);
    expect(span.style.transform).toContain('translateX');
  });
});

describe('applyDissolveEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'B';
    span.dataset.original = 'B';
  });

  it('applies blur filter', () => {
    applyDissolveEffect(span, 0.7);
    expect(span.style.filter).toContain('blur');
  });

  it('may replace character with static', () => {
    // Run multiple times — character replacement is probabilistic
    let replaced = false;
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('span');
      s.textContent = 'X';
      s.dataset.original = 'X';
      applyDissolveEffect(s, 0.9);
      if (s.textContent !== 'X') replaced = true;
    }
    expect(replaced).toBe(true);
  });
});

describe('applyVanishEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'C';
  });

  it('sets very low opacity', () => {
    applyVanishEffect(span, 1.0);
    const opacity = parseFloat(span.style.opacity);
    expect(opacity).toBeLessThanOrEqual(0.1);
  });

  it('applies strong blur', () => {
    applyVanishEffect(span, 1.0);
    expect(span.style.filter).toContain('blur');
  });
});
