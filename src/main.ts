import './style.css';
import { renderInvitation } from '@/phases/invitation';
import { renderBroadcast } from '@/phases/broadcast';
import { renderSilence } from '@/phases/silence';
import { clearContainer, fadeOut } from '@/ui/dom';
import { musicManager } from '@/audio/musicManager';

type Phase = 'invitation' | 'broadcast' | 'silence';

/**
 * Bootstrap the app: set up the phase state machine and render the
 * initial invitation phase inside the #app container.
 */
function init(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const transitionTo = (phase: Phase, secret?: string): void => {
    const currentEl = root.querySelector('.phase') as HTMLElement | null;

    const renderNext = () => {
      clearContainer(root);

      switch (phase) {
        case 'invitation':
          renderInvitation(root, (text: string) => {
            transitionTo('broadcast', text);
          });
          break;

        case 'broadcast': {
          if (!secret) return;
          musicManager.initialize().then(() => musicManager.start());
          renderBroadcast(root, secret, () => {
            transitionTo('silence');
          });
          break;
        }

        case 'silence':
          musicManager.fadeOut();
          renderSilence(root, () => {
            transitionTo('invitation');
          });
          break;
      }
    };

    if (currentEl) {
      fadeOut(currentEl).then(renderNext);
    } else {
      renderNext();
    }
  };

  transitionTo('invitation');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
