
# Contributing to Hybrid Astro UI

Thanks for your interest in contributing. This repo contains a **CLI** and a component **registry** for Astro.

## Requirements

- Node.js: **20.x**
- PNPM: **9.x**

> CI uses Node 20 and PNPM 9.

## Local setup

1. Fork the repository and clone your fork.
2. Install dependencies:

```bash
pnpm install
```

## Useful commands

```bash
# Build the package (generates dist/)
pnpm run build

# Watch build
pnpm run watch

# Formatting
pnpm run check
pnpm run format
```

### CI (what runs on PRs)

- On Pull Requests to `main` or `develop`, CI runs **Prettier check**:

```bash
pnpm run check
```

## How to contribute (PRs)

1. Create a branch from `main`:

```bash
git checkout -b feat/my-change
```

2. Keep changes small and focused.
3. Before opening a PR, run:

```bash
pnpm run check
pnpm run build
```

4. Open a PR targeting `main` (or as requested by the maintainer).

## Component Registry (`registry/` folder)

Components live in `registry/<component-name>/`.

Typical structure:

- `registry/<componente>/<componente>.astro`
- `registry/<componente>/index.ts` (exports)
- `registry/<componente>/component.json`

### Important: `component.json` is generated

`component.json` should **not** be edited by hand. It is generated automatically with:

```bash
pnpm run build:registry
```

This script scans `.astro` files inside each folder in `registry/` and updates `component.json` to map them into `src/components/hybrid-astro-ui/<component>/...`.

### Adding a new component

1. Create the folder `registry/<your-component>/`.
2. Add one or more `.astro` files.
3. Add `index.ts` exporting the component(s).
4. Run:

```bash
pnpm run build:registry
```

5. Verify formatting:

```bash
pnpm run check
```

## Publishing (maintainers)

Publishing to npm is automated via GitHub Actions (OIDC). In general:

- Don't publish from PRs.
- If your change requires a release, coordinate it in the PR.

## Best practices

- Keep formatting consistent (Prettier).
- Avoid unrelated changes in the same PR.
- Explain the “what” and the “why” in the PR description.

