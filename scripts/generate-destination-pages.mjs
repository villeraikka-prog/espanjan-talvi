import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DESTINATION_ASSESSMENT_METHOD, DESTINATION_CATEGORY_LABELS, DESTINATION_PROFILE_CONTENT_RECORDS, DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID, DESTINATION_RECORDS, DESTINATION_RECORDS_BY_ID, DESTINATION_REGIONS } from "../public/assets/destinations.mjs";
import { DESTINATION_SCORE_CATEGORY_IDS, DESTINATION_SCORE_RECORDS_BY_ID } from "../public/assets/destination-scores.mjs";
import { DESTINATION_SEA_TEMPERATURES, DESTINATION_STATIONS, noaaOisstCellUrl } from "../public/assets/area-comparison.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const canonicalOrigin = "https://espanjan-talvi.netlify.app";
const analyticsToken = "3417bf6e12fa4f4cb95039eddd2e5af8";
const regionsByHeading = new Map(DESTINATION_REGIONS.map(({ name, id }) => [name, id]));

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function modernSrcset(srcset, format) {
  return srcset.replace(/\.jpe?g(?=\s|,|$)/gi, `.${format}`);
}

function renderModernImageSources(srcset, sizes) {
  return ["avif", "webp"].map((format) =>
    `<source type="image/${format}" srcset="${escapeHtml(modernSrcset(srcset, format))}" sizes="${escapeHtml(sizes)}">`,
  ).join("");
}

function textFromHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", "\u00a0")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}

