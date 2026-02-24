# The Forgetting Machine — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static website where users write a secret, watch it decay over 60 seconds with a radio-signal aesthetic, then it's gone forever.

**Architecture:** Three-state machine (Invitation → Broadcast → Silence) with vanilla TypeScript, direct DOM manipulation. Per-character `<span>` decay with randomized thresholds. No framework, no server, no persistence.

**Tech Stack:** TypeScript, Vite, Vitest (jsdom), pnpm, plain CSS, Libre Baskerville font

---

### Task 1: Scaffold project with Vite + TypeScript

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

**Step 1: Initialize Vite project**

```bash
cd /Users/anthonyliddle/Development/forgetting-machine
pnpm create vite . --template vanilla-ts
```

If prompted about existing files, allow overwrite (only docs/ exists). This generates the base scaffolding.

**Step 2: Clean up generated files**

Remove the default Vite demo files that we don't need:

```bash
rm -f src/counter.ts src/typescript.svg src/style.css public/vite.svg
```

**Step 3: Update index.html**

Replace the generated `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Write a secret. Watch it disappear. Nothing is saved." />
    <title>The Forgetting Machine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**Step 4: Create minimal src/main.ts**

```typescript
const app = document.getElementById('app');
if (app) {
  app.textContent = 'The Forgetting Machine';
}
```

**Step 5: Create empty src/style.css**

```css
/* The Forgetting Machine */
```

**Step 6: Install dependencies and verify**

```bash
pnpm install
pnpm dev
```

Verify the dev server starts and shows "The Forgetting Machine" in the browser. Kill the dev server.

**Step 7: Install Vitest for testing**

```bash
pnpm add -D vitest jsdom
```

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Add test script to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + TypeScript project with Vitest"
```

---

### Task 2: Repo tooling setup (ESLint, Husky, commitlint, community files)

**Files:**
- Create: `eslint.config.mjs`
- Create: `commitlint.config.cjs`
- Create: `.husky/commit-msg`
- Create: `.husky/pre-commit`
- Create: `LICENSE`
- Create: `CODE_OF_CONDUCT.md`
- Create: `CONTRIBUTING.md`
- Create: `README.md`
- Create: `.github/workflows/test.yml`
- Create: `.github/dependabot.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/ISSUE_TEMPLATE/config.yml`

**Step 1: Install ESLint + TypeScript ESLint**

```bash
pnpm add -D eslint @eslint/js typescript-eslint globals
```

Create `eslint.config.mjs`:

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ignores: ['dist/'],
  },
);
```

Add lint script to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint src/"
  }
}
```

**Step 2: Install Husky + commitlint**

```bash
pnpm add -D husky @commitlint/cli @commitlint/config-conventional
npx husky init
```

Create `commitlint.config.cjs`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

Update `.husky/commit-msg`:

```bash
npx --no -- commitlint --edit ${1}
```

Update `.husky/pre-commit`:

```bash
npx tsc --noEmit && npx eslint src/
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
```

**Step 4: Create community files**

Create `LICENSE` (MIT, copyright Anthony Liddle, 2026).

Create `CODE_OF_CONDUCT.md` (Contributor Covenant v2.0).

Create `CONTRIBUTING.md` with: development setup (pnpm install, pnpm dev), commit conventions (conventional commits), code style (ESLint), PR process.

Create `README.md` with: title, one-line description ("Write a secret. Watch it disappear. Nothing is saved."), badges (MIT license, TypeScript), features, getting started, project structure, tech stack, contributing, license.

**Step 5: Create GitHub config files**

Create `.github/workflows/test.yml`:

```yaml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    commit-message:
      prefix: "chore(deps)"
    groups:
      minor-and-patch:
        update-types:
          - "minor"
          - "patch"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    commit-message:
      prefix: "chore(deps)"
    groups:
      minor-and-patch:
        update-types:
          - "minor"
          - "patch"
```

Create `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/ISSUE_TEMPLATE/config.yml` per global CLAUDE.md conventions.

**Step 6: Verify tooling works**

