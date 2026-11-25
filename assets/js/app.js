/* Directory application: build all dynamic UI with DOM nodes and textContent. */
import { filterAndSortEditions } from './filters.js';
import { downloadCsv } from './export-csv.js';

const DATA_PATHS = { series: 'data/series.json', editions: 'data/editions.json' };
const GITHUB_BASE = 'https://github.com/psyconf-index/psyconf-index.github.io';
const elements = {
  events: document.getElementById('events'), search: document.getElementById('search'),
  subdiscipline: document.getElementById('subdiscipline'), approach: document.getElementById('approach'),
  format: document.getElementById('format'), country: document.getElementById('country'),
  language: document.getElementById('language'), openCfp: document.getElementById('open-cfp'),
  sort: document.getElementById('sort'), count: document.getElementById('result-count'),
  empty: document.getElementById('empty-state'), error: document.getElementById('load-error'),
  export: document.getElementById('export-csv'), listView: document.getElementById('list-view'),
  cardView: document.getElementById('card-view')
};
let seriesList = [];
let editions = [];
let currentResults = [];

const todayISO = () => new Date().toISOString().slice(0, 10);
const safeExternalUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);
const make = (tag, className = '', text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
};

function addExternalLink(parent, label, url) {
  if (!safeExternalUrl(url)) return;
  const link = make('a', '', label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  parent.append(link);
}

function setKnownExternalLink(element, url) {
  if (!element || !safeExternalUrl(url)) return;
  element.href = url;
  element.target = '_blank';
  element.rel = 'noopener noreferrer';
}

function seriesFor(edition) {
  return seriesList.find((series) => series.series_id === edition.series_id);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function populateSelect(select, values) {
  for (const value of uniqueSorted(values)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function dateLabel(iso) {
  if (!iso) return 'Not announced';
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(date);
}

function countdownLabel(deadline) {
  if (!deadline) return 'CFP deadline not listed';
  const days = Math.ceil((new Date(`${deadline}T00:00:00Z`) - new Date(`${todayISO()}T00:00:00Z`)) / 86400000);
  if (days < 0) return 'CFP closed';
  if (days === 0) return 'CFP closes today';
  return `CFP closes in ${days} day${days === 1 ? '' : 's'}`;
}

function formatLabel(format) {
  return { in_person: 'In-person', hybrid: 'Hybrid', online: 'Online' }[format] || format;
}

function feeSummary(fees, currency) {
  const categories = [
    ['Student early', fees.student_early], ['Member early', fees.member_early],
    ['Non-member early', fees.non_member_early], ['Listener only', fees.listener_only]
  ];
  return categories.map(([label, amount]) => `${label}: ${amount === null ? 'Not listed' : `${currency} ${amount}`}`).join(' · ');
}

function addBadge(parent, text, modifier = '') {
  parent.append(make('span', `badge ${modifier}`.trim(), text));
}

function renderEvent(edition) {
  const series = seriesFor(edition);
  if (!series) return null;

  const article = make('article', 'event');
  const heading = make('h3');
  addExternalLink(heading, edition.short_title, edition.edition_url);
  article.append(heading);
  article.append(make('p', 'event-description', edition.short_description));
  article.append(make('p', 'event-meta', `${edition.city}, ${edition.country_code} · ${dateLabel(edition.start_date)} – ${dateLabel(edition.end_date)} · ${series.organizer}`));

  const badges = make('div', 'badges');
  const isOpen = edition.cfp_deadline && edition.cfp_deadline >= todayISO();
  addBadge(badges, countdownLabel(edition.cfp_deadline), isOpen ? 'deadline' : '');
  addBadge(badges, formatLabel(edition.format));
  addBadge(badges, series.scope_circle.replaceAll('_', ' '));
  if (series.reliability.backed_by_society_or_uni) addBadge(badges, 'Society / university backing');
  if (series.reliability.identifiable_scientific_committee) addBadge(badges, 'Scientific committee identified');
  article.append(badges);

  const actions = make('div', 'event-actions');
  addExternalLink(actions, 'Learn more', edition.edition_url);
  const issueLink = new URL(`${GITHUB_BASE}/issues/new`);
  issueLink.searchParams.set('template', 'report-update.yml');
  issueLink.searchParams.set('title', `Update or report: ${edition.short_title}`);
  addExternalLink(actions, 'Suggest an update / Report issue', issueLink.href);
  article.append(actions);

  const details = document.createElement('details');
  details.append(make('summary', '', 'Event details and transparency'));
  const list = make('dl', 'detail-grid');
  const detailFields = [
    ['Fees', feeSummary(edition.fees, edition.currency)],
    ['Sponsors / funders', edition.sponsors_note],
    ['Peer review', series.reliability.peer_reviewed ? 'Reported as peer-reviewed' : 'Not reported as peer-reviewed'],
    ['Travel grants', edition.travel_grants_available ? 'Available' : 'Not reported as available'],
    ['Languages', edition.languages.join(', ') || 'Not listed'],
    ['Proceedings', edition.proceedings_published ? 'Published' : 'Not reported as published'],
    ['CFP deadline', dateLabel(edition.cfp_deadline)],
    ['Notification date', dateLabel(edition.notification_date)],
    ['Early-bird deadline', dateLabel(edition.early_bird_deadline)]
  ];
  for (const [label, value] of detailFields) {
    const item = document.createElement('div');
    item.append(make('dt', '', label), make('dd', '', value));
    list.append(item);
  }
  details.append(list);
  article.append(details);
  return article;
}

function readControls() {
  return {
    search: elements.search.value,
    scope: document.querySelector('input[name="scope"]:checked')?.value || 'core',
    subdiscipline: elements.subdiscipline.value,
    approach: elements.approach.value,
    format: elements.format.value,
    country: elements.country.value,
    language: elements.language.value,
    openCfp: elements.openCfp.checked,
    sort: elements.sort.value
  };
}

function render() {
  currentResults = filterAndSortEditions(editions, seriesList, readControls(), todayISO());
  elements.events.replaceChildren();
  for (const edition of currentResults) {
    const eventNode = renderEvent(edition);
    if (eventNode) elements.events.append(eventNode);
  }
  elements.count.textContent = `${currentResults.length} event${currentResults.length === 1 ? '' : 's'} shown`;
  elements.empty.hidden = currentResults.length > 0;
}

function exportCurrentResults() {
  const rows = [[
    'Edition title', 'Series', 'Acronym', 'Description', 'Start date', 'End date',
    'CFP deadline', 'Format', 'City', 'Country code', 'Languages', 'Official event URL'
  ]];
  for (const edition of currentResults) {
    const series = seriesFor(edition);
    rows.push([
      edition.short_title, series.name, series.acronym, edition.short_description,
      edition.start_date, edition.end_date, edition.cfp_deadline || '', formatLabel(edition.format),
      edition.city, edition.country_code, edition.languages.join('; '), edition.edition_url
    ]);
  }
  downloadCsv(rows);
}

function setView(view) {
  const cards = view === 'card';
  elements.events.classList.toggle('card-view', cards);
  elements.events.classList.toggle('list-view', !cards);
  elements.cardView.classList.toggle('active', cards);
  elements.listView.classList.toggle('active', !cards);
  elements.cardView.setAttribute('aria-pressed', String(cards));
  elements.listView.setAttribute('aria-pressed', String(!cards));
}

async function initialize() {
  setKnownExternalLink(document.getElementById('submit-event-link'), `${GITHUB_BASE}/issues/new?template=submit-conference.yml`);
  setKnownExternalLink(document.getElementById('submit-event-button'), `${GITHUB_BASE}/issues/new?template=submit-conference.yml`);
  setKnownExternalLink(document.getElementById('policy-link'), `${GITHUB_BASE}/blob/main/CONTRIBUTING.md`);
  setKnownExternalLink(document.getElementById('join-committee-link'), `${GITHUB_BASE}/issues/new?title=Curatorial%20committee%20volunteer`);

  try {
    const [seriesResponse, editionsResponse] = await Promise.all([
      fetch(DATA_PATHS.series), fetch(DATA_PATHS.editions)
    ]);
    if (!seriesResponse.ok || !editionsResponse.ok) throw new Error('Directory data request failed.');
    [seriesList, editions] = await Promise.all([seriesResponse.json(), editionsResponse.json()]);

    populateSelect(elements.subdiscipline, seriesList.flatMap((series) => series.subdisciplines ?? []));
    populateSelect(elements.approach, seriesList.flatMap((series) => series.approaches ?? []));
    populateSelect(elements.country, editions.map((edition) => edition.country_code));
    populateSelect(elements.language, editions.flatMap((edition) => edition.languages ?? []));
    render();

    for (const control of [elements.search, elements.subdiscipline, elements.approach, elements.format, elements.country, elements.language, elements.openCfp, elements.sort]) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
    document.querySelectorAll('input[name="scope"]').forEach((input) => input.addEventListener('change', render));
    elements.export.addEventListener('click', exportCurrentResults);
    elements.listView.addEventListener('click', () => setView('list'));
    elements.cardView.addEventListener('click', () => setView('card'));
  } catch {
    elements.count.textContent = '';
    elements.error.hidden = false;
  }
}

initialize();