function attributesFromTag(tag) {
  return Object.fromEntries([...tag.matchAll(/\b([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value.replaceAll("&amp;", "&")]));
}

function markdownTableCells(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function getImageCredit(name, sourceUrl, display) {
  const imageSources = readFileSync(path.join(projectRoot, "IMAGE-SOURCES.md"), "utf8");
  const row = imageSources.split(/\r?\n/).find((line) => {
    if (!line.startsWith("|")) return false;
    const cells = markdownTableCells(line);
    return cells[0] === name || cells[0].split(",")[0].trim() === name;
  });
  if (!row) throw new Error(`IMAGE-SOURCES.md has no credit row for ${name}`);
  const cells = markdownTableCells(row);
  const licenseCell = cells[3] || "";
  const recognizedLicense = licenseCell.match(/CC BY-SA 4\.0|CC BY-SA 3\.0|CC BY 2\.0|CC BY 4\.0|CC0 1\.0 Universal Public Domain Dedication|Lähdesivun public domain -dedikaatio \(ei CC0\)|tekijän public domain -dedikaatio[^.]*|Pexels License|Unsplash License/)?.[0];
  const license = recognizedLicense || (/\*\*Public domain\*\*/i.test(licenseCell) && /ei CC0-lisenssimerkintää/i.test(licenseCell)
    ? "tekijän public domain -dedikaatio, ei CC0-lisenssimerkintä"
    : null);
  if (!license) throw new Error(`Image license is not identifiable in IMAGE-SOURCES.md for ${name}`);
  const links = [...licenseCell.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(([, label, url]) => ({ label, url }));
  const licenseLink = links.find(({ label, url }) => /lisenssi/i.test(label) || /creativecommons\.org|pexels\.com\/legal-pages\/license|unsplash\.com\/license/i.test(url));
  let licenseUrl = license === "Pexels License"
    ? "https://www.pexels.com/legal-pages/license/"
    : licenseLink?.url;
  if (!licenseUrl && license === "CC BY-SA 4.0") licenseUrl = "https://creativecommons.org/licenses/by-sa/4.0/";
  const modification = licenseCell.match(/(?:Koonmuutos|Paikalliset\s+[\d\s]+\/[\d\s]+px|Paikalliset\s+1\s*400\/[\d\s]+px)[^.]*\./)?.[0]?.trim() || "";
  return { display, sourceUrl, license, licenseUrl, modification };
}

function getClimateStations() {
  const home = readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const stations = new Map();
  for (const [, block] of home.matchAll(/<details class="climate-station">([\s\S]*?)<\/details>/g)) {
    const summary = textFromHtml(block.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "");
    const stationMatch = summary.match(/\basema\s+([\dA-Z]+)\s*·\s*([\d–-]+)\s*·/i);
    const stationId = stationMatch?.[1];
    if (!stationId) throw new Error(`Cannot parse AEMET station ID from: ${summary}`);
    const row = block.match(/<tbody>\s*<tr>([\s\S]*?)<\/tr>/i)?.[1] || "";
    const values = [...row.matchAll(/<td>([^<]+)<\/td>/gi)].map(([, value]) => {
      const numeric = value.trim().replace(",", ".");
      return numeric === "–" || numeric === "-" ? null : Number(numeric);
    });
    const sourceUrl = (block.match(/<a href="(https:\/\/www\.aemet\.es\/[^\"]+)"/)?.[1] || "").replaceAll("&amp;", "&");
    if (values.length !== 5 || values.some((value) => !Number.isFinite(value)) || !sourceUrl) {
      throw new Error(`AEMET table is missing a complete January row or source: ${stationId}`);
    }
    stations.set(stationId, {
      id: stationId,
      name: summary.replace(/\s*·\s*asema\s+[\dA-Z]+.*$/i, ""),
      period: stationMatch[2],
      sourceUrl,
      january: { meanC: values[0], dayHighMeanC: values[1], nightLowMeanC: values[2], precipitationMm: values[3], sunshineHours: values[4] },
      monthly: [...block.matchAll(/<tr><th>([^<]+)<\/th>((?:<td>[^<]+<\/td>){5})<\/tr>/g)].map(([, month, cells]) => ({
        month,
        values: [...cells.matchAll(/<td>([^<]+)<\/td>/g)].map(([, value]) => {
          const numeric = value.trim().replace(",", ".");
          return numeric === "–" || numeric === "-" ? null : Number(numeric);
        }),
      })),
    });
  }
  return stations;
}

function getRentalRows() {
  const home = readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const section = home.match(/<section id="vuokrausdata"[\s\S]*?<\/section>/)?.[0] || "";
  if (!section) throw new Error("The dated Idealista source table is missing from the homepage");
  const periodText = textFromHtml(section).match(/syyskuu\s+\d{4}/i)?.[0];
  if (!periodText) throw new Error("The Idealista source table does not disclose its reporting month");
  const rows = new Map();
  for (const match of section.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)) {
    const row = match[0];
    const name = textFromHtml(row.match(/<th scope="row">([\s\S]*?)<\/th>/i)?.[1] || "");
    if (!name) continue;
    const valueText = textFromHtml(row.match(/<td>([^<]+)<\/td>/i)?.[1] || "");
    const value = Number(valueText.replace(",", "."));
    const sourceUrl = (row.match(/<a href="(https:\/\/www\.idealista\.com\/[^\"]+)"/i)?.[1] || "").replaceAll("&amp;", "&");
    if (Number.isFinite(value) && sourceUrl) rows.set(name, { reportArea: name, value, period: "2026-09", unit: "€/m²/kk", sourceUrl, periodText });
  }
  return rows;
}

function getSourceBackedProfileRecord(destination) {
  const editorial = DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.get(destination.id);
  if (!editorial) throw new Error(`No editorial profile record exists for ${destination.id}`);
  const stationAssignment = DESTINATION_STATIONS.get(destination.id);
  const station = stationAssignment && getClimateStations().get(stationAssignment.stationId);
  const seaCell = DESTINATION_SEA_TEMPERATURES.get(destination.id);
  const rentalName = destination.id === "alicante" ? "Alicante / Alacant" : destination.name;
  const rent = getRentalRows().get(rentalName);
  if (!station || !seaCell || !rent) throw new Error(`AEMET, NOAA or Idealista source data is missing for ${destination.id}`);
  const geographicCoverage = stationAssignment.role === "regional"
    ? `${station.name} on alueellinen vertailuasema, ei paikallinen mittaus kohteessa ${destination.name}.`
    : `${station.name} on kaupunkiasema; yksittäisen asuinalueen olosuhteet voivat poiketa.`;
  return {
    ...destination,
    region: { id: destination.regionId, name: destination.regionName },
    profilePage: editorial.profilePage,
    fitGuidance: editorial.fitGuidance,
    seasonalHighlights: editorial.seasonalHighlights,
    claims: editorial.claims,
    climate: {
      station: { ...station, role: stationAssignment.role, geographicCoverage },
      january: station.january,
    },
    seaSurface: {
      valueC: seaCell.value,
      place: seaCell.place,
      gridCenter: { latitude: seaCell.latitude, longitude: seaCell.longitude },
      dataset: "NOAA/NCEI OISST AVHRR-only v2.1",
      period: "1991–2020",
      month: "January",
      sourceUrl: "https://comet.nefsc.noaa.gov/erddap/griddap/noaa_psl_55a2_880b_1f29.html",
    },
    rentalIndex: {
      ...rent,
      metric: "Idealistan vuokrailmoitusten pyyntihintaindeksi",
      geographicCoverage: `Idealistan ${rent.reportArea}-raporttirivi; ei talvikauden kalustetun vuokrauksen hinta.`,
    },
  };
}

function getCatalog() {
  const home = readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const groups = [...home.matchAll(/<section class="destination-region" aria-labelledby="([^"]+)">([\s\S]*?)<\/section>/g)].map(([, headingId, contents]) => {
    const heading = textFromHtml(contents.match(new RegExp(`<h2\\s+id="${headingId}"[^>]*>([\\s\\S]*?)<\\/h2>`))?.[1] || "");
    const regionId = regionsByHeading.get(heading);
    if (!regionId) throw new Error(`Unknown destination category heading: ${heading || headingId}`);
    const destinations = [...contents.matchAll(/<article class="destination-card" id="([^"]+)">([\s\S]*?)<\/article>/g)].map(([, id, card]) => {
      const record = DESTINATION_RECORDS_BY_ID.get(id);
      const title = textFromHtml(card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] || "");
      const cardLabel = textFromHtml(card.match(/<span class="card-index">([^<]+)<\/span>/)?.[1] || "");
      const placeType = cardLabel.split("·").slice(1).join("·").trim();
      const summary = textFromHtml(card.match(/<p class="destination-fit">([\s\S]*?)<\/p>/)?.[1] || "");
      const figure = card.match(/<figure class="destination-photo">([\s\S]*?)<\/figure>/)?.[1] || "";
      const imageTag = figure.match(/<img\b([^>]*)>/)?.[1] || "";
      const imageAttrs = attributesFromTag(imageTag);
      const sourceAnchor = figure.match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const imageBase = record?.image || {
        src: imageAttrs.src,
        srcset: imageAttrs.srcset,
        sizes: imageAttrs.sizes,
        alt: imageAttrs.alt,
        width: Number(imageAttrs.width),
        height: Number(imageAttrs.height),
        credit: {
          sourceUrl: sourceAnchor?.[1]?.replaceAll("&amp;", "&") || "",
          display: textFromHtml(sourceAnchor?.[2] || "Kuvan lähde").replace(/^Kuvan lähde:\s*/i, ""),
        },
      };
      const image = record?.image || {
        ...imageBase,
        credit: DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.has(id)
          ? getImageCredit(title, imageBase.credit.sourceUrl, imageBase.credit.display)
          : imageBase.credit,
      };
      if (!title || !placeType || !summary || !image.src || !image.alt || !image.credit?.sourceUrl || !image.credit?.license) {
        throw new Error(`Destination catalog data is incomplete for ${id}`);
      }
      if (/^CC BY(?:-SA)?\b/.test(image.credit.license) && (!image.credit.licenseUrl || !image.credit.modification)) {
        throw new Error(`Creative Commons destination image needs a license link and modification notice: ${id}`);
      }
      return {
        id,
        slug: record?.slug || id,
        name: record?.name || title,
        regionId,
        regionName: record?.region.name || heading,
        placeType: record?.placeType || placeType,
        summary: record?.summary || summary,
        image,
        profileAvailable: Boolean(record || DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.has(id)),
      };
    });
    return { id: regionId, name: heading, destinations };
  });
  if (groups.length !== 5 || groups.reduce((count, group) => count + group.destinations.length, 0) !== 24) {
    throw new Error("The destination directory source must contain exactly five groups and 24 places");
  }
  const ids = groups.flatMap((group) => group.destinations.map(({ id }) => id));
  if (new Set(ids).size !== 24) throw new Error("Destination IDs in the directory must be unique");
  return groups;
}

