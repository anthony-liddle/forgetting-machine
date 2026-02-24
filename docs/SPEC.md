# The Forgetting Machine

A website where you write a secret. It displays it beautifully for exactly 60 seconds, then it's gone forever.

No database. No logs. No accounts. No server.

*Nothing you write here will be saved. Leave here lighter than before.*

---

## Philosophy

Most software fights entropy. It saves, syncs, backs up, replicates. Every keystroke is a permanent record. The Forgetting Machine does the opposite — it exists to help you let go.

This is not a privacy tool. It's not a secure messaging app. It's a ritual. You write something you've been carrying, and you watch it leave. The 60-second window isn't a limitation — it's the experience. Long enough to read it back. Long enough to sit with it. Short enough that when it's gone, it's gone.

The secret never touches a server. It lives in a JavaScript variable inside your browser tab and nowhere else. When the timer ends, the variable is overwritten. The DOM is cleared. There is nothing to recover. The ephemerality isn't a feature — it's the entire product.

Think of it like a radio station you're driving away from. The signal was always there. You just can't hear it anymore.

---

## Experience Design

### The Arc

The user experience has three distinct phases. Each has a different emotional register.

**Phase 1 — The Invitation** (Landing)

The user arrives at a quiet, mostly empty page. Dark background. A single heading. A short line of copy. A text area. The page communicates: *this is a safe place to put something down.*

There is no sign-up. No explanation of how it works beyond what's immediately visible. No FAQ. The design should be self-evident. If you have to explain it, you've already broken the spell.

The only interactive element is the text area and a single button. The button does not say "Submit." It says **"Let go."**

**Phase 2 — The Broadcast** (60 seconds)

After pressing "Let go," the writing interface disappears. The secret is now displayed in beautiful, centered typography — large, serif, treated with reverence. A thin progress bar (or subtle arc) indicates the remaining time without creating anxiety. There is no numerical countdown. No ticking. Just a quiet visual indicator that recedes like a tide.

Over the 60 seconds, the text undergoes a slow visual transformation inspired by a fading radio signal. This is not abrupt. The text doesn't "break" — it *drifts*. Possible treatments, layered progressively:

- **0–20s**: The text is crisp and clear. Full presence. The user reads it back.
- **20–40s**: Subtle static/noise begins to creep into the rendering. Faint scan lines. Very slight letter displacement. The signal is weakening. Characters may occasionally flicker or shift by a pixel or two.
- **40–55s**: The noise increases. Letters become harder to read. The text is still *there* but it's slipping away. Gaps appear. Some characters dissolve into static. The signal is almost out of range.
- **55–60s**: A final fade. The remaining fragments wash out. The screen goes quiet.

The decay should feel analog, not digital. Not a glitch aesthetic — a *distance* aesthetic. Like holding a transistor radio and watching the signal meter drop.

**Phase 3 — The Silence** (Post-expiry)

The secret is gone. The screen holds on a single line for a few seconds:

*Gone.*

Then even that fades. The page returns to Phase 1 — the invitation. Ready for the next person, or the same person, to let go of something else. No confirmation. No "your secret has been deleted" messaging. It's just... not there anymore.

### What It Is Not

- It is not shareable. There are no links to send. No "share this secret" flow. This is between you and the void.
- It is not social. There is no feed of other people's secrets. No anonymous posting board. One person, one secret, one moment.
- It is not a tool. There are no features to unlock, no settings to configure, no accounts to create.
- It is not permanent. That is the point.

---

## Visual Design

### Overall Aesthetic

Dark, warm, minimal. The page should feel like a late-night radio broadcast — intimate, slightly analog, not cold. Think less "hacker terminal" and more "the last station on the dial."

### Color Palette

