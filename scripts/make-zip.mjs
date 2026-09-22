#!/usr/bin/env node
/**
 * Builds `public/fairness-app.zip` — a complete, Vercel-ready snapshot of this project.
 *
 * Usage:  node scripts/make-zip.mjs
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const staging = join(root, ".zip-staging");
const appDir = join(staging, "fairness-app");
const outZip = join(root, "public", "fairness-app.zip");

const copyIfPresent = (rel) => {
  const from = join(root, rel);
  if (!existsSync(from)) return;
  cpSync(from, join(appDir, rel), { recursive: true });
};

rmSync(staging, { recursive: true, force: true });
mkdirSync(appDir, { recursive: true });
mkdirSync(join(appDir, "public"), { recursive: true });

// --- source + config -------------------------------------------------------
copyIfPresent("src");
copyIfPresent("db");
copyIfPresent("scripts");
copyIfPresent("next.config.ts");
copyIfPresent("postcss.config.mjs");
copyIfPresent("tsconfig.json");
copyIfPresent("eslint.config.mjs");
copyIfPresent("README.md");
copyIfPresent("DEPLOY.md");
copyIfPresent(".env.example");

// --- derived package.json (adds db scripts, keeps everything else) ---------
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
pkg.name = "fairness-aware-routine-survey";
pkg.scripts = {
  dev: "next dev",
  build: "next build",
  start: "next start",
  lint: "eslint .",
  typecheck: "tsc --noEmit",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
};
writeFileSync(join(appDir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

// --- drizzle config that reads DATABASE_URL from .env ---------------------
writeFileSync(
  join(appDir, "drizzle.config.ts"),
  `import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
`,
);

writeFileSync(
  join(appDir, "next-env.d.ts"),
  `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`,
);

writeFileSync(
  join(appDir, ".gitignore"),
  `node_modules
.next
out
.env
.env.local
.DS_Store
*.tsbuildinfo
next-env.d.ts
drizzle/
`,
);

writeFileSync(join(appDir, "public", ".gitkeep"), "");

// --- the ZIP itself is not self-referential: swap the download card -------
const pagePath = join(appDir, "src", "app", "page.tsx");
if (existsSync(pagePath)) {
  let page = readFileSync(pagePath, "utf8");
  page = page
    .replace(
      'href="/fairness-app.zip"',
      'href="https://vercel.com/new" target="_blank" rel="noreferrer"',
    )
    .replace("⬇ Download Vercel ZIP", "Deploy this app to Vercel →")
    .replace("⬇ Download Vercel-ready ZIP", "Deploy this app to Vercel →")
    .replace(
      "Auto-healing tables, multi-env detection & SSL ready.",
      "Read DEPLOY.md in the project root for the 60-second setup guide.",
    );
  writeFileSync(pagePath, page);
}

// --- archive ---------------------------------------------------------------
mkdirSync(join(root, "public"), { recursive: true });
rmSync(outZip, { force: true });
execSync(`zip -qr "${outZip}" fairness-app`, { cwd: staging, stdio: "inherit" });

const kb = Math.round(statSync(outZip).size / 1024);
console.log(`✅ public/fairness-app.zip created (${kb} KB)`);

rmSync(staging, { recursive: true, force: true });
