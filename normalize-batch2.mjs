#!/usr/bin/env node
/* One-time: normalize batch-2 tool meta.json files to the format build.mjs expects.
   Batch-2 briefs used: title/desc/categories[] ; build.mjs needs: title/description/category.
   Usage: node normalize-batch2.mjs [slug ...]  (no args = all dirs changed since baseline) */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIR = join(ROOT, 'src', 'tools');
const args = process.argv.slice(2);
const slugs = args.length ? args : readdirSync(DIR).filter(d => statSync(join(DIR, d)).isDirectory()).sort();

let changed = 0;
for (const slug of slugs) {
  const mp = join(DIR, slug, 'meta.json');
  if (!existsSync(mp)) continue;
  const meta = JSON.parse(readFileSync(mp, 'utf8'));
  let dirty = false;
  if (!meta.category && Array.isArray(meta.categories) && meta.categories.length) {
    meta.category = meta.categories[0];
    delete meta.categories;
    dirty = true;
  }
  if (!meta.description && typeof meta.desc === 'string') {
    meta.description = meta.desc;
    delete meta.desc;
    dirty = true;
  }
  if (dirty) {
    writeFileSync(mp, JSON.stringify(meta, null, 2) + '\n');
    changed++;
    console.log('normalized', slug, '→ category:', meta.category);
  }
}
console.log(`Done. Normalized ${changed} meta.json file(s).`);
