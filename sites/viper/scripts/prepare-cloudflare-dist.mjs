#!/usr/bin/env node
// Copies the Cloudflare-specific _headers/_redirects/.assetsignore into dist/ and
// validates the result before `wrangler deploy` uploads it.
//
// Run from the repo root: node sites/viper/scripts/prepare-cloudflare-dist.mjs

import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(siteDir, "dist");
const sourceDir = join(siteDir, "deploy", "cloudflare");

const HEADER_LINE_LIMIT = 2000;
const MAX_FILES = 20000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

const errors = [];

function fail(message) {
  errors.push(message);
}

const sourceCache = new Map();

function readSource(name) {
  if (sourceCache.has(name)) return sourceCache.get(name);

  const path = join(sourceDir, name);
  if (!existsSync(path)) {
    fail(`missing ${relative(process.cwd(), path)}`);
    sourceCache.set(name, null);
    return null;
  }

  const content = readFileSync(path, "utf8");
  sourceCache.set(name, content);
  return content;
}

for (const name of ["_headers", "_redirects", ".assetsignore"]) {
  const content = readSource(name);
  if (content !== null) {
    copyFileSync(join(sourceDir, name), join(distDir, name));
  }
}

// --- _headers parsing ------------------------------------------------------

function parseHeaders(text) {
  const rules = [];
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;

    if (!/^\s/.test(rawLine)) {
      current = { pattern: rawLine.trim(), detach: [], set: [] };
      rules.push(current);
      continue;
    }

    if (!current) {
      fail(`_headers: header line before any path rule: ${rawLine.trim()}`);
      continue;
    }

    const line = rawLine.trim();
    if (line.length > HEADER_LINE_LIMIT) {
      fail(
        `_headers: header line is ${line.length} chars (limit ${HEADER_LINE_LIMIT})`,
      );
    }

    if (line.startsWith("!")) {
      current.detach.push(line.slice(1).trim().toLowerCase());
      continue;
    }

    const colon = line.indexOf(":");
    if (colon === -1) {
      fail(`_headers: cannot parse header line: ${line}`);
      continue;
    }
    current.set.push({
      name: line.slice(0, colon).trim().toLowerCase(),
      value: line.slice(colon + 1).trim(),
    });
  }

  return rules;
}

function matches(pattern, path) {
  if (pattern.endsWith("/*")) {
    return path.startsWith(pattern.slice(0, -1));
  }
  return path === pattern;
}

function resolveHeaders(rules, path) {
  const headers = new Map();
  for (const rule of rules) {
    if (!matches(rule.pattern, path)) continue;
    for (const name of rule.detach) headers.delete(name);
    for (const { name, value } of rule.set) {
      if (!headers.has(name)) headers.set(name, []);
      headers.get(name).push(value);
    }
  }
  return headers;
}

const headersText = readSource("_headers");
if (headersText !== null) {
  const rules = parseHeaders(headersText);

  const probes = [
    "/",
    "/admin/index.html",
    "/_astro/app.js",
    "/images/photo.webp",
    "/sw.js",
  ];
  const resolved = new Map(
    probes.map((path) => [path, resolveHeaders(rules, path)]),
  );

  for (const [path, headers] of resolved) {
    const csp = headers.get("content-security-policy") ?? [];
    if (csp.length !== 1) {
      fail(
        `${path}: expected exactly 1 Content-Security-Policy, found ${csp.length}`,
      );
    }
    const cache = headers.get("cache-control") ?? [];
    if (cache.length > 1) {
      fail(
        `${path}: expected at most 1 Cache-Control, found ${cache.length}: ${cache.join(" | ")}`,
      );
    }
  }

  const siteCsp = resolved.get("/").get("content-security-policy")?.[0] ?? "";
  const adminCsp =
    resolved.get("/admin/index.html").get("content-security-policy")?.[0] ?? "";

  if (
    !siteCsp.includes("frame-ancestors 'none'") ||
    siteCsp.includes("unpkg.com")
  ) {
    fail("/: strict CSP missing or replaced by the admin CSP");
  }
  if (
    !adminCsp.includes("https://unpkg.com") ||
    !adminCsp.includes("frame-src 'none'")
  ) {
    fail(
      "/admin/index.html: lax admin CSP missing or replaced by the strict CSP",
    );
  }
  if (siteCsp && siteCsp === adminCsp) {
    fail(
      "strict and admin CSP are identical; the admin detach did not take effect",
    );
  }

  for (const path of ["/_astro/app.js", "/images/photo.webp"]) {
    const cache = resolved.get(path).get("cache-control") ?? [];
    if (
      cache.length !== 1 ||
      cache[0] !== "public, max-age=31536000, immutable"
    ) {
      fail(
        `${path}: expected immutable Cache-Control, found ${JSON.stringify(cache)}`,
      );
    }
  }

  const swCache = resolved.get("/sw.js")?.get("cache-control") ?? [];
  if (swCache.length !== 1 || swCache[0] !== "no-cache, must-revalidate") {
    fail(`/sw.js: expected no-cache, found ${JSON.stringify(swCache)}`);
  }
}

// --- _redirects ------------------------------------------------------------

const redirectsText = readSource("_redirects");
if (redirectsText !== null) {
  const rules = redirectsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/));

  const favicon = rules.find(
    ([from, to, code]) =>
      from === "/favicon.ico" && to === "/favicon.svg" && code === "301",
  );
  if (!favicon) {
    fail("_redirects: missing `/favicon.ico /favicon.svg 301`");
  }

  // Cloudflare rejects a rewrite whose destination normalizes back into its own
  // source pattern (for example `/admin/* /admin/index.html 200`), so guard
  // against reintroducing that class of rule.
  for (const [from, to, code] of rules) {
    if (code !== "200" || !from.endsWith("/*")) continue;
    const prefix = from.slice(0, -1);
    if (
      to === prefix ||
      to.startsWith(prefix) ||
      to === `${prefix}index.html`
    ) {
      fail(
        `_redirects: ${from} -> ${to} 200 would rewrite into its own source`,
      );
    }
  }
}

// --- .assetsignore ---------------------------------------------------------

const ignoreText = readSource(".assetsignore");
if (ignoreText !== null) {
  const patterns = ignoreText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const ignoresHtaccess = patterns.some((pattern) => {
    const normalized = pattern.replace(/^\*\*\//, "").replace(/^\//, "");
    return normalized === ".htaccess" || normalized === "**/.htaccess";
  });
  if (!ignoresHtaccess) {
    fail(".assetsignore: no pattern excludes .htaccess");
  }
}

// --- Cloudflare limits -----------------------------------------------------

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

if (!existsSync(join(distDir, "index.html"))) {
  fail("dist/index.html is missing; run the build first");
} else {
  const files = walk(distDir);
  const sizes = files.map((path) => ({ path, size: statSync(path).size }));
  const largest = sizes.reduce((a, b) => (b.size > a.size ? b : a), {
    path: "",
    size: 0,
  });
  const total = sizes.reduce((sum, file) => sum + file.size, 0);

  if (files.length > MAX_FILES) {
    fail(`dist has ${files.length} files (Cloudflare limit ${MAX_FILES})`);
  }
  if (largest.size > MAX_FILE_BYTES) {
    fail(
      `dist file over 25 MiB: ${relative(distDir, largest.path)} (${largest.size} bytes)`,
    );
  }

  if (errors.length === 0) {
    console.log(
      `cloudflare assets ok: ${files.length} files, ${total} bytes, ` +
        `largest ${relative(distDir, largest.path)} (${largest.size} bytes)`,
    );
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}
