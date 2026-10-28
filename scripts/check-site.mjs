import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateBudget } from "../public/assets/budget.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const canonicalOrigin = "https://espanjan-talvi.pages.dev";
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

function routeFor(filePath) {
  const relative = path.relative(publicRoot, filePath).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

walk(publicRoot);
const pages = htmlFiles.filter((file) => path.relative(publicRoot, file).replaceAll(path.sep, "/") !== "404.html");
const titles = new Set();
const descriptions = new Set();
const canonicalRoutes = new Set();
const expectedDestinations = ["alicante", "torrevieja", "benidorm", "orihuela-costa", "guardamar-del-segura", "denia", "javea-xabia", "calp", "malaga", "fuengirola", "cartagena", "los-alcazares", "san-pedro-del-pinatar", "la-manga-del-mar-menor", "puerto-de-mazarron", "aguilas", "almeria", "roquetas-de-mar", "almerimar", "vera", "valencia", "murcia", "cadiz", "huelva"];
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
  ["orihuela-costa", "https://commons.wikimedia.org/wiki/File:Mediterranean_coastline_of_Cabo_Roig_in_Orihuela_Costa,_Orihuela,_Alicante,_Spain,_2022_January.jpg"],
  ["guardamar-del-segura", "https://unsplash.com/photos/a-sandy-area-with-trees-and-bushes-in-the-foreground-ioeoj6bpoKU"],
  ["denia", "https://unsplash.com/photos/white-boats-on-docking-station-oADsJyngtEs"],
  ["javea-xabia", "https://unsplash.com/photos/an-aerial-view-of-a-beach-and-the-ocean-S9wG2nhlyt8"],
  ["calp", "https://unsplash.com/photos/a-view-of-a-city-with-a-mountain-in-the-background-zgK9I8MEjMY"],
  ["cartagena", "https://unsplash.com/photos/ancient-roman-amphitheater-ruins-under-the-bright-sun-2GGPhORBdVE"],
  ["los-alcazares", "https://commons.wikimedia.org/wiki/File:Los_Alcazares_del_mar_menor.JPG"],
  ["san-pedro-del-pinatar", "https://commons.wikimedia.org/wiki/File:Salinas_y_Arenales_de_San_Pedro_del_Pinatar_-_WLE_Spain_2015.jpg"],
  ["la-manga-del-mar-menor", "https://unsplash.com/photos/green-palm-trees-near-white-and-brown-concrete-building-during-daytime-PlObKBlri-M"],
  ["puerto-de-mazarron", "https://commons.wikimedia.org/wiki/File:Hafen_Pto.d.Mazarron05.JPG"],
  ["aguilas", "https://commons.wikimedia.org/wiki/File:Aguilasmurcia.JPG"],
  ["roquetas-de-mar", "https://unsplash.com/photos/a-view-of-a-body-of-water-next-to-a-beach-1iGPrkOsoeo"],
  ["almerimar", "https://commons.wikimedia.org/wiki/File:PXL_20240126_gale%C3%B3n_Andaluc%C3%ADa_en_Almerimar_12.jpg"],
  ["vera", "https://commons.wikimedia.org/wiki/File:Vista_de_Vera_013.jpg"],
]);
const expectedStations = ["8025", "8019", "6155A", "8416", "6325O", "7178I", "5973", "4642E"];
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

  assert.ok(title, `Missing title: ${route}`);
  assert.ok(description, `Missing meta description: ${route}`);
  assert.ok(canonical, `Missing canonical: ${route}`);
  assert.ok(html.includes('<html lang="fi">'), `Missing Finnish language declaration: ${route}`);
  assert.ok(html.includes('<main id="sisalto">') || html.includes('<main id="sisalto" '), `Missing main landmark: ${route}`);
  assert.ok((html.match(/<h1\b/gi) || []).length === 1, `Expected one h1: ${route}`);
  assert.ok(!titles.has(title), `Duplicate title: ${title}`);
  assert.ok(!descriptions.has(description), `Duplicate description: ${route}`);
  titles.add(title);
  descriptions.add(description);

  const expectedCanonical = new URL(route, canonicalOrigin).href;
  assert.equal(canonical, expectedCanonical, `Canonical does not match route: ${route}`);
  canonicalRoutes.add(expectedCanonical);

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