function breadcrumbJsonLd(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url,
    })),
  }).replaceAll("</script", "<\\/script");
}

function renderHead({ title, description, canonical, breadcrumb }) {
  const ld = breadcrumbJsonLd(breadcrumb);
  return `<!doctype html>
<html lang="fi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <link rel="stylesheet" href="/assets/site.css">
    <script type="application/ld+json">${ld}</script>
    <!-- Cloudflare Web Analytics -->
    <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${analyticsToken}"}'></script>
    <!-- End Cloudflare Web Analytics -->
  </head>`;
}

function renderHeader(activeHref = "") {
  const link = (href, label) => `<a href="${href}"${activeHref === href ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<a class="skip-link" href="#sisalto">Siirry sisältöön</a>
    <header class="site-header"><a class="brand" href="/" aria-label="Espanjan talviarki – etusivu"><span class="brand-mark" aria-hidden="true">ET</span><span>Espanjan<br>talviarki</span></a><nav class="site-nav" aria-label="Päänavigaatio">${link("/", "Vertaa")}${link("/kohteet/", "Kohteet")}${link("/vuokraus/", "Vuokraus")}${link("/budjetti/", "Budjetti")}${link("/elinkustannukset/", "Elinkustannukset")}${link("/talvehtiminen-espanjassa/", "Talvehtimisen opas")}${link("/palvelut-ja-linkit/", "Palvelut ja linkit")}</nav></header>`;
}

function renderFooter() {
  return `<footer class="site-footer"><a class="footer-brand" href="/">Espanjan talviarki</a><p>Suunnitteluapua pidempään talveen — lähteet näkyviin, oletukset erilleen faktoista.</p><nav aria-label="Alatunniste"><a href="/toimitusperiaatteet/">Tietoa ja toimitusperiaatteet</a><a href="/tietosuoja/">Tietosuoja</a></nav><p class="footer-meta">Kohdekohtaiset väitteet ja mittarit on rajattu näkyviin lähteisiin ja ajanjaksoihin.</p></footer>`;
}

function renderBreadcrumbs(items, currentName) {
  return `<nav class="breadcrumbs" aria-label="Murupolku">${items.map(({ name, href }) => `<a href="${href}">${escapeHtml(name)}</a><span aria-hidden="true">/</span>`).join("")}<span aria-current="page">${escapeHtml(currentName)}</span></nav>`;
}

function renderImage(image, { className = "", eager = false } = {}) {
  const credit = image.credit;
  const sizes = "(max-width: 760px) calc(100vw - 2rem), (max-width: 1100px) 46vw, 620px";
  const licenseText = credit.license
    ? ` Lisenssitieto: ${escapeHtml(credit.license)}${credit.licenseUrl ? ` (<a href="${escapeHtml(credit.licenseUrl)}" rel="noopener">lisenssin ehdot</a>)` : ""}.`
    : "";
  const modification = credit.modification ? ` ${escapeHtml(credit.modification)}` : "";
  return `<figure class="destination-profile-photo ${className}">
      <picture class="responsive-picture">${renderModernImageSources(image.srcset, sizes)}<img src="${escapeHtml(image.src)}" srcset="${escapeHtml(image.srcset)}" sizes="${sizes}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}></picture>
      <figcaption><details><summary>Kuvan lähde ja lisenssi</summary><p>${escapeHtml(credit.display)} · <a href="${escapeHtml(credit.sourceUrl)}" rel="noopener">kuvan lähdesivu</a>.${licenseText}${modification}</p></details></figcaption>
    </figure>`;
}