```bash
pnpm lint
pnpm test
pnpm build
```

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: add ESLint, Husky, commitlint, community files, and CI"
```

---

### Task 3: CSS foundation — design tokens and base styles

**Files:**
- Create: `src/style.css`

**Step 1: Write the complete stylesheet**

```css
:root {
  /* Color palette */
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --text-primary: #e8e0d4;
  --text-secondary: #6b6560;
  --accent: #c4956a;
  --noise-dark: #2a2520;
  --noise-light: #4a4540;

  /* Typography */
  --font-serif: 'Libre Baskerville', Georgia, 'Times New Roman', serif;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --font-size-secret: clamp(1.5rem, 4vw, 2.5rem);
  --line-height-secret: 1.7;

  /* Layout */
  --max-width: 640px;
  --padding: clamp(1.5rem, 5vw, 3rem);

  /* Transitions */
  --fade-duration: 300ms;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--padding);
}

/* Phase container — shared by all phases */
.phase {
  width: 100%;
  max-width: var(--max-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity var(--fade-duration) ease;
}

.phase.fade-out {
  opacity: 0;
}

/* Phase 1: Invitation */
.invitation__heading {
  font-family: var(--font-sans);
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

.invitation__subheading {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-style: italic;
}

.invitation__textarea {
  width: 100%;
  min-height: 150px;
  max-height: 50vh;
  padding: 1.25rem;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--noise-dark);
  border-radius: 4px;
  resize: none;
  overflow-y: auto;
  outline: none;
  transition: border-color 0.2s ease;
}

.invitation__textarea:focus {
  border-color: var(--text-secondary);
}

.invitation__button {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.invitation__button:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.invitation__button:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Phase 2: Broadcast */
.broadcast__text {
  font-family: var(--font-serif);
  font-size: var(--font-size-secret);
  line-height: var(--line-height-secret);
  color: var(--text-primary);
  text-align: center;
  word-break: break-word;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.broadcast__text .char {
  display: inline-block;
  transition: none;
  will-change: transform, opacity, filter, color;
}

.broadcast__text .word {
  display: inline-block;
  white-space: nowrap;
}

.progress {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--accent);
  transition: opacity 0.3s ease;
}

/* Phase 3: Silence */
.silence__text {
  font-family: var(--font-serif);
  font-size: clamp(1.25rem, 3vw, 2rem);
  color: var(--text-primary);
  font-style: italic;
  opacity: 1;
  transition: opacity 1s ease;
}

.silence__text.fade-out {
  opacity: 0;
}

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  .broadcast__text .char {
    will-change: opacity;
  }

  .phase {
    transition: opacity var(--fade-duration) ease;
  }
}

/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Step 2: Verify build**

```bash
pnpm build
```

**Step 3: Commit**

```bash
git add src/style.css
git commit -m "style: add CSS foundation with design tokens and phase styles"
```

---

### Task 4: DOM helpers

**Files:**
- Create: `src/ui/dom.ts`
- Create: `src/ui/__tests__/dom.test.ts`

**Step 1: Write failing tests**

```typescript
// src/ui/__tests__/dom.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createElement, clearContainer } from '../dom';

describe('createElement', () => {
  it('creates an element with tag, className, and text', () => {
    const el = createElement('p', 'test-class', 'Hello');
    expect(el.tagName).toBe('P');
    expect(el.className).toBe('test-class');
    expect(el.textContent).toBe('Hello');
  });

  it('creates an element without optional params', () => {
    const el = createElement('div');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('');
    expect(el.textContent).toBe('');
  });
});

describe('clearContainer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    const child1 = document.createElement('p');
    child1.textContent = 'child 1';
    const child2 = document.createElement('p');
    child2.textContent = 'child 2';
    container.appendChild(child1);
    container.appendChild(child2);
  });

  it('removes all children from a container', () => {
    clearContainer(container);
    expect(container.children.length).toBe(0);
    expect(container.childNodes.length).toBe(0);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

Expected: FAIL — modules not found.

**Step 3: Write implementation**

```typescript
// src/ui/dom.ts
export function createElement(
  tag: string,
  className?: string,
  textContent?: string,
): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

export function clearContainer(container: HTMLElement): void {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

export function fadeOut(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add('fade-out');
    element.addEventListener('transitionend', () => resolve(), { once: true });
    // Fallback if transition doesn't fire
    setTimeout(resolve, 400);
  });
}