| Role | Value | Notes |
|---|---|---|
| Background | `#0a0a0a` – `#111111` | Near-black, not pure black. Warm. |
| Primary text | `#e8e0d4` | Warm off-white. Not clinical. |
| Secondary text | `#6b6560` | Muted warm gray for supporting copy. |
| Accent | `#c4956a` | Warm amber. Used sparingly — the progress indicator, the button hover. |
| Static/noise | `#2a2520` – `#4a4540` | Warm grays for the decay particles. |

### Typography

- **Secret display**: A serif typeface. Georgia as the system fallback; load a web font like Playfair Display, Lora, or Libre Baskerville if performance allows. Large — `clamp(1.5rem, 4vw, 2.5rem)`. Generous line height (`1.6–1.8`).
- **UI text** (heading, button, "Gone."): A clean sans-serif. System font stack or Inter. Small, understated.
- **The "Gone." text**: Same serif as the secret. Slightly smaller. Centered. Italic.

### Layout

Vertically and horizontally centered. Max-width on the text area and display — probably `640px`. Generous padding. The page is mostly negative space. On mobile, the text area should fill the width with comfortable margins.

### The Decay Effect

The signal-fade effect is the heart of the visual design. Implementation approaches, in order of preference:

1. **Canvas overlay**: Render the text in the DOM for accessibility, then overlay a `<canvas>` element that progressively introduces noise, scan lines, and character displacement. The canvas reads the text positions and draws interference patterns over them.

2. **Per-character `<span>` manipulation**: Wrap each character in a `<span>`. Over time, apply transforms — `opacity`, `translateX/Y` jitter, `filter: blur()`, and occasionally replace characters with static block characters (`░`, `▒`, `▓`). This is more DOM-heavy but gives precise control.

3. **CSS-only with layered pseudo-elements**: Use `::before`/`::after` overlays with animated noise backgrounds (CSS gradients or a small tiled noise texture). Simpler but less character-level control.

The recommended approach is **option 2** — it aligns with the ASCII/character-level aesthetic from your other projects, gives precise timing control per character, and creates the feeling of individual letters losing signal rather than a blanket fade.

### Progress Indicator

A single thin horizontal line at the bottom of the viewport (or below the text). Full width at 60s, receding to zero. Color: the warm amber accent, fading to transparent as it shrinks. No numbers. No percentage. Just a presence that diminishes.

---

## Technical Spec

### Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript (vanilla, no framework) | Purity. This is too small and too intentional for React. Direct DOM manipulation. |
| Build | Vite | Matches your existing toolchain. Fast, zero-config for vanilla TS. |
| Styling | Plain CSS (single file) | No preprocessor needed. CSS custom properties for the palette. |
| Hosting | Vercel (or any static host) | Zero server. Just static files. |
| Font loading | `<link rel="preload">` + `font-display: swap` | Performance-first. System fallback is fine. |

### Project Structure

```
the-forgetting-machine/
├── src/
│   ├── main.ts              # Entry point, phase orchestration
│   ├── phases/
│   │   ├── invitation.ts    # Phase 1: text input UI
│   │   ├── broadcast.ts     # Phase 2: display + decay engine
│   │   └── silence.ts       # Phase 3: "Gone." + reset
│   ├── decay/
│   │   ├── engine.ts        # Decay timing and orchestration
│   │   ├── effects.ts       # Character-level visual effects
│   │   └── characters.ts    # Static/noise character sets
│   ├── ui/
│   │   ├── progress.ts      # Progress bar component
│   │   └── dom.ts           # DOM helpers (create, clear, animate)
│   └── style.css            # Single stylesheet
├── index.html
├── public/
│   └── (favicon, OG image)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.mjs
├── .husky/
├── commitlint.config.cjs
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE                   # MIT
└── README.md
```

### Architecture

The application is a state machine with three states. No router. No navigation. Just transitions.

