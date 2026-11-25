import fs from 'node:fs/promises';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = new URL('../', import.meta.url);
const readJson = async (relativePath) => JSON.parse(await fs.readFile(new URL(relativePath, root), 'utf8'));
const [series, editions, seriesSchema, editionsSchema] = await Promise.all([
  readJson('data/series.json'),
  readJson('data/editions.json'),
  readJson('schemas/series.schema.json'),
  readJson('schemas/editions.schema.json')
]);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
let failed = false;

function validate(records, schema, label) {
  const check = ajv.compile(schema);
  if (check(records)) {
    console.log(`${label}: schema validation passed (${records.length} records).`);
    return;
  }
  failed = true;
  console.error(`${label}: schema validation failed.`);
  for (const error of check.errors ?? []) {
    console.error(`  ${error.instancePath || '/'} ${error.message}`);
  }
}

function checkDuplicateIds(records, key, label) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record[key])) {
      failed = true;
      console.error(`${label}: duplicate ${key} "${record[key]}".`);
    }
    seen.add(record[key]);
  }
}

validate(series, seriesSchema, 'Series');
validate(editions, editionsSchema, 'Editions');
checkDuplicateIds(series, 'series_id', 'Series');
checkDuplicateIds(editions, 'edition_id', 'Editions');

const knownSeries = new Set(series.map((record) => record.series_id));
for (const edition of editions) {
  if (!knownSeries.has(edition.series_id)) {
    failed = true;
    console.error(`Edition "${edition.edition_id}" references unknown series_id "${edition.series_id}".`);
  }
  if (edition.start_date > edition.end_date) {
    failed = true;
    console.error(`Edition "${edition.edition_id}" ends before it starts.`);
  }
}

if (failed) process.exitCode = 1;
else console.log('Duplicate identifiers, references, and event date ordering are valid.');