function renderCatalogCard(destination) {
  const credit = destination.image.credit;
  const sizes = "(max-width: 760px) calc(100vw - 2.5rem), (max-width: 1050px) 46vw, 30vw";
  const licenseText = credit.license
    ? ` Lisenssitieto: ${escapeHtml(credit.license)}${credit.licenseUrl ? ` (<a href="${escapeHtml(credit.licenseUrl)}" rel="noopener">lisenssin ehdot</a>)` : ""}.`
    : "";
  const modification = credit.modification ? ` ${escapeHtml(credit.modification)}` : "";
  const profileLink = destination.profileAvailable
    ? `<a class="destination-directory-link" href="/kohteet/${escapeHtml(destination.slug)}/" aria-label="Lue ${escapeHtml(destination.name)}n kohdeprofiili">Tarkemmat tiedot <span aria-hidden="true">→</span></a>`
    : `<p class="destination-profile-status">Profiilia ei ole vielä julkaistu.</p>`;
  return `<article class="destination-directory-card" data-destination-card data-name="${escapeHtml(destination.name)}" data-region="${escapeHtml(destination.regionId)}">
    <figure class="destination-directory-photo"><picture class="responsive-picture">${renderModernImageSources(destination.image.srcset, sizes)}<img src="${escapeHtml(destination.image.src)}" srcset="${escapeHtml(destination.image.srcset)}" sizes="${sizes}" alt="${escapeHtml(destination.image.alt)}" width="${destination.image.width}" height="${destination.image.height}" loading="lazy" decoding="async"></picture><figcaption><details><summary>Kuvan lähde ja lisenssi</summary><p>${escapeHtml(credit.display)} · <a href="${escapeHtml(credit.sourceUrl)}" rel="noopener">kuvan lähdesivu</a>.${licenseText}${modification}</p></details></figcaption></figure>
    <div class="destination-directory-card__body"><p class="eyebrow">${escapeHtml(destination.regionName)}</p><h3>${escapeHtml(destination.name)}</h3><p class="destination-directory-type">${escapeHtml(destination.placeType)}</p><p>${escapeHtml(destination.summary)}</p>${profileLink}</div>
  </article>`;
}

function renderDirectory(groups) {
  const canonical = `${canonicalOrigin}/kohteet/`;
  const publishedCount = groups.flatMap((group) => group.destinations).filter(({ profileAvailable }) => profileAvailable).length;
  const breadcrumb = [
    { name: "Etusivu", url: `${canonicalOrigin}/` },
    { name: "Kohteet", url: canonical },
  ];
  const description = "Selaa 24 Espanjan talvikohdetta viidellä alueella. Tutustu kohdeprofiileihin ja vertaa käveltävyyttä, joukkoliikennettä sekä arjen palveluja.";
  return `${renderHead({ title: "Espanjan talvikohteet – 24 kohdetta viidellä alueella | Espanjan talviarki", description, canonical, breadcrumb })}
  <body>
    ${renderHeader("/kohteet/")}
    <main id="sisalto" class="article-shell article-shell-wide destination-directory-page">
      ${renderBreadcrumbs([{ name: "Etusivu", href: "/" }], "Kohteet")}
      <header class="destination-directory-heading"><p class="eyebrow">24 talvikohdetta · 5 alueryhmää</p><h1>Espanjan talvikohteet</h1><p class="lede">Tutustu kohteisiin alueittain ja avaa kunkin paikan lähteistetty talviprofiili. Kaikkien 24 kohteen ilmasto- ja vuokraluvut löytyvät etusivun työkalusta.</p><p><a href="/#comparison-app">Avaa 24 kohteen vertailu</a> · <a href="/espanja-ilman-autoa/">Vertaa kohteita ilman autoa</a> · <a href="/alicante-vai-torrevieja/">Alicante vai Torrevieja?</a></p></header>
      <div class="destination-directory-filters" id="destination-directory-controls" hidden>
        <label for="destination-search">Hae kohdetta<input id="destination-search" type="search" autocomplete="off" placeholder="Esim. Torrevieja"></label>
        <label for="destination-region-filter">Rajaa alueen mukaan<select id="destination-region-filter"><option value="all">Kaikki alueet</option>${groups.map((group) => `<option value="${escapeHtml(group.id)}">${escapeHtml(group.name)}</option>`).join("")}</select></label>
        <p id="destination-directory-status" role="status" aria-live="polite">Näytetään kaikki 24 kohdetta.</p>
      </div>
      <div class="destination-directory-groups">${groups.map((group) => `<section class="destination-directory-region" id="region-${escapeHtml(group.id)}" data-destination-group="${escapeHtml(group.id)}" aria-labelledby="${escapeHtml(group.id)}-heading"><div class="section-heading"><p class="eyebrow">${escapeHtml(group.destinations.length)} kohdetta</p><h2 id="${escapeHtml(group.id)}-heading">${escapeHtml(group.name)}</h2></div><div class="destination-directory-grid">${group.destinations.map(renderCatalogCard).join("")}</div></section>`).join("")}</div>
      <p class="small-note">Hakemiston ryhmittely vastaa etusivun vertailua. Kohteet, joilla ei vielä ole omaa profiilia, ovat silti mukana etusivun vertailussa.</p>
    </main>
    ${renderFooter()}
    <script type="module" src="/assets/destination-directory.mjs"></script>
  </body>
</html>
`;
}

function renderClaims(record) {
  return record.claims.map((claim) => {
    const kindLabel = claim.kind === "source-linked-description" ? "Kunnan tai liikennöitsijän tieto" : "Käytännön huomio";
    const sources = claim.sources?.length
      ? `<ul class="destination-source-links">${claim.sources.map((url) => `<li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(new URL(url).hostname.replace(/^www\./, ""))}</a></li>`).join("")}</ul>`
      : "";
    return `<article class="destination-profile-claim"><p class="eyebrow">${kindLabel} · ${escapeHtml(DESTINATION_CATEGORY_LABELS[claim.categoryId] || claim.categoryId)}</p><p>${escapeHtml(claim.statement)}</p><p class="small-note">Aluerajaus: ${escapeHtml(claim.geographicScope)} Tarkistettu ${escapeHtml(claim.checkedOn)}.</p>${sources}</article>`;
  }).join("");
}

function formatEditorialScore(score) {
  return `${score.toLocaleString("fi-FI", { maximumFractionDigits: 1 })}/5`;
}