```
┌──────────────┐     "Let go"     ┌──────────────┐     Timer = 0     ┌──────────────┐
│              │ ──────────────▶  │              │ ──────────────▶   │              │
│  INVITATION  │                  │  BROADCAST   │                   │   SILENCE    │
│              │ ◀──────────────  │              │                   │              │
└──────────────┘     Reset        └──────────────┘                   └──────┬───────┘
       ▲                                                                    │
       └────────────────────────────────────────────────────────────────────┘
                                    ~3 seconds
```

Each phase owns its own DOM. On transition, the previous phase's DOM is cleared and the new phase renders into the same root container. The secret text is passed from Invitation → Broadcast as a function argument. It is never stored in `localStorage`, `sessionStorage`, a cookie, a URL parameter, or any persistent medium.

### The Secret Lifecycle

```
1. User types into <textarea>              → secret exists in textarea.value
2. User clicks "Let go"                    → secret is read into a local variable
3. textarea is removed from DOM            → textarea.value is gone
4. secret is rendered as <span> elements   → variable is overwritten with empty string
5. Timer runs for 60 seconds               → secret exists only in the DOM
6. Decay effect progressively destroys     → characters are replaced/removed from DOM
7. Timer hits 0, DOM is cleared            → secret exists nowhere
```

At no point does the secret exist in more than one place. Each handoff is a *move*, not a copy.

### Decay Engine Detail

The decay engine operates on a `requestAnimationFrame` loop for smooth visual updates, with the 60-second timer driven by `performance.now()` for accuracy.

```typescript
interface DecayConfig {
  totalDuration: number;       // 60000ms
  phases: {
    clear:    [0, 0.33];      // 0-20s: no decay
    drift:    [0.33, 0.67];   // 20-40s: subtle interference
    dissolve: [0.67, 0.92];   // 40-55s: heavy decay
    vanish:   [0.92, 1.0];    // 55-60s: final fade
  };
}
```

Each character `<span>` is assigned a random decay threshold within its phase window. When the global progress crosses a character's threshold, the effect is applied. This creates an organic, non-uniform dissolution — some characters go early, some hang on. Just like a real signal.

**Effect types applied per character:**

| Effect | CSS Property | Phase |
|---|---|---|
| Opacity reduction | `opacity: 0.7 → 0` | drift → vanish |
| Horizontal jitter | `translateX(±1-3px)` | drift → dissolve |
| Vertical drift | `translateY(±1-2px)` | dissolve |
| Blur | `filter: blur(1-3px)` | dissolve → vanish |
| Character replacement | Replace with `░`, `▒`, `▓`, or space | dissolve → vanish |
| Color fade | Shift toward background color | drift → vanish |

### Security and Privacy Guarantees

These are not aspirational. They are hard constraints.

1. **No network requests carrying the secret.** The secret never leaves the browser. No analytics. No error reporting that could capture DOM state. No server-side rendering.
2. **No persistent storage.** The secret is never written to `localStorage`, `sessionStorage`, `IndexedDB`, cookies, or the URL. A page refresh during Phase 2 destroys the secret.
3. **No clipboard interaction.** The site does not programmatically interact with the clipboard. (We can't prevent manual copy — and we don't try. This isn't about control. It's about ritual.)
4. **No logging.** `console.log` is never called with the secret text. In production builds, the secret variable name should be minified and non-descriptive.
5. **CSP headers.** The site should serve a strict Content Security Policy: no inline scripts (use nonce or hash), no external script sources beyond the font CDN if applicable. This prevents injection attacks that could exfiltrate DOM content.
6. **Memory cleanup.** After Phase 2 completes, the secret variable is overwritten with an empty string before the DOM is cleared. The DOM nodes are removed. If using the per-character `<span>` approach, the `textContent` of each span is cleared before the span is removed. Belt and suspenders.

### Analytics

The only telemetry that is acceptable:

- A simple, privacy-respecting page view counter (e.g., Plausible, or a Vercel Analytics hit). No cookies. No user identification.
- PostHog is acceptable if configured in the same privacy-respecting manner as your rock-paper-scissors project (no cookies, honors Do Not Track).

