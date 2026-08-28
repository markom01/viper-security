#!/usr/bin/env node
// Enforce that every DBC CMS page shares the SAME collection structure.
// Builds only run Zod at runtime; Sveltia (the CMS editor) can still write a
// file that drifts from the shape (missing block, wrong type) and a build won't
// catch it until much later. This script validates every CMS YAML against the
// JSON Schema files that ALSO drive in-editor validation (see .vscode/settings.json
// + sites/dbc/src/content/json-schemas/*.json). One source of truth for both.
//
// Canonical structure (DBC): home / services / site each carry the same section
// blocks — seo, stats, cta, bottomcta, about, branding, labels — on top of
// their page-specific fields. gallery + privacy are site-specific and exempt.
// VIPER home reuses the SAME block shapes via a permissive schema (top-level
// additionalProperties: true) because VIPER may carry extra site-specific sections.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import Ajv from "ajv";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DBC = join(root, "sites", "dbc", "src", "content");
const VIPER = join(root, "sites", "viper", "src", "content");

// DBC: collection dir under sites/dbc/src/content → json schema file.
const dbcSchemas = {
  home: join(DBC, "json-schemas", "home.json"),
  services: join(DBC, "json-schemas", "services.json"),
  site: join(DBC, "json-schemas", "site.json"),
};

// VIPER: only home is validated here (it shares DBC's block shapes). The other
// VIPER collections (fleet/pricing/membership/site) differ structurally and are
// intentionally out of scope — home is the page the user wants structure-checked.
const viperSchemas = {
  home: join(VIPER, "json-schemas", "home.json"),
};

// gallery + privacy are site-specific and exempt (not in any map above).
const ajv = new Ajv({ allErrors: true, strict: false });
const compileAll = (map, baseDir) =>
  Object.fromEntries(
    Object.entries(map).map(([name, file]) => [
      join(baseDir, name),
      { schema: JSON.parse(readFileSync(file, "utf8")), validate: ajv.compile(JSON.parse(readFileSync(file, "utf8"))) },
    ]),
  );
const dbcValidators = compileAll(dbcSchemas, DBC);
const viperValidators = compileAll(viperSchemas, VIPER);
const allValidators = { ...dbcValidators, ...viperValidators };

function listYaml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listYaml(full));
    } else if (/\.ya?ml$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

let errors = 0;
const checked = [];
for (const [dir, entry] of Object.entries(allValidators)) {
  const validate = entry.validate;
  let files;
  try {
    files = listYaml(dir);
  } catch {
    console.error(`✗ collection dir missing: ${dir.replace(root + "/", "")}`);
    errors++;
    continue;
  }
  for (const file of files) {
    const rel = file.replace(root + "\\", "").replace(root + "/", "");
    let doc;
    try {
      doc = parseYaml(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`✗ ${rel}: YAML parse error — ${e.message}`);
      errors++;
      continue;
    }
    if (validate(doc)) {
      checked.push(rel);
    } else {
      errors++;
      for (const err of validate.errors || []) {
        console.error(`✗ ${rel}${err.instancePath}: ${err.message}`);
      }
    }
  }
}

console.log(`\nCMS structure check: ${checked.length} file(s) valid, ${errors} error(s).`);
if (errors) process.exit(1);
console.log("DBC + VIPER home CMS pages share the canonical structure (gallery/privacy + other VIPER collections exempt).");