export function fadeIn(element: HTMLElement): void {
  element.classList.remove('fade-out');
}
```

**Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/ui/dom.ts src/ui/__tests__/dom.test.ts
git commit -m "feat(ui): add DOM helper utilities"
```

---

### Task 5: Character sets for decay

**Files:**
- Create: `src/decay/characters.ts`
- Create: `src/decay/__tests__/characters.test.ts`

**Step 1: Write failing tests**

```typescript
// src/decay/__tests__/characters.test.ts
import { describe, it, expect } from 'vitest';
import { STATIC_CHARS, getRandomStaticChar } from '../characters';

describe('STATIC_CHARS', () => {
  it('contains block characters', () => {
    expect(STATIC_CHARS).toContain('\u2591');
    expect(STATIC_CHARS).toContain('\u2592');
    expect(STATIC_CHARS).toContain('\u2593');
  });

  it('contains space as final dissolution', () => {
    expect(STATIC_CHARS).toContain(' ');
  });
});

describe('getRandomStaticChar', () => {
  it('returns a character from the STATIC_CHARS set', () => {
    for (let i = 0; i < 20; i++) {
      const char = getRandomStaticChar();
      expect(STATIC_CHARS).toContain(char);
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/decay/characters.ts
export const STATIC_CHARS = ['\u2591', '\u2592', '\u2593', ' ', ' ', ' '];

export function getRandomStaticChar(): string {
  return STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)];
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/decay/characters.ts src/decay/__tests__/characters.test.ts
git commit -m "feat(decay): add static/noise character sets"
```

---

### Task 6: Decay engine — timing and per-character orchestration

**Files:**
- Create: `src/decay/engine.ts`
- Create: `src/decay/__tests__/engine.test.ts`

**Step 1: Write failing tests**

