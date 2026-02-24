import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderInvitation } from '../invitation';

describe('renderInvitation', () => {
  let container: HTMLElement;
  let onLetGo: ReturnType<typeof vi.fn<(secret: string) => void>>;

  beforeEach(() => {
    container = document.createElement('div');
    onLetGo = vi.fn<(secret: string) => void>();
    renderInvitation(container, onLetGo);
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
    const button = container.querySelector('.invitation__button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toBe('Let go');
    expect(button.disabled).toBe(true);
  });

  it('enables button when textarea has non-whitespace content', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector('.invitation__button') as HTMLButtonElement;

    textarea.value = '  hello  ';
    textarea.dispatchEvent(new Event('input'));

    expect(button.disabled).toBe(false);
  });

  it('keeps button disabled for whitespace-only content', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector('.invitation__button') as HTMLButtonElement;

    textarea.value = '   \n\t  ';
    textarea.dispatchEvent(new Event('input'));

    expect(button.disabled).toBe(true);
  });

  it('calls onLetGo with text when button is clicked', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector('.invitation__button') as HTMLButtonElement;

    textarea.value = 'my secret';
    textarea.dispatchEvent(new Event('input'));
    button.click();

    expect(onLetGo).toHaveBeenCalledWith('my secret');
  });

  it('truncates text at 5000 characters', () => {
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const button = container.querySelector('.invitation__button') as HTMLButtonElement;

    textarea.value = 'a'.repeat(6000);
    textarea.dispatchEvent(new Event('input'));
    button.click();

    expect(onLetGo).toHaveBeenCalledWith('a'.repeat(5000));
  });
});
