import { createElement, clearContainer } from '@/ui/dom';
import {
  createProgressBar,
  updateProgressBar,
  removeProgressBar,
} from '@/ui/progress';
import {
  DEFAULT_DECAY_CONFIG,
  createCharacterThresholds,
  startDecayLoop,
  getDecayPhase,
  DecayPhase,
} from '@/decay/engine';
import type { DecayConfig } from '@/decay/engine';
import {
  applyDriftEffect,
  applyDissolveEffect,
  applyVanishEffect,
} from '@/decay/effects';
import { TIMING } from '@/timing';

/**
 * Convert a string into per-character `<span>` elements inside the container.
 * Preserves line breaks as `<br>` and wraps each word in a `.word` span
 * so the browser can break lines between words, not mid-word.
 */
export function wrapTextInSpans(
  text: string,
  container: HTMLElement,
): HTMLSpanElement[] {
  const allCharSpans: HTMLSpanElement[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      container.appendChild(document.createElement('br'));
    }

    const words = line.split(/( )/);

    words.forEach((word) => {
      if (word === '') return;

      if (word === ' ') {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ' ';
        span.dataset.original = ' ';
        container.appendChild(span);
        allCharSpans.push(span);
        return;
      }

      const wordSpan = createElement('span', 'word');

      for (const char of word) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.dataset.original = char;
        wordSpan.appendChild(span);
        allCharSpans.push(span);
      }

      container.appendChild(wordSpan);
    });
  });

  return allCharSpans;
}

/**
 * Render the broadcast phase: display the secret text with a per-character
 * staggered decay animation over the configured duration.
 * The text fades in over 1000ms, then each character independently drifts,
 * dissolves, and vanishes. A progress bar tracks elapsed time.
 * Calls `onComplete` when the animation finishes.
 * Returns a cleanup function to stop the decay loop early.
 */
export function renderBroadcast(
  container: HTMLElement,
  secret: string,
  onComplete: () => void,
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
): () => void {
  const phase = createElement('div', 'phase broadcast');
  const textContainer = createElement('div', 'broadcast__text');

  // Wrap secret into per-character spans
  const charSpans = wrapTextInSpans(secret, textContainer);

  // Accessibility: aria-live region for the secret text.
  // The region must be in the DOM (empty) before content is injected so
  // VoiceOver registers it as a monitored live region and announces the
  // subsequent change rather than ignoring pre-existing content.
  const liveRegion = createElement('div', 'sr-only');
  liveRegion.setAttribute('aria-live', 'polite');

  // Progress bar
  const progressBar = createProgressBar();

  phase.appendChild(textContainer);
  phase.appendChild(liveRegion);
  container.appendChild(phase);
  document.body.appendChild(progressBar);

  // Inject the secret after one task turn so VoiceOver observes the change.
  setTimeout(() => {
    liveRegion.textContent = secret;
  }, 100);

  // Fade in the broadcast text (duration: TIMING.BROADCAST_FADE_IN, controlled by CSS)
  textContainer.style.setProperty(
    '--broadcast-fade-in',
    `${TIMING.BROADCAST_FADE_IN}ms`,
  );
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      textContainer.classList.add('fade-in');
    });
  });

  // Create per-character decay thresholds
  const thresholds = createCharacterThresholds(charSpans.length, config);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  // Performance monitoring for mobile degradation
  let lastFrameTime = performance.now();
  let slowFrameCount = 0;
  let degraded = false;
  const SLOW_FRAME_THRESHOLD = 33;
  const DEGRADATION_TRIGGER = 10;

  // Start the decay loop
  const stopLoop = startDecayLoop(
    config,
    (progress: number) => {
      updateProgressBar(progressBar, progress);

      // Performance check
      const now = performance.now();
      if (now - lastFrameTime > SLOW_FRAME_THRESHOLD) {
        slowFrameCount++;
      }
      lastFrameTime = now;

      if (slowFrameCount >= DEGRADATION_TRIGGER && !degraded) {
        degraded = true;
      }

      if (prefersReducedMotion || degraded) {
        // Simple fade for reduced motion or degraded performance
        textContainer.style.opacity = String(Math.max(0, 1 - progress));
        return;
      }

      const currentPhase = getDecayPhase(progress);

      charSpans.forEach((span, index) => {
        const t = thresholds[index];

        if (currentPhase === DecayPhase.Clear) return;

        if (progress >= t.vanishAt) {
          const vanishIntensity = (progress - t.vanishAt) / (1 - t.vanishAt);
          applyVanishEffect(span, Math.min(1, vanishIntensity));
        } else if (progress >= t.dissolveAt) {
          const dissolveIntensity =
            (progress - t.dissolveAt) / (t.vanishAt - t.dissolveAt);
          applyDissolveEffect(span, Math.min(1, dissolveIntensity));
        } else if (progress >= t.driftAt) {
          const driftIntensity =
            (progress - t.driftAt) / (t.dissolveAt - t.driftAt);
          applyDriftEffect(span, Math.min(1, driftIntensity));
        }
      });
    },
    () => {
      // Clear the live region first so screen readers can't re-read the secret,
      // then erase the visible characters, then dismantle the rest.
      liveRegion.textContent = '';
      charSpans.forEach((span) => {
        span.textContent = '';
      });
      removeProgressBar(progressBar);
      clearContainer(textContainer);
      onComplete();
    },
  );

  // Return cleanup function
  return stopLoop;
}