```typescript
// src/decay/__tests__/engine.test.ts
import { describe, it, expect } from 'vitest';
import {
  DecayPhase,
  getDecayPhase,
  createCharacterThresholds,
  DEFAULT_DECAY_CONFIG,
} from '../engine';

describe('getDecayPhase', () => {
  it('returns "clear" for progress 0-0.33', () => {
    expect(getDecayPhase(0)).toBe(DecayPhase.Clear);
    expect(getDecayPhase(0.1)).toBe(DecayPhase.Clear);
    expect(getDecayPhase(0.32)).toBe(DecayPhase.Clear);
  });

  it('returns "drift" for progress 0.33-0.67', () => {
    expect(getDecayPhase(0.33)).toBe(DecayPhase.Drift);
    expect(getDecayPhase(0.5)).toBe(DecayPhase.Drift);
    expect(getDecayPhase(0.66)).toBe(DecayPhase.Drift);
  });

  it('returns "dissolve" for progress 0.67-0.92', () => {
    expect(getDecayPhase(0.67)).toBe(DecayPhase.Dissolve);
    expect(getDecayPhase(0.8)).toBe(DecayPhase.Dissolve);
    expect(getDecayPhase(0.91)).toBe(DecayPhase.Dissolve);
  });

  it('returns "vanish" for progress 0.92-1.0', () => {
    expect(getDecayPhase(0.92)).toBe(DecayPhase.Vanish);
    expect(getDecayPhase(1.0)).toBe(DecayPhase.Vanish);
  });
});

describe('createCharacterThresholds', () => {
  it('creates an array of thresholds matching character count', () => {
    const thresholds = createCharacterThresholds(100, DEFAULT_DECAY_CONFIG);
    expect(thresholds.length).toBe(100);
  });

  it('all thresholds are between 0 and 1', () => {
    const thresholds = createCharacterThresholds(50, DEFAULT_DECAY_CONFIG);
    for (const t of thresholds) {
      expect(t.driftAt).toBeGreaterThanOrEqual(0);
      expect(t.driftAt).toBeLessThanOrEqual(1);
      expect(t.dissolveAt).toBeGreaterThanOrEqual(t.driftAt);
      expect(t.vanishAt).toBeGreaterThanOrEqual(t.dissolveAt);
      expect(t.vanishAt).toBeLessThanOrEqual(1);
    }
  });

  it('thresholds fall within their respective phase windows', () => {
    const config = DEFAULT_DECAY_CONFIG;
    const thresholds = createCharacterThresholds(200, config);
    for (const t of thresholds) {
      expect(t.driftAt).toBeGreaterThanOrEqual(config.phases.drift[0]);
      expect(t.driftAt).toBeLessThanOrEqual(config.phases.drift[1]);
      expect(t.dissolveAt).toBeGreaterThanOrEqual(config.phases.dissolve[0]);
      expect(t.dissolveAt).toBeLessThanOrEqual(config.phases.dissolve[1]);
      expect(t.vanishAt).toBeGreaterThanOrEqual(config.phases.vanish[0]);
      expect(t.vanishAt).toBeLessThanOrEqual(config.phases.vanish[1]);
    }
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/decay/engine.ts
export enum DecayPhase {
  Clear = 'clear',
  Drift = 'drift',
  Dissolve = 'dissolve',
  Vanish = 'vanish',
}

export interface DecayConfig {
  totalDuration: number;
  phases: {
    clear: [number, number];
    drift: [number, number];
    dissolve: [number, number];
    vanish: [number, number];
  };
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  totalDuration: 60000,
  phases: {
    clear: [0, 0.33],
    drift: [0.33, 0.67],
    dissolve: [0.67, 0.92],
    vanish: [0.92, 1.0],
  },
};

export interface CharacterThreshold {
  driftAt: number;
  dissolveAt: number;
  vanishAt: number;
}

export function getDecayPhase(progress: number): DecayPhase {
  if (progress < 0.33) return DecayPhase.Clear;
  if (progress < 0.67) return DecayPhase.Drift;
  if (progress < 0.92) return DecayPhase.Dissolve;
  return DecayPhase.Vanish;
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createCharacterThresholds(
  count: number,
  config: DecayConfig,
): CharacterThreshold[] {
  const thresholds: CharacterThreshold[] = [];
  for (let i = 0; i < count; i++) {
    thresholds.push({
      driftAt: randomInRange(config.phases.drift[0], config.phases.drift[1]),
      dissolveAt: randomInRange(config.phases.dissolve[0], config.phases.dissolve[1]),
      vanishAt: randomInRange(config.phases.vanish[0], config.phases.vanish[1]),
    });
  }
  return thresholds;
}

export type DecayTickCallback = (progress: number) => void;

export function startDecayLoop(
  config: DecayConfig,
  onTick: DecayTickCallback,
  onComplete: () => void,
): () => void {
  const startTime = performance.now();
  let animationId: number;
  let stopped = false;

  function tick() {
    if (stopped) return;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / config.totalDuration, 1);

    onTick(progress);

    if (progress >= 1) {
      onComplete();
      return;
    }

    animationId = requestAnimationFrame(tick);
  }

  animationId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(animationId);
  };
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/decay/engine.ts src/decay/__tests__/engine.test.ts
git commit -m "feat(decay): add decay engine with timing and per-character thresholds"
```

---

### Task 7: Decay effects — per-character visual transformations

**Files:**
- Create: `src/decay/effects.ts`
- Create: `src/decay/__tests__/effects.test.ts`

**Step 1: Write failing tests**

