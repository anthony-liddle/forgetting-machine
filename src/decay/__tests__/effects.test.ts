import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyDriftEffect,
  applyDissolveEffect,
  applyVanishEffect,
} from '../effects';

describe('applyDriftEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'A';
  });

  it('reduces opacity proportional to intensity', () => {
    applyDriftEffect(span, 0.5);
    const opacity = parseFloat(span.style.opacity);
    expect(opacity).toBeLessThan(1);
    expect(opacity).toBeGreaterThan(0.5);
  });

  it('does not apply transform', () => {
    applyDriftEffect(span, 0.8);
    expect(span.style.transform).toBe('');
  });

  it('does not apply blur', () => {
    applyDriftEffect(span, 1.0);
    expect(span.style.filter).toBe('');
  });

  it('shifts color away from warm cream', () => {
    applyDriftEffect(span, 0.5);
    expect(span.style.color).toContain('rgb');
    // At intensity 0.5, color should be noticeably shifted from the starting rgb(232, 224, 212)
    expect(span.style.color).not.toBe('rgb(232, 224, 212)');
  });

  it('preserves text content', () => {
    applyDriftEffect(span, 1.0);
    expect(span.textContent).toBe('A');
  });
});

describe('applyDissolveEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'B';
    span.dataset.original = 'B';
  });

  it('reduces opacity further than drift', () => {
    applyDissolveEffect(span, 0.5);
    const opacity = parseFloat(span.style.opacity);
    expect(opacity).toBeLessThan(0.7);
    expect(opacity).toBeGreaterThan(0);
  });

  it('does not apply blur', () => {
    applyDissolveEffect(span, 1.0);
    expect(span.style.filter).toBe('');
  });

  it('does not replace character', () => {
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('span');
      s.textContent = 'X';
      s.dataset.original = 'X';
      applyDissolveEffect(s, 0.9);
      expect(s.textContent).toBe('X');
    }
  });

  it('shifts color toward background', () => {
    applyDissolveEffect(span, 1.0);
    expect(span.style.color).toContain('rgb');
  });
});

describe('applyVanishEffect', () => {
  let span: HTMLSpanElement;

  beforeEach(() => {
    span = document.createElement('span');
    span.textContent = 'C';
  });

  it('sets very low opacity at full intensity', () => {
    applyVanishEffect(span, 1.0);
    const opacity = parseFloat(span.style.opacity);
    expect(opacity).toBeLessThanOrEqual(0.01);
  });

  it('applies gentle blur at full intensity', () => {
    applyVanishEffect(span, 1.0);
    expect(span.style.filter).toContain('blur');
    // Should be max 1px, not the old aggressive 4px
    const match = span.style.filter.match(/blur\(([0-9.]+)px\)/);
    expect(match).not.toBeNull();
    expect(parseFloat(match![1])).toBeLessThanOrEqual(1);
  });

  it('does not apply blur at zero intensity', () => {
    applyVanishEffect(span, 0);
    // At 0 intensity, blur should be 0 or not applied
    if (span.style.filter) {
      const match = span.style.filter.match(/blur\(([0-9.]+)px\)/);
      if (match) {
        expect(parseFloat(match[1])).toBeLessThanOrEqual(0.01);
      }
    }
  });

  it('does not replace character', () => {
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('span');
      s.textContent = 'C';
      applyVanishEffect(s, 1.0);
      expect(s.textContent).toBe('C');
    }
  });
});
