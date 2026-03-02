import { createElement } from '../ui/dom';

const MAX_SECRET_LENGTH = 5000;

export function renderInvitation(
  container: HTMLElement,
  onLetGo: (secret: string) => void,
): void {
  const phase = createElement('div', 'phase invitation');

  const heading = createElement('h1', 'invitation__heading', 'The Forgetting Machine');
  const subheading = createElement(
    'p',
    'invitation__subheading',
    'Nothing you write here will be saved.',
  );

  const textarea = document.createElement('textarea');
  textarea.className = 'invitation__textarea';
  textarea.setAttribute('spellcheck', 'false');
  textarea.setAttribute('autocomplete', 'off');
  textarea.setAttribute('autocorrect', 'off');
  textarea.setAttribute('autocapitalize', 'off');
  textarea.setAttribute('aria-label', 'Write something you want to let go of');
  textarea.rows = 1;

  const button = document.createElement('button');
  button.className = 'invitation__button';
  button.textContent = 'Let go';
  button.disabled = true;
  button.type = 'button';

  // Auto-resize textarea — min-height in CSS sets the initial size;
  // rows=1 prevents the rows attribute from competing with it.
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 150)}px`;
    button.disabled = textarea.value.trim().length === 0;
  });

  // Button click
  button.addEventListener('click', () => {
    const secret = textarea.value.slice(0, MAX_SECRET_LENGTH);
    if (secret.trim().length > 0) {
      onLetGo(secret);
    }
  });

  // Cmd/Ctrl+Enter keyboard shortcut
  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!button.disabled) {
        button.click();
      }
    }
  });

  phase.appendChild(heading);
  phase.appendChild(subheading);
  phase.appendChild(textarea);
  phase.appendChild(button);
  container.appendChild(phase);

  // Auto-focus on desktop only
  if (!isMobile()) {
    textarea.focus();
  }
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