```typescript
// src/decay/__tests__/effects.test.ts
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
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/decay/effects.ts
import { getRandomStaticChar } from './characters';

export function applyDriftEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 1 - intensity * 0.3;
  const jitterX = (Math.random() - 0.5) * intensity * 3;
  const jitterY = (Math.random() - 0.5) * intensity * 1;

  span.style.opacity = String(opacity);
  span.style.transform = `translateX(${jitterX}px) translateY(${jitterY}px)`;

  // Subtle color shift toward background
  const colorShift = Math.round(intensity * 30);
  const r = 232 - colorShift;
  const g = 224 - colorShift;
  const b = 212 - colorShift;
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

export function applyDissolveEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 0.7 - intensity * 0.5;
  const blur = intensity * 2.5;
  const jitterX = (Math.random() - 0.5) * 4;
  const jitterY = (Math.random() - 0.5) * 3;

  span.style.opacity = String(Math.max(0, opacity));
  span.style.filter = `blur(${blur}px)`;
  span.style.transform = `translateX(${jitterX}px) translateY(${jitterY}px)`;

  // Character replacement — more likely as intensity increases
  if (Math.random() < intensity * 0.6) {
    span.textContent = getRandomStaticChar();
  }

  // Color fades toward background
  const colorShift = Math.round(30 + intensity * 60);
  const r = 232 - colorShift;
  const g = 224 - colorShift;
  const b = 212 - colorShift;
  span.style.color = `rgb(${r}, ${g}, ${b})`;
}

export function applyVanishEffect(span: HTMLSpanElement, intensity: number): void {
  const opacity = 0.2 * (1 - intensity);
  const blur = 2 + intensity * 2;

  span.style.opacity = String(Math.max(0, opacity));
  span.style.filter = `blur(${blur}px)`;
  span.style.transform = `translateX(${(Math.random() - 0.5) * 2}px)`;

  // Replace remaining characters with spaces
  if (Math.random() < intensity) {
    span.textContent = ' ';
  }

  span.style.color = `rgb(${42 + Math.round((1 - intensity) * 30)}, ${37 + Math.round((1 - intensity) * 25)}, ${32 + Math.round((1 - intensity) * 20)})`;
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/decay/effects.ts src/decay/__tests__/effects.test.ts
git commit -m "feat(decay): add per-character visual decay effects"
```

---

### Task 8: Progress bar component

**Files:**
- Create: `src/ui/progress.ts`
- Create: `src/ui/__tests__/progress.test.ts`

**Step 1: Write failing tests**

```typescript
// src/ui/__tests__/progress.test.ts
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
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/ui/progress.ts
export function createProgressBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.style.width = '100%';
  bar.setAttribute('role', 'presentation');
  return bar;
}

export function updateProgressBar(bar: HTMLElement, progress: number): void {
  const remaining = Math.max(0, 1 - progress);
  bar.style.width = `${remaining * 100}%`;
  bar.style.opacity = String(Math.max(0.2, remaining));
}

export function removeProgressBar(bar: HTMLElement): void {
  bar.remove();
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/ui/progress.ts src/ui/__tests__/progress.test.ts
git commit -m "feat(ui): add progress bar component"
```

---

### Task 9: Phase 1 — Invitation

**Files:**
- Create: `src/phases/invitation.ts`
- Create: `src/phases/__tests__/invitation.test.ts`

**Step 1: Write failing tests**

```typescript
// src/phases/__tests__/invitation.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderInvitation } from '../invitation';

describe('renderInvitation', () => {
  let container: HTMLElement;
  let onLetGo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    onLetGo = vi.fn();
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
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/phases/invitation.ts
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
  textarea.rows = 6;

  const button = document.createElement('button');
  button.className = 'invitation__button';
  button.textContent = 'Let go';
  button.disabled = true;
  button.type = 'button';

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
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
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/phases/invitation.ts src/phases/__tests__/invitation.test.ts
git commit -m "feat(phases): add invitation phase with textarea and Let go button"
```

---

### Task 10: Phase 2 — Broadcast (display + decay integration)

**Files:**
- Create: `src/phases/broadcast.ts`
- Create: `src/phases/__tests__/broadcast.test.ts`

**Step 1: Write failing tests**

