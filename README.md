# Lore

**Lore** is an open-source, local-first AI coworker that connects to your email and meeting notes, builds a long-lived knowledge graph, and uses that context to help you get real work done — privately, on your machine.

Unlike generic AI assistants that start cold every session, Lore accumulates context over time. It knows your projects, your people, your decisions, and your commitments — and compounds that knowledge to make you genuinely more effective.

---

## ✨ Features

- **Persistent Memory** — Lore builds and maintains a knowledge graph from your emails and meeting notes. Context accumulates over time rather than starting from scratch every session.
- **Meeting Prep** — Get a crisp brief before any meeting, pulling past decisions, open questions, and relevant threads automatically.
- **Email Drafting** — Draft replies grounded in your history, commitments, and relationships.
- **Docs & Decks** — Generate PDFs, summaries, and project updates using your real ongoing context.
- **Background Agents** — Set up recurring tasks that run automatically — morning briefings, email drafts, knowledge graph updates, and more.
- **Voice Memos** — Record voice notes that are automatically transcribed and captured into your knowledge graph.
- **Bring Your Own Model** — Works with local models (Ollama, LM Studio) or hosted models via your own API key.
- **MCP Tool Support** — Extend Lore with external tools via Model Context Protocol (Slack, GitHub, Linear, Exa, ElevenLabs, and more).
- **Local-First** — All your data lives on your machine as plain Markdown. No cloud lock-in, no hidden formats. Inspect, edit, or delete anything at any time.

Inspired by [Rowboat](https://github.com/rowboatlabs/rowboat) — reimagined and rebuilt from the ground up.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install & Run

```bash
pnpm install
pnpm run dev
```

This starts the Vite dev server and Electron app. The workspace lives at `~/.lore/` by default (override with `LORE_HOME`).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Electron app with hot-reload (renderer + main) |
| `pnpm run deps` | Build shared, core, preload packages |
| `pnpm run api` | Run Hono API server (standalone) |
| `pnpm run build` | Full production build |

---

## 📁 Project Structure

```
Lore/
├── packages/
│   ├── shared/     # Zod schemas (workspace, models, runs, IPC, agents)
│   └── core/       # Config, workspace, models provider, AI
├── apps/
│   ├── api/        # Hono API (config, workspace, models routes)
│   ├── main/       # Electron main process + IPC
│   ├── preload/    # Electron preload bridge
│   └── renderer/   # React 19 + Vite + Tailwind + Radix UI
```

---

## 🎨 Theme

Lore supports **Light**, **Dark**, and **System** themes. The theme is persisted in `localStorage` (`lore-theme`). Use the theme selector in the header to switch.

---

*Lore — because your work deserves a memory.*