function renderFiveStars(score) {
  const full = Math.floor(score);
  const half = score - full === 0.5;
  return Array.from({ length: 5 }, (_, index) => {
    const state = index < full ? "full" : index === full && half ? "half" : "empty";
    return `<span class="destination-rating-star destination-rating-star--${state}" aria-hidden="true">★</span>`;
  }).join("");
}

export function renderRatingCard(assessment, label) {
  if (assessment.score === null) {
    return `<article class="destination-rating-card destination-rating-card--unassessed"><h3>${escapeHtml(label)}</h3><p class="destination-rating-unassessed">Tämän kohteen tapahtumatarjontaa ei ole arvioitu erikseen.</p></article>`;
  }
  if (!assessment.publicDescription || !assessment.scope || !assessment.sources.length || !assessment.checkedOn) {
    throw new Error(`Published destination rating is missing copy or source metadata: ${assessment.categoryId}`);
  }
  const checkedOn = new Date(`${assessment.checkedOn}T00:00:00Z`).toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const sources = assessment.sources.map((url) => `<li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(new URL(url).hostname.replace(/^www\./, ""))}</a></li>`).join("");
  const categoryScope = assessment.scope === DESTINATION_ASSESSMENT_METHOD.sharedScope
    ? ""
    : `<p class="small-note">${escapeHtml(assessment.scope)}</p>`;
  return `<article class="destination-rating-card"><h3>${escapeHtml(label)}</h3><div class="destination-rating-card__score"><span class="destination-rating-stars" aria-hidden="true">${renderFiveStars(assessment.score)}</span><span class="destination-rating-sr-only">${escapeHtml(assessment.score.toLocaleString("fi-FI", { maximumFractionDigits: 1 }))} tähteä viidestä</span><strong aria-hidden="true">${formatEditorialScore(assessment.score)}</strong></div><p class="destination-rating-description">${escapeHtml(assessment.publicDescription)}</p><details class="destination-rating-details"><summary>Lähteet ja tarkistuspäivä</summary>${categoryScope}<p class="small-note">Tarkistettu ${escapeHtml(checkedOn)}.</p><ul class="destination-source-links">${sources}</ul></details></article>`;
}

function renderAssessments(record) {
  const scoreRecord = DESTINATION_SCORE_RECORDS_BY_ID.get(record.id);
  if (!scoreRecord || scoreRecord.profilePublication.status !== "ready") {
    throw new Error(`Destination profile is not approved for publication: ${record.id}`);
  }
  const cards = DESTINATION_SCORE_CATEGORY_IDS.map((categoryId, index) => {
    const assessment = scoreRecord.assessments[index];
    if (assessment.categoryId !== categoryId) throw new Error(`Wrong score category order for ${record.id}`);
    return renderRatingCard(assessment, DESTINATION_CATEGORY_LABELS[categoryId]);
  }).join("");
  const scale = DESTINATION_ASSESSMENT_METHOD.scale.map(({ score, label }) => `<li><strong>${score}/5</strong><span>${escapeHtml(label)}</span></li>`).join("");
  const categoryMethods = DESTINATION_SCORE_CATEGORY_IDS.map((id) => `<p><strong>${escapeHtml(DESTINATION_CATEGORY_LABELS[id])}:</strong> ${escapeHtml(DESTINATION_ASSESSMENT_METHOD.categoryMethods[id])}</p>`).join("");
  return `<section class="destination-profile-section destination-assessment" aria-labelledby="${record.id}-assessment-title"><div class="section-heading"><p class="eyebrow">Kohteen arki</p><h2 id="${record.id}-assessment-title">Millainen ${escapeHtml(record.name)} on talvella?</h2></div><div class="destination-rating-grid">${cards}</div><details class="destination-method"><summary>Miten arviot tehdään?</summary><p>${escapeHtml(DESTINATION_ASSESSMENT_METHOD.explanation)}</p><p>${escapeHtml(DESTINATION_ASSESSMENT_METHOD.sharedScope)}</p><ol class="destination-rating-scale">${scale}</ol>${categoryMethods}<p>${escapeHtml(DESTINATION_ASSESSMENT_METHOD.limitation)}</p><p>Arvioita ei lasketa yhteen eikä kohteita aseteta kokonaisjärjestykseen.</p></details></section>`;
}

function renderTorreviejaWinterStay(record) {
  if (record.id !== "torrevieja") return "";
  const station = getClimateStations().get(record.climate.station.id);
  const winterMonths = [["Marras", "Marraskuu"], ["Joulu", "Joulukuu"], ["Tammi", "Tammikuu"], ["Helmi", "Helmikuu"], ["Maalis", "Maaliskuu"]];
  const weatherRows = winterMonths.map(([month, label]) => {
    const values = station?.monthly.find((row) => row.month === month)?.values;
    if (!values || values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Missing winter climate values for Torrevieja's comparison station: ${month}`);
    }
    const temperature = (value) => value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `<tr><th scope="row">${label}</th><td>${temperature(values[1])}</td><td>${temperature(values[2])}</td><td>${values[3].toLocaleString("fi-FI")}</td><td>${values[4].toLocaleString("fi-FI")}</td></tr>`;
  }).join("");
  return `<section class="destination-profile-section" aria-labelledby="torrevieja-long-stay-title">
        <div class="section-heading"><p class="eyebrow">1–6 kuukauden talvi</p><h2 id="torrevieja-long-stay-title">Torrevieja talvella: valitse arki ennen näköalaa</h2></div>
        <p>Asuntoa etsiessä kannattaa erottaa keskustan kävelyarki, La Matan rantaympäristö ja eteläisten asuinalueiden bussiyhteydet. Sama Torrevieja-osoite voi tarkoittaa hyvin erilaista tavallista viikkoa. Seuraavat valintavinkit ovat toimituksellisia arvioita alueiden sijainnin ja virallisten liikkumistietojen pohjalta.</p>
        <div class="destination-fit-grid">
          <article><h3>Keskusta ja Playa del Cura</h3><p>Playa del Cura on keskustan kaupunkiranta lähellä Juan Aparicion rantakävelyä. Aloittaisimme asuntohaun täältä, jos haluat yhdistää keskustassa asioinnin ja merenrannan. Tarkista silti oman korttelin ruokakauppa ja pysäkki: rannan läheisyys ei ratkaise kaikkia arkimatkoja.</p><p><a href="https://turismo.torrevieja.es/es/poi/playa-del-cura">Matkailutoimiston kuvaus Playa del Curasta</a></p></article>
          <article><h3>Los Locos</h3><p>Los Locos on kaupunkiranta, jonka rantakadulla on ravintoloita. Se on vaihtoehto, jos haluat rantaympäristön ja olet valmis arvioimaan keskustamatkat erikseen. Kaupungin lokakuun 2026 tiedotteessa linjan 8 reittiä muutettiin rantakadun töiden vuoksi, joten tarkista pysäkit kumpaankin suuntaan.</p><p><a href="https://turismo.torrevieja.es/es/poi/playa-de-los-locos">Los Locosin virallinen rantakuvaus</a></p></article>
          <article><h3>La Mata</h3><p>La Matan pitkä ranta sopii kävelyjä painottavaan talveen. Pohjoispää liittyy Torrelamatan kyläkeskukseen, kun taas rannan eteläosassa on Molino del Aguan dyynialue. Tarkista kummalla osuudella asunto on. Linja 8 yhdistää La Matan Torreviejan keskustaan, mutta kävely pysäkille ja vuorot on tarkistettava osoitteesta.</p><p><a href="https://turismo.torrevieja.es/es/poi/playa-de-la-mata">La Matan rannan pohjois- ja eteläosa</a></p></article>
          <article><h3>Los Balcones ja Lago Jardín</h3><p>Nämä eteläiset asuinalueet ovat eri valinta kuin keskustaranta. Kunnan tiedotteen mukaan linja 2 yhdistää ne sairaalaan ja keskustan Gregorio Marañónille ilman vaihtoa 2.11.2026 alkaen. Jos harkitset asuntoa täältä ilman autoa, varmista kauppareitti ja bussin paluuvuoro. Auto voi olla hyödyllinen, jos viikoittaiset matkat eivät sovi reitin tai aikataulun varaan.</p></article>
        </div>
        <p class="small-note">Aluekuvaukset ja liikennelähteet tarkistettu 11.11.2026. <a href="https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo">Kaupungin tiedote linjoista 1, 2 ja 8</a> sekä <a href="https://turismo.torrevieja.es/es/planifica/como-desplazarse">virallinen liikkumisohje</a>. Rantasivujen kesäpalvelut eivät vahvista talven aukioloja. Tarkista reitit ja palvelut omalle oleskeluajalle.</p>
        <h3>Marras–maaliskuun päivät ja yöt vertailuasemalla</h3>
        <p>Talven keskellä yöt ovat viileämpiä kuin marraskuussa. Varmista vuokranantajalta lämmitys, sen kulut ja asunnon talvikunto; ulkoilman keskiarvosta ei voi päätellä sisälämpötilaa.</p>
        <p class="small-note">AEMET: ${escapeHtml(station.name)}, asema ${escapeHtml(station.id)}, ${escapeHtml(station.period)}. Elchen kunnassa sijaitseva alueellinen vertailuasema, ei Torreviejan paikallinen mittaus. Historiallisia keskiarvoja, eivät ennusteita.</p>
        <div class="table-wrap" role="region" tabindex="0" aria-label="Torreviejan alueellisen vertailuaseman talvikuukaudet"><table><caption>Marras–maaliskuu · AEMET ${escapeHtml(station.period)}</caption><thead><tr><th scope="col">Kuukausi</th><th scope="col">Päivän ylin keskimäärin (°C)</th><th scope="col">Yön alin keskimäärin (°C)</th><th scope="col">Sadetta (mm/kk)</th><th scope="col">Aurinkoa (h/kk)</th></tr></thead><tbody>${weatherRows}</tbody></table></div>
        <p class="small-note"><a href="${escapeHtml(station.sourceUrl)}">AEMETin kuukausinormaalit ja muuttujien määritelmät</a>. Luvut ovat samasta asemataulukosta kuin etusivun vertailutiedot.</p>
        <h3>Pyydä tarjous koko talvijaksolle</h3><p>Idealistan €/m²-ilmoitusindeksi on pitkäaikaisen vuokrauksen taustamittari. Se ei kerro kalustetun marras–maaliskuun asunnon hintaa. Pyydä kirjallinen kokonaishinta omalle ajanjaksollesi sekä tiedot sähköstä, vedestä, lämmityksestä ja vakuudesta. <a href="/vuokraus/">Talviasunnon tarkistuslista</a> auttaa sopimuksen ja talvikunnon arvioinnissa.</p><p><a href="/espanja-ilman-autoa/">Vertaa Torreviejaa muihin autottoman talven vaihtoehtoihin</a>.</p>
      </section>`;
}

function renderHighlights(record) {
  const groups = ["culture-and-sights", "events", "beaches-and-outdoors", "restaurants-and-shopping"];
  const content = groups.map((categoryId) => {
    const items = record.seasonalHighlights.filter((item) => item.categoryId === categoryId);
    if (!items.length) return "";
    const cards = items.map((item) => {
      const sourceLinks = [
        { label: "virallinen lähde", url: item.source },
        ...(item.additionalSources ?? []),
      ].map(({ label, url }) => `<a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(label)}</a>`).join(" · ");
      return `<article class="destination-highlight"><p class="eyebrow">${escapeHtml(item.period)}</p><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p><p class="small-note">Tarkistettu ${escapeHtml(item.checkedOn)} · ${sourceLinks}</p></article>`;
    }).join("");
    return `<div class="destination-highlight-group"><h3>${escapeHtml(DESTINATION_CATEGORY_LABELS[categoryId])}</h3><div class="destination-highlight-grid">${cards}</div></div>`;
  }).join("");
  return `<section class="destination-profile-section destination-winter-highlights" aria-labelledby="${record.id}-highlights-title"><div class="section-heading"><p class="eyebrow">Paikallista nähtävää</p><h2 id="${record.id}-highlights-title">Kohteessa nähtävää ja koettavaa</h2><p>Tässä muutama lähteistetty esimerkki. Ohjelma ja aukiolot kannattaa tarkistaa ennen matkaa.</p></div>${content}</section>`;
}

function renderProfile(record) {
  const scoreRecord = DESTINATION_SCORE_RECORDS_BY_ID.get(record.id);
  const canonical = `${canonicalOrigin}/kohteet/${record.slug}/`;
  const regionAnchor = `/kohteet/#region-${record.region.id}`;
  const breadcrumb = [
    { name: "Etusivu", url: `${canonicalOrigin}/` },
    { name: "Kohteet", url: `${canonicalOrigin}/kohteet/` },
    { name: record.region.name, url: `${canonicalOrigin}/kohteet/#region-${record.region.id}` },
    { name: record.name, url: canonical },
  ];
  const climate = record.climate;
  const sea = record.seaSurface;
  const rent = record.rentalIndex;
  const description = record.profilePage.description;
  const sourceLinks = [
    { label: `AEMET: ${climate.station.name}, asema ${climate.station.id} (${climate.station.period})`, url: climate.station.sourceUrl },
    { label: `NOAA/NCEI OISST: ${sea.period}, tammikuu, ruudun keskipiste ${sea.gridCenter.latitude}, ${sea.gridCenter.longitude}`, url: noaaOisstCellUrl(sea.gridCenter.latitude, sea.gridCenter.longitude) },
    { label: `Idealista: ${rent.reportArea}, ${rent.period}`, url: rent.sourceUrl },
  ];
  const checkedDates = [...new Set([
    ...record.claims.map(({ checkedOn }) => checkedOn),
    ...scoreRecord.assessments.map(({ checkedOn }) => checkedOn).filter(Boolean),
    ...record.seasonalHighlights.map(({ checkedOn }) => checkedOn),
  ])].sort();
  const latestCheckedDate = checkedDates.at(-1);
  return `${renderHead({ title: record.profilePage.title, description, canonical, breadcrumb })}
  <body>
    ${renderHeader("/kohteet/")}
    <main id="sisalto" class="article-shell article-shell-wide destination-profile-page">
      ${renderBreadcrumbs([{ name: "Etusivu", href: "/" }, { name: "Kohteet", href: "/kohteet/" }, { name: record.region.name, href: regionAnchor }], record.name)}
      <div class="destination-profile-hero">
        <header class="page-heading destination-profile-heading"><p class="eyebrow">${escapeHtml(record.region.name)} · ${escapeHtml(record.placeType)}</p><h1>${escapeHtml(record.name)}</h1><p class="lede">${escapeHtml(record.profilePage.introduction)}</p></header>
        ${renderImage(record.image, { eager: true })}
      </div>
      ${renderAssessments(record)}
      ${renderHighlights(record)}
      ${renderClaims(record) ? `<section class="destination-profile-section" aria-labelledby="${record.id}-daily-title"><div class="section-heading"><p class="eyebrow">Käytännön arki</p><h2 id="${record.id}-daily-title">Liikkuminen ja arjen palvelut</h2><p>Yhteydet ja kävelymatkat kannattaa tarkistaa juuri harkittavan asunnon osoitteesta.</p></div><div class="destination-profile-claims">${renderClaims(record)}</div></section>` : ""}
${renderTorreviejaWinterStay(record)}
      <section class="destination-profile-section destination-fit-guidance" aria-labelledby="${record.id}-fit-title"><div class="section-heading"><p class="eyebrow">Talvehtijan valinta</p><h2 id="${record.id}-fit-title">Kenelle kohde voi sopia?</h2></div><div class="destination-fit-grid"><article><h3>Kohteen vetovoima</h3><p>${escapeHtml(record.fitGuidance.maySuit)}</p></article><article><h3>Huomioi tämä</h3><p>${escapeHtml(record.fitGuidance.weigh)}</p></article></div></section>
      <section class="destination-profile-section destination-profile-context" aria-labelledby="${record.id}-context-title"><div class="section-heading"><p class="eyebrow">Taustatietoa</p><h2 id="${record.id}-context-title">Ilmasto ja vuokran vertailuluku</h2></div><div class="destination-background-grid"><article class="destination-background-card destination-profile-climate" aria-labelledby="${record.id}-climate-title"><h3 id="${record.id}-climate-title">Tammikuu vertailuasemalla</h3><p>Historialliset AEMET-ilmastonormaalit, eivät nykyinen sää tai ennuste. ${escapeHtml(climate.station.name)} (${climate.station.id}), ${escapeHtml(climate.station.period)}. ${escapeHtml(climate.station.geographicCoverage)}</p><dl class="destination-climate-metrics"><div><dt>Keskimääräinen lämpötila</dt><dd>${climate.january.meanC.toLocaleString("fi-FI", { maximumFractionDigits: 1 })} °C</dd></div><div><dt>Päivän keskimääräinen ylin</dt><dd>${climate.january.dayHighMeanC.toLocaleString("fi-FI", { maximumFractionDigits: 1 })} °C</dd></div><div><dt>Yön keskimääräinen alin</dt><dd>${climate.january.nightLowMeanC.toLocaleString("fi-FI", { maximumFractionDigits: 1 })} °C</dd></div><div><dt>Sademäärä</dt><dd>${climate.january.precipitationMm.toLocaleString("fi-FI")} mm</dd></div><div><dt>Auringonpaistetta</dt><dd>${climate.january.sunshineHours.toLocaleString("fi-FI")} h</dd></div></dl><div class="destination-sea-note"><h4>Meriveden pintalämpötila</h4><p>${sea.valueC.toLocaleString("fi-FI")} °C tammikuun alueellisessa NOAA/OISST-meriruudussa (${escapeHtml(sea.period)}): ${escapeHtml(sea.place)}. Ruutuarvo ei ole paikallinen rantamittaus eikä kuvaa esimerkiksi suojaisan lahden tai laguunin vettä.</p></div></article><article class="destination-background-card destination-profile-rent" aria-labelledby="${record.id}-rent-title"><p class="eyebrow">Idealistan vuokrailmoitusindeksi</p><h3 id="${record.id}-rent-title">Pitkäaikaisen vuokrauksen pyyntihinta</h3><p class="destination-profile-rent-value">${rent.value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span>${escapeHtml(rent.unit)}</span></p><p>Raporttialue: <strong>${escapeHtml(rent.reportArea)}</strong> · ${escapeHtml(rent.period)}. Luku kuvaa ilmoitusten pyyntihintaa, ei toteutunutta vuokraa eikä kalustetun talvikauden asunnon hintaa.</p><p><a href="${escapeHtml(rent.sourceUrl)}" rel="noopener">Avaa Idealistan ${escapeHtml(rent.reportArea)}-raportti</a></p></article></div></section>
      <section class="destination-profile-section destination-profile-sources" aria-labelledby="${record.id}-sources-title"><div class="section-heading"><p class="eyebrow">Lisätietoa</p><h2 id="${record.id}-sources-title">Lähteet ja rajaukset</h2><p>Avaa lähteet, jos haluat tarkistaa kohdetta ja vertailutietoja koskevat lisätiedot.</p></div><details><summary>Avaa ilmasto-, meri- ja vuokralähteet</summary><ul>${sourceLinks.map(({ label, url }) => `<li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(label)}</a></li>`).join("")}</ul><p class="small-note">Käytännön kohdekuvaukset ja arviot on tarkistettu ${escapeHtml(latestCheckedDate)}. Tapahtumien, aukiolojen ja reittien ajantasaisuus on tarkistettava alkuperäislähteistä.</p></details></section>
      <nav class="destination-profile-related" aria-label="Aiheeseen liittyvät sivut"><h2>Jatka suunnittelua</h2><ul><li><a href="/#comparison-app">Vertaa ${escapeHtml(record.name)}a etusivun työkalussa</a></li><li><a href="/kohteet/">Takaisin 24 kohteen hakemistoon</a></li><li><a href="/espanja-ilman-autoa/">Käveltävyys ja joukkoliikenne 24 kohteessa</a></li>${["alicante", "torrevieja"].includes(record.id) ? `<li><a href="/alicante-vai-torrevieja/">Alicante vai Torrevieja talvella?</a></li>` : ""}<li><a href="/vuokraus/">Talviasunnon vuokraamisen tarkistuslista</a></li><li><a href="/budjetti/">Laske oma budjetti</a></li><li><a href="/elinkustannukset/">Elinkustannusten vertailu</a></li><li><a href="/talvehtiminen-espanjassa/">Talvehtimisen yleisopas</a></li></ul></nav>
    </main>
    ${renderFooter()}
  </body>
</html>
`;
}

export function renderDestinationOutputs() {
  const groups = getCatalog();
  const outputs = new Map([[path.join(publicRoot, "kohteet", "index.html"), renderDirectory(groups)]]);
  const destinationsById = new Map(groups.flatMap((group) => group.destinations).map((destination) => [destination.id, destination]));
  const profileRecords = [
    ...DESTINATION_RECORDS,
    ...DESTINATION_PROFILE_CONTENT_RECORDS.map((record) => {
      const destination = destinationsById.get(record.id);
      if (!destination) throw new Error(`Editorial profile destination is missing from the current catalog: ${record.id}`);
      return getSourceBackedProfileRecord(destination);
    }),
  ];
  for (const record of profileRecords) {
    outputs.set(path.join(publicRoot, "kohteet", record.slug, "index.html"), renderProfile(record));
  }
  return outputs;
}

function run() {
  const checkOnly = process.argv.includes("--check");
  const outputs = renderDestinationOutputs();
  for (const [filePath, html] of outputs) {
    if (checkOnly) {
      let current;
      try {
        current = readFileSync(filePath, "utf8");
      } catch {
        throw new Error(`Generated destination page is missing: ${path.relative(projectRoot, filePath)}`);
      }
      if (current.replaceAll("\r\n", "\n") !== html.replaceAll("\r\n", "\n")) throw new Error(`Generated destination page is stale: ${path.relative(projectRoot, filePath)}`);
    } else {
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, html, "utf8");
    }
  }
  console.log(`${checkOnly ? "OK" : "Generated"}: ${outputs.size} static destination pages`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
