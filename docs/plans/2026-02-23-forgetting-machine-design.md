# The Forgetting Machine — v1 Design

## Summary

A static website where you write a secret, watch it displayed for 60 seconds with a radio-signal decay effect, then it's gone forever. No server, no database, no accounts, no persistence.

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (vanilla, no framework) |
| Build | Vite |
| Package manager | pnpm |
| Styling | Plain CSS, custom properties |
| Serif font | Libre Baskerville (Google Fonts) |
| Sans font | System font stack |
| Hosting | Any static host (Vercel) |
| Analytics | None |

## Architecture

Three-state machine: Invitation → Broadcast → Silence → Invitation.

Each phase owns its DOM. On transition, the previous phase's DOM is cleared and the new phase renders into the same root container. The secret is passed from Invitation → Broadcast as a function argument — never stored in localStorage, sessionStorage, cookies, or URLs.

## Project Structure

```
src/
├── main.ts              # Entry point, phase orchestration
├── phases/
│   ├── invitation.ts    # Phase 1: text input UI
│   ├── broadcast.ts     # Phase 2: display + decay engine
│   └── silence.ts       # Phase 3: "Gone." + reset
├── decay/
│   ├── engine.ts        # Decay timing and orchestration
│   ├── effects.ts       # Character-level visual effects
│   └── characters.ts    # Static/noise character sets
├── ui/
│   ├── progress.ts      # Progress bar component
│   └── dom.ts           # DOM helpers
└── style.css            # Single stylesheet
```

## Decay Engine

Per-character `<span>` manipulation. Four sub-phases with randomized per-character thresholds:

| Sub-phase | Time | Behavior |
|---|---|---|
| clear | 0–20s | No decay, full presence |
| drift | 20–40s | Subtle opacity, jitter, color shift |
| dissolve | 40–55s | Heavy blur, character replacement (░▒▓) |
| vanish | 55–60s | Final fade to nothing |

Driven by `requestAnimationFrame` + `performance.now()`.

## Visual Design

- Background: `#0a0a0a`–`#111111` (warm near-black)
- Primary text: `#e8e0d4` (warm off-white)
- Secondary text: `#6b6560` (muted warm gray)
- Accent: `#c4956a` (warm amber, progress bar + button hover)
- Static/noise: `#2a2520`–`#4a4540`

Progress indicator: thin horizontal line at viewport bottom, full width → zero over 60s, warm amber fading to transparent.

## Accessibility

- `prefers-reduced-motion`: skip per-character decay, use simple crossfade
- `aria-live` region for screen readers: full text announced, then "Gone."
- Keyboard: Cmd/Ctrl+Enter to submit, any key/click after Phase 3 to reset

## Security Constraints

- Secret never leaves the browser
- No persistent storage of any kind
- No console.log of secret text
- Memory cleanup: variable overwritten, span textContent cleared, DOM nodes removed
- Strict CSP headers

## Decisions Made

- Font: Libre Baskerville (serif), system stack (sans)
- No crisis resource link in v1
- No analytics in v1
- No sound in v1
- Mobile: graceful degradation if per-character decay causes frame drops
