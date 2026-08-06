# Dental Centrum Dobeš

This repository contains the production foundation for the Dental Centrum Dobeš
website. It preserves the approved homepage hero and provides a maintainable
Next.js and TypeScript base for future pages and features.

## Local development

Requires Node.js 22.13.0 or later.

```bash
npm install
npm run dev
npm test
npm run build
```

## Branch roles

- `main` is the stable branch.
- `develop` is the shared integration and development branch.
- `codex/<topic>` branches are Codex working branches.
- `claude/<topic>` branches are Claude working branches.

Keep commits small and descriptive. Do not commit secrets, credentials, tokens,
or local configuration values.

## Agent handoff

`COLLAB.md` is the single shared coordination record. Before inspecting or
editing project files, read it and record the owner, branch, task, and reserved
files. Do not edit files reserved by the other agent. Before handing work off,
run relevant tests, commit or stash the changes, update `COLLAB.md`, and add a
handoff-log entry.

## Source archive

The approved source materials are preserved under `docs/source/`, including the
original hero prototype and transcript. Treat them as reference material; do
not replace them with generated substitutes.
