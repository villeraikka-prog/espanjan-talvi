import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateBudget } from "../public/assets/budget.mjs";
import {
  DESTINATION_ASSESSMENT_METHOD,
  DESTINATION_CATEGORY_IDS,
  DESTINATION_CATEGORY_LABELS,
  DESTINATION_RECORDS,
  DESTINATION_RECORDS_BY_ID,
  DESTINATION_PROFILE_CONTENT_RECORDS,
  DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID,
  DESTINATION_PROFILE_CONTENT_SCHEMA_VERSION,
  DESTINATION_REGIONS,
  DESTINATION_SCHEMA_VERSION,
} from "../public/assets/destinations.mjs";
import {
  DESTINATION_SCORE_CATEGORY_IDS,
  DESTINATION_SCORE_RECORDS,
  DESTINATION_SCORE_RECORDS_BY_ID,
} from "../public/assets/destination-scores.mjs";
import {
  MAX_COMPARISON_ITEMS,
  DESTINATION_SEA_TEMPERATURES,
  DESTINATION_STATIONS,
  addComparisonItem,
  applyDestinationRecord,
  calculateIndexedRent,
  comparisonRegionId,
  filterDestinations,
  sortDestinationOptions,
  normalizePlaceName,
  noaaOisstCellUrl,
  noaaOisstGridIndices,
  removeComparisonItem,
} from "../public/assets/area-comparison.mjs";
import {
  calculateRelativeRentIndex,
  normalizeRentalPlaceName,
  readComparisonRentRows,
  rentalRowsForRegion,
} from "../public/assets/rental-index.mjs";
import { renderDestinationOutputs, renderRatingCard } from "./generate-destination-pages.mjs";
import {
  AIRPORTS,
  CTMAM_INTERURBAN_SINGLE_FARES,
  DESTINATION_AIRPORTS,
  FOOD_PRICE_LEVEL,
  HUELVA_ORDINARY_SINGLE_FARE,
  MAPA_FOOD_PERIOD,
  MAPA_FOOD_PRODUCTS,
  MAPA_FOOD_REGIONS,
  MAPA_FOOD_REGION_DESTINATIONS,
  NATIONAL_RENT_BENCHMARK,
  calculateMapaFoodMetrics,
  createFlightsSearchUrl,
} from "../public/assets/elinkustannukset.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const canonicalOrigin = "https://espanjan-talvi.netlify.app";
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".html") && entry.name !== "googled30403c4c0cf7607.html") htmlFiles.push(fullPath);
  }
}

