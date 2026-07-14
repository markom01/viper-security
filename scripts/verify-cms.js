import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let exitCode = 0;
const errors = [];
const warnings = [];
const infos = [];

function check(condition, message) {
  if (!condition) {
    errors.push(`  \u2716 ${message}`);
    exitCode = 1;
  } else {
    infos.push(`  \u2713 ${message}`);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(`  \u26A0 ${message}`);
  }
}

const configPath = resolve(ROOT, 'public/admin/config.yml');
if (!existsSync(configPath)) {
  console.error('ERROR: public/admin/config.yml not found');
  process.exit(1);
}

let config;
try {
  const raw = readFileSync(configPath, 'utf-8');
  config = parseYaml(raw);
} catch (err) {
  console.error('ERROR: Failed to parse config.yml:', err.message);
  process.exit(1);
}

console.log('\n\uD83D\uDD0D Viper Security — Decap CMS Verification');
console.log('\u2550'.repeat(50));

if (!config.collections || !Array.isArray(config.collections)) {
  console.error('ERROR: config.yml has no collections');
  process.exit(1);
}

console.log(`\nFound ${config.collections.length} collections in config.yml\n`);

for (const collection of config.collections) {
  const name = collection.name;
  console.log(`\n\uD83D\uDCC1 Collection: "${name}" (${collection.label})`);

  if (collection.files) {
    for (const fileEntry of collection.files) {
      const filePath = fileEntry.file;
      const fullPath = resolve(ROOT, filePath);
      check(
        existsSync(fullPath),
        `File "${filePath}" exists`
      );
      if (!existsSync(fullPath)) {
        const altPaths = [
          filePath,
          filePath.replace(/^src\//, ''),
          `src/content/${filePath}`,
        ];
        for (const alt of altPaths) {
          const altFull = resolve(ROOT, alt);
          if (existsSync(altFull)) {
            warn(false, `  \u2192 File exists at alternate path: "${alt}"`);
            break;
          }
        }
      }
    }
  }

  if (collection.folder) {
    const folderPath = collection.folder;
    const fullFolderPath = resolve(ROOT, folderPath);

    check(
      existsSync(fullFolderPath),
      `Folder "${folderPath}" exists`
    );

    if (existsSync(fullFolderPath)) {
      const entries = readdirSync(fullFolderPath).filter(
        (f) => f.endsWith('.md') && statSync(resolve(fullFolderPath, f)).isFile()
      );
      infos.push(`  \u2139 Found ${entries.length} content file(s) in "${folderPath}": ${entries.join(', ') || '(none)'}`);
    }

    if (collection.slug) {
      const slugTemplate = collection.slug.replace(/[{}]/g, '');
      const hasSlugField = collection.fields?.some(f => f.name === slugTemplate);
      warn(
        hasSlugField,
        `Slug template "${collection.slug}" has matching field "${slugTemplate}"`
      );
    }
  }

  if (collection.fields) {
    const fieldNames = collection.fields.map(f => f.name).filter(Boolean);
    check(
      fieldNames.length > 0,
      `Has at least one named field`
    );
    const dups = fieldNames.filter((n, i) => fieldNames.indexOf(n) !== i);
    warn(
      dups.length === 0,
      `No duplicate field names${dups.length ? ` (duplicates: ${dups.join(', ')})` : ''}`
    );
  }
}

console.log('\n\n\uD83D\uDCDD Cross-checking against content.config.ts...\n');
const contentConfigPath = resolve(ROOT, 'src/content.config.ts');
if (existsSync(contentConfigPath)) {
  const contentConfigRaw = readFileSync(contentConfigPath, 'utf-8');

  const collectionsMatch = contentConfigRaw.match(/export\s+const\s+collections\s*=\s*\{([^}]+)\}/s);
  if (collectionsMatch) {
    const schemaNames = collectionsMatch[1]
      .split(',')
      .map(s => s.trim().split(':')[0].trim().replace(/['"]/g, ''))
      .filter(Boolean);

    const configNames = config.collections.map(c => c.name);

    for (const name of schemaNames) {
      const matched = configNames.includes(name);
      warn(
        matched,
        `Schema collection "${name}" has a matching Config collection`
      );
    }

    for (const name of configNames) {
      if (!schemaNames.includes(name)) {
        warn(false, `Config collection "${name}" has NO matching schema collection`);
      }
    }
  }
}

console.log('\n' + '\u2550'.repeat(50));
console.log('VERIFICATION RESULTS\n');

if (infos.length > 0) {
  console.log('Info:');
  infos.forEach(l => console.log(l));
}
if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(l => console.log(l));
}
if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(l => console.log(l));
}

console.log(`\n${infos.length} info, ${warnings.length} warning(s), ${errors.length} error(s)`);

if (exitCode === 0) {
  console.log('\n\u2705 All checks passed — config.yml matches content files.\n');
} else {
  console.log('\n\u274C Some checks failed — review errors above.\n');
}

process.exit(exitCode);