const sitemap = readFileSync(path.join(publicRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(sitemapUrls.length, canonicalRoutes.size, "Sitemap URL count must match indexable pages");
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "Sitemap must not contain duplicate URLs");
for (const url of sitemapUrls) assert.ok(canonicalRoutes.has(url), `Sitemap URL has no matching page canonical: ${url}`);
for (const canonical of canonicalRoutes) assert.ok(sitemapUrls.includes(canonical), `Indexable page is missing from sitemap: ${canonical}`);

const robots = readFileSync(path.join(publicRoot, "robots.txt"), "utf8");
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), "robots.txt sitemap URL does not match canonical origin");
const homepageHtml = readFileSync(path.join(publicRoot, "index.html"), "utf8");
const verificationMentions = homepageHtml.match(/google-site-verification/gi) || [];
const verificationMetaTags = [...homepageHtml.matchAll(/<meta\b[^>]*>/gi)]
  .filter(([tag]) => /\bname\s*=\s*["']google-site-verification["']/i.test(tag));
assert.equal(verificationMentions.length, verificationMetaTags.length, "Google verification token must appear in a well-formed meta tag");
assert.ok(verificationMetaTags.length <= 1, "Homepage must not contain duplicate Google verification tags");
if (verificationMetaTags.length === 1) {
  const tag = verificationMetaTags[0][0];
  const nameAttributes = [...tag.matchAll(/\bname\s*=\s*(["'])(.*?)\1/gi)];
  const contentAttributes = [...tag.matchAll(/\bcontent\s*=\s*(["'])(.*?)\1/gi)];
  assert.equal(nameAttributes.length, 1, "Google verification meta tag must have exactly one quoted name attribute");
  assert.equal(nameAttributes[0][2].toLowerCase(), "google-site-verification", "Unexpected Google verification meta name");
  assert.equal(contentAttributes.length, 1, "Google verification meta tag must have exactly one quoted content attribute");
  const verificationToken = contentAttributes[0][2];
  assert.match(verificationToken, /^[A-Za-z0-9_-]{20,100}$/, "Google verification token must have a valid token format");
  assert.ok(!/(?:^|[_-])(?:example|placeholder|your|replace|insert|todo|changeme|fake|dummy|sample|test|demo|token|x{3,})(?:$|[_-])/i.test(verificationToken), "Google verification token must not be a placeholder");
}

const comparison = readFileSync(path.join(publicRoot, "aluevertailu", "index.html"), "utf8");
assert.ok(!/10\s+Espanjan talvikohdetta/i.test(comparison), "Comparison title must not retain the outdated ten-destination claim");
assert.ok(!/Kymmenen kaupunkia|Kymmenen erilaista paikkaa/i.test(comparison), "Comparison introduction must not retain the outdated ten-destination claim");
for (const destination of expectedDestinations) {
  assert.ok(comparison.includes(`id="${destination}"`), `Missing destination profile: ${destination}`);
}
const destinationCards = [...comparison.matchAll(/<article class="destination-card" id="([^"]+)">([\s\S]*?)<\/article>/g)];
assert.equal(destinationCards.length, expectedDestinations.length, "Each destination needs exactly one profile");
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
  if (expectedNewPhotoSources.has(destination)) {
    assert.ok(img.includes('width="1400" height="933"'), `New destination photo must declare the 3:2 output size: ${destination}`);
    assert.ok(img.includes(`srcset="/assets/${destination}-700.jpg 700w, /assets/${destination}.jpg 1400w"`), `New destination photo must include its responsive 700px variant: ${destination}`);
  }
  assert.ok(/<details class="destination-details">[\s\S]*?<summary\b/.test(card), `Destination profile should keep its longer guidance accessible but collapsed: ${destination}`);
}
assert.equal(destinationImages.size, expectedDestinations.length, "All 24 destination profiles must have a unique photo");

const rentalPage = readFileSync(path.join(publicRoot, "vuokraus", "index.html"), "utf8");
assert.ok(!/id="vuokraesimerkit"|data-city="|data-rate="/.test(rentalPage), "Rental page must not duplicate the destination rent-index table");
assert.ok(rentalPage.includes('href="/aluevertailu/#vuokrausdata"'), "Rental page must link directly to the destination rent-index section");
assert.match(rentalPage, /Idealistan vuokrailmoitusindeksi[\s\S]{0,180}alustavaan alueiden väliseen vertailuun/i, "Rental page must explain the indicative use of the rent index");
assert.match(rentalPage, /indeksit eivät ole toteutuneita vuokria[\s\S]{0,160}talvivuokrauksille ei ole käytettävissä/i, "Rental page must distinguish asking-price indices from seasonal rent");
assert.match(rentalPage, /vertailukelpoista aineistoa kalustetuille 1–6 kuukauden talvivuokrauksille ei ole käytettävissä/i, "Seasonal-rental data limitations must be clear");
assert.match(rentalPage, /indeksi ei ole talvikauden vuokrahinta|indeksit eivät ole[\s\S]{0,120}talvivuokrauksille/i, "Rental page must disclaim actual winter-rent pricing");
assert.ok(rentalPage.includes('href="/budjetti/"') && rentalPage.includes('href="/aluevertailu/"'), "Rental page must link to budget and destination planning");

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

const rentTable = comparison.match(/<caption>Idealista:[\s\S]*?<\/table>/i)?.[0];
assert.ok(rentTable, "Missing dated Idealista rental index table");
const rentRows = [...rentTable.matchAll(/<tr>\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)];
assert.equal(rentRows.length, expectedComparisonRents.size, "Each destination needs one dated rental index value");
for (const [, city, value, source] of rentRows) {
  assert.equal(value, expectedComparisonRents.get(city), `Rental index value changed or mismatched for ${city}`);
  assert.equal(source, expectedComparisonSources.get(city), `Unexpected Idealista report for ${city}`);
}
const costaBlancaRentBody = rentTable.match(/<tbody><tr><th scope="rowgroup" colspan="3">Costa Blanca<\/th><\/tr>([\s\S]*?)<\/tbody>/)?.[1] || "";
const costaBlancaRentRows = [...costaBlancaRentBody.matchAll(/<tr>\s*<th scope="row">([^<]+)<\/th>\s*<td>([^<]+)<\/td>\s*<td><a href="([^"]+)"/g)];
assert.equal(costaBlancaRentRows.length, expectedCostaBlancaRents.size, "Costa Blanca must have exactly eight approved rental-index rows");
for (const [, city, value, source] of costaBlancaRentRows) {
  assert.equal(value, expectedCostaBlancaRents.get(city), `Costa Blanca rental-index value changed or mismatched for ${city}`);
  assert.equal(source, expectedComparisonSources.get(city), `Unexpected Costa Blanca Idealista report for ${city}`);
}
assert.ok(/syyskuu 2026/i.test(rentTable), "Rental index must retain its publication month");

const styles = readFileSync(path.join(publicRoot, "assets", "site.css"), "utf8");
assert.ok(/@media\s*\(max-width:\s*760px\)/.test(styles), "Missing mobile layout breakpoint");
assert.ok(/\.table-wrap\s*\{[^}]*overflow-x:\s*auto/s.test(styles), "Wide tables must be horizontally scrollable on narrow screens");
assert.ok(/\.destination-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s.test(styles), "Destination cards need a bounded two-column desktop grid");
assert.ok(/@media\s*\(max-width:\s*760px\)[\s\S]*?\.destination-list\s*\{\s*grid-template-columns:\s*1fr;/s.test(styles), "Destination cards must stack on mobile to avoid page overflow");
assert.ok(/\.destination-photo img\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2;[^}]*object-fit:\s*cover;/s.test(styles), "Destination images need a consistent responsive crop");
assert.ok(/\.article-layout\s*>\s*\*\s*\{\s*min-width:\s*0;\s*\}/s.test(styles), "Article grid items must not expand the page around wide comparison tables");
assert.ok(/\.table-wrap\s*\{[^}]*overflow-x:\s*auto/s.test(styles), "Wide comparison tables must scroll inside their own container");
assert.ok(/prefers-reduced-motion:\s*reduce/.test(styles), "Respect reduced-motion preferences");

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

console.log(`OK: ${pages.length} indexable pages; ${sitemapUrls.length} sitemap URLs; internal href/src/srcset targets; metadata and canonicals; labelled forms and responsive/accessibility basics; ${destinationCards.length} destination profiles (${destinationImages.size} with unique, identified photos); all destination profiles linked in ${destinationNavGroups.length} category groups; ${expectedCostaBlancaProfiles.length} Costa Blanca profiles and exact rent rows; no duplicate rent-index table on rental page; ${climateBlocks.length} climate tables × 12 months; ${rentRows.length} dated rental indices; budget arithmetic and invalid-input cases.`);
