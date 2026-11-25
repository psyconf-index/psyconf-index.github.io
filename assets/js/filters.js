/* Pure filtering and ordering helpers for the directory. */
export function filterAndSortEditions(editions, seriesList, controls, today = new Date().toISOString().slice(0, 10)) {
  const seriesById = new Map(seriesList.map((series) => [series.series_id, series]));
  const query = controls.search.trim().toLowerCase();
  const scope = controls.scope;

  const matches = editions.filter((edition) => {
    const series = seriesById.get(edition.series_id);
    if (!series) return false;
    if (scope === 'core' && series.scope_circle !== 'core_psychology') return false;

    const searchableText = [
      series.name,
      series.acronym,
      series.organizer,
      edition.short_title,
      edition.short_description,
      edition.city,
      ...(series.themes ?? [])
    ].join(' ').toLowerCase();
    if (query && !searchableText.includes(query)) return false;
    if (controls.subdiscipline && !(series.subdisciplines ?? []).includes(controls.subdiscipline)) return false;
    if (controls.approach && !(series.approaches ?? []).includes(controls.approach)) return false;
    if (controls.format && edition.format !== controls.format) return false;
    if (controls.country && edition.country_code !== controls.country) return false;
    if (controls.language && !(edition.languages ?? []).includes(controls.language)) return false;
    if (controls.openCfp && (!edition.cfp_deadline || edition.cfp_deadline < today)) return false;
    return true;
  });

  matches.sort((first, second) => {
    if (controls.sort === 'start') {
      return first.start_date.localeCompare(second.start_date) || first.short_title.localeCompare(second.short_title);
    }
    const firstDeadline = first.cfp_deadline || '9999-12-31';
    const secondDeadline = second.cfp_deadline || '9999-12-31';
    return firstDeadline.localeCompare(secondDeadline) || first.start_date.localeCompare(second.start_date);
  });
  return matches;
}