What is never tracked: the content of secrets, the length of secrets, the time spent on the page, or any behavioral data that could be correlated to a specific secret-writing session.

---

## Interaction Details

### The Text Area

- No character limit visible to the user. Internally, cap at ~5,000 characters to prevent performance issues with the per-character decay rendering.
- No placeholder text in the input field itself. A label or heading above it provides context.
- Auto-focus on page load (desktop). On mobile, do not auto-focus — let the user tap deliberately.
- The textarea grows vertically with content (auto-resize), up to a max height, then scrolls.
- No spell-check. No autocorrect attributes. `spellcheck="false"` and `autocomplete="off"`. This isn't a document — it's a release.

### The "Let Go" Button

- Disabled until the textarea has content (at least 1 non-whitespace character).
- No confirmation dialog. Pressing the button is the commitment. Asking "are you sure?" undermines the act.
- On press, a brief transition (~300ms) fades the input UI out before the broadcast fades in. This is not instant — there should be a breath between the act of releasing and the moment of seeing.

### Keyboard Support

- `Cmd/Ctrl + Enter` triggers "Let go" (standard form submission shortcut).
- During Phase 2, `Escape` does nothing. There is no way to cancel, extend, or save. You chose to let go.
- After Phase 3 resolves, any keypress or click returns to Phase 1.

### Mobile Considerations

- The text area should be comfortably sized for thumb typing. Minimum height of ~150px.
- The decay effect should be performant on mobile. If per-character manipulation causes frame drops, degrade gracefully to a simpler opacity + blur fade on the whole text block. Feature-detect via `requestAnimationFrame` timing.
- The progress bar should be visible without scrolling during Phase 2. Ensure the secret display + progress bar fit within the viewport. If the secret is long, allow vertical scroll during Phase 2 but keep the progress bar fixed at the bottom.
- Respect `prefers-reduced-motion`. If set, skip the character-level decay and use a simple crossfade to "Gone."

---

## Open Questions

Things to resolve during development, not in this spec:

1. **Sound?** A faint ambient hum during Phase 2 that fades with the signal could be beautiful. But it could also be annoying or unexpected. Consider it as a v2 feature, toggled off by default, using the Soundscape Engine. The philosophical argument for it: radio stations have sound. The argument against: silence *is* the sound of letting go.

2. **Repeat visits.** Should the site feel different on a second visit? Currently: no. Every visit is the same. But there's a possible v2 where the landing page copy rotates subtly — different phrasings of the same invitation. Nothing that implies memory of the user. Just variety.

3. **The OG image / social preview.** When someone shares the URL on social media, what does the card look like? It can't reveal anything about secrets. Suggestion: a dark card with just the name and tagline. "The Forgetting Machine — Leave here lighter than before."

4. **Accessibility.** The decay effect is purely visual. A screen reader user would hear the full secret read aloud via an `aria-live` region, then hear "Gone" when the timer ends. The experience is different but philosophically equivalent — the words are spoken, then they're over. We should ensure this works well.

5. **What if someone writes something alarming?** This is a hard question. Because there is genuinely no server and no logging, there is no mechanism to flag, report, or intervene. This is by design — but it means the tool cannot serve as any kind of safety net. The landing page should not position itself as a mental health resource or confessional. It's a creative/philosophical tool. Consider whether a small, unobtrusive link to crisis resources belongs somewhere on the page — not as a feature, but as a human gesture.

---

## What Success Looks Like

This project is successful if:

- Someone visits, writes something real, watches it disappear, and feels something.
- The source code is beautiful enough that reading it feels like reading the spec.
- A technical person inspects the network tab, the storage tab, and the source — and finds nothing. The promise is kept.
- It takes less than 2 seconds to load on a 3G connection.
- It works perfectly on a phone at 2am.

---

## License

MIT — Anthony Liddle