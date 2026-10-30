export const MAX_COMPARISON_ITEMS = 4;

export function filterDestinations(destinations, region) {
  return region === "all" ? [...destinations] : destinations.filter((destination) => destination.regionId === region);
}

export function sortDestinationOptions(destinations, region) {
  if (region !== "all") return [...destinations];
  const collator = new Intl.Collator("fi", { sensitivity: "base" });
  return [...destinations].sort((a, b) => collator.compare(a.name, b.name));
}

export function addComparisonItem(currentIds, id, maxItems = MAX_COMPARISON_ITEMS) {
  if (currentIds.includes(id)) return { ids: [...currentIds], result: "duplicate" };
  if (currentIds.length >= maxItems) return { ids: [...currentIds], result: "limit" };
  return { ids: [...currentIds, id], result: "added" };
}

export function removeComparisonItem(currentIds, id) {
  return currentIds.filter((currentId) => currentId !== id);
}

export function calculateIndexedRent(rate, area) {
  const numericRate = typeof rate === "string" ? Number(rate.replace(",", ".")) : Number(rate);
  const numericArea = Number(area);
  if (!Number.isFinite(numericRate) || numericRate < 0 || !Number.isFinite(numericArea) || numericArea <= 0) return null;
  return Math.round(numericRate * numericArea);
}

export function normalizePlaceName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fi")
    .replace(/[^a-z0-9]/g, "");
}

export const DESTINATION_STATIONS = new Map([
  ["alicante", { stationId: "8025", role: "city" }],
  ["torrevieja", { stationId: "8019", role: "regional" }],
  ["benidorm", { stationId: "8025", role: "regional" }],
  ["orihuela-costa", { stationId: "8019", role: "regional" }],
  ["guardamar-del-segura", { stationId: "8019", role: "regional" }],
  ["denia", { stationId: "8416", role: "regional" }],
  ["javea-xabia", { stationId: "8025", role: "regional" }],
  ["calp", { stationId: "8025", role: "regional" }],
  ["malaga", { stationId: "6155A", role: "airport" }],
  ["fuengirola", { stationId: "6155A", role: "regional" }],
  ["cartagena", { stationId: "7178I", role: "regional" }],
  ["los-alcazares", { stationId: "7178I", role: "regional" }],
  ["san-pedro-del-pinatar", { stationId: "7178I", role: "regional" }],
  ["la-manga-del-mar-menor", { stationId: "7178I", role: "regional" }],
  ["puerto-de-mazarron", { stationId: "7178I", role: "regional" }],
  ["aguilas", { stationId: "6325O", role: "regional" }],
  ["almeria", { stationId: "6325O", role: "airport" }],
  ["roquetas-de-mar", { stationId: "6325O", role: "regional" }],
  ["almerimar", { stationId: "6325O", role: "regional" }],
  ["vera", { stationId: "6325O", role: "regional" }],
  ["valencia", { stationId: "8416", role: "city" }],
  ["murcia", { stationId: "7178I", role: "city" }],
  ["cadiz", { stationId: "5973", role: "city" }],
  ["huelva", { stationId: "4642E", role: "city" }],
]);

// NOAA OISST 1991–2020 January normals, sampled at the nearest valid 0.25° ocean grid cell.
// Values are rounded to whole degrees for display; grid coordinates are the cell centers.
export const DESTINATION_SEA_TEMPERATURES = new Map([
  ["alicante", { value: 14, place: "Alicantesta itään, Välimeri", latitude: 38.375, longitude: -0.375 }],
  ["torrevieja", { value: 14, place: "Torreviejan ja Orihuela Costan edusta", latitude: 37.875, longitude: -0.625 }],
  ["benidorm", { value: 14, place: "Benidormin edusta", latitude: 38.375, longitude: -0.125 }],
  ["orihuela-costa", { value: 14, place: "Torreviejan ja Orihuela Costan edusta", latitude: 37.875, longitude: -0.625 }],
  ["guardamar-del-segura", { value: 14, place: "Guardamarin edusta", latitude: 38.125, longitude: -0.625 }],
  ["denia", { value: 14, place: "Dénian pohjoisrannikon edusta", latitude: 38.875, longitude: 0.125 }],
  ["javea-xabia", { value: 14, place: "Dénian ja Xàbian välinen merialue", latitude: 38.875, longitude: 0.125 }],
  ["calp", { value: 14, place: "Calpin edusta", latitude: 38.625, longitude: 0.125 }],
  ["malaga", { value: 15, place: "Málagan edusta", latitude: 36.625, longitude: -4.375 }],
  ["fuengirola", { value: 15, place: "Fuengirolan eteläpuolinen Välimeri", latitude: 36.375, longitude: -4.625 }],
  ["cartagena", { value: 15, place: "Cartagenan eteläpuolinen Välimeri", latitude: 37.375, longitude: -0.875 }],
  ["los-alcazares", { value: 14, place: "Mar Menorin kaakkoispuolinen Välimeri", latitude: 37.625, longitude: -0.625 }],
  ["san-pedro-del-pinatar", { value: 14, place: "San Pedro del Pinatarin itäpuolinen Välimeri", latitude: 37.875, longitude: -0.625 }],
  ["la-manga-del-mar-menor", { value: 14, place: "Mar Menorin kaakkoispuolinen Välimeri, ei laguunin sisäosa", latitude: 37.625, longitude: -0.625 }],
  ["puerto-de-mazarron", { value: 15, place: "Puerto de Mazarrónin rannikon edusta", latitude: 37.375, longitude: -1.375 }],
  ["aguilas", { value: 15, place: "Águilasin edusta", latitude: 37.375, longitude: -1.625 }],
  ["almeria", { value: 15, place: "Almerían rannikon edusta", latitude: 36.625, longitude: -2.375 }],
  ["roquetas-de-mar", { value: 15, place: "Roquetas de Marin edusta", latitude: 36.625, longitude: -2.625 }],
  ["almerimar", { value: 15, place: "Almerimarin edusta", latitude: 36.625, longitude: -2.875 }],
  ["vera", { value: 15, place: "Vera Playan rannikon edusta", latitude: 37.125, longitude: -1.875 }],
  ["valencia", { value: 14, place: "Valencian rannikon merialue", latitude: 39.375, longitude: -0.125 }],
  ["murcia", { value: 14, place: "Murcian kaupungin lähirannikko, Mar Menorin itäpuoli", latitude: 37.875, longitude: -0.625 }],
  ["cadiz", { value: 15, place: "Cádizlahden edusta", latitude: 36.625, longitude: -6.375 }],
  ["huelva", { value: 15, place: "Huelvan edustan Atlantti", latitude: 37.125, longitude: -6.875 }],
]);

export function noaaOisstGridIndices(latitude, longitude) {
  const eastLongitude = longitude < 0 ? longitude + 360 : longitude;
  return {
    latitude: Math.round((latitude + 89.875) / 0.25),
    longitude: Math.round((eastLongitude - 0.125) / 0.25),
  };
}

export function noaaOisstCellUrl(latitude, longitude) {
  const indices = noaaOisstGridIndices(latitude, longitude);
  const query = `sst[1][${indices.latitude}][${indices.longitude}],valid_yr_count[1][${indices.latitude}][${indices.longitude}]`;
  return `https://comet.nefsc.noaa.gov/erddap/griddap/noaa_psl_55a2_880b_1f29.htmlTable?${encodeURIComponent(query)}`;
}

function readFinnishNumber(value) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "–" || trimmed === "—") return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatTemperature(value) {
  return value === null ? "—" : `${value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C`;
}

function createIcon(kind) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const paths = {
    sun: ["circle:cx=12,cy=12,r=4", "path:d=M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"],
    moon: ["path:d=M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.7 8.7 0 1 0 20.5 15.2Z"],
    wave: ["path:d=M2 8c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0M2 15c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7 0"],
    home: ["path:d=m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z"],
  };
  for (const descriptor of paths[kind] || []) {
    const [tagName, ...attributes] = descriptor.split(":");
    const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    if (tagName === "circle") {
      for (const [key, value] of attributes.join(":").split(",").map((part) => part.split("="))) element.setAttribute(key, value);
    } else {
      element.setAttribute("d", attributes.join(":"));
    }
    svg.append(element);
  }
  return svg;
}

