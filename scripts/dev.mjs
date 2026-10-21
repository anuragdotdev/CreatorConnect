#!/usr/bin/env node
/**
 * Starts the CreatorConnect backend and frontend together.
 *
 * Usage: `npm run dev` from the repository root.
 * Press Ctrl+C to stop both processes.
 */
import { spawn } from "node:child_process";
import process from "node:process";

const targets = [
  { name: "backend", cwd: "backend", args: ["run", "dev"] },
  { name: "frontend", cwd: "frontend", args: ["run", "dev"] },
];

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

for (const target of targets) {
  const child = spawn(npm, target.args, {
    cwd: new URL(`../${target.cwd}/`, import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  const prefix = `[${target.name}]`;
  const forward = (stream, out) => {
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      for (const line of text.split(/\r?\n/)) {
        if (line.trim()) out.write(`${prefix} ${line}\n`);
      }
    });
  };

  forward(child.stdout, process.stdout);
  forward(child.stderr, process.stderr);

  child.on("exit", (code) => {
    console.log(`${prefix} process exited with code ${code}`);
    shutdown(code ?? 0);
  });

  children.push(child);
}

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
