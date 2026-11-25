import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const siteUrl = 'https://psyconf-index.github.io/';
const [editions, series] = await Promise.all([
  readJson(new URL('data/editions.json', root)),
  readJson(new URL('data/series.json', root))
]);
const seriesById = new Map(series.map((entry) => [entry.series_id, entry]));
const now = new Date();
const year = now.getUTCFullYear();
const monthIndex = now.getUTCMonth();
const monthStart = new Date(Date.UTC(year, monthIndex, 1));
const nextMonth = new Date(Date.UTC(year, monthIndex + 1, 1));
const startKey = monthStart.toISOString().slice(0, 10);
const endKey = nextMonth.toISOString().slice(0, 10);
const monthName = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(monthStart);

async function readJson(url) {
  return JSON.parse(await fs.readFile(url, 'utf8'));
}

function xmlEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function validHttpsUrl(value) {
  return typeof value === 'string' && /^https:\/\//i.test(value);
}

function isInCurrentMonth(date) {
  return typeof date === 'string' && date >= startKey && date < endKey;
}

function readableDate(date) {
  if (!date) return 'Not announced';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`));
}

function createItem(edition, deadlineFeed) {
  const seriesEntry = seriesById.get(edition.series_id);
  if (!seriesEntry || !validHttpsUrl(edition.edition_url)) return '';

  const eventInfo = deadlineFeed
    ? `CFP deadline: ${readableDate(edition.cfp_deadline)}.`
    : `Event dates: ${readableDate(edition.start_date)}–${readableDate(edition.end_date)}.`;
  const summary = `${edition.short_description} ${eventInfo} Format: ${edition.format.replaceAll('_', ' ')}. Languages: ${edition.languages.join(', ')}.`;
  const relevantDate = deadlineFeed ? edition.cfp_deadline : edition.start_date;
  const pubDate = new Date(`${relevantDate}T00:00:00Z`).toUTCString();

  return [
    '    <item>',
    `      <title>${xmlEscape(edition.short_title)}</title>`,
    `      <description>${xmlEscape(summary)}</description>`,
    `      <link>${xmlEscape(edition.edition_url)}</link>`,
    `      <guid isPermaLink="true">${xmlEscape(edition.edition_url)}</guid>`,
    `      <pubDate>${xmlEscape(pubDate)}</pubDate>`,
    '    </item>'
  ].join('\n');
}

function createFeed(title, description, records, deadlineFeed) {
  const items = records.map((record) => createItem(record, deadlineFeed)).filter(Boolean).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${xmlEscape(title)}</title>`,
    `    <link>${xmlEscape(siteUrl)}</link>`,
    `    <description>${xmlEscape(description)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${xmlEscape(now.toUTCString())}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    ''
  ].filter((line, index, list) => line !== '' || index === list.length - 2).join('\n');
}

const eventRecords = editions
  .filter((edition) => isInCurrentMonth(edition.start_date))
  .sort((a, b) => a.start_date.localeCompare(b.start_date));
const deadlineRecords = editions
  .filter((edition) => isInCurrentMonth(edition.cfp_deadline))
  .sort((a, b) => a.cfp_deadline.localeCompare(b.cfp_deadline));

const rssDirectory = new URL('rss/', root);
await fs.mkdir(rssDirectory, { recursive: true });
await Promise.all([
  fs.writeFile(new URL('events-this-month.xml', rssDirectory), createFeed(
    `PsyConf Index — Events in ${monthName}`,
    `Research events taking place in ${monthName}.`,
    eventRecords,
    false
  )),
  fs.writeFile(new URL('deadlines-this-month.xml', rssDirectory), createFeed(
    `PsyConf Index — CFP deadlines in ${monthName}`,
    `Calls for papers closing in ${monthName}.`,
    deadlineRecords,
    true
  ))
]);

console.log(`Generated monthly feeds for ${monthName}: ${eventRecords.length} events and ${deadlineRecords.length} deadlines.`);