```typescript
// src/phases/__tests__/broadcast.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderBroadcast, wrapTextInSpans } from '../broadcast';

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

  it('creates an aria-live region with the secret text', () => {
    renderBroadcast(container, 'My secret', vi.fn());
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live!.textContent).toBe('My secret');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/phases/broadcast.ts
import { createElement, clearContainer } from '../ui/dom';
import { createProgressBar, updateProgressBar, removeProgressBar } from '../ui/progress';
import {
  DEFAULT_DECAY_CONFIG,
  createCharacterThresholds,
  startDecayLoop,
  getDecayPhase,
  DecayPhase,
  DecayConfig,
} from '../decay/engine';
import { applyDriftEffect, applyDissolveEffect, applyVanishEffect } from '../decay/effects';

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

  // Accessibility: aria-live region with full text
  const liveRegion = createElement('div', 'sr-only');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.textContent = secret;

  // Progress bar
  const progressBar = createProgressBar();

  phase.appendChild(textContainer);
  phase.appendChild(liveRegion);
  container.appendChild(phase);
  document.body.appendChild(progressBar);

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
          const vanishIntensity =
            (progress - t.vanishAt) / (1 - t.vanishAt);
          applyVanishEffect(span, Math.min(1, vanishIntensity));
        } else if (progress >= t.dissolveAt) {
          const dissolveIntensity =
            (progress - t.dissolveAt) /
            (t.vanishAt - t.dissolveAt);
          applyDissolveEffect(span, Math.min(1, dissolveIntensity));
        } else if (progress >= t.driftAt) {
          const driftIntensity =
            (progress - t.driftAt) /
            (t.dissolveAt - t.driftAt);
          applyDriftEffect(span, Math.min(1, driftIntensity));
        }
      });
    },
    () => {
      // Cleanup: clear all span content before removing
      charSpans.forEach((span) => {
        span.textContent = '';
      });
      liveRegion.textContent = '';
      removeProgressBar(progressBar);
      clearContainer(textContainer);
      onComplete();
    },
  );

  // Return cleanup function
  return stopLoop;
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/phases/broadcast.ts src/phases/__tests__/broadcast.test.ts
git commit -m "feat(phases): add broadcast phase with decay engine integration"
```

---

### Task 11: Phase 3 — Silence

**Files:**
- Create: `src/phases/silence.ts`
- Create: `src/phases/__tests__/silence.test.ts`

**Step 1: Write failing tests**

```typescript
// src/phases/__tests__/silence.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderSilence } from '../silence';

describe('renderSilence', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders "Gone." in italic serif', () => {
    renderSilence(container, vi.fn());
    const text = container.querySelector('.silence__text');
    expect(text).not.toBeNull();
    expect(text!.textContent).toBe('Gone.');
  });

  it('announces "Gone." to screen readers via aria-live', () => {
    renderSilence(container, vi.fn());
    const live = container.querySelector('[aria-live]');
    expect(live).not.toBeNull();
    expect(live!.textContent).toBe('Gone.');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/phases/silence.ts
import { createElement } from '../ui/dom';

export function renderSilence(
  container: HTMLElement,
  onReset: () => void,
): void {
  const phase = createElement('div', 'phase silence');

  const text = createElement('span', 'silence__text', 'Gone.');

  // Aria-live for screen readers
  const liveRegion = createElement('div', 'sr-only');
  liveRegion.setAttribute('aria-live', 'assertive');
  liveRegion.textContent = 'Gone.';

  phase.appendChild(text);
  phase.appendChild(liveRegion);
  container.appendChild(phase);

  // After ~3 seconds, fade "Gone." and return to invitation
  const fadeTimeout = setTimeout(() => {
    text.classList.add('fade-out');

    const resetTimeout = setTimeout(() => {
      onReset();
    }, 1000);

    // Listen for early interaction to reset sooner
    const earlyReset = () => {
      clearTimeout(resetTimeout);
      onReset();
    };

    document.addEventListener('keydown', earlyReset, { once: true });
    document.addEventListener('click', earlyReset, { once: true });
  }, 3000);

  // Also allow any keypress/click during the initial 3s hold
  // Only listen after a brief delay to prevent accidental triggers
  setTimeout(() => {
    const earlyInteraction = () => {
      clearTimeout(fadeTimeout);
      text.classList.add('fade-out');
      setTimeout(onReset, 500);
    };

    document.addEventListener('keydown', earlyInteraction, { once: true });
    document.addEventListener('click', earlyInteraction, { once: true });
  }, 500);
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Commit**

```bash
git add src/phases/silence.ts src/phases/__tests__/silence.test.ts
git commit -m "feat(phases): add silence phase with Gone text and auto-reset"
```

---

### Task 12: Main entry point — state machine orchestration

**Files:**
- Modify: `src/main.ts`
- Create: `src/__tests__/main.test.ts`

**Step 1: Write failing tests**

```typescript
// src/__tests__/main.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

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
```

**Step 2: Run tests to verify they fail**

```bash
pnpm test
```

**Step 3: Write implementation**

```typescript
// src/main.ts
import './style.css';
import { renderInvitation } from './phases/invitation';
import { renderBroadcast } from './phases/broadcast';
import { renderSilence } from './phases/silence';
import { clearContainer, fadeOut } from './ui/dom';

