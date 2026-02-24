# Contributing to The Forgetting Machine

Thank you for your interest in contributing.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/anthonyliddle/forgetting-machine.git
cd forgetting-machine

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint

# Build for production
pnpm build
```

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<scope>): <subject>`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`

Examples:

- `feat(decay): add new character dissolution effect`
- `fix(phases): correct transition timing between phases`
- `docs: update README with deployment instructions`

Commits are validated by commitlint via a git hook.

## Code Style

- TypeScript strict mode
- ESLint with TypeScript ESLint
- No frameworks — vanilla TypeScript and direct DOM manipulation
- Pre-commit hooks run type checking and linting automatically

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with conventional commits
3. Ensure all tests pass (`pnpm test`)
4. Ensure linting passes (`pnpm lint`)
5. Ensure the build succeeds (`pnpm build`)
6. Open a pull request against `main`
7. Fill out the PR template
8. Wait for review and address any feedback
