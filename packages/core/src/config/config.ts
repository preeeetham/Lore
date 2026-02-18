import path from "node:path";
import fs from "node:fs";
import { homedir } from "node:os";

const LORE_HOME = process.env.LORE_HOME ?? path.join(homedir(), ".lore");

export const WorkDir = LORE_HOME;

function ensureDirs() {
  const ensure = (p: string) => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  };
  ensure(WorkDir);
  ensure(path.join(WorkDir, "config"));
  ensure(path.join(WorkDir, "knowledge"));
  ensure(path.join(WorkDir, "runs"));
  ensure(path.join(WorkDir, "agents"));
}

const WELCOME_CONTENT = `# Welcome to Lore

This vault is your work memory.

Lore extracts context from your emails and meetings and turns it into long-lived, editable Markdown notes. The goal is not to store everything, but to preserve the context that stays useful over time.

---

## How it works

**Entity-based notes**
Notes represent people, projects, organizations, or topics that matter to your work.

**Auto-updating context**
As new emails and meetings come in, Lore adds decisions, commitments, and relevant context to the appropriate notes.

**Living notes**
These are not static summaries. Context accumulates over time, and notes evolve as your work evolves.

---

## Your AI coworker

Lore uses this shared memory to help with everyday work, such as:

- Drafting emails
- Preparing for meetings
- Summarizing the current state of a project
- Taking local actions when appropriate

The AI works with deep context, but you stay in control. All notes are visible, editable, and yours.

---

## Design principles

**Reduce noise**
Lore focuses on recurring contacts and active projects instead of trying to capture everything.

**Local and inspectable**
All data is stored locally as plain Markdown. You can read, edit, or delete any file at any time.

**Built to improve over time**
As you keep using Lore, context accumulates across notes instead of being reconstructed from scratch.

---

_Lore — because your work deserves a memory._
`;

function ensureWelcomeFile() {
  const welcomeDest = path.join(WorkDir, "knowledge", "Welcome.md");
  if (!fs.existsSync(welcomeDest)) {
    fs.mkdirSync(path.dirname(welcomeDest), { recursive: true });
    fs.writeFileSync(welcomeDest, WELCOME_CONTENT);
  }
}

ensureDirs();
ensureWelcomeFile();