type Phase = 'invitation' | 'broadcast' | 'silence';

function app(): void {
  const root = document.getElementById('app');
  if (!root) return;

  function transitionTo(phase: Phase, secret?: string): void {
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
          renderBroadcast(root, secret, () => {
            transitionTo('silence');
          });
          break;
        }

        case 'silence':
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
  }

  transitionTo('invitation');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app);
} else {
  app();
}
```

**Step 4: Run tests, verify pass**

```bash
pnpm test
```

**Step 5: Verify full app works in browser**

```bash
pnpm dev
```

Open browser, verify:
1. Invitation phase shows with heading, subheading, textarea, disabled button
2. Typing enables button
3. Clicking "Let go" transitions to broadcast with decaying text
4. After 60s, shows "Gone."
5. Returns to invitation

Kill dev server.

**Step 6: Commit**

```bash
git add src/main.ts src/__tests__/main.test.ts
git commit -m "feat: add state machine orchestration and wire all phases together"
```

---

### Task 13: Security hardening and meta tags

**Files:**
- Modify: `index.html` (add CSP and OG meta tags)

**Step 1: Add security and social meta tags to index.html**

Add inside `<head>`:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'" />
<meta property="og:title" content="The Forgetting Machine" />
<meta property="og:description" content="Leave here lighter than before." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="The Forgetting Machine" />
<meta name="twitter:description" content="Leave here lighter than before." />
```

**Step 2: Verify build still works**

```bash
pnpm build
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "chore: add CSP headers and OG meta tags"
```

---

### Task 14: Final integration test — full flow

**Step 1: Run full test suite, lint, and build**

```bash
pnpm test
pnpm lint
pnpm build
```

All must pass.

**Step 2: Run dev server and manually test the complete arc**

```bash
pnpm dev
```

Verify the complete experience:
1. Page loads fast, dark background, Libre Baskerville loads
2. Heading: "The Forgetting Machine", subheading, textarea, disabled button
3. Type a secret, button enables
4. Cmd+Enter or click "Let go" — 300ms fade transition
5. Secret displayed in large serif, progress bar at bottom
6. 0-20s: text is crisp and clear
7. 20-40s: subtle jitter, opacity shifts, color drift
8. 40-55s: blur, character replacement with static blocks, heavy decay
9. 55-60s: final fade to nothing
10. "Gone." appears centered in italic
11. After ~3s (or keypress), fades and returns to invitation
12. Repeat

**Step 3: Verify security guarantees in DevTools**

- **Network tab**: no requests during/after broadcast (only initial page load + font)
- **Application tab > Storage**: no localStorage, sessionStorage, cookies, IndexedDB entries
- **Console**: no output containing secret text
- **Elements**: after "Gone.", inspect DOM — no trace of secret characters

**Step 4: Build production bundle and verify size**

```bash
pnpm build
ls -la dist/
```

Bundle should be tiny — well under 50KB for JS + CSS.

**Step 5: Preview production build**

```bash
pnpm preview
```

Verify identical behavior to dev.

**Step 6: Final commit if any adjustments were needed**

```bash
git add -A
git commit -m "chore: final integration verification"
```