function routeFor(filePath) {
  const relative = path.relative(publicRoot, filePath).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

walk(publicRoot);
const comparisonRedirectPath = path.join(publicRoot, "aluevertailu", "index.html");
const pages = htmlFiles.filter((file) => {
  const relative = path.relative(publicRoot, file).replaceAll(path.sep, "/");
  return relative !== "404.html" && relative !== "aluevertailu/index.html";
});
const generatedDestinationOutputs = renderDestinationOutputs();
assert.equal(generatedDestinationOutputs.size, 25, "Destination generator must produce the directory and all 24 sourced destination profiles");
for (const [filePath, expectedHtml] of generatedDestinationOutputs) {
  assert.ok(existsSync(filePath), `Generated destination page is missing: ${path.relative(publicRoot, filePath)}`);
  assert.equal(readFileSync(filePath, "utf8").replaceAll("\r\n", "\n"), expectedHtml.replaceAll("\r\n", "\n"), `Generated destination page is stale: ${path.relative(publicRoot, filePath)}`);
}
const destinationDirectoryHtml = readFileSync(path.join(publicRoot, "kohteet", "index.html"), "utf8");
const destinationDirectoryCards = [...destinationDirectoryHtml.matchAll(/<article class="destination-directory-card" data-destination-card\b[^>]*data-name="([^"]+)"[^>]*data-region="([^"]+)"/g)];
assert.equal(destinationDirectoryCards.length, 24, "Destination directory must display all 24 places");
assert.equal((destinationDirectoryHtml.match(/class="destination-directory-region"/g) || []).length, 5, "Destination directory must preserve the five regional groups");
const directoryImageCredits = [...destinationDirectoryHtml.matchAll(/<figure class="destination-directory-photo">[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption><\/figure>/g)].map(([, caption]) => caption);
assert.equal(directoryImageCredits.length, 24, "Every directory image must include its own credit disclosure");
for (const [index, caption] of directoryImageCredits.entries()) {
  assert.match(caption, /<details><summary>Kuvan lähde ja lisenssi<\/summary><p>[\s\S]*?kuvan lähdesivu[\s\S]*?Lisenssitieto:/, `Directory image credit must include its source and license: ${index + 1}`);
  if (/CC BY(?:-SA)?\b/.test(caption)) {
    assert.match(caption, /href="https:\/\/creativecommons\.org\/licenses\//, `Creative Commons directory credit needs a license link: ${index + 1}`);
    assert.match(caption, /Koonmuutos|pienennetty|Paikalliset/i, `Creative Commons directory credit needs a modification notice: ${index + 1}`);
  }
}
const directoryProfileLinks = [...destinationDirectoryHtml.matchAll(/href="(\/kohteet\/[a-z0-9-]+\/)"/g)].map(([, href]) => href);
const expectedPublishedProfileRoutes = ["alicante", "orihuela-costa", "guardamar-del-segura", "denia", "javea-xabia", "calp", "cartagena", "los-alcazares", "san-pedro-del-pinatar", "la-manga-del-mar-menor", "puerto-de-mazarron", "aguilas", "almeria", "roquetas-de-mar", "almerimar", "vera", "torrevieja", "fuengirola", "benidorm", "malaga", "valencia", "murcia", "cadiz", "huelva"].map((id) => `/kohteet/${id}/`);
assert.deepEqual(directoryProfileLinks.sort(), [...expectedPublishedProfileRoutes].sort(), "Directory must link to all 24 published profiles");
assert.equal((destinationDirectoryHtml.match(/Profiilia ei ole vielä julkaistu\./g) || []).length, 0, "All 24 destination directory entries must link to a published profile");
assert.doesNotMatch(destinationDirectoryHtml, /Avaa [^<]+-profiili/, "Directory profile links must use the reader-facing concise label");
assert.ok(destinationDirectoryHtml.includes('id="destination-search"') && destinationDirectoryHtml.includes('id="destination-region-filter"'), "Destination directory must include a progressive search and region filter");
assert.ok(destinationDirectoryHtml.includes('src="/assets/destination-directory.mjs"'), "Destination directory must load its lightweight filter module");
for (const [filePath, html] of generatedDestinationOutputs) {
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(jsonLd, `Generated destination route needs BreadcrumbList data: ${path.relative(publicRoot, filePath)}`);
  const breadcrumbData = JSON.parse(jsonLd);
  assert.equal(breadcrumbData["@type"], "BreadcrumbList", `Only breadcrumb structured data is expected: ${path.relative(publicRoot, filePath)}`);
  assert.ok(breadcrumbData.itemListElement.length >= 2, `BreadcrumbList must have a visible path: ${path.relative(publicRoot, filePath)}`);
  const breadcrumbNav = html.match(/<nav class="breadcrumbs" aria-label="Murupolku">([\s\S]*?)<\/nav>/)?.[1] || "";
  for (const item of breadcrumbData.itemListElement) assert.ok(breadcrumbNav.includes(item.name), `Structured breadcrumb item is not visible: ${item.name}`);
  assert.doesNotMatch(jsonLd, /"@type"\s*:\s*"(?:Article|BlogPosting)"/);
}
assert.equal(pages.length, 33, "The indexable site should contain the original eight pages, directory and 24 sourced profiles");
const expectedPrimaryNavigation = [
  ["/", "Vertaa"],
  ["/kohteet/", "Kohteet"],
  ["/vuokraus/", "Vuokraus"],
  ["/budjetti/", "Budjetti"],
  ["/elinkustannukset/", "Elinkustannukset"],
  ["/talvehtiminen-espanjassa/", "Talvehtimisen opas"],
  ["/palvelut-ja-linkit/", "Palvelut ja linkit"],
];
const activeNavigationByRoute = new Map([
  ["/", ["/"]],
  ["/aluevertailu/", ["/"]],
  ["/vuokraus/", ["/vuokraus/"]],
  ["/budjetti/", ["/budjetti/"]],
  ["/elinkustannukset/", ["/elinkustannukset/"]],
  ["/talvehtiminen-espanjassa/", ["/talvehtiminen-espanjassa/"]],
  ["/toimitusperiaatteet/", []],
  ["/palvelut-ja-linkit/", ["/palvelut-ja-linkit/"]],
  ["/kohteet/", ["/kohteet/"]],
  ["/kohteet/torrevieja/", ["/kohteet/"]],
  ["/kohteet/fuengirola/", ["/kohteet/"]],
  ["/kohteet/benidorm/", ["/kohteet/"]],
  ["/kohteet/alicante/", ["/kohteet/"]],
  ["/kohteet/orihuela-costa/", ["/kohteet/"]],
  ["/kohteet/guardamar-del-segura/", ["/kohteet/"]],
  ["/kohteet/denia/", ["/kohteet/"]],
  ["/kohteet/javea-xabia/", ["/kohteet/"]],
  ["/kohteet/calp/", ["/kohteet/"]],
  ["/kohteet/cartagena/", ["/kohteet/"]],
  ["/kohteet/los-alcazares/", ["/kohteet/"]],
  ["/kohteet/san-pedro-del-pinatar/", ["/kohteet/"]],
  ["/kohteet/la-manga-del-mar-menor/", ["/kohteet/"]],
  ["/kohteet/puerto-de-mazarron/", ["/kohteet/"]],
  ["/kohteet/aguilas/", ["/kohteet/"]],
  ["/kohteet/almeria/", ["/kohteet/"]],
  ["/kohteet/roquetas-de-mar/", ["/kohteet/"]],
  ["/kohteet/almerimar/", ["/kohteet/"]],
  ["/kohteet/vera/", ["/kohteet/"]],
  ["/kohteet/malaga/", ["/kohteet/"]],
  ["/kohteet/valencia/", ["/kohteet/"]],
  ["/kohteet/murcia/", ["/kohteet/"]],
  ["/kohteet/cadiz/", ["/kohteet/"]],
  ["/kohteet/huelva/", ["/kohteet/"]],
]);
const titles = new Set();
const descriptions = new Set();
const canonicalRoutes = new Set();
const expectedDestinations = ["alicante", "torrevieja", "benidorm", "orihuela-costa", "guardamar-del-segura", "denia", "javea-xabia", "calp", "malaga", "fuengirola", "cartagena", "los-alcazares", "san-pedro-del-pinatar", "la-manga-del-mar-menor", "puerto-de-mazarron", "aguilas", "almeria", "roquetas-de-mar", "almerimar", "vera", "valencia", "murcia", "cadiz", "huelva"];
const expectedPilotIds = ["torrevieja", "fuengirola", "benidorm"];
const expectedNewProfileIds = ["alicante", "orihuela-costa", "guardamar-del-segura", "denia", "javea-xabia", "calp", "cartagena", "los-alcazares", "san-pedro-del-pinatar", "la-manga-del-mar-menor", "puerto-de-mazarron", "aguilas", "almeria", "roquetas-de-mar", "almerimar", "vera", "malaga", "valencia", "murcia", "cadiz", "huelva"];
const expectedPublishedProfileIds = [...expectedPilotIds, ...expectedNewProfileIds];
const expectedDestinationCategoryIds = [
  "climate-and-sunshine", "beaches-and-outdoors", "culture-and-sights", "events", "nightlife",
  "restaurants-and-shopping", "quietness", "walkability", "public-transport",
  "health-and-daily-services", "rental-availability", "price-level",
];
const expectedCostaBlancaProfiles = ["alicante", "torrevieja", "benidorm", "orihuela-costa", "guardamar-del-segura", "denia", "javea-xabia", "calp"];
const expectedDestinationNavigationGroups = new Map([
  ["Costa Blanca", [...expectedCostaBlancaProfiles, "alicante-vai-torrevieja"]],
  ["Costa del Sol", ["malaga", "fuengirola"]],
  ["Costa Cálida", ["cartagena", "los-alcazares", "san-pedro-del-pinatar", "la-manga-del-mar-menor", "puerto-de-mazarron", "aguilas"]],
  ["Costa de Almería", ["almeria", "roquetas-de-mar", "almerimar", "vera"]],
  ["Muut kohteet Espanjassa", ["valencia", "murcia", "cadiz", "huelva"]],
]);
const destinationAltNames = new Map([
  ["orihuela-costa", "Orihuela Costa"],
  ["guardamar-del-segura", "Guardamar del Segura"],
  ["javea-xabia", "Xàbia"],
  ["san-pedro-del-pinatar", "San Pedro del Pinatar"],
  ["la-manga-del-mar-menor", "La Manga"],
  ["puerto-de-mazarron", "Puerto de Mazarrón"],
  ["roquetas-de-mar", "Roquetas de Mar"],
]);
const expectedNewPhotoSources = new Map([
  ["alicante", "https://commons.wikimedia.org/wiki/File:Alicante_Harbor_from_Santa_Barbara_Castle.jpg"],
  ["orihuela-costa", "https://commons.wikimedia.org/wiki/File:Mediterranean_coastline_of_Cabo_Roig_in_Orihuela_Costa,_Orihuela,_Alicante,_Spain,_2022_January.jpg"],
  ["guardamar-del-segura", "https://commons.wikimedia.org/wiki/File:Dunes_of_Guardamar_del_Segura.JPG"],
  ["denia", "https://unsplash.com/photos/white-boats-on-docking-station-oADsJyngtEs"],
  ["javea-xabia", "https://commons.wikimedia.org/wiki/File:Port_de_X%C3%A0bia_i_Montg%C3%B3.JPG"],
  ["calp", "https://commons.wikimedia.org/wiki/File:Pe%C3%B1%C3%B3n_de_Ifach,_Calpe,_Espa%C3%B1a,_2014-07-01,_DD_14.JPG"],
  ["torrevieja", "https://commons.wikimedia.org/wiki/File:Strandentorrevieja.jpg"],
  ["cartagena", "https://unsplash.com/photos/ancient-roman-amphitheater-ruins-under-the-bright-sun-2GGPhORBdVE"],
  ["benidorm", "https://www.pexels.com/photo/benidorm-skyline-with-intempo-building-33739349/"],
  ["malaga", "https://www.pexels.com/photo/aerial-view-of-malaga-spain-at-sunset-12876971/"],
  ["los-alcazares", "https://commons.wikimedia.org/wiki/File:Playa_de_Las_Palmeras_en_Los_Alc%C3%A1zares.jpg"],
  ["san-pedro-del-pinatar", "https://commons.wikimedia.org/wiki/File:Salinas_y_Arenales_de_San_Pedro_del_Pinatar_-_WLE_Spain_2015.jpg"],
  ["la-manga-del-mar-menor", "https://unsplash.com/photos/green-palm-trees-near-white-and-brown-concrete-building-during-daytime-PlObKBlri-M"],
  ["puerto-de-mazarron", "https://commons.wikimedia.org/wiki/File:Hafen_Pto.d.Mazarron05.JPG"],
  ["aguilas", "https://commons.wikimedia.org/wiki/File:Castilloaguilasmurcia.jpg"],
  ["almeria", "https://www.pexels.com/photo/town-on-sea-coast-15947296/"],
  ["roquetas-de-mar", "https://commons.wikimedia.org/wiki/File:Playa_Roquetas_de_Mar.jpg"],
  ["murcia", "https://commons.wikimedia.org/wiki/File:Cathedral,_Murcia.jpg"],
  ["cadiz", "https://commons.wikimedia.org/wiki/File:Catedral_of_Cadiz.jpg"],
  ["almerimar", "https://commons.wikimedia.org/wiki/File:PXL_20240126_gale%C3%B3n_Andaluc%C3%ADa_en_Almerimar_12.jpg"],
  ["vera", "https://commons.wikimedia.org/wiki/File:Vista_de_Vera_013.jpg"],
]);
const expectedOriginalImageUrls = new Map([
  ["alicante", "https://upload.wikimedia.org/wikipedia/commons/4/41/Alicante_Harbor_from_Santa_Barbara_Castle.jpg"],
  ["torrevieja", "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Strandentorrevieja.jpg/1920px-Strandentorrevieja.jpg"],
  ["benidorm", "https://images.pexels.com/photos/33739349/pexels-photo-33739349.jpeg"],
  ["guardamar-del-segura", "https://upload.wikimedia.org/wikipedia/commons/7/7a/Dunes_of_Guardamar_del_Segura.JPG"],
  ["javea-xabia", "https://upload.wikimedia.org/wikipedia/commons/d/da/Port_de_X%C3%A0bia_i_Montg%C3%B3.JPG"],
  ["calp", "https://upload.wikimedia.org/wikipedia/commons/d/df/Pe%C3%B1%C3%B3n_de_Ifach%2C_Calpe%2C_Espa%C3%B1a%2C_2014-07-01%2C_DD_14.JPG"],
  ["malaga", "https://images.pexels.com/photos/12876971/pexels-photo-12876971.jpeg"],
  ["los-alcazares", "https://upload.wikimedia.org/wikipedia/commons/6/67/Playa_de_Las_Palmeras_en_Los_Alc%C3%A1zares.jpg"],
  ["almeria", "https://images.pexels.com/photos/15947296/pexels-photo-15947296.jpeg"],
  ["roquetas-de-mar", "https://upload.wikimedia.org/wikipedia/commons/9/94/Playa_Roquetas_de_Mar.jpg"],
  ["murcia", "https://upload.wikimedia.org/wikipedia/commons/2/27/Cathedral%2C_Murcia.jpg"],
  ["cadiz", "https://upload.wikimedia.org/wikipedia/commons/3/39/Catedral_of_Cadiz.jpg"],
  ["aguilas", "https://upload.wikimedia.org/wikipedia/commons/5/5e/Castilloaguilasmurcia.jpg"],
]);
const expectedDestinationPhotoFiles = new Map([
  ["alicante", ["alicante-harbor-v3", 630]], ["torrevieja", ["torrevieja-homes-v2", 1050]],
  ["benidorm", ["benidorm-street-v2", 933]], ["guardamar-del-segura", ["guardamar-dunes-v3", 919]],
  ["javea-xabia", ["javea-harbor-montgo-v3", 901]], ["calp", ["calp-penon-v3", 933]],
  ["malaga", ["malaga-street-v2", 788]], ["los-alcazares", ["los-alcazares-playa-palmeras-v3", 663]],
  ["almeria", ["almeria-old-town-v2", 927]], ["roquetas-de-mar", ["roquetas-castillo-santa-ana-v3", 788]],
  ["murcia", ["murcia-cathedral-v3", 1050]], ["cadiz", ["cadiz-cathedral-v3", 933]],
  ["aguilas", ["aguilas-castle-v3", 933]],
]);
const expectedStations = ["8025", "8019", "6155A", "8416", "6325O", "7178I", "5973", "4642E"];
const expectedClimateAssignments = new Map([
  ["alicante", ["8025", "city"]], ["torrevieja", ["8019", "regional"]], ["benidorm", ["8025", "regional"]],
  ["orihuela-costa", ["8019", "regional"]], ["guardamar-del-segura", ["8019", "regional"]], ["denia", ["8416", "regional"]],
  ["javea-xabia", ["8025", "regional"]], ["calp", ["8025", "regional"]], ["malaga", ["6155A", "airport"]],
  ["fuengirola", ["6155A", "regional"]], ["cartagena", ["7178I", "regional"]], ["los-alcazares", ["7178I", "regional"]],
  ["san-pedro-del-pinatar", ["7178I", "regional"]], ["la-manga-del-mar-menor", ["7178I", "regional"]],
  ["puerto-de-mazarron", ["7178I", "regional"]], ["aguilas", ["6325O", "regional"]], ["almeria", ["6325O", "airport"]],
  ["roquetas-de-mar", ["6325O", "regional"]], ["almerimar", ["6325O", "regional"]], ["vera", ["6325O", "regional"]],
  ["valencia", ["8416", "city"]], ["murcia", ["7178I", "city"]], ["cadiz", ["5973", "city"]], ["huelva", ["4642E", "city"]],
]);
const expectedSeaCells = new Map([
  ["alicante", [14, 38.375, -0.375]], ["torrevieja", [14, 37.875, -0.625]], ["benidorm", [14, 38.375, -0.125]],
  ["orihuela-costa", [14, 37.875, -0.625]], ["guardamar-del-segura", [14, 38.125, -0.625]], ["denia", [14, 38.875, 0.125]],
  ["javea-xabia", [14, 38.875, 0.125]], ["calp", [14, 38.625, 0.125]], ["malaga", [15, 36.625, -4.375]],
  ["fuengirola", [15, 36.375, -4.625]], ["cartagena", [15, 37.375, -0.875]], ["los-alcazares", [14, 37.625, -0.625]],
  ["san-pedro-del-pinatar", [14, 37.875, -0.625]], ["la-manga-del-mar-menor", [14, 37.625, -0.625]],
  ["puerto-de-mazarron", [15, 37.375, -1.375]], ["aguilas", [15, 37.375, -1.625]], ["almeria", [15, 36.625, -2.375]],
  ["roquetas-de-mar", [15, 36.625, -2.625]], ["almerimar", [15, 36.625, -2.875]], ["vera", [15, 37.125, -1.875]],
  ["valencia", [14, 39.375, -0.125]], ["murcia", [14, 37.875, -0.625]], ["cadiz", [15, 36.625, -6.375]], ["huelva", [15, 37.125, -6.875]],
]);
const expectedRents = new Map([["Alicante / Alacant", "13,9"], ["Torrevieja", "12,7"], ["Benidorm", "17,7"], ["Málaga", "16,5"], ["Fuengirola", "17,2"], ["Almería", "9,4"], ["Valencia", "16,3"], ["Murcia", "9,9"], ["Cádiz", "12,4"], ["Huelva", "10,7"]]);
const expectedComparisonRents = new Map([...expectedRents, ["Orihuela Costa", "13,2"], ["Guardamar del Segura", "11,4"], ["Dénia", "13,9"], ["Jávea / Xàbia", "15,4"], ["Calp / Calpe", "15,0"], ["Cartagena", "9,4"], ["Los Alcázares", "10,5"], ["San Pedro del Pinatar", "10,2"], ["La Manga del Mar Menor", "11,7"], ["Puerto de Mazarrón", "10,8"], ["Águilas", "8,3"], ["Roquetas de Mar", "9,2"], ["Almerimar", "9,4"], ["Vera", "9,5"]]);
const expectedCostaBlancaRents = new Map([["Alicante / Alacant", "13,9"], ["Torrevieja", "12,7"], ["Benidorm", "17,7"], ["Orihuela Costa", "13,2"], ["Guardamar del Segura", "11,4"], ["Dénia", "13,9"], ["Jávea / Xàbia", "15,4"], ["Calp / Calpe", "15,0"]]);
const expectedCostaBlancaAdditionalProfileSources = new Map([
  ["orihuela-costa", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/orihuela/orihuela-costa/"],
  ["guardamar-del-segura", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/guardamar-del-segura/"],
  ["denia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/denia/"],
  ["javea-xabia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/javea-xabia/"],
  ["calp", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/calpe/"],
]);
const expectedComparisonSources = new Map([
  ["Alicante / Alacant", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/alicante-alacant/"],
  ["Torrevieja", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/torrevieja/"],
  ["Benidorm", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/benidorm/"],
  ["Orihuela Costa", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/orihuela/orihuela-costa/"],
  ["Guardamar del Segura", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/guardamar-del-segura/"],
  ["Dénia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/denia/"],
  ["Jávea / Xàbia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/javea-xabia/"],
  ["Calp / Calpe", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/alicante/calpe/"],
  ["Málaga", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/malaga-provincia/malaga/"],
  ["Fuengirola", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/malaga-provincia/fuengirola/"],
  ["Cartagena", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/cartagena/"],
  ["Los Alcázares", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/los-alcazares/"],
  ["San Pedro del Pinatar", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/san-pedro-del-pinatar/"],
  ["La Manga del Mar Menor", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/la-manga-del-mar-menor/"],
  ["Puerto de Mazarrón", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/mazarron/puerto-de-mazarron/"],
  ["Águilas", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/aguilas/"],
  ["Almería", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/almeria-provincia/almeria/"],
  ["Roquetas de Mar", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/almeria-provincia/roquetas-de-mar/"],
  ["Almerimar", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/almeria-provincia/el-ejido/almerimar/"],
  ["Vera", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/almeria-provincia/vera/"],
  ["Valencia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/comunitat-valenciana/valencia-provincia/valencia/"],
  ["Murcia", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/murcia-region/murcia-provincia/murcia/"],
  ["Cádiz", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/cadiz-provincia/cadiz/"],
  ["Huelva", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/andalucia/huelva-provincia/huelva/"],
]);

for (const filePath of pages) {
  const html = readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*>/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*>/i)?.[1];
  const openGraphUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"\s*>/i)?.[1];

  assert.ok(title, `Missing title: ${route}`);
  assert.ok(description, `Missing meta description: ${route}`);
  assert.ok(canonical, `Missing canonical: ${route}`);
  assert.ok(openGraphUrl, `Missing Open Graph URL: ${route}`);
  assert.ok(html.includes('<html lang="fi">'), `Missing Finnish language declaration: ${route}`);
  assert.ok(html.includes('<main id="sisalto">') || html.includes('<main id="sisalto" '), `Missing main landmark: ${route}`);
  assert.ok((html.match(/<h1\b/gi) || []).length === 1, `Expected one h1: ${route}`);
  assert.ok(!titles.has(title), `Duplicate title: ${title}`);
  assert.ok(!descriptions.has(description), `Duplicate description: ${route}`);
  titles.add(title);
  descriptions.add(description);

  const expectedCanonical = new URL(route, canonicalOrigin).href;
  assert.equal(canonical, expectedCanonical, `Canonical does not match route: ${route}`);
  assert.equal(openGraphUrl, expectedCanonical, `Open Graph URL does not match canonical: ${route}`);
  assert.ok(!html.includes("espanjan-talvi.pages.dev"), `Legacy Cloudflare host remains in indexable page metadata: ${route}`);
  canonicalRoutes.add(expectedCanonical);

  const robotsMetaTags = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /\bname\s*=\s*(["'])robots\1/i.test(tag));
  assert.ok(robotsMetaTags.length <= 1, `Duplicate robots directives: ${route}`);
  for (const tag of robotsMetaTags) {
    const content = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.ok(content, `Robots directive has no content: ${route}`);
    assert.ok(!/(?:^|,)\s*(?:noindex|none)\b/i.test(content), `Indexable page must not be marked noindex: ${route}`);
  }

  const checkLocalUrl = (rawUrl) => {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(rawUrl)) return;
    const resolved = new URL(rawUrl, `https://local.test${route}`);
    if (resolved.origin !== "https://local.test") return;
    const pathname = decodeURIComponent(resolved.pathname);
    let targetPath = path.join(publicRoot, pathname.replace(/^\/+/, ""));
    if (pathname.endsWith("/")) targetPath = path.join(targetPath, "index.html");
    assert.ok(existsSync(targetPath), `Broken internal URL ${rawUrl} on ${route}`);

    if (resolved.hash && targetPath.endsWith(".html")) {
      const targetHtml = readFileSync(targetPath, "utf8");
      const id = decodeURIComponent(resolved.hash.slice(1));
      assert.ok(targetHtml.includes(`id="${id}"`), `Missing anchor #${id} for ${rawUrl} on ${route}`);
    }
  };

  for (const [, rawUrl] of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    checkLocalUrl(rawUrl);
  }

  for (const [, rawSrcset] of html.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const candidate of rawSrcset.split(",")) {
      const imageUrl = candidate.trim().split(/\s+/, 1)[0];
      assert.ok(imageUrl, `Empty srcset candidate on ${route}`);
      checkLocalUrl(imageUrl);
    }
  }

  for (const [, attributes] of html.matchAll(/<img\b([^>]*)>/gi)) {
    const alt = attributes.match(/\balt="([^"]*)"/i)?.[1];
    assert.ok(alt?.trim(), `Image needs meaningful alt text on ${route}`);
    const source = attributes.match(/\bsrc="([^"]+)"/i)?.[1];
    assert.ok(source, `Image has no src on ${route}`);
    const imagePath = path.join(publicRoot, decodeURIComponent(new URL(source, `https://local.test${route}`).pathname).replace(/^\/+/, ""));
    assert.ok(statSync(imagePath).size < 1_000_000, `Image exceeds 1 MB: ${source}`);
  }

  for (const [, id] of html.matchAll(/<(?:input|select)\b[^>]*\bid="([^"]+)"/gi)) {
    if (id === "budget-error") continue;
    assert.ok(new RegExp(`<label\\b[^>]*\\bfor="${id}"`, "i").test(html), `Form control lacks a label: ${route} #${id}`);
  }
}

assert.equal(htmlFiles.length, 35, "Expected thirty-five static HTML files, including 24 destination profiles, the directory, 8 main pages, the 404 and legacy-route fallback");
let configuredAnalyticsToken = null;
let analyticsTaggedPages = 0;
for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  const beaconScripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /^<script\b[^>]*\bsrc\s*=\s*(["'])https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\1/i.test(tag));
  if (pages.includes(filePath)) {
    assert.equal(beaconScripts.length, 1, `Indexable page must contain exactly one Cloudflare Web Analytics tag: ${route}`);
    analyticsTaggedPages += 1;
    const openingTag = beaconScripts[0].match(/^<script\b[^>]*>/i)?.[0] || "";
    assert.match(openingTag, /\btype\s*=\s*(["'])module\1/i, `Cloudflare Web Analytics tag must be a module script: ${route}`);
    const configText = openingTag.match(/\bdata-cf-beacon\s*=\s*(["'])(.*?)\1/i)?.[2];
    assert.ok(configText, `Cloudflare Web Analytics tag has no configuration: ${route}`);
    let config;
    try {
      config = JSON.parse(configText);
    } catch {
      assert.fail(`Cloudflare Web Analytics configuration is not valid JSON: ${route}`);
    }
    assert.equal(typeof config?.token, "string", `Cloudflare Web Analytics configuration has no token: ${route}`);
    assert.ok(config.token.trim() && !/(?:placeholder|example|replace|your[-_ ]?token)/i.test(config.token), `Cloudflare Web Analytics configuration must use the existing non-placeholder token: ${route}`);
    if (configuredAnalyticsToken === null) configuredAnalyticsToken = config.token;
    else assert.ok(config.token === configuredAnalyticsToken, `Cloudflare Web Analytics tags must use one consistent existing configuration: ${route}`);
  } else {
    assert.equal(beaconScripts.length, 0, `Non-indexable HTML must not contain a Cloudflare Web Analytics tag: ${route}`);
  }
  const navHtml = html.match(/<nav class="site-nav" aria-label="Päänavigaatio">([\s\S]*?)<\/nav>/)?.[1] || "";
  const navLinks = [...navHtml.matchAll(/<a href="([^"]+)"(?: aria-current="page")?>([^<]+)<\/a>/g)]
    .map(([, href, label]) => [href, label]);
  assert.deepEqual(navLinks, expectedPrimaryNavigation, `Primary navigation links differ on ${route}`);
  const currentLinks = [...navHtml.matchAll(/<a href="([^"]+)" aria-current="page">/g)].map(([, href]) => href);
  assert.deepEqual(currentLinks, activeNavigationByRoute.get(route) || [], `Unexpected active primary navigation item on ${route}`);
  assert.ok(/<a class="brand" href="\/"/.test(html), `Brand must always link to the homepage: ${route}`);
  const footerNav = html.match(/<nav aria-label="Alatunniste">([\s\S]*?)<\/nav>/)?.[1] || "";
  assert.ok(/<a href="\/toimitusperiaatteet\/"(?: aria-current="page")?>Tietoa ja toimitusperiaatteet<\/a>/.test(footerNav), `About/editorial-principles page must remain accessible from the footer: ${route}`);
}

const sitemap = readFileSync(path.join(publicRoot, "sitemap.xml"), "utf8");
const alternateSitemap = readFileSync(path.join(publicRoot, "sitemap-google.xml"), "utf8");
assert.match(sitemap, /^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>\s*<urlset\b[\s\S]*<\/urlset>\s*$/i, "Primary sitemap must be a well-formed XML urlset document");
assert.equal(alternateSitemap, sitemap, "Alternate Google sitemap must remain byte-for-byte identical to the primary sitemap");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "Sitemap must not contain duplicate URLs");
assert.equal(sitemapUrls.length, canonicalRoutes.size, "Sitemap must contain every indexable canonical page and no others");
assert.deepEqual([...sitemapUrls].sort(), [...canonicalRoutes].sort(), "Sitemap URLs must exactly match the indexable pages' canonical URLs");
const redirectsText = readFileSync(path.join(publicRoot, "_redirects"), "utf8");
const redirectRules = new Map(redirectsText.split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/))
  .filter(([source, destination, code]) => source && !source.startsWith("#") && destination && code)
  .map(([source, destination]) => [source, destination]));
assert.equal(redirectRules.get("/aluevertailu"), "/", "Legacy comparison URL without trailing slash must redirect to the homepage");
assert.equal(redirectRules.get("/aluevertailu/"), "/", "Legacy comparison URL with trailing slash must redirect to the homepage");
for (const url of sitemapUrls) {
  assert.ok(!redirectRules.has(new URL(url).pathname), `Sitemap must not list a redirecting route: ${url}`);
}
for (const filePath of htmlFiles.filter((file) => !pages.includes(file))) {
  const html = readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  const robotsMeta = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .find((tag) => /\bname\s*=\s*(["'])robots\1/i.test(tag));
  const robotsContent = robotsMeta?.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
  assert.ok(/(?:^|,)\s*(?:noindex|none)\b/i.test(robotsContent), `Non-indexable HTML must declare noindex: ${route}`);
  assert.ok(!sitemapUrls.includes(new URL(route, canonicalOrigin).href), `Non-indexable page must not be listed in sitemap: ${route}`);
}
const redirectedSitemapUrls = sitemapUrls.filter((url) => !canonicalRoutes.has(url));
assert.deepEqual(redirectedSitemapUrls, [], "Sitemap must contain only canonical URLs; redirecting routes must not be listed");
assert.ok(!sitemapUrls.some((url) => new URL(url).pathname.startsWith("/aluevertailu")), "The legacy comparison route must not remain in the sitemap");

const comparisonRedirect = readFileSync(comparisonRedirectPath, "utf8");
assert.match(comparisonRedirect, /<meta name="robots" content="noindex, follow">/i, "Legacy-route fallback must not be indexable");
assert.match(comparisonRedirect, /<link rel="canonical" href="https:\/\/espanjan-talvi\.netlify\.app\/">/i, "Legacy-route fallback must canonicalize to the homepage");
assert.match(comparisonRedirect, /<meta http-equiv="refresh" content="0; url=\/">/i, "Local static preview must provide a redirect fallback");
assert.doesNotMatch(comparisonRedirect, /id="comparison-app"|id="comparison-source"/, "Comparison experience must not be duplicated at the legacy URL");

const robots = readFileSync(path.join(publicRoot, "robots.txt"), "utf8");
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), "robots.txt sitemap URL does not match canonical origin");
assert.ok(!robots.includes("espanjan-talvi.pages.dev"), "robots.txt must not reference the former Cloudflare host");
const homepageHtml = readFileSync(path.join(publicRoot, "index.html"), "utf8");
const verificationMentions = homepageHtml.match(/google-site-verification/gi) || [];
const verificationMetaTags = [...homepageHtml.matchAll(/<meta\b[^>]*>/gi)]
  .filter(([tag]) => /\bname\s*=\s*["']google-site-verification["']/i.test(tag));
assert.equal(verificationMentions.length, verificationMetaTags.length, "Google verification token must appear in a well-formed meta tag");
assert.ok(verificationMetaTags.length >= 1, "Homepage must retain its Google Search Console verification meta tag");
const verificationTokens = [];
for (const [tag] of verificationMetaTags) {
  const nameAttributes = [...tag.matchAll(/\bname\s*=\s*(["'])(.*?)\1/gi)];
  const contentAttributes = [...tag.matchAll(/\bcontent\s*=\s*(["'])(.*?)\1/gi)];
  assert.equal(nameAttributes.length, 1, "Google verification meta tag must have exactly one quoted name attribute");
  assert.equal(nameAttributes[0][2].toLowerCase(), "google-site-verification", "Unexpected Google verification meta name");
  assert.equal(contentAttributes.length, 1, "Google verification meta tag must have exactly one quoted content attribute");
  const verificationToken = contentAttributes[0][2];
  assert.match(verificationToken, /^[A-Za-z0-9_-]{20,100}$/, "Google verification token must have a valid token format");
  assert.ok(!/(?:^|[_-])(?:example|placeholder|your|replace|insert|todo|changeme|fake|dummy|sample|test|demo|token|x{3,})(?:$|[_-])/i.test(verificationToken), "Google verification token must not be a placeholder");
  verificationTokens.push(verificationToken);
}
assert.equal(new Set(verificationTokens).size, verificationTokens.length, "Homepage must not repeat the same Google verification token");

const comparison = readFileSync(path.join(publicRoot, "index.html"), "utf8");
assert.ok(comparison.includes('id="comparison-app"') && comparison.includes('id="comparison-source"'), "Comparison app must retain the searchable source content as a no-JavaScript fallback");
assert.ok(comparison.includes('src="/assets/area-comparison.mjs"'), "Comparison page must load its local interaction module");
for (const control of ["comparison-region", "comparison-destination"]) {
  assert.ok(new RegExp(`<label\\b[^>]*for="${control}"`, "i").test(comparison), `Comparison select must have a label: ${control}`);
}
assert.equal((comparison.match(/class="comparison-view"/g) || []).length, 2, "Comparison app must provide comparison and practical view controls");
assert.ok(comparison.includes('id="ilmastodata"') && comparison.includes('id="vuokrausdata"'), "Climate and rent source sections must remain linkable");
assert.ok(!/10\s+Espanjan talvikohdetta/i.test(comparison), "Comparison title must not retain the outdated ten-destination claim");
assert.ok(!/Kymmenen kaupunkia|Kymmenen erilaista paikkaa/i.test(comparison), "Comparison introduction must not retain the outdated ten-destination claim");

const servicesPage = readFileSync(path.join(publicRoot, "palvelut-ja-linkit", "index.html"), "utf8");
for (const id of ["viranomaiset", "terveydenhuolto", "joukkoliikenne", "suomalaisyhteisot", "kaupunkipalvelut"]) {
  assert.ok(servicesPage.includes(`id="${id}"`), `Services directory is missing its section: ${id}`);
}
assert.ok(!/<meta\s+name="robots"\s+content="noindex/i.test(servicesPage), "The services directory must remain indexable");
assert.ok(servicesPage.includes(`<link rel="canonical" href="${canonicalOrigin}/palvelut-ja-linkit/">`), "Services directory must self-canonicalize");
assert.ok(servicesPage.includes("https://sede.carm.es/web/pagina?IDCONTENIDO=3749&amp;IDTIPO=240&amp;RASTRO=c%24m40293"), "Services directory must include the verified regional Murcia transport source");
const guidePage = readFileSync(path.join(publicRoot, "talvehtiminen-espanjassa", "index.html"), "utf8");
assert.ok(guidePage.includes('href="/palvelut-ja-linkit/"'), "The wintering guide must link to the services directory");
assert.ok(guidePage.includes('href="/kohteet/"'), "The wintering guide must make the destination directory discoverable without changing the primary navigation");
assert.ok(!guidePage.includes("https://www.renfe.com/es/en"), "The wintering guide should not duplicate the directory's long transport link list");
for (const destination of expectedDestinations) {
  assert.ok(comparison.includes(`id="${destination}"`), `Missing destination profile: ${destination}`);
}
const destinationCards = [...comparison.matchAll(/<article class="destination-card" id="([^"]+)">([\s\S]*?)<\/article>/g)];
assert.equal(destinationCards.length, expectedDestinations.length, "Each destination needs exactly one profile");
const expectedComparisonRegions = [
  ["costa-blanca", "Costa Blanca", "costa-blanca-heading", 8],
  ["costa-del-sol", "Costa del Sol", "costa-del-sol-heading", 2],
  ["costa-calida", "Costa Cálida", "costa-calida-heading", 6],
  ["costa-de-almeria", "Costa de Almería", "costa-almeria-heading", 4],
  ["other-spain", "Muut kohteet Espanjassa", "other-destinations-heading", 4],
];
assert.deepEqual(
  DESTINATION_REGIONS.map(({ id, name, headingId }) => [id, name, headingId, expectedComparisonRegions.find(([expectedId]) => expectedId === id)?.[3]]),
  expectedComparisonRegions,
  "The shared region model must retain the five canonical region IDs and expected destination counts",
);
const comparisonRegionSections = [...comparison.matchAll(/<section class="destination-region" aria-labelledby="([^"]+)">([\s\S]*?)<\/section>/g)];
assert.equal(comparisonRegionSections.length, DESTINATION_REGIONS.length, "The comparison tool must expose all five modeled regions");
const comparisonFilterDestinations = [];
const comparisonProfileIdsByRegion = new Map();
for (const [, headingId, sectionHtml] of comparisonRegionSections) {
  const region = DESTINATION_REGIONS.find(({ headingId: expectedHeadingId }) => expectedHeadingId === headingId);
  assert.ok(region, `Comparison section heading is missing from the shared region model: ${headingId}`);
  const headingName = sectionHtml.match(new RegExp(`<h2\\s+id="${headingId}"[^>]*>([^<]+)<\\/h2>`))?.[1];
  assert.equal(headingName, region.name, `Comparison section heading differs from the shared region model: ${headingId}`);
  assert.equal(comparisonRegionId(headingId), region.id, `Comparison selector must use the canonical region ID for ${region.name}`);
  const profileIds = [...sectionHtml.matchAll(/<article class="destination-card" id="([^"]+)">/g)].map(([, id]) => id);
  comparisonProfileIdsByRegion.set(region.id, profileIds);
  for (const id of profileIds) {
    const recordRegionId = DESTINATION_RECORDS_BY_ID.get(id)?.region.id;
    const regionId = recordRegionId || comparisonRegionId(headingId);
    assert.equal(regionId, region.id, `Comparison destination has a mismatched canonical region: ${id}`);
    comparisonFilterDestinations.push({ id, regionId });
  }
}
assert.equal(filterDestinations(comparisonFilterDestinations, "all").length, 24, "The all-regions comparison selector must expose all 24 destinations");
for (const [regionId, , , expectedCount] of expectedComparisonRegions) {
  const filtered = filterDestinations(comparisonFilterDestinations, regionId);
  assert.equal(filtered.length, expectedCount, `Comparison selector returned the wrong number of destinations for ${regionId}`);
  assert.deepEqual(filtered.map(({ id }) => id), comparisonProfileIdsByRegion.get(regionId), `Comparison selector membership differs from the homepage region for ${regionId}`);
}
const destinationNavGroups = [...comparison.matchAll(/<nav class="city-index" aria-label="([^"]+)">([\s\S]*?)<\/nav>/g)];
assert.equal(destinationNavGroups.length, expectedDestinationNavigationGroups.size, "Destination index must have one navigation group per region category");
const navigationProfileTargets = [];
for (const [label, expectedLinks] of expectedDestinationNavigationGroups) {
  const group = destinationNavGroups.find(([, groupLabel]) => groupLabel === label)?.[2] || "";
  assert.ok(group, `Missing destination navigation group: ${label}`);
  const targets = [...group.matchAll(/<a href="#([^"]+)">/g)].map(([, target]) => target);
  const profileTargets = targets.filter((target) => expectedDestinations.includes(target));
  assert.deepEqual(profileTargets, expectedLinks.filter((target) => expectedDestinations.includes(target)), `Wrong destination links or order in navigation group: ${label}`);
  const nonProfileTargets = targets.filter((target) => !expectedDestinations.includes(target));
  assert.deepEqual(nonProfileTargets, expectedLinks.filter((target) => !expectedDestinations.includes(target)), `Unexpected non-profile link in navigation group: ${label}`);
  navigationProfileTargets.push(...profileTargets);
}
assert.deepEqual(navigationProfileTargets, expectedDestinations, "All 24 destination profiles must be linked exactly once in category navigation order");
for (const [destination, source] of expectedCostaBlancaAdditionalProfileSources) {
  const card = destinationCards.find(([, id]) => id === destination)?.[2] || "";
  assert.ok(card.includes(source), `Costa Blanca profile has the wrong or missing Idealista report: ${destination}`);
}
const costaBlancaRegion = comparison.match(/<section class="destination-region" aria-labelledby="costa-blanca-heading">([\s\S]*?)<\/section>/)?.[1] || "";
const costaBlancaProfileIds = [...costaBlancaRegion.matchAll(/<article class="destination-card" id="([^"]+)">/g)].map(([, id]) => id);
assert.deepEqual(costaBlancaProfileIds, expectedCostaBlancaProfiles, "Costa Blanca must contain exactly the eight approved destination profiles in order");
const destinationImages = new Set();
const imageSourceRegistry = readFileSync(path.join(projectRoot, "IMAGE-SOURCES.md"), "utf8");
const foldText = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fi");
assert.equal(DESTINATION_SCHEMA_VERSION, 2, "Destination data schema version must be explicit");
assert.deepEqual(DESTINATION_CATEGORY_IDS, expectedDestinationCategoryIds, "Destination data must define every planned assessment category exactly once");
assert.deepEqual(Object.keys(DESTINATION_CATEGORY_LABELS), expectedDestinationCategoryIds, "Every category must have one reader-facing Finnish label");
assert.equal(DESTINATION_ASSESSMENT_METHOD.scale.length, 5, "Editorial assessment scale must explain all five levels");
assert.deepEqual(DESTINATION_ASSESSMENT_METHOD.scale.map(({ score }) => score), [1, 2, 3, 4, 5], "Assessment scale must be ordered from one to five");
assert.ok(DESTINATION_ASSESSMENT_METHOD.explanation && DESTINATION_ASSESSMENT_METHOD.limitation, "Assessment method must disclose its interpretation and limitations");
assert.ok(DESTINATION_ASSESSMENT_METHOD.sharedScope, "Shared assessment scope must be defined once in the destination model");
assert.deepEqual(Object.keys(DESTINATION_ASSESSMENT_METHOD.categoryMethods), DESTINATION_SCORE_CATEGORY_IDS, "Assessment method must define the seven published star categories in order");
assert.match(DESTINATION_ASSESSMENT_METHOD.explanation, /mainintojen määrää ei muuteta pisteiksi|lähteiden tai mainintojen määrää ei muuteta pisteiksi/i, "Assessment method must rule out source-count scoring");
assert.deepEqual(DESTINATION_RECORDS.map(({ id }) => id), expectedPilotIds, "The shared dataset should contain only the three approved pilot destinations");
assert.equal(DESTINATION_RECORDS_BY_ID.size, DESTINATION_RECORDS.length, "Pilot IDs must be unique");
assert.equal(new Set(DESTINATION_RECORDS.map(({ slug }) => slug)).size, DESTINATION_RECORDS.length, "Pilot slugs must be unique");
assert.deepEqual(DESTINATION_SCORE_CATEGORY_IDS, ["beaches-and-outdoors", "culture-and-sights", "events", "restaurants-and-shopping", "nightlife", "walkability", "public-transport"]);
assert.deepEqual(DESTINATION_SCORE_RECORDS.map(({ id }) => id), expectedDestinations, "Score model must contain the 24 current IDs in source order");
assert.equal(DESTINATION_SCORE_RECORDS_BY_ID.size, 24, "Score records must have unique destination IDs");
const expectedScoreMatrix = [
  [4, 4.5, 4.5, 4.5, 4, 4, 4.5], [4, 3, 4, 3.5, 3, 3, 3], [4, 4, 4, 4, 5, 3.5, 3], [4.5, 2.5, null, 3, 2, 2, 2.5],
  [4.5, 3, 3, 3, 2, 3.5, 2.5], [4.5, 4, 3.5, 4.5, 3, 3.5, 3], [4.5, 4, 3, 4, 3, 2.5, 2.5], [4.5, 3.5, 3.5, 4, 3, 3, 3],
  [4, 5, 4.5, 5, 4.5, 4.5, 5], [4, 4, 4, 4, 3, 4, 4], [3.5, 4.5, 3.5, 4, 3, 4, 4], [4, 2.5, 3, 3, 2, 4, 2.5],
  [4.5, 3.5, 3, 3, 2, 3, 2.5], [5, 2, null, 3, 2, 2, 2.5], [4, 3, null, 3.5, 2.5, 3.5, 2.5], [4.5, 4, 3.5, 3.5, 3, 3.5, 3],
  [4, 4.5, 4, 4, 4, 4, 4], [4, 3.5, 3.5, 3.5, 3, 3, 3], [3.5, 2, null, 3, 2, 2.5, 2], [4, 3.5, 3, 3, 2.5, 2.5, 2],
  [4.5, 5, 5, 5, 4.5, 4.5, 5], [3, 4.5, 4, 4.5, 4, 4.5, 4.5], [4.5, 5, 5, 4.5, 4, 5, 3.5], [3.5, 3.5, 3.5, 4, 3, 4, 3.5],
];
const expectedScoreRegions = [
  ...Array(8).fill("costa-blanca"), ...Array(2).fill("costa-del-sol"), ...Array(6).fill("costa-calida"),
  ...Array(4).fill("costa-de-almeria"), ...Array(4).fill("other-spain"),
];
for (let destinationIndex = 0; destinationIndex < DESTINATION_SCORE_RECORDS.length; destinationIndex += 1) {
  const scoreRecord = DESTINATION_SCORE_RECORDS[destinationIndex];
  assert.equal(scoreRecord.regionId, expectedScoreRegions[destinationIndex], `Score region changed for ${scoreRecord.id}`);
  assert.deepEqual(scoreRecord.assessments.map(({ categoryId }) => categoryId), DESTINATION_SCORE_CATEGORY_IDS, `Seven categories must remain ordered for ${scoreRecord.id}`);
  assert.deepEqual(scoreRecord.assessments.map(({ score }) => score), expectedScoreMatrix[destinationIndex], `Score differs from the approved comparison matrix for ${scoreRecord.id}`);
  for (const assessment of scoreRecord.assessments) {
    assert.ok(assessment.score === null || (Number.isFinite(assessment.score) && assessment.score >= 1 && assessment.score <= 5 && assessment.score * 2 % 1 === 0), `Score must be null or a half-step from 1 to 5: ${scoreRecord.id}/${assessment.categoryId}`);
    assert.equal(assessment.status, assessment.score === null ? "not-assessed" : "assessed", `Score status must match value for ${scoreRecord.id}/${assessment.categoryId}`);
    if (assessment.score === null) assert.equal(assessment.categoryId, "events", `Only events may be unassessed: ${scoreRecord.id}`);
  }
  if (scoreRecord.profilePublication.status === "ready") {
    assert.ok(scoreRecord.assessments.every((assessment) => assessment.score === null
      ? assessment.categoryId === "events" && assessment.publicDescription === null && assessment.scope === null && assessment.checkedOn === null
      : assessment.publicDescription && assessment.sources.length && assessment.scope && /^\d{4}-\d{2}-\d{2}$/.test(assessment.checkedOn)), `Published score copy needs unique text, sources, scope and date except an explicitly unassessed event: ${scoreRecord.id}`);
    for (const assessment of scoreRecord.assessments) for (const source of assessment.sources) assert.match(source, /^https:\/\//, `Rating source must be HTTPS: ${scoreRecord.id}/${assessment.categoryId}`);
  } else {
    assert.ok(scoreRecord.profilePublication.blockers.length > 0, `Unpublished profile needs recorded readiness gaps: ${scoreRecord.id}`);
    assert.ok(scoreRecord.assessments.every(({ publicDescription }) => publicDescription === null), `Unverified prose must not be exposed for ${scoreRecord.id}`);
  }
}
assert.deepEqual(DESTINATION_SCORE_RECORDS.filter(({ profilePublication }) => profilePublication.status === "ready").map(({ id }) => id).sort(), [...expectedPublishedProfileIds].sort(), "Only profiles that passed their content and source gate may be generated");
assert.deepEqual(DESTINATION_PROFILE_CONTENT_RECORDS.map(({ id }) => id), expectedNewProfileIds, "Editorial content must cover exactly the approved sourced profiles in source order");
assert.equal(DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.size, expectedNewProfileIds.length, "New profile editorial IDs must be unique");
assert.equal(DESTINATION_PROFILE_CONTENT_SCHEMA_VERSION, 1, "New editorial profile content must have an explicit schema version");
for (const profile of DESTINATION_PROFILE_CONTENT_RECORDS) {
  assert.ok(profile.profilePage?.title && profile.profilePage.description && profile.profilePage.introduction, `New profile needs distinct page copy: ${profile.id}`);
  assert.ok(profile.fitGuidance?.maySuit && profile.fitGuidance.weigh, `New profile needs balanced reader guidance: ${profile.id}`);
  assert.ok(profile.seasonalHighlights.length >= 3, `New profile must include at least three source-backed place-specific highlights: ${profile.id}`);
  assert.ok(profile.claims.length >= 2, `New profile must document practical local facts: ${profile.id}`);
  for (const highlight of profile.seasonalHighlights) {
    assert.ok(["beaches-and-outdoors", "culture-and-sights", "events", "restaurants-and-shopping"].includes(highlight.categoryId), `Unknown highlight category: ${profile.id}/${highlight.title}`);
    assert.ok(highlight.title && highlight.text && highlight.period && /^\d{4}-\d{2}-\d{2}$/.test(highlight.checkedOn), `Highlight needs copy, time scope and review date: ${profile.id}`);
    assert.match(highlight.source, /^https:\/\//, `Highlight source must be HTTPS: ${profile.id}`);
    for (const source of highlight.additionalSources ?? []) {
      assert.ok(source.label && source.url, `Additional highlight source needs a label and URL: ${profile.id}/${highlight.title}`);
      assert.match(source.url, /^https:\/\//, `Additional highlight source must be HTTPS: ${profile.id}/${highlight.title}`);
    }
  }
  for (const claim of profile.claims) {
    assert.ok(claim.id && claim.categoryId && claim.statement && claim.geographicScope && /^\d{4}-\d{2}-\d{2}$/.test(claim.checkedOn), `Practical claim needs scope and review date: ${profile.id}`);
    assert.ok(claim.sources?.length, `Practical claim needs a verifiable source: ${profile.id}/${claim.id}`);
    for (const source of claim.sources) assert.match(source, /^https:\/\//, `Claim source must be HTTPS: ${profile.id}/${claim.id}`);
  }
}
assert.equal(DESTINATION_SCORE_RECORDS_BY_ID.get("orihuela-costa").assessments.find(({ categoryId }) => categoryId === "events").score, null, "Orihuela Costa events must remain unassessed");
const integerSample = renderRatingCard({ categoryId: "nightlife", score: 4, publicDescription: "Testikuvaus.", scope: "Testirajaus.", sources: ["https://example.com/source"], checkedOn: "2026-11-01" }, "Yöelämä");
assert.equal((integerSample.match(/destination-rating-star--/g) || []).length, 5, "Integer rating sample must render five star slots");
const halfSample = renderRatingCard({ categoryId: "walkability", score: 3.5, publicDescription: "Testikuvaus.", scope: "Testirajaus.", sources: ["https://example.com/source"], checkedOn: "2026-11-01" }, "Käveltävyys");
assert.equal((halfSample.match(/destination-rating-star--/g) || []).length, 5, "Half-star sample must render five star slots");
assert.equal((halfSample.match(/destination-rating-star--half/g) || []).length, 1, "Half-star sample must show exactly one half star");
assert.match(halfSample, /3,5 tähteä viidestä[\s\S]*3,5\/5/, "Half-star score must be localized and screen-reader readable");
const nullSample = renderRatingCard({ categoryId: "events", score: null }, "Tapahtumat");
assert.ok(nullSample.includes("Tämän kohteen tapahtumatarjontaa ei ole arvioitu erikseen."), "Null event rating must use the approved short reader-facing copy");
assert.doesNotMatch(nullSample, /destination-rating-star|0\/5|Miksi ei arvioitu|perustelu/i, "Null rating must not render stars, zero or internal explanation");
const sharedScopeSample = renderRatingCard({ categoryId: "walkability", score: 4, publicDescription: "Testikuvaus.", scope: DESTINATION_ASSESSMENT_METHOD.sharedScope, sources: ["https://example.com/source"], checkedOn: "2026-11-01" }, "Käveltävyys");
assert.ok(!sharedScopeSample.includes(DESTINATION_ASSESSMENT_METHOD.sharedScope), "Shared scope must be omitted from the individual category card");
assert.ok(sharedScopeSample.includes("https://example.com/source") && sharedScopeSample.includes("Tarkistettu "), "Deduplicating shared scope must preserve category sources and review dates");
const allowedCoverageStatuses = new Set(["proxy-data", "not-assessed", "qualitative-only", "sources-not-comparable", "rental-index-only"]);
for (const record of DESTINATION_RECORDS) {
  assert.equal(record.schemaVersion, DESTINATION_SCHEMA_VERSION, `Wrong schema version for ${record.id}`);
  assert.ok(expectedDestinations.includes(record.id), `Unknown pilot ID: ${record.id}`);
  assert.equal(record.slug, record.id, `Pilot slug should remain stable and match its current profile ID: ${record.id}`);
  assert.ok(record.name && record.region?.id && record.region?.name && record.placeType && record.summary && record.comparisonFallbackSummary && record.practicalSummary && record.comparisonFallbackPracticalSummary, `Pilot identity and editorial fields must be populated: ${record.id}`);
  assert.ok(record.profilePage?.title && record.profilePage.description && record.profilePage.introduction, `Pilot profile page needs a unique title, description and useful introduction: ${record.id}`);
  assert.deepEqual(Object.keys(record.coverage), expectedDestinationCategoryIds, `Coverage must explicitly represent all categories for ${record.id}`);
  assert.ok(Object.values(record.coverage).every((state) => allowedCoverageStatuses.has(state)), `Unknown coverage state for ${record.id}`);
  assert.ok(record.seasonalHighlights.length >= 3, `Each pilot must have at least three distinct sourced seasonal highlights: ${record.id}`);
  assert.ok(record.fitGuidance?.maySuit && record.fitGuidance?.weigh, `Profile needs balanced fit guidance: ${record.id}`);
  for (const highlight of record.seasonalHighlights) {
    assert.ok(highlight.categoryId && ["culture-and-sights", "events", "beaches-and-outdoors"].includes(highlight.categoryId), `Seasonal highlight needs a supported profile category: ${record.id}`);
    assert.ok(highlight.title && highlight.text && highlight.period && /^\d{4}-\d{2}-\d{2}$/.test(highlight.checkedOn), `Seasonal highlight needs a title, text, period and date: ${record.id}`);
    assert.match(highlight.source, /^https:\/\//, `Seasonal highlight needs an HTTPS primary source: ${record.id}`);
    for (const source of highlight.additionalSources ?? []) {
      assert.ok(source.label && source.url, `Additional seasonal source needs a label and URL: ${record.id}/${highlight.title}`);
      assert.match(source.url, /^https:\/\//, `Additional seasonal source needs an HTTPS URL: ${record.id}/${highlight.title}`);
    }
  }
  assert.ok(record.claims.length > 0, `Pilot needs documented category claims: ${record.id}`);
  for (const claim of record.claims) {
    assert.ok(expectedDestinationCategoryIds.includes(claim.categoryId), `Claim uses an unknown category: ${record.id}/${claim.id}`);
    assert.ok(claim.statement && claim.geographicScope && /^\d{4}-\d{2}-\d{2}$/.test(claim.checkedOn), `Claim needs text, geographic scope and review date: ${record.id}/${claim.id}`);
    if (claim.kind === "source-linked-description") assert.ok(claim.sources?.length > 0, `Sourced claim has no sources: ${record.id}/${claim.id}`);
    if (Object.hasOwn(claim, "sources")) assert.ok(Array.isArray(claim.sources) && claim.sources.length > 0, `Optional claim sources must be omitted rather than left empty: ${record.id}/${claim.id}`);
    for (const source of claim.sources || []) assert.match(source, /^https:\/\//, `Claim source must be an HTTPS URL: ${record.id}/${claim.id}`);
  }
  assert.ok(Number.isFinite(record.rentalIndex.value) && record.rentalIndex.period === "2026-09" && record.rentalIndex.unit === "€/m²/kk" && record.rentalIndex.sourceUrl.startsWith("https://www.idealista.com/"), `Rental index needs value, date, unit and source: ${record.id}`);
  assert.ok(record.rentalIndex.metric.includes("pyyntihintaindeksi") && record.rentalIndex.geographicCoverage, `Rental metric scope must be explicit: ${record.id}`);
  assert.ok(record.climate.station.id && record.climate.station.name && record.climate.station.period && record.climate.station.sourceUrl.startsWith("https://www.aemet.es/"), `Climate station metadata needs a period and source: ${record.id}`);
  assert.ok(["city", "airport", "regional"].includes(record.climate.station.role) && record.climate.station.geographicCoverage, `Climate station role and coverage must be explicit: ${record.id}`);
  assert.ok(Object.values(record.climate.january).every(Number.isFinite), `Climate observations must be numeric and source-backed: ${record.id}`);
  assert.ok(Number.isFinite(record.seaSurface.valueC) && record.seaSurface.period === "1991–2020" && record.seaSurface.sourceUrl.startsWith("https://comet.nefsc.noaa.gov/"), `Sea-surface record needs a period and source: ${record.id}`);
  assert.ok(Number.isFinite(record.seaSurface.gridCenter.latitude) && Number.isFinite(record.seaSurface.gridCenter.longitude), `Sea grid coordinates must be explicit: ${record.id}`);
  assert.ok(record.image.src && record.image.srcset && record.image.alt && record.image.width > 0 && record.image.height > 0, `Image metadata is incomplete: ${record.id}`);
  assert.ok(record.image.credit.author && record.image.credit.display && record.image.credit.sourceUrl && record.image.credit.license, `Image attribution and license notes are required: ${record.id}`);
  if (record.image.credit.licenseUrl) assert.match(record.image.credit.licenseUrl, /^https:\/\//, `Image license URL must be HTTPS: ${record.id}`);

  const profilePath = path.join(publicRoot, "kohteet", record.slug, "index.html");
  const profileHtml = readFileSync(profilePath, "utf8");
  const ratingSection = profileHtml.match(/<section class="destination-profile-section destination-assessment"[\s\S]*?<\/section>/)?.[0] || "";
  const methodDetails = ratingSection.match(/<details class="destination-method">[\s\S]*?<\/details>/)?.[0] || "";
  const ratingCards = [...ratingSection.matchAll(/<article class="destination-rating-card(?: [^"]*)?">[\s\S]*?<\/article>/g)].map(([html]) => html);
  const scoreRecord = DESTINATION_SCORE_RECORDS_BY_ID.get(record.id);
  const expectedRatingLabels = DESTINATION_SCORE_CATEGORY_IDS.map((id) => DESTINATION_CATEGORY_LABELS[id]);
  assert.ok(ratingSection, `Profile must show category comparison immediately after its hero: ${record.id}`);
  assert.equal(ratingSection.split(DESTINATION_ASSESSMENT_METHOD.sharedScope).length - 1, 1, `Shared assessment scope must appear exactly once per profile: ${record.id}`);
  assert.ok(methodDetails.includes(DESTINATION_ASSESSMENT_METHOD.sharedScope), `Shared assessment scope belongs in the common method disclosure: ${record.id}`);
  const ratingPositions = expectedRatingLabels.map((label) => ratingSection.indexOf(`<h3>${label}</h3>`));
  assert.ok(ratingPositions.every((position) => position >= 0), `Profile is missing one of the seven rating categories: ${record.id}`);
  assert.deepEqual(ratingPositions, [...ratingPositions].sort((a, b) => a - b), `Rating categories must follow the shared order: ${record.id}`);
  assert.equal((ratingSection.match(/class="destination-rating-card(?:\s|\")/g) || []).length, 7, `Profile must show exactly seven lightweight category cards: ${record.id}`);
  assert.ok(ratingSection.includes("Lähteet ja tarkistuspäivä"), `Rating sources and checked date must be disclosed: ${record.id}`);
  for (const assessment of scoreRecord.assessments) {
    const ratingCard = ratingCards.find((html) => html.includes(`<h3>${DESTINATION_CATEGORY_LABELS[assessment.categoryId]}</h3>`)) || "";
    assert.ok(ratingCard, `Each score category must have one corresponding card: ${record.id}/${assessment.categoryId}`);
    if (assessment.score === null) {
      assert.equal(assessment.categoryId, "events", `Only event ratings may be unassessed: ${record.id}`);
      assert.ok(ratingSection.includes("Tämän kohteen tapahtumatarjontaa ei ole arvioitu erikseen."), `Unassessed event must have its neutral status text: ${record.id}`);
      assert.equal(ratingSection.includes("0/5"), false, `Unassessed event must not render as zero: ${record.id}`);
    } else {
      assert.ok(ratingSection.includes(assessment.publicDescription), `Published profile is missing the approved traveler-facing copy: ${record.id}/${assessment.categoryId}`);
      assert.ok(ratingCard.includes("Tarkistettu "), `Category card must retain its checked date: ${record.id}/${assessment.categoryId}`);
      for (const source of assessment.sources) assert.ok(ratingCard.includes(`href="${source}"`), `Category card must retain its own source link: ${record.id}/${assessment.categoryId}`);
      if (assessment.scope === DESTINATION_ASSESSMENT_METHOD.sharedScope) {
        assert.ok(!ratingCard.includes(DESTINATION_ASSESSMENT_METHOD.sharedScope), `Shared scope must not repeat inside each category card: ${record.id}/${assessment.categoryId}`);
      } else {
        assert.ok(ratingCard.includes(assessment.scope), `Category-specific scope must remain with its category source: ${record.id}/${assessment.categoryId}`);
      }
    }
  }
  assert.doesNotMatch(ratingSection, /rationale|Sisäinen peruste|Mitä ei arvioitu|Miksi ei arvioitu/i, `Internal scoring rationale must not be rendered: ${record.id}`);
  assert.equal((ratingSection.match(/destination-rating-star--half/g) || []).length, scoreRecord.assessments.filter(({ score }) => score % 1 === 0.5).length, `Half-stars must match the data model: ${record.id}`);
  assert.ok(!profileHtml.includes("Mitä kannattaa verrata?") && !profileHtml.includes("Mitä lähteistä dokumentoitu tarjonta kertoo?"), `Profile must not retain the generic V2 section headings: ${record.id}`);
  assert.ok(!profileHtml.includes("Lähteissä nimetyt muodot") && !profileHtml.includes("evidenceTypes"), `Profile must not describe source-count ratings: ${record.id}`);
  const profileOrder = ["destination-profile-hero", "destination-assessment", "destination-winter-highlights", "-daily-title", "-fit-title", "destination-profile-context", "-sources-title"]
    .map((token) => profileHtml.indexOf(token));
  assert.ok(profileOrder.every((index) => index >= 0), `Profile must include each planned section: ${record.id}`);
  assert.deepEqual(profileOrder, [...profileOrder].sort((a, b) => a - b), `Profile sections must follow the requested reading order: ${record.id}`);
  assert.ok(profileHtml.includes("Kulttuuri ja nähtävyydet") && profileHtml.includes("Tapahtumat") && profileHtml.includes("Rannat ja ulkoilu"), `Profile highlights must be grouped by useful content category: ${record.id}`);

  const card = destinationCards.find(([, id]) => id === record.id)?.[2] || "";
  assert.ok(card, `Pilot must retain its static profile card: ${record.id}`);
  const htmlName = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1]?.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").trim();
  const htmlRegionAndType = card.match(/<span class="card-index">([^<]+)<\/span>/)?.[1] || "";
  const htmlDescription = card.match(/<p class="destination-fit">([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const htmlPractical = card.match(/<div class="destination-columns">[\s\S]*?<h4>Arki ja liikkuminen<\/h4>\s*<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const imageTag = card.match(/<figure class="destination-photo">[\s\S]*?<img\b([^>]*)>/)?.[1] || "";
  const imageAttribute = (name) => imageTag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] || "";
  const expectedRegion = [...expectedDestinationNavigationGroups].find(([, ids]) => ids.includes(record.id))?.[0];
  assert.equal(htmlName, record.name, `Pilot name differs from its static profile: ${record.id}`);
  assert.equal(record.region.name, expectedRegion, `Pilot region differs from the current profile grouping: ${record.id}`);
  assert.equal(foldText(htmlRegionAndType.split("·")[0].trim()), foldText(record.region.name), `Pilot region label differs from its static profile: ${record.id}`);
  assert.equal(foldText(htmlRegionAndType.split("·").slice(1).join("·").trim()), foldText(record.placeType), `Pilot place type differs from its static profile: ${record.id}`);
  assert.equal(htmlDescription, record.comparisonFallbackSummary, `Static fallback description differs from its dedicated data field: ${record.id}`);
  assert.equal(htmlPractical, record.comparisonFallbackPracticalSummary, `Static fallback practical description differs from its dedicated data field: ${record.id}`);
  assert.equal(imageAttribute("src"), record.image.src, `Pilot image source differs from its static profile: ${record.id}`);
  assert.equal(imageAttribute("srcset"), record.image.srcset, `Pilot image srcset differs from its static profile: ${record.id}`);
  assert.equal(imageAttribute("sizes"), record.image.sizes, `Pilot image sizes differs from its static profile: ${record.id}`);
  assert.equal(imageAttribute("alt"), record.image.alt, `Pilot image alt differs from its static profile: ${record.id}`);
  assert.equal(Number(imageAttribute("width")), record.image.width, `Pilot image width differs from its static profile: ${record.id}`);
  assert.equal(Number(imageAttribute("height")), record.image.height, `Pilot image height differs from its static profile: ${record.id}`);
  const pilotFigure = card.match(/<figure class="destination-photo">([\s\S]*?)<\/figure>/)?.[1] || "";
  assert.ok(pilotFigure.includes(`href="${record.image.credit.sourceUrl}"`) && pilotFigure.includes(record.image.credit.display), `Pilot image credit differs from its static profile: ${record.id}`);
  assert.ok(imageSourceRegistry.includes(`public/assets/${path.basename(record.image.src)}`) && imageSourceRegistry.includes(record.image.credit.sourceUrl), `Pilot image source is missing from IMAGE-SOURCES.md: ${record.id}`);

  const merged = applyDestinationRecord({ id: record.id, name: "legacy", regionId: "legacy", regionName: "legacy", description: "legacy", practical: "legacy" }, record);
  assert.deepEqual(
    [merged.name, merged.regionId, merged.regionName, merged.description, merged.practical, merged.image, merged.srcset, merged.sizes, merged.alt, merged.imageWidth, merged.imageHeight],
    [record.name, record.region.id, record.region.name, record.summary, record.practicalSummary, record.image.src, record.image.srcset, record.image.sizes, record.image.alt, record.image.width, record.image.height],
    `Comparison adapter must resolve the pilot presentation from the shared data record: ${record.id}`,
  );
  assert.deepEqual([merged.rent.value, merged.rent.label, merged.rent.url], [record.rentalIndex.value, record.rentalIndex.value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 }), record.rentalIndex.sourceUrl], `Comparison adapter must use the shared rent record: ${record.id}`);
  assert.deepEqual([merged.climate.stationId, merged.climate.role, merged.climate.period, merged.climate.high, merged.climate.low, merged.climate.sourceUrl], [record.climate.station.id, record.climate.station.role, record.climate.station.period, record.climate.january.dayHighMeanC, record.climate.january.nightLowMeanC, record.climate.station.sourceUrl], `Comparison adapter must use the shared climate record: ${record.id}`);
  assert.deepEqual([merged.sea.value, merged.sea.place, merged.sea.latitude, merged.sea.longitude], [record.seaSurface.valueC, record.seaSurface.place, record.seaSurface.gridCenter.latitude, record.seaSurface.gridCenter.longitude], `Comparison adapter must use the shared sea-surface record: ${record.id}`);
}
for (const [, destination, card] of destinationCards) {
  assert.ok(expectedDestinations.includes(destination), `Unexpected destination profile: ${destination}`);
  const figure = card.match(/<figure class="destination-photo">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(figure, `Destination needs its own photo: ${destination}`);
  const img = figure.match(/<img\b([^>]*)>/i)?.[1] || "";
  const src = img.match(/\bsrc="([^"]+)"/i)?.[1];
  const alt = img.match(/\balt="([^"]+)"/i)?.[1]?.trim();
  assert.ok(src, `Destination photo has no src: ${destination}`);
  assert.ok(!destinationImages.has(src), `Destination photo is reused in another card: ${destination}`);
  destinationImages.add(src);
  const altName = destinationAltNames.get(destination) || destination.replaceAll("-", " ");
  assert.ok(alt && foldText(alt).includes(foldText(altName)), `Alt text must identify ${destination}: ${alt}`);
  assert.ok(/<figcaption>[\s\S]*?href="https:\/\//i.test(figure), `Destination photo needs a linked source credit: ${destination}`);
  const imageFile = path.basename(new URL(src, `https://local.test${routeFor(path.join(publicRoot, "aluevertailu", "index.html"))}`).pathname);
  assert.ok(imageSourceRegistry.includes(`public/assets/${imageFile}`), `Destination photo is missing from IMAGE-SOURCES.md: ${destination}`);
  const expectedSource = expectedNewPhotoSources.get(destination);
  if (expectedSource) assert.ok(figure.includes(expectedSource), `Destination photo has the wrong source URL: ${destination}`);
  const originalImageUrl = expectedOriginalImageUrls.get(destination);
  if (originalImageUrl) assert.ok(imageSourceRegistry.includes(originalImageUrl), `Destination photo registry is missing its original image URL: ${destination}`);
  if (expectedNewPhotoSources.has(destination)) {
    const [imageBase, imageHeight] = expectedDestinationPhotoFiles.get(destination) || [destination, 933];
    assert.ok(img.includes(`width="1400" height="${imageHeight}"`), `Destination photo must declare its 1400px output dimensions: ${destination}`);
    assert.ok(img.includes(`srcset="/assets/${imageBase}-700.jpg 700w, /assets/${imageBase}.jpg 1400w"`), `Destination photo must include its responsive 700px variant: ${destination}`);
  }
  assert.ok(/<details class="destination-details">[\s\S]*?<summary\b/.test(card), `Destination profile should keep its longer guidance accessible but collapsed: ${destination}`);
}
assert.equal(destinationImages.size, expectedDestinations.length, "All 24 destination profiles must have a unique photo");
const destinationOptions = destinationCards.map(([, id, card]) => ({
  id,
  regionId: [...expectedDestinationNavigationGroups].find(([, ids]) => ids.includes(id))?.[0],
  name: card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1]?.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").trim() || id,
}));
const fiCollator = new Intl.Collator("fi", { sensitivity: "base" });
const expectedAlphabeticalNames = destinationOptions.map(({ name }) => name).sort((a, b) => fiCollator.compare(a, b));
assert.deepEqual(sortDestinationOptions(destinationOptions, "all").map(({ name }) => name), expectedAlphabeticalNames, "All-area selector options must be alphabetized by their visible Finnish names");
assert.equal(destinationOptions.length, 24, "All 24 destinations must remain available in the selector");
assert.ok(destinationOptions.some(({ id }) => id === "torrevieja"), "Torrevieja must remain available as the default selection");
for (const region of new Set(destinationOptions.map(({ regionId }) => regionId))) {
  const regionalOptions = destinationOptions.filter((destination) => destination.regionId === region);
  assert.deepEqual(sortDestinationOptions(regionalOptions, region).map(({ id }) => id), regionalOptions.map(({ id }) => id), `A regional selector must retain its existing order: ${region}`);
}

const rentalPage = readFileSync(path.join(publicRoot, "vuokraus", "index.html"), "utf8");
assert.ok(rentalPage.includes('id="rental-index-table"') && rentalPage.includes('id="rental-region-filter"'), "Rental page must contain its static destination index table and region filter");
assert.ok(rentalPage.includes('src="/assets/rental-index.mjs"'), "Rental page must load its small local region-filter module");
assert.ok(rentalPage.includes('href="/#vuokrausdata"'), "Rental page must link directly to the destination rent-index section on the homepage");
assert.match(rentalPage, /Idealistan vuokrailmoitusindeksi[\s\S]{0,180}alustavaan alueiden väliseen vertailuun/i, "Rental page must explain the indicative use of the rent index");
assert.match(rentalPage, /indeksit eivät ole toteutuneita vuokria[\s\S]{0,160}talvivuokrauksille ei ole käytettävissä/i, "Rental page must distinguish asking-price indices from seasonal rent");
assert.match(rentalPage, /vertailukelpoista aineistoa kalustetuille 1–6 kuukauden talvivuokrauksille ei ole käytettävissä/i, "Seasonal-rental data limitations must be clear");
assert.match(rentalPage, /indeksi ei ole talvikauden vuokrahinta|indeksit eivät ole[\s\S]{0,120}talvivuokrauksille/i, "Rental page must disclaim actual winter-rent pricing");
assert.ok(rentalPage.includes('href="/budjetti/"') && rentalPage.includes('href="/#comparison-app"'), "Rental page must link to budget and the homepage comparison");

const climateBlocks = [...comparison.matchAll(/<details class="climate-station">([\s\S]*?)<\/details>/g)];
assert.equal(climateBlocks.length, expectedStations.length, "Expected one climate table per verified station");
for (let index = 0; index < climateBlocks.length; index += 1) {
  const block = climateBlocks[index][1];
  assert.ok(block.includes(`asema ${expectedStations[index]}`), `Unexpected climate station order or ID: ${expectedStations[index]}`);
  assert.ok(/https:\/\/www\.aemet\.es\//i.test(block), `Climate table lacks official AEMET source: ${expectedStations[index]}`);
  const tableBody = block.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || "";
  assert.ok(tableBody, `Climate table has no tbody: ${expectedStations[index]}`);
  const rows = [...tableBody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 12, `Climate station ${expectedStations[index]} must have 12 monthly rows`);
  for (const [, row] of rows) {
    assert.equal((row.match(/<th\b/gi) || []).length, 1, `Climate month row should have one row heading: ${expectedStations[index]}`);
    assert.equal((row.match(/<td\b/gi) || []).length, 5, `Climate month row should contain T, TM, Tm, R and I: ${expectedStations[index]}`);
  }
}
const cadizBlock = climateBlocks.find(([, block]) => block.includes("asema 5973"))?.[1] || "";
assert.equal((cadizBlock.match(/<td>–<\/td>/g) || []).length, 2, "Cádiz missing sunshine values must remain missing, not be treated as zero");

const comparisonUi = comparison.slice(comparison.indexOf('<section id="comparison-app"'), comparison.indexOf('<details id="comparison-source"'));
assert.doesNotMatch(comparisonUi, /Ei nimettyä asemaa|Ei aineistossa/, "Interactive climate summary must not contain missing-data placeholder copy");
assert.ok(comparisonUi.includes("Päivän ylin keskimäärin") && comparisonUi.includes("Yön alin keskimäärin"), "Interactive climate summary must distinguish average daily maximum and minimum");
assert.ok(comparisonUi.includes("NOAA/OISST-aineiston 1991–2020") && comparisonUi.includes("0,25° meriruudussa"), "Climate comparison must disclose the historical sea-surface source and grid resolution");
assert.ok(!/Meriveden lämpötilaa ei ole nykyisessä lähdeaineistossa/.test(comparisonUi), "Comparison note must not claim sea-temperature data is absent");

assert.deepEqual([...DESTINATION_STATIONS.keys()], expectedDestinations, "Every destination must have one climate-station assignment in profile order");
assert.deepEqual([...DESTINATION_SEA_TEMPERATURES.keys()], expectedDestinations, "Every destination must have one NOAA sea-cell value in profile order");
assert.deepEqual([...DESTINATION_STATIONS].map(([id, station]) => [id, station.stationId, station.role]), [...expectedClimateAssignments].map(([id, [stationId, role]]) => [id, stationId, role]), "Climate station assignments must remain explicit and reviewable");
assert.deepEqual([...DESTINATION_SEA_TEMPERATURES].map(([id, sea]) => [id, sea.value, sea.latitude, sea.longitude]), [...expectedSeaCells].map(([id, [value, latitude, longitude]]) => [id, value, latitude, longitude]), "NOAA values and grid centers must match the verified destination mapping");
assert.deepEqual(noaaOisstGridIndices(38.375, -0.375), { latitude: 513, longitude: 1438 }, "NOAA grid indexing must select the intended Alicante sea cell");

const stationRows = new Map();
for (const [, block] of climateBlocks) {
  const summary = block.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "";
  const stationId = summary.match(/asema\s+([\dA-Z]+)/i)?.[1];
  const period = summary.match(/\b(\d{4}–\d{4})\b/)?.[1];
  const january = block.match(/<tr><th>Tammi<\/th>((?:<td>[^<]*<\/td>){5})<\/tr>/i)?.[1] || "";
  const values = [...january.matchAll(/<td>([^<]*)<\/td>/g)].map(([, value]) => Number(value.replace(",", ".")));
  assert.ok(stationId && period, "Each station table must expose its station ID and comparison period");
  assert.equal(values.length, 5, `Station ${stationId} must have complete January T/TM/Tm/R/I values`);
  stationRows.set(stationId, {
    name: summary.replace(/\s*·\s*asema\s+[\dA-Z]+.*$/i, ""),
    period,
    mean: values[0],
    high: values[1],
    low: values[2],
    precipitation: values[3],
    sunshine: values[4],
    sourceUrl: (block.match(/<a href="(https:\/\/www\.aemet\.es\/[^\"]+)"/)?.[1] || "").replaceAll("&amp;", "&"),
  });
}
for (const [destination, [stationId, role]] of expectedClimateAssignments) {
  const station = stationRows.get(stationId);
  assert.ok(station, `Destination ${destination} maps to a missing AEMET station ${stationId}`);
  assert.ok(["city", "airport", "regional"].includes(role), `Unknown station role for ${destination}`);
  assert.ok(Number.isFinite(station.high) && Number.isFinite(station.low), `Destination ${destination} must receive numeric January TM/Tm values`);
  assert.ok(station.period && station.sourceUrl, `Destination ${destination} must retain the AEMET station period and source`);
}
for (const record of DESTINATION_RECORDS) {
  const station = stationRows.get(record.climate.station.id);
  assert.ok(station, "Pilot AEMET station is absent from the static climate tables");
  assert.deepEqual(
    [station.name, station.period, station.mean, station.high, station.low, station.precipitation, station.sunshine, station.sourceUrl],
    [record.climate.station.name, record.climate.station.period, record.climate.january.meanC, record.climate.january.dayHighMeanC, record.climate.january.nightLowMeanC, record.climate.january.precipitationMm, record.climate.january.sunshineHours, record.climate.station.sourceUrl],
    "Pilot dataset climate metadata and January observations must match the pre-migration source table",
  );
  assert.equal(record.seaSurface.valueC, expectedSeaCells.get(record.id)[0], "Pilot NOAA value changed from the pre-migration comparison baseline");
  assert.deepEqual([record.seaSurface.gridCenter.latitude, record.seaSurface.gridCenter.longitude], expectedSeaCells.get(record.id).slice(1), "Pilot NOAA grid changed from the pre-migration comparison baseline");
}
for (const [destination, [value, latitude, longitude]] of expectedSeaCells) {
  const sea = DESTINATION_SEA_TEMPERATURES.get(destination);
  assert.ok(Number.isInteger(value) && value >= 0 && value <= 40, `Unexpected rounded sea temperature for ${destination}`);
  assert.ok(Number.isInteger((latitude + 89.875) / 0.25), `Latitude is not a NOAA OISST grid center for ${destination}`);
  const eastLongitude = longitude < 0 ? longitude + 360 : longitude;
  assert.ok(Number.isInteger((eastLongitude - 0.125) / 0.25), `Longitude is not a NOAA OISST grid center for ${destination}`);
  const queryUrl = noaaOisstCellUrl(latitude, longitude);
  assert.ok(queryUrl.startsWith("https://comet.nefsc.noaa.gov/erddap/griddap/noaa_psl_55a2_880b_1f29.htmlTable?"), `Missing direct NOAA ERDDAP source for ${destination}`);
  assert.match(decodeURIComponent(queryUrl), /sst\[1\].*valid_yr_count\[1\]/, `NOAA source link must request the January SST and valid-year count for ${destination}`);
}
const sourceRegistry = readFileSync(path.join(projectRoot, "SOURCES.md"), "utf8");
assert.ok(sourceRegistry.includes("## Meriveden pintalämpötila — NOAA OISST"), "SOURCES.md must document the NOAA sea-surface dataset and method");
assert.ok(sourceRegistry.includes("| Huelva | 37,125; −6,875 | 15 |"), "SOURCES.md must preserve the Huelva NOAA grid and rounded value");

const rentTable = comparison.match(/<caption>Idealista:[\s\S]*?<\/table>/i)?.[0];
assert.ok(rentTable, "Missing dated Idealista rental index table");
const rentRows = [...rentTable.matchAll(/<tr>\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)];
assert.equal(rentRows.length, expectedComparisonRents.size, "Each destination needs one dated rental index value");
for (const [, city, value, source] of rentRows) {
  assert.equal(value, expectedComparisonRents.get(city), `Rental index value changed or mismatched for ${city}`);
  assert.equal(source, expectedComparisonSources.get(city), `Unexpected Idealista report for ${city}`);
}
for (const record of DESTINATION_RECORDS) {
  assert.equal(record.rentalIndex.value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 }), expectedComparisonRents.get(record.name), `Pilot dataset rent value differs from the pre-migration comparison baseline: ${record.id}`);
  assert.equal(record.rentalIndex.sourceUrl, expectedComparisonSources.get(record.name), `Pilot dataset rent source differs from the pre-migration comparison baseline: ${record.id}`);
  const staticRentRow = rentRows.find(([, city]) => city === record.name);
  assert.ok(staticRentRow, `Static rent table must retain the pilot row: ${record.id}`);
  assert.equal(Number(staticRentRow[2].replace(",", ".")), record.rentalIndex.value, `Pilot dataset and static rent table values must match: ${record.id}`);
  assert.equal(staticRentRow[3], record.rentalIndex.sourceUrl, `Pilot dataset and static rent table sources must match: ${record.id}`);
}
const costaBlancaRentBody = rentTable.match(/<tbody><tr><th scope="rowgroup" colspan="3">Costa Blanca<\/th><\/tr>([\s\S]*?)<\/tbody>/)?.[1] || "";
const costaBlancaRentRows = [...costaBlancaRentBody.matchAll(/<tr>\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)];
assert.equal(costaBlancaRentRows.length, expectedCostaBlancaRents.size, "Costa Blanca must have exactly eight approved rental-index rows");
for (const [, city, value, source] of costaBlancaRentRows) {
  assert.equal(value, expectedCostaBlancaRents.get(city), `Costa Blanca rental-index value changed or mismatched for ${city}`);
  assert.equal(source, expectedComparisonSources.get(city), `Unexpected Costa Blanca Idealista report for ${city}`);
}
assert.ok(/syyskuu 2026/i.test(rentTable), "Rental index must retain its publication month");

const sourceRentRecords = new Map();
for (const [, body] of rentTable.matchAll(/<tbody>([\s\S]*?)<\/tbody>/gi)) {
  const region = body.match(/<th scope="rowgroup" colspan="3">([^<]+)<\/th>/)?.[1];
  assert.ok(region, "Homepage rent source table needs a region heading for each block");
  for (const [, city, value, source] of body.matchAll(/<tr>\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)) {
    sourceRentRecords.set(city, { region, value, source });
  }
}
const newProfileRentNames = new Map([
  ["alicante", "Alicante / Alacant"], ["orihuela-costa", "Orihuela Costa"], ["guardamar-del-segura", "Guardamar del Segura"],
  ["denia", "Dénia"], ["javea-xabia", "Jávea / Xàbia"], ["calp", "Calp / Calpe"],
  ["cartagena", "Cartagena"], ["los-alcazares", "Los Alcázares"], ["san-pedro-del-pinatar", "San Pedro del Pinatar"],
  ["la-manga-del-mar-menor", "La Manga del Mar Menor"], ["puerto-de-mazarron", "Puerto de Mazarrón"], ["aguilas", "Águilas"],
  ["almeria", "Almería"], ["roquetas-de-mar", "Roquetas de Mar"], ["almerimar", "Almerimar"], ["vera", "Vera"],
  ["malaga", "Málaga"], ["valencia", "Valencia"], ["murcia", "Murcia"], ["cadiz", "Cádiz"], ["huelva", "Huelva"],
]);
for (const id of expectedNewProfileIds) {
  const html = generatedDestinationOutputs.get(path.join(publicRoot, "kohteet", id, "index.html"));
  const rentName = newProfileRentNames.get(id);
  const rent = sourceRentRecords.get(rentName);
  const assignment = DESTINATION_STATIONS.get(id);
  const station = assignment && stationRows.get(assignment.stationId);
  const sea = DESTINATION_SEA_TEMPERATURES.get(id);
  const card = destinationCards.find(([, cardId]) => cardId === id)?.[2] || "";
  const cardImage = card.match(/<img\b([^>]*)>/i)?.[1] || "";
  const profileImage = html?.match(/<figure class="destination-profile-photo[^"]*">\s*<img\b([^>]*)>/i)?.[1] || "";
  const cardAttrs = Object.fromEntries([...cardImage.matchAll(/\b([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
  const profileAttrs = Object.fromEntries([...profileImage.matchAll(/\b([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
  assert.ok(html && rent && station && sea, `New profile must use existing sourced facts for climate, sea and rent: ${id}`);
  assert.equal(profileAttrs.src, cardAttrs.src, `New profile must reuse the homepage image source: ${id}`);
  assert.equal(profileAttrs.srcset, cardAttrs.srcset, `New profile must reuse the homepage responsive image source: ${id}`);
  assert.ok(html.includes(`>${rent.value} <span>€/m²/kk</span></p>`), `New profile rent value must match the homepage source table: ${id}`);
  assert.ok(html.includes(`href="${rent.source}"`), `New profile rent link must match the homepage source table: ${id}`);
  assert.ok(html.includes(`${station.name} (${assignment.stationId}), ${station.period}`), `New profile must use the existing AEMET station and period: ${id}`);
  for (const value of [station.mean, station.high, station.low, station.precipitation, station.sunshine]) {
    assert.ok(html.includes(value.toLocaleString("fi-FI")), `New profile climate value must match its AEMET table: ${id}/${value}`);
  }
  assert.ok(html.includes(`${sea.value} °C tammikuun alueellisessa NOAA/OISST-meriruudussa`), `New profile must use its existing NOAA/OISST cell: ${id}`);
  assert.ok(!Object.hasOwn(DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.get(id), "rentalIndex")
    && !Object.hasOwn(DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.get(id), "climate")
    && !Object.hasOwn(DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.get(id), "seaSurface"), `Editorial data must not duplicate maintained source facts: ${id}`);
}
const costPageHtml = readFileSync(path.join(publicRoot, "elinkustannukset", "index.html"), "utf8");
const costModule = readFileSync(path.join(publicRoot, "assets", "elinkustannukset.mjs"), "utf8");
const costGroups = [...costPageHtml.matchAll(/<optgroup label="([^"]+)">([\s\S]*?)<\/optgroup>/gi)].map(([, label, body]) => ({
  label,
  options: [...body.matchAll(/<option\s+value="([^"]+)"(?:\s+selected)?>([^<]+)<\/option>/gi)].map(([, value, name]) => ({ value, name: name.trim() })),
}));
const sourceRentRegions = [...new Set([...sourceRentRecords.values()].map(({ region }) => region))];
assert.deepEqual(costGroups.map(({ label }) => label), sourceRentRegions, "Cost selector must preserve the source table's five region groups and order");
const costOptions = costGroups.flatMap(({ options }) => options);
assert.equal(costOptions.length, 24, "Cost-page selector must list all 24 destinations");
assert.deepEqual(costOptions.map(({ name }) => name).sort(), [...sourceRentRecords.keys()].sort(), "Cost-page selector must use exactly the source table's 24 destination names");
const finnishCollator = new Intl.Collator("fi", { sensitivity: "base" });
for (const group of costGroups) {
  const expectedNames = [...sourceRentRecords]
    .filter(([, record]) => record.region === group.label)
    .map(([name]) => name)
    .sort(finnishCollator.compare);
  assert.deepEqual(group.options.map(({ name }) => name), expectedNames, `Cost selector destinations must be Finnish-alphabetical within ${group.label}`);
  for (const option of group.options) {
    const sourceRow = sourceRentRecords.get(option.name);
    assert.ok(sourceRow, `Cost selector contains an unknown destination: ${option.name}`);
    assert.equal(sourceRow.region, group.label, `Cost selector has a destination in the wrong group: ${option.name}`);
    assert.equal(option.value, normalizeRentalPlaceName(option.name), `Cost selector key must normalize its displayed city name: ${option.name}`);
  }
}
assert.ok(costPageHtml.includes('src="/assets/elinkustannukset.mjs"'), "Cost page must load its local interaction module");
for (const heading of ["Elintarvikkeiden hintavertailu alueittain", "Asuminen", "Julkinen liikenne", "Matkat Suomeen"]) {
  assert.ok(costPageHtml.includes(heading), `Cost page is missing its ${heading} section`);
}
const foodSectionStart = costPageHtml.indexOf('aria-labelledby="cost-food-title"');
const destinationPickerStart = costPageHtml.indexOf('class="cost-destination-picker"');
const housingSectionStart = costPageHtml.indexOf('aria-labelledby="cost-housing-title"');
assert.ok(foodSectionStart > 0 && destinationPickerStart > foodSectionStart && housingSectionStart > destinationPickerStart,
  "MAPA food comparison must precede the destination picker and housing section");
const sharedRentRows = readComparisonRentRows(comparison);
assert.equal(sharedRentRows.length, 24, "Cost page must read all 24 rent rows from the homepage source table");
for (const row of sharedRentRows) {
  const expected = sourceRentRecords.get(row.name);
  assert.ok(expected, `Shared rent parser returned an unexpected destination: ${row.name}`);
  assert.equal(row.region, expected.region, `Shared rent parser lost the region for ${row.name}`);
  assert.equal(row.rate.toFixed(1).replace(".", ","), expected.value, `Shared rent parser changed the rate for ${row.name}`);
  assert.equal(row.sourceUrl, expected.source, `Shared rent parser changed the source link for ${row.name}`);
}
assert.equal(NATIONAL_RENT_BENCHMARK, 15.1, "National September 2026 rent benchmark must match the official Idealista report");
assert.equal(calculateRelativeRentIndex(15.1, NATIONAL_RENT_BENCHMARK), 100);
assert.equal(calculateRelativeRentIndex(13.9, NATIONAL_RENT_BENCHMARK), 92.1);
assert.equal(calculateRelativeRentIndex(0, NATIONAL_RENT_BENCHMARK), null);
assert.equal(FOOD_PRICE_LEVEL.value, 94.9);
assert.equal(FOOD_PRICE_LEVEL.reference, "EU = 100");
assert.equal(FOOD_PRICE_LEVEL.year, 2025);
assert.equal(MAPA_FOOD_PERIOD, "1.1.–31.12.2025", "MAPA food comparison must use the verified 2025 calendar year");
assert.deepEqual(MAPA_FOOD_REGIONS, ["España", "Comunitat Valenciana", "Región de Murcia", "Andalucía"]);
const expectedFoodDestinations = {
  "Comunitat Valenciana": [
    "Alicante / Alacant", "Torrevieja", "Benidorm", "Orihuela Costa", "Guardamar del Segura",
    "Dénia", "Jávea / Xàbia", "Calp / Calpe", "Valencia",
  ],
  "Región de Murcia": [
    "Cartagena", "Los Alcázares", "San Pedro del Pinatar", "La Manga del Mar Menor",
    "Puerto de Mazarrón", "Águilas", "Murcia",
  ],
  Andalucía: ["Málaga", "Fuengirola", "Almería", "Roquetas de Mar", "Almerimar", "Vera", "Cádiz", "Huelva"],
};
assert.deepEqual(MAPA_FOOD_REGION_DESTINATIONS, expectedFoodDestinations, "MAPA values must be mapped to the specified 9, 7, and 8 current destinations");
assert.deepEqual(
  Object.fromEntries(Object.entries(MAPA_FOOD_REGION_DESTINATIONS).map(([region, names]) => [region, names.length])),
  { "Comunitat Valenciana": 9, "Región de Murcia": 7, Andalucía: 8 },
  "Every target autonomous community must have the expected current destination count",
);
const mapaFoodDestinations = Object.values(MAPA_FOOD_REGION_DESTINATIONS).flat().map(normalizeRentalPlaceName);
assert.equal(new Set(mapaFoodDestinations).size, 24, "MAPA destination mapping must not duplicate places");
assert.deepEqual([...mapaFoodDestinations].sort(), costOptions.map(({ value }) => value).sort(), "Every current cost-page destination must map to exactly one MAPA region");
const expectedMapaFoodProducts = [
  ["eggs", "Kananmunat", "T.HUEVOS UNDS.", "€/kpl", "Kananmunat mitataan kappaleina.",
    [[1665346.2317, 6865713.825], [197225.2387, 817173.9452], [48693.98298, 202365.0533], [267157.9398, 1114535.907]],
    [0.243, 0.241, 0.241, 0.240], [100, 99.5, 99.2, 98.8]],
  ["milk", "Nestemäinen maito", "TOTAL LECHE LIQUIDA", "€/l", "Nestemäinen lehmän-, vuohen- tai lampaanmaito, myös raakamaito; ei rekonstituoitua maitoa eikä kasvipohjaisia juomia.",
    [[2783491.2, 2860234], [277357.23, 280394.22], [78499.222, 77043.611], [426971.91, 446621.05]],
    [0.973, 0.989, 1.019, 0.956], [100, 101.6, 104.7, 98.2]],
  ["bread", "Leipä", "PAN", "€/kg", "Kaikenlainen pakattu tai pakkaamaton leipä.",
    [[3480727.4, 1288521.55], [384770.84, 137066.47], [97853.438, 36559.086], [618629.98, 233700.34]],
    [2.701, 2.807, 2.677, 2.647], [100, 103.9, 99.1, 98.0]],
  ["meat", "Liha", "TOTAL CARNE", "€/kg", "Tuore, pakastettu ja prosessoitu liha.",
    [[17646595, 2019846.9], [1940589, 229304.25], [510977.87, 59851.005], [2785755.8, 337920.82]],
    [8.737, 8.463, 8.537, 8.244], [100, 96.9, 97.7, 94.4]],
  ["fish", "Kala", "PESCADOS", "€/kg", "Tuore ja pakastettu kala.",
    [[4625444, 423155.55], [416335.44, 39008.316], [121182.93, 11251.2953], [783069.29, 75177.921]],
    [10.931, 10.673, 10.771, 10.416], [100, 97.6, 98.5, 95.3]],
  ["fresh-fruit", "Tuoreet hedelmät", "T.FRUTAS FRESCAS", "€/kg", "Tuoreet hedelmät, pakattuna tai irtona.",
    [[8731228.9, 3821842], [917085.36, 407235.88], [264904.45, 117048.568], [1397621.68, 629119.07]],
    [2.285, 2.252, 2.263, 2.222], [100, 98.6, 99.1, 97.2]],
  ["fresh-vegetables", "Tuoreet vihannekset", "T.HORTALIZAS FRESCAS", "€/kg", "Tuoreet vihannekset pakattuna tai irtona; tuoreet perunat eivät sisälly tähän ryhmään.",
    [[5794030.2, 2299310.3], [666974.88, 259170.04], [160333.89, 66726.639], [909277.57, 382900.28]],
    [2.520, 2.574, 2.403, 2.375], [100, 102.1, 95.4, 94.2]],
  ["legumes", "Palkokasvit", "LEGUMBRES", "€/kg", "Kuivat ja kypsennetyt palkokasvit, kuten kikherneet, linssit ja pavut.",
    [[354738.24, 162362.99], [34040.856, 17987.678], [9978.5457, 5069.2453], [55207.869, 25950.535]],
    [2.185, 1.892, 1.968, 2.127], [100, 86.6, 90.1, 97.4]],
];
assert.equal(MAPA_FOOD_PRODUCTS.length, 8, "MAPA table must contain exactly eight distinct product groups");
assert.deepEqual(MAPA_FOOD_PRODUCTS.map(({ id }) => id), expectedMapaFoodProducts.map(([id]) => id));
const formatFoodPrice = (value) => value.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const formatFoodIndex = (value) => value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
for (let productIndex = 0; productIndex < expectedMapaFoodProducts.length; productIndex += 1) {
  const [id, name, sourceRow, unit, definition, expectedAmounts, expectedPrices, expectedIndices] = expectedMapaFoodProducts[productIndex];
  const product = MAPA_FOOD_PRODUCTS[productIndex];
  assert.deepEqual(
    { id: product.id, name: product.name, sourceRow: product.sourceRow, unit: product.unit, definition: product.definition },
    { id, name, sourceRow, unit, definition },
    `${id} must use the audited MAPA row, definition and unit`,
  );
  assert.deepEqual(Object.keys(product.amounts), MAPA_FOOD_REGIONS, `${name} must have all four geographic levels`);
  for (let regionIndex = 0; regionIndex < MAPA_FOOD_REGIONS.length; regionIndex += 1) {
    const region = MAPA_FOOD_REGIONS[regionIndex];
    const amounts = product.amounts[region];
    assert.deepEqual([amounts.valor, amounts.volumen], expectedAmounts[regionIndex], `${name} ${region} raw MAPA amounts must match the audited annual workbook`);
    assert.ok(amounts.volumen > 0, `${name} ${region} needs a positive volume; missing data must not become zero`);
    const metrics = calculateMapaFoodMetrics(product, region);
    assert.ok(metrics, `${name} ${region} should calculate a price and index`);
    assert.equal(Number(formatFoodPrice(metrics.average).replace(/\s/g, "").replace(",", ".")), expectedPrices[regionIndex], `${name} ${region} annual mean price must match the validation report`);
    assert.equal(metrics.index, expectedIndices[regionIndex], `${name} ${region} ratio must match the validation report`);
    if (region === "España") assert.equal(metrics.index, 100, `${name} Spain baseline must equal 100`);
  }
}
const foodTable = costPageHtml.match(/<table id="cost-food-table"[\s\S]*?<\/table>/i)?.[0];
assert.ok(foodTable, "Cost page needs the MAPA regional food comparison table");
assert.ok(foodTable.includes('<caption id="cost-food-caption"></caption>') && foodTable.includes('<tbody id="cost-food-rows">'), "Food table rows and caption must be rendered from the single JavaScript data source");
assert.ok(!/data-product-id=/.test(foodTable), "Food prices must not be duplicated as manually maintained HTML rows");
const foodRenderer = costModule.match(/export function renderMapaFoodTable\([\s\S]*?\n\}/)?.[0];
assert.ok(foodRenderer && !foodRenderer.includes("cost-destination"), "MAPA table rendering must be independent of the selected destination");
assert.ok(costModule.includes("renderMapaFoodTable") && costModule.includes("calculateMapaFoodMetrics"), "The cost module must render and calculate MAPA products from raw values");
assert.ok(!costModule.includes("syyskuu 2025 – elokuu 2026") && !costPageHtml.includes("syyskuu 2025 – elokuu 2026"), "The invalid rolling-period pilot must not be used in the new table");
assert.ok(costPageHtml.indexOf('aria-labelledby="cost-food-title"') < costPageHtml.indexOf('class="cost-destination-picker"'), "The food table must precede the destination selector");
assert.ok(costPageHtml.indexOf('class="cost-food-eurostat"') > costPageHtml.indexOf('aria-labelledby="cost-food-title"')
  && costPageHtml.indexOf('class="cost-food-eurostat"') < costPageHtml.indexOf('class="cost-destination-picker"'),
"Eurostat's national comparison must remain separate after MAPA and before the destination picker");
for (const phrase of ["MAPA:n kotitalouksien tosiasiallisista ostoista", "itsehallintoalue", "saman alueen tämän sivuston kohteet jakavat saman arvon", "tuotevalikoima", "laatu", "tuotemerkit", "pakkauskoot", "tarjoukset", "painotettua yleistä elintarvikeindeksiä", "henkilökohtaista ruokabudjettia"]) {
  assert.ok(costPageHtml.toLocaleLowerCase("fi-FI").includes(phrase.toLocaleLowerCase("fi-FI")), `Cost page must explain MAPA limits: ${phrase}`);
}
for (const source of ["https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/series-anuales", "2025-datos-anuales-panel-consumo-hogares-base2021_corregido", "2025dic-datos-mensuales-panel-consumo-hogares-ccaa-base2021", "definiciones-y-clasificaciones-panel-hogares-rev-julio2025", "https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/metodologia/"]) {
  assert.ok(costPageHtml.includes(source), `Cost page must cite MAPA source ${source}`);
}
assert.ok(costPageHtml.includes("Erillinen kansallinen vertailu · Eurostat") && costPageHtml.includes("94,9"), "Eurostat's 94.9 national figure must remain separately labelled");
assert.deepEqual(CTMAM_INTERURBAN_SINGLE_FARES.map(({ zoneChanges, euros }) => [zoneChanges, euros]), [[0, 1.6], [1, 1.75], [2, 2.5], [3, 3.75], [4, 6.25]]);
assert.equal(HUELVA_ORDINARY_SINGLE_FARE, 1.1);
assert.deepEqual([...DESTINATION_AIRPORTS.keys()].sort(), [...expectedComparisonRents.keys()].map(normalizeRentalPlaceName).sort(), "Every cost-page destination must have an airport option assignment");
for (const codes of DESTINATION_AIRPORTS.values()) {
  assert.ok(codes.length > 0 && codes.every((code) => AIRPORTS[code]), "Airport assignment must use a defined Aena airport code");
}
assert.equal(createFlightsSearchUrl("ALC", "2026-12-01", "2027-02-01")?.includes("HEL"), true);
assert.equal(createFlightsSearchUrl("ALC", "2026-12-01", "2026-11-30"), null);
assert.equal(createFlightsSearchUrl("bad", "2026-12-01", "2027-02-01"), null);
const rentalTable = rentalPage.match(/<table id="rental-index-table"[^>]*>([\s\S]*?)<\/table>/i)?.[0];
assert.ok(rentalTable, "Missing static 24-destination rental index table on rental page");
const rentalRows = [...rentalTable.matchAll(/<tr data-rental-region="([^"]+)">\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)];
assert.equal(rentalRows.length, expectedComparisonRents.size, "Rental page must list every one of the 24 destination indices");
assert.deepEqual(rentalRows.map(([, , city]) => city), [...sourceRentRecords.keys()], "Rental page must preserve the homepage's destination order and names");
const rentalRegionIds = new Map([
  ["Costa Blanca", "costa-blanca"], ["Costa del Sol", "costa-del-sol"], ["Costa Cálida", "costa-calida"],
  ["Costa de Almería", "costa-de-almeria"], ["Muut kohteet Espanjassa", "other-spain"],
]);
const parseWholeEuro = (text) => Number(text.replace(/[^\d]/g, ""));
for (const [, regionId, city, region, rateText, fortyText, sixtyText, source] of rentalRows) {
  const sourceRow = sourceRentRecords.get(city);
  assert.ok(sourceRow, `Rental table contains an unknown destination: ${city}`);
  assert.equal(region, sourceRow.region, `Rental table region differs from homepage for ${city}`);
  assert.equal(regionId, rentalRegionIds.get(sourceRow.region), `Unexpected filter region for ${city}`);
  assert.equal(rateText, `${sourceRow.value} €/m²/kk`, `Rental index differs from homepage for ${city}`);
  assert.equal(source, sourceRow.source, `Idealista source differs from homepage for ${city}`);
  assert.equal(Number(rateText.match(/[\d,]+/)?.[0]?.replace(",", ".")), Number(sourceRow.value.replace(",", ".")), `Unable to parse rental index for ${city}`);
  assert.equal(parseWholeEuro(fortyText), calculateIndexedRent(sourceRow.value, 40), `40 m² estimate does not use the comparison formula for ${city}`);
  assert.equal(parseWholeEuro(sixtyText), calculateIndexedRent(sourceRow.value, 60), `60 m² estimate does not use the comparison formula for ${city}`);
}
const rentalRegionCounts = new Map();
for (const [, regionId] of rentalRows) rentalRegionCounts.set(regionId, (rentalRegionCounts.get(regionId) || 0) + 1);
assert.deepEqual([...rentalRegionCounts.values()], [8, 2, 6, 4, 4], "Rental filter categories must cover the 24 places across the five comparison groups");
const rentalFilterOptions = [...rentalPage.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)].map(([, value, label]) => [value, label]);
assert.deepEqual(rentalFilterOptions, [
  ["all", "Kaikki alueet"], ["costa-blanca", "Costa Blanca"], ["costa-del-sol", "Costa del Sol"],
  ["costa-calida", "Costa Cálida"], ["costa-de-almeria", "Costa de Almería"], ["other-spain", "Muut kohteet Espanjassa"],
], "Rental filter must offer all five regions and an all-areas reset");
const filterTestRows = rentalRows.map(([, regionId]) => ({ dataset: { rentalRegion: regionId } }));
assert.equal(rentalRowsForRegion(filterTestRows, "all").length, 24, "All-area rental filter must retain all 24 rows");
for (const [regionId, count] of [["costa-blanca", 8], ["costa-del-sol", 2], ["costa-calida", 6], ["costa-de-almeria", 4], ["other-spain", 4]]) {
  assert.equal(rentalRowsForRegion(filterTestRows, regionId).length, count, `Rental filter returned the wrong number of rows for ${regionId}`);
}
assert.match(rentalPage, /Vuokra-arviot lasketaan pyyntivuokraindeksistä ja pinta-alasta/, "Rental page must clearly label calculated index estimates");
assert.match(rentalPage, /Ne eivät ole talvikauden kalustettujen asuntojen vuokrahintoja/, "Rental page must disclaim seasonal furnished-rental prices");
const imageRegistry = readFileSync(path.join(projectRoot, "IMAGE-SOURCES.md"), "utf8");
for (const imageFile of ["rental-terrace.jpg", "rental-terrace-700.jpg", "winter-guide-valencia.jpg", "winter-guide-valencia-700.jpg", "budget-cafe.jpg", "budget-cafe-700.jpg", "elinkustannukset-market.jpg", "elinkustannukset-market-700.jpg"]) {
  assert.ok(imageRegistry.includes(imageFile), `IMAGE-SOURCES.md must record ${imageFile}`);
}
assert.ok(imageRegistry.includes("Ahmet ÇÖTÜR") && imageRegistry.includes("Tahmina Mustafayeva") && imageRegistry.includes("Serhii Raskolei") && imageRegistry.includes("Joaquin Carfagna"), "Editorial images must retain source-page photographer attribution");

const styles = readFileSync(path.join(publicRoot, "assets", "site.css"), "utf8");
assert.ok(/@media\s*\(max-width:\s*760px\)/.test(styles), "Missing mobile layout breakpoint");
assert.ok(/@media\s*\(max-width:\s*760px\)[\s\S]*?\.site-nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s.test(styles), "All primary navigation links must remain in a bounded, visible mobile grid");
assert.ok(/\.table-wrap\s*\{[^}]*overflow-x:\s*auto/s.test(styles), "Wide tables must be horizontally scrollable on narrow screens");
assert.ok(/\.destination-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s.test(styles), "Destination cards need a bounded two-column desktop grid");
assert.ok(/@media\s*\(max-width:\s*760px\)[\s\S]*?\.destination-list\s*\{\s*grid-template-columns:\s*1fr;/s.test(styles), "Destination cards must stack on mobile to avoid page overflow");
assert.ok(/\.destination-photo img\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2;[^}]*object-fit:\s*cover;/s.test(styles), "Destination images need a consistent responsive crop");
assert.ok(/\.article-layout\s*>\s*\*\s*\{\s*min-width:\s*0;\s*\}/s.test(styles), "Article grid items must not expand the page around wide comparison tables");
assert.ok(/\.editorial-hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s+minmax\(280px,\s*\.92fr\)/s.test(styles), "Editorial pages must use the shared two-column hero layout");
assert.ok(/\.budget-form\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s.test(styles), "Budget inputs should use the available desktop width in two columns");
assert.ok(/\.rental-index-table\s*\{\s*min-width:\s*820px/s.test(styles), "Rental table must retain a bounded horizontally scrollable layout");
assert.ok(/\.rental-index-filter\s*\{\s*align-items:\s*stretch;\s*flex-direction:\s*column/s.test(styles), "Rental filter should stack on narrow screens");
assert.ok(/\.table-wrap\s*\{[^}]*overflow-x:\s*auto/s.test(styles), "Wide comparison tables must scroll inside their own container");
assert.ok(/prefers-reduced-motion:\s*reduce/.test(styles), "Respect reduced-motion preferences");

const sampleDestinations = [
  { id: "torrevieja", regionId: "costa-blanca" },
  { id: "malaga", regionId: "costa-del-sol" },
  { id: "aguilas", regionId: "costa-calida" },
  { id: "alicante", regionId: "costa-blanca" },
  { id: "vera", regionId: "almeria" },
];
assert.equal(MAX_COMPARISON_ITEMS, 4);
assert.deepEqual(filterDestinations(sampleDestinations, "costa-blanca").map(({ id }) => id), ["torrevieja", "alicante"]);
assert.equal(filterDestinations(sampleDestinations, "all").length, sampleDestinations.length);
assert.deepEqual(addComparisonItem(["torrevieja"], "malaga"), { ids: ["torrevieja", "malaga"], result: "added" });
assert.deepEqual(addComparisonItem(["torrevieja"], "torrevieja"), { ids: ["torrevieja"], result: "duplicate" });
assert.deepEqual(addComparisonItem(["a", "b", "c", "d"], "e"), { ids: ["a", "b", "c", "d"], result: "limit" });
assert.deepEqual(removeComparisonItem(["torrevieja", "malaga", "aguilas"], "malaga"), ["torrevieja", "aguilas"]);
assert.deepEqual(removeComparisonItem(["torrevieja"], "torrevieja"), []);
assert.equal(calculateIndexedRent("13,9", 40), 556);
assert.equal(calculateIndexedRent("13,9", 60), 834);
assert.equal(calculateIndexedRent("12,7", 40), 508);
assert.equal(calculateIndexedRent("12,7", 60), 762);
assert.equal(calculateIndexedRent("ei saatavilla", 40), null);
assert.equal(normalizePlaceName("Jávea / Xàbia"), "javeaxabia");

const totals = calculateBudget({
  months: 3,
  travellers: 2,
  monthly: { rent: 1000, utilities: 200, internet: 50, food: 400, transport: 50 },
  oneOff: { travel: 600, insurance: 240, other: 100 },
  contingencyPercent: 10,
});
assert.deepEqual(totals, {
  months: 3,
  travellers: 2,
  monthlyTotal: 1700,
  oneOffTotal: 940,
  contingencyPercent: 10,
  contingencyTotal: 604,
  baseTotal: 6040,
  total: 6644,
  averageMonthly: 6644 / 3,
  perTraveller: 3322,
});
assert.equal(calculateBudget({ months: 1, travellers: 1 }).total, 0, "Blank costs should produce a zero planning total");
assert.equal(calculateBudget({ months: 6, travellers: 2, monthly: { rent: 100 }, oneOff: { travel: 20 } }).total, 620, "Six-month total should multiply monthly costs and add one-off costs");
for (const months of [0, 7, 1.5, "bad"]) assert.throws(() => calculateBudget({ months }), RangeError, `Invalid duration should fail: ${months}`);
for (const travellers of [0, 3, "two"]) assert.throws(() => calculateBudget({ months: 1, travellers }), RangeError, `Invalid traveller count should fail: ${travellers}`);
for (const contingencyPercent of [-1, 51, Infinity]) assert.throws(() => calculateBudget({ months: 1, contingencyPercent }), RangeError, `Invalid contingency should fail: ${contingencyPercent}`);
for (const value of [-0.01, Infinity, "not a number"]) assert.throws(() => calculateBudget({ months: 1, monthly: { rent: value } }), RangeError, `Invalid costs should fail: ${value}`);

assert.equal(analyticsTaggedPages, pages.length, "Every indexable page must have one validated Cloudflare Web Analytics tag");
console.log(`OK: ${pages.length} indexable pages and matching canonical sitemap URLs; ${analyticsTaggedPages} validated Cloudflare Web Analytics tags on indexable pages only; shared navigation on ${htmlFiles.length} HTML files; permanent legacy-route redirects; internal href/src/srcset targets; metadata and canonicals; labelled forms and responsive/accessibility basics; ${destinationCards.length} destination profiles (${destinationImages.size} with unique, identified photos); all destination profiles linked in ${destinationNavGroups.length} category groups; ${expectedCostaBlancaProfiles.length} Costa Blanca profiles and exact rent rows; ${rentalRows.length} static rental rows checked against homepage data and sources across ${rentalRegionCounts.size} regions; ${sharedRentRows.length} shared cost-page rent rows; ${Object.keys(MAPA_FOOD_REGION_DESTINATIONS).length} MAPA food regions / ${MAPA_FOOD_PRODUCTS.length} food indicators; ${DESTINATION_AIRPORTS.size} destination airport mappings; ${climateBlocks.length} climate tables × 12 months; ${DESTINATION_STATIONS.size} climate-station assignments and ${DESTINATION_SEA_TEMPERATURES.size} NOAA/OISST sea cells; ${rentRows.length} dated rental indices; budget arithmetic and invalid-input cases.`);
