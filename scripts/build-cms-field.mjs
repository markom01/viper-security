// Bundle the Sveltia `nhtsa_vehicle` custom field into both sites' admin
// assets. Run via `npm run cms:field`, or automatically by each site's
// `prebuild` hook.
//
// The entry imports ../lib/nhtsa.js by relative path, so esbuild bundles it
// without any alias map. Output paths are resolved from this script's
// location, not the caller's cwd (site builds run with cwd = site dir).

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import esbuild from "esbuild";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const entry = resolve(repoRoot, "packages/shared/src/admin/nhtsa-field.js");
const outfiles = [
  resolve(repoRoot, "sites/viper/public/admin/vehicle-lookup.js"),
  resolve(repoRoot, "sites/dbc/public/admin/vehicle-lookup.js"),
];

await Promise.all(
  outfiles.map((outfile) =>
    esbuild.build({
      entryPoints: [entry],
      bundle: true,
      format: "iife",
      target: "es2020",
      minify: true,
      legalComments: "none",
      outfile,
      logLevel: "warning",
    }),
  ),
);

console.log(`cms:field bundled → ${outfiles.length} admin asset(s)`);
