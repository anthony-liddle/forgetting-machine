import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderInvitation } from '../invitation';
import { TIMING } from '../../timing';

describe('renderInvitation', () => {
  let container: HTMLElement;
  let onLetGo: ReturnType<typeof vi.fn<(secret: string) => void>>;

  beforeEach(() => {
    container = document.createElement('div');
    onLetGo = vi.fn<(secret: string) => void>();
    renderInvitation(container, onLetGo);
  });

  afterEach(() => {
    document.getElementById('broadcast-announce')?.remove();
  });

  it('renders a heading', () => {
    const heading = container.querySelector('.invitation__heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('The Forgetting Machine');
  });

  it('renders a subheading', () => {
    const sub = container.querySelector('.invitation__subheading');
    expect(sub).not.toBeNull();
  });

  it('renders a textarea with correct attributes', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.getAttribute('spellcheck')).toBe('false');
    expect(textarea.getAttribute('autocomplete')).toBe('off');
  });

  it('renders a disabled button', () => {
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toBe('Let go');
    expect(button.disabled).toBe(true);
  });

  it('enables button when textarea has non-whitespace content', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;

    textarea.value = '  hello  ';
    textarea.dispatchEvent(new Event('input'));

    expect(button.disabled).toBe(false);
  });

  it('keeps button disabled for whitespace-only content', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;

    textarea.value = '   \n\t  ';
    textarea.dispatchEvent(new Event('input'));

    expect(button.disabled).toBe(true);
  });

  it('calls onLetGo with text when button is clicked', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;

    textarea.value = 'my secret';
    textarea.dispatchEvent(new Event('input'));
    button.click();

    expect(onLetGo).toHaveBeenCalledWith('my secret');
  });

  it('truncates text at 5000 characters', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;

    textarea.value = 'a'.repeat(6000);
    textarea.dispatchEvent(new Event('input'));
    button.click();

    expect(onLetGo).toHaveBeenCalledWith('a'.repeat(5000));
  });

  it('renders heading with splash class initially', () => {
    const heading = container.querySelector('.invitation__heading');
    expect(heading!.classList.contains('invitation__heading--splash')).toBe(
      true,
    );
    expect(heading!.classList.contains('invitation__heading--settled')).toBe(
      false,
    );
  });

  it('wraps subheading, textarea, and button in .invitation__form', () => {
    const form = container.querySelector('.invitation__form');
    expect(form).not.toBeNull();
    expect(form!.querySelector('.invitation__subheading')).not.toBeNull();
    expect(form!.querySelector('textarea')).not.toBeNull();
    expect(form!.querySelector('.invitation__button')).not.toBeNull();
  });

  it('creates #broadcast-announce live region on body and focuses it on button click', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector(
      '.invitation__button',
    ) as HTMLButtonElement;

    textarea.value = 'test secret';
    textarea.dispatchEvent(new Event('input'));
    button.click();

    const announceEl = document.getElementById('broadcast-announce');
    expect(announceEl).not.toBeNull();
    expect(announceEl!.parentElement).toBe(document.body);
    expect(announceEl!.getAttribute('aria-live')).toBe('polite');
    expect(announceEl!.getAttribute('aria-atomic')).toBe('true');
    expect(announceEl!.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(announceEl);
  });

  it('does not fire the heading live announcement on initial load', () => {
    vi.useFakeTimers();
    const freshContainer = document.createElement('div');
    renderInvitation(freshContainer, vi.fn(), false);
    const announcement = freshContainer.querySelector('[aria-live="polite"]');
    vi.advanceTimersByTime(TIMING.SPLASH_HOLD + TIMING.SPLASH_FORM_DELAY + 200);
    expect(announcement!.textContent).toBe('');
    vi.useRealTimers();
  });

  it('re-announces the heading via live region on reset before focus moves to input', () => {
    vi.useFakeTimers();
    const freshContainer = document.createElement('div');
    renderInvitation(freshContainer, vi.fn(), true);
    const announcement = freshContainer.querySelector('[aria-live="polite"]');
    expect(announcement).not.toBeNull();
    // Before the form reveals, announcement is empty
    vi.advanceTimersByTime(TIMING.SPLASH_HOLD + TIMING.SPLASH_FORM_DELAY);
    expect(announcement!.textContent).toBe('');
    // After form reveals + 100ms, heading is announced
    vi.advanceTimersByTime(100);
    expect(announcement!.textContent).toBe('The Forgetting Machine');
    vi.useRealTimers();
  });
});
