const CATALOG_SELECTOR = '[data-prometheus-profile-catalog]';
const PROFILE_SELECTOR = '[data-prometheus-profile]';
const FAMILY_SELECTOR = '[data-prometheus-profile-family]';
const CHART_SELECTOR = '[data-prometheus-profile-chart]';

const normalize = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const createControls = (inputId) => {
  const controls = document.createElement('div');
  controls.className = 'prometheus-profile-tools';

  const field = document.createElement('div');
  field.className = 'prometheus-profile-search-field';
  const label = document.createElement('label');
  label.htmlFor = inputId;
  label.textContent = 'Search curated charts';
  const input = document.createElement('input');
  input.id = inputId;
  input.type = 'search';
  input.autocomplete = 'off';
  input.placeholder = 'Search charts, metrics, dimensions…';
  field.append(label, input);

  const actions = document.createElement('div');
  actions.className = 'prometheus-profile-actions';
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.textContent = 'Expand all';
  const collapse = document.createElement('button');
  collapse.type = 'button';
  collapse.textContent = 'Collapse all';
  actions.append(expand, collapse);

  const status = document.createElement('p');
  status.className = 'prometheus-profile-search-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  controls.append(field, actions, status);
  return { controls, input, expand, collapse, status };
};

export const enhancePrometheusProfileCatalogs = (root = document) => {
  root.querySelectorAll(CATALOG_SELECTOR).forEach((catalog, index) => {
    if (catalog.dataset.prometheusProfileCatalogEnhanced === 'true') return;

    const summary = catalog.querySelector(':scope > summary');
    const charts = Array.from(catalog.querySelectorAll(CHART_SELECTOR));
    if (!summary || charts.length === 0) return;

    const disclosures = Array.from(catalog.querySelectorAll('details'));
    const initialOpen = new Map(disclosures.map((details) => [details, details.open]));
    const profiles = Array.from(catalog.querySelectorAll(PROFILE_SELECTOR));
    const families = Array.from(catalog.querySelectorAll(FAMILY_SELECTOR));
    const searchable = new Map(charts.map((chart) => [chart, normalize(chart.textContent)]));
    const inputId = `prometheus-profile-search-${index + 1}`;
    const { controls, input, expand, collapse, status } = createControls(inputId);

    summary.insertAdjacentElement('afterend', controls);
    catalog.dataset.prometheusProfileCatalogEnhanced = 'true';

    const setStatus = (query, visibleCount) => {
      status.classList.toggle('is-empty', Boolean(query) && visibleCount === 0);
      if (!query) {
        status.textContent = `${charts.length} ${charts.length === 1 ? 'chart' : 'charts'}`;
      } else if (visibleCount === 0) {
        status.textContent = `No charts match “${input.value.trim()}”.`;
      } else {
        status.textContent = `${visibleCount} of ${charts.length} charts shown`;
      }
    };

    const restore = () => {
      charts.forEach((chart) => { chart.hidden = false; });
      families.forEach((family) => { family.hidden = false; });
      profiles.forEach((profile) => { profile.hidden = false; });
      disclosures.forEach((details) => { details.open = initialOpen.get(details); });
      setStatus('', charts.length);
    };

    const update = () => {
      const query = normalize(input.value);
      if (!query) {
        restore();
        return;
      }

      let visibleCount = 0;
      const visibleFamilies = new Set();
      const visibleProfiles = new Set();
      charts.forEach((chart) => {
        const visible = searchable.get(chart).includes(query);
        chart.hidden = !visible;
        chart.open = visible;
        chart.querySelectorAll('details').forEach((details) => { details.open = visible; });
        if (!visible) return;

        visibleCount += 1;
        let ancestor = chart.parentElement;
        while (ancestor && ancestor !== catalog) {
          if (ancestor.matches(FAMILY_SELECTOR)) visibleFamilies.add(ancestor);
          if (ancestor.matches(PROFILE_SELECTOR)) visibleProfiles.add(ancestor);
          ancestor = ancestor.parentElement;
        }
      });

      families.forEach((family) => {
        const hasVisibleChart = visibleFamilies.has(family);
        family.hidden = !hasVisibleChart;
        family.open = hasVisibleChart;
      });
      profiles.forEach((profile) => {
        const hasVisibleChart = visibleProfiles.has(profile);
        profile.hidden = !hasVisibleChart;
        profile.open = hasVisibleChart;
      });
      setStatus(query, visibleCount);
    };

    const setVisibleDisclosures = (open) => {
      disclosures.forEach((details) => {
        if (!details.hidden && !details.closest('details[hidden]')) details.open = open;
      });
    };

    input.addEventListener('input', update);
    expand.addEventListener('click', () => setVisibleDisclosures(true));
    collapse.addEventListener('click', () => setVisibleDisclosures(false));
    setStatus('', charts.length);
  });
};
