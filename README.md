# The Forgetting Machine

Write a secret. Watch it disappear. Nothing is saved.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)

## About

A website where you write something you want to let go of. It displays your words for exactly 60 seconds with a radio-signal decay effect, then they're gone forever.

No database. No logs. No accounts. No server. Nothing you write here will be saved.

## Features

- Three-phase experience: Invitation, Broadcast, Silence
- Per-character decay effect inspired by fading radio signals
- No persistent storage of any kind
- Accessible with screen reader support and reduced motion preference
- Mobile-friendly with graceful performance degradation

## Getting Started

```bash
pnpm install
pnpm dev
```

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

## Tech Stack

- **TypeScript** — vanilla, no framework
- **Vite** — build tool
- **Vitest** — testing
- **Plain CSS** — custom properties, no preprocessor
- **Libre Baskerville** — serif typeface

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE) — Anthony Liddle