function initializeComparison() {
  const app = document.getElementById("comparison-app");
  const source = document.getElementById("comparison-source");
  if (!app || !source) return;

  const regions = [...source.querySelectorAll(".destination-region")].map((regionElement) => {
    const heading = document.getElementById(regionElement.getAttribute("aria-labelledby"));
    return { id: regionElement.id || regionElement.getAttribute("aria-labelledby"), name: heading?.textContent.trim() || "Alue" };
  });
  const destinations = [...source.querySelectorAll(".destination-region .destination-card")].map((card) => {
    const regionElement = card.closest(".destination-region");
    const regionHeadingId = regionElement?.getAttribute("aria-labelledby");
    const title = card.querySelector(".destination-top h3")?.textContent.trim() || card.id;
    const photo = card.querySelector("figure.destination-photo img");
    const practicalParagraph = card.querySelector(".destination-details .destination-columns > div p");
    return {
      id: card.id,
      name: title,
      regionId: regionElement?.id || regionHeadingId,
      regionName: document.getElementById(regionHeadingId)?.textContent.trim() || "Espanja",
      description: card.querySelector(".destination-fit")?.textContent.trim() || "",
      practical: practicalParagraph?.textContent.trim() || card.querySelector(".destination-fit")?.textContent.trim() || "",
      image: photo?.getAttribute("src") || "",
      srcset: photo?.getAttribute("srcset") || "",
      sizes: photo?.getAttribute("sizes") || "",
      alt: photo?.getAttribute("alt") || "",
      imageWidth: Number(photo?.getAttribute("width")) || 1400,
      imageHeight: Number(photo?.getAttribute("height")) || 933,
      profileId: card.id,
      rent: null,
      climate: null,
    };
  });

  const byId = new Map(destinations.map((destination) => [destination.id, destination]));
  const rentTable = source.querySelector("#vuokrausdata table");
  const rentRows = new Map();
  if (rentTable) {
    for (const row of rentTable.querySelectorAll("tbody tr")) {
      const cells = row.querySelectorAll("th, td");
      if (cells.length !== 3 || cells[0].getAttribute("scope") !== "row") continue;
      const sourceLink = cells[2].querySelector("a[href]");
      rentRows.set(normalizePlaceName(cells[0].textContent), {
        value: readFinnishNumber(cells[1].textContent),
        label: cells[1].textContent.trim(),
        url: sourceLink?.getAttribute("href") || "",
      });
    }
  }

  const rentNameByDestination = new Map([
    ["alicante", "Alicante / Alacant"],
    ["javea-xabia", "Jávea / Xàbia"],
    ["calp", "Calp / Calpe"],
  ]);
  for (const destination of destinations) {
    const rentName = rentNameByDestination.get(destination.id) || destination.name;
    destination.rent = rentRows.get(normalizePlaceName(rentName)) || null;
  }

  const stationDetails = new Map();
  for (const details of source.querySelectorAll("details.climate-station")) {
    const summary = details.querySelector("summary");
    const stationId = summary?.textContent.match(/asema\s+([\dA-Z]+)/i)?.[1];
    if (!stationId) continue;
    const table = details.querySelector("table");
    const january = [...(table?.querySelectorAll("tbody tr") || [])].find((row) => /^tammi/i.test(row.querySelector("th")?.textContent.trim() || ""));
    const values = january ? [...january.querySelectorAll("td")].map((cell) => readFinnishNumber(cell.textContent)) : [];
    stationDetails.set(stationId, {
      name: summary.textContent.trim().replace(/\s*·\s*asema\s+[\dA-Z]+.*$/i, ""),
      period: summary.textContent.match(/\b(\d{4}–\d{4})\b/)?.[1] || "",
      high: values[1] ?? null,
      low: values[2] ?? null,
      sourceUrl: table?.querySelector("caption a[href]")?.getAttribute("href") || "",
    });
  }

  for (const destination of destinations) {
    const station = DESTINATION_STATIONS.get(destination.id);
    const stationData = station ? stationDetails.get(station.stationId) : null;
    destination.climate = stationData ? { ...stationData, role: station.role } : null;
    const sea = DESTINATION_SEA_TEMPERATURES.get(destination.id);
    destination.sea = sea ? { ...sea, sourceUrl: noaaOisstCellUrl(sea.latitude, sea.longitude) } : null;
  }

  const regionSelect = document.getElementById("comparison-region");
  const destinationSelect = document.getElementById("comparison-destination");
  const addButton = document.getElementById("comparison-add");
  const status = document.getElementById("comparison-status");
  const selectedImage = document.getElementById("selected-destination-image");
  const selectedStationNote = document.getElementById("selected-station-note");
  const stationSources = document.createElement("details");
  stationSources.className = "climate-summary__sources";
  const stationSourcesSummary = document.createElement("summary");
  stationSourcesSummary.textContent = "Lähteet ja laskentatapa";
  const stationCaveat = document.createElement("p");
  stationCaveat.id = "selected-station-caveat";
  stationCaveat.className = "climate-summary__note climate-summary__caveat";
  selectedStationNote.before(stationCaveat);
  selectedStationNote.replaceWith(stationSources);
  stationSources.append(stationSourcesSummary, selectedStationNote);
  const comparisonHead = document.getElementById("comparison-table-head");
  const comparisonBody = document.getElementById("comparison-table-body");
  const comparisonEmpty = document.getElementById("comparison-empty");
  const comparisonWrap = document.getElementById("comparison-table-wrap");
  const selectedDestination = document.querySelector(".selected-destination");
  const comparisonResults = document.getElementById("comparison-results");
  const practicalPanel = document.getElementById("practical-panel");
  const practicalCards = document.getElementById("practical-cards");
  const viewButtons = [...app.querySelectorAll("[data-view]")];
  let selectedId = byId.has("torrevieja") ? "torrevieja" : destinations[0]?.id;
  let comparisonIds = ["torrevieja", "malaga", "aguilas"].filter((id) => byId.has(id));

  const appendOption = (select, value, label) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  };
  appendOption(regionSelect, "all", "Kaikki alueet");
  for (const region of regions) appendOption(regionSelect, region.id, region.name);

  function filteredItems() {
    return filterDestinations(destinations, regionSelect.value);
  }

  function updateDestinationOptions(preferredId = selectedId) {
    const available = filteredItems();
    destinationSelect.replaceChildren();
    for (const destination of sortDestinationOptions(available, regionSelect.value)) appendOption(destinationSelect, destination.id, destination.name);
    selectedId = available.some((destination) => destination.id === preferredId) ? preferredId : available[0]?.id;
    if (selectedId) destinationSelect.value = selectedId;
    renderSelectedDestination();
    addButton.disabled = !selectedId || comparisonIds.length >= MAX_COMPARISON_ITEMS;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function stationNote(destination) {
    const climate = destination.climate;
    const sea = destination.sea;
    const stationRole = climate?.role === "city"
      ? "Kaupunkiasema ei kuvaa jokaista kaupunginosaa."
      : climate?.role === "airport"
        ? "Lentoasema-asema ei kuvaa jokaista asuinaluetta."
        : "Alueellinen vertailuasema; lukemat eivät ole kohteen paikallinen mittaus.";
    const stationSpecificCaveat = destination.id === "huelva" ? " Ronda Este on Huelvan kaupungissa, ei rannikolla." : "";
    const stationText = `AEMETin historialliset normaalit ${climate?.period || ""}: ${climate?.name || ""}. ${stationRole}${stationSpecificCaveat} Arvot eivät ole ennusteita.`;
    const locationCaveat = destination.id === "murcia"
      ? " Kyse on lähirannikon meriruudusta, ei Murcian kaupungin mittauksesta."
      : destination.id === "la-manga-del-mar-menor" || destination.id === "los-alcazares"
        ? " Ruudukko ei kuvaa Mar Menorin laguunin sisäosaa."
        : "";
    const seaText = sea
      ? ` Merivesi: ${sea.place}, NOAA/OISST tammikuun 1991–2020 keskiarvo, noin ${sea.value} °C (0,25° ruutu, pyöristetty).${locationCaveat}`
      : "";
    return `${stationText}${seaText}`;
  }

  function visibleStationCaveat(destination) {
    const climate = destination.climate;
    const stationRole = climate?.role === "city"
      ? "Kaupunkiasema ei kuvaa jokaista kaupunginosaa."
      : climate?.role === "airport"
        ? "Lentoasema-asema ei kuvaa jokaista asuinaluetta."
        : "Alueellinen vertailuasema; lukemat eivät ole kohteen paikallinen mittaus.";
    const stationSpecificCaveat = destination.id === "huelva" ? " Ronda Este on Huelvan kaupungissa, ei rannikolla." : "";
    return `Historialliset keskiarvot, eivät sääennusteita. ${stationRole}${stationSpecificCaveat}`;
  }

  function appendSourceLink(parent, href, label) {
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    parent.append(document.createTextNode(" "), link);
  }

  function renderSelectedDestination() {
    const destination = byId.get(selectedId);
    if (!destination) return;
    setText("selected-destination-region", destination.regionName);
    setText("selected-destination-name", destination.name);
    setText("selected-destination-description", destination.description);
    setText("selected-destination-badge", `${destination.name} · ${destination.regionName}`);
    setText("selected-day-temperature", formatTemperature(destination.climate?.high ?? null));
    setText("selected-night-temperature", formatTemperature(destination.climate?.low ?? null));
    setText("selected-sea-temperature", destination.sea ? `noin ${destination.sea.value} °C` : "—");
    setText("selected-station-caveat", visibleStationCaveat(destination));
    selectedStationNote.replaceChildren(document.createTextNode(stationNote(destination)));
    appendSourceLink(selectedStationNote, destination.climate?.sourceUrl, "AEMET-lähde");
    appendSourceLink(selectedStationNote, destination.sea?.sourceUrl, "NOAA/OISST-ruutu");
    selectedImage.src = destination.image;
    if (destination.srcset) selectedImage.srcset = destination.srcset;
    if (destination.sizes) selectedImage.sizes = destination.sizes;
    selectedImage.alt = destination.alt;
    selectedImage.width = destination.imageWidth;
    selectedImage.height = destination.imageHeight;
    selectedImage.loading = "eager";
    const profileLink = document.getElementById("selected-destination-link");
    profileLink.href = `#${destination.profileId}`;
    renderPracticalCards();
  }

  function createCell(tagName, value, className = "") {
    const cell = document.createElement(tagName);
    if (className) cell.className = className;
    cell.textContent = value;
    return cell;
  }

  function renderComparison() {
    const active = comparisonIds.map((id) => byId.get(id)).filter(Boolean);
    comparisonHead.replaceChildren();
    const headerRow = document.createElement("tr");
    const firstHeading = createCell("th", "Vertailtava tieto");
    firstHeading.scope = "col";
    headerRow.append(firstHeading);
    for (const destination of active) {
      const header = document.createElement("th");
      header.scope = "col";
      const card = document.createElement("div");
      card.className = "comparison-destination-head";
      const image = document.createElement("img");
      image.src = destination.image;
      if (destination.srcset) image.srcset = destination.srcset;
      image.sizes = "(max-width: 760px) 45vw, 25vw";
      image.alt = "";
      image.width = destination.imageWidth;
      image.height = destination.imageHeight;
      image.loading = "eager";
      image.decoding = "async";
      card.append(image);
      const label = document.createElement("span");
      label.className = "comparison-destination-head__label";
      label.append(createCell("strong", destination.name), createCell("span", destination.regionName));
      card.append(label);
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "comparison-remove";
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", `Poista ${destination.name} vertailusta`);
      removeButton.addEventListener("click", () => {
        comparisonIds = removeComparisonItem(comparisonIds, destination.id);
        setStatus(`${destination.name} poistettu vertailusta.`);
        renderComparison();
      });
      card.append(removeButton);
      header.append(card);
      headerRow.append(header);
    }
    comparisonHead.append(headerRow);

    const rows = [
      { type: "climate", icon: "sun", label: "Tammikuu – päivän ylin keskimäärin", value: (destination) => destination.climate ? formatTemperature(destination.climate.high) : "—", source: (destination) => destination.climate?.sourceUrl },
      { type: "climate", icon: "moon", label: "Tammikuu – yön alin keskimäärin", value: (destination) => destination.climate ? formatTemperature(destination.climate.low) : "—", source: (destination) => destination.climate?.sourceUrl },
      { type: "climate", icon: "wave", label: "Meriveden pintalämpötila (tammi)", value: (destination) => destination.sea ? `noin ${destination.sea.value} °C` : "—", source: (destination) => destination.sea?.sourceUrl },
      { type: "rent", icon: "home", label: "Vuokraindeksi (€/m²/kk)", value: (destination) => destination.rent ? `${destination.rent.label} €/m²/kk` : "—", source: (destination) => destination.rent?.url },
      { type: "rent", icon: "home", label: "Laskennallinen kuukausivuokra, 40 m²", value: (destination) => destination.rent?.value === null || !destination.rent ? "—" : `${calculateIndexedRent(destination.rent.value, 40).toLocaleString("fi-FI")} €/kk` },
      { type: "rent", icon: "home", label: "Laskennallinen kuukausivuokra, 60 m²", value: (destination) => destination.rent?.value === null || !destination.rent ? "—" : `${calculateIndexedRent(destination.rent.value, 60).toLocaleString("fi-FI")} €/kk` },
    ];
    comparisonBody.replaceChildren();
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.dataset.rowType = row.type;
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.append(createIcon(row.icon), createCell("span", row.label));
      tr.append(heading);
      for (const destination of active) {
        const td = document.createElement("td");
        const value = row.value(destination);
        const href = row.source?.(destination);
        if (href && value !== "—") {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = value;
          td.append(link);
        } else {
          td.textContent = value;
        }
        tr.append(td);
      }
      comparisonBody.append(tr);
    }
    comparisonEmpty.hidden = active.length > 0;
    comparisonWrap.hidden = active.length === 0;
    addButton.disabled = !selectedId || active.length >= MAX_COMPARISON_ITEMS;
    renderPracticalCards();
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function renderPracticalCards() {
    if (!practicalCards) return;
    practicalCards.replaceChildren();
    const ids = comparisonIds.length ? comparisonIds : selectedId ? [selectedId] : [];
    for (const id of ids) {
      const destination = byId.get(id);
      if (!destination) continue;
      const article = document.createElement("article");
      article.className = "practical-card";
      const heading = document.createElement("h3");
      const link = document.createElement("a");
      link.href = `#${destination.profileId}`;
      link.textContent = destination.name;
      heading.append(link);
      article.append(heading, createCell("p", destination.practical));
      practicalCards.append(article);
    }
  }

  function setView(view) {
    app.dataset.view = view;
    for (const button of viewButtons) button.setAttribute("aria-pressed", String(button.dataset.view === view));
    const practices = view === "practices";
    practicalPanel.hidden = !practices;
    selectedDestination.hidden = practices;
    comparisonResults.hidden = practices;
    if (practices) setStatus("Arjen kuvaukset perustuvat kohteiden lähteistettyihin profiileihin.");
    else setStatus("");
  }

  regionSelect.addEventListener("change", () => updateDestinationOptions());
  destinationSelect.addEventListener("change", () => {
    selectedId = destinationSelect.value;
    renderSelectedDestination();
    addButton.disabled = comparisonIds.length >= MAX_COMPARISON_ITEMS;
  });
  addButton.addEventListener("click", () => {
    const updated = addComparisonItem(comparisonIds, selectedId);
    comparisonIds = updated.ids;
    const destination = byId.get(selectedId);
    const messages = {
      added: comparisonIds.length >= MAX_COMPARISON_ITEMS
        ? `${destination?.name || "Kohde"} lisätty. Vertailussa on enintään neljä kohdetta; poista yksi ennen seuraavaa lisäystä.`
        : `${destination?.name || "Kohde"} lisätty vertailuun.`,
      duplicate: `${destination?.name || "Kohde"} on jo vertailussa.`,
      limit: "Vertailussa voi olla enintään neljä kohdetta. Poista ensin yksi kohde.",
    };
    setStatus(messages[updated.result]);
    renderComparison();
  });
  for (const button of viewButtons) button.addEventListener("click", () => setView(button.dataset.view));

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = decodeURIComponent(anchor.hash.slice(1));
    const target = document.getElementById(id);
    if (target && source.contains(target)) source.open = true;
  });

  const hashTarget = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (hashTarget && source.contains(hashTarget)) source.open = true;
  updateDestinationOptions(selectedId);
  renderComparison();
  setView("comparison");
  source.open = Boolean(hashTarget && source.contains(hashTarget));
  app.hidden = false;
}

if (typeof document !== "undefined") initializeComparison();
