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
const expectedDestinations = ["alicante", "torrevieja", "benidorm", "malaga", "fuengirola", "almeria", "valencia", "murcia", "cadiz", "huelva"];
const expectedStations = ["8025", "8019", "6155A", "8416", "6325O", "7178I", "5973", "4642E"];
const expectedRents = new Map([["Alicante / Alacant", "13,9"], ["Torrevieja", "12,7"], ["Benidorm", "17,7"], ["Málaga", "16,5"], ["Fuengirola", "17,2"], ["Almería", "9,4"], ["Valencia", "16,3"], ["Murcia", "9,9"], ["Cádiz", "12,4"], ["Huelva", "10,7"]]);

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
assert.ok(!/google-site-verification/i.test(readFileSync(path.join(publicRoot, "index.html"), "utf8")), "Remove placeholder GSC tokens; add only the real token during setup");

const comparison = readFileSync(path.join(publicRoot, "aluevertailu", "index.html"), "utf8");
for (const destination of expectedDestinations) {
  assert.ok(comparison.includes(`id="${destination}"`), `Missing destination profile: ${destination}`);
}
const destinationCards = [...comparison.matchAll(/<article class="destination-card" id="([^"]+)">([\s\S]*?)<\/article>/g)];
assert.equal(destinationCards.length, expectedDestinations.length, "Each destination needs exactly one profile");
const destinationImages = new Set();
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
  assert.ok(alt && foldText(alt).includes(foldText(destination)), `Alt text must identify ${destination}: ${alt}`);
  assert.ok(/<figcaption>[\s\S]*?href="https:\/\//i.test(figure), `Destination photo needs a linked source credit: ${destination}`);
  assert.ok(/<details class="destination-details">[\s\S]*?<summary\b/.test(card), `Destination profile should keep its longer guidance accessible but collapsed: ${destination}`);
}

const rentalPage = readFileSync(path.join(publicRoot, "vuokraus", "index.html"), "utf8");
const rentEquivalentTable = rentalPage.match(/<table id="vuokraesimerkit">([\s\S]*?)<\/table>/i)?.[1];
assert.ok(rentEquivalentTable, "Missing rent-index equivalent table");
const equivalentRows = [...rentEquivalentTable.matchAll(/<tr data-city="([^"]+)" data-rate="([^"]+)">([\s\S]*?)<\/tr>/g)];
assert.equal(equivalentRows.length, expectedRents.size, "Each city needs one rent-equivalent calculation row");
for (const [, city, rawRate, row] of equivalentRows) {
  const indexValue = expectedRents.get(city);
  assert.ok(indexValue, `Unexpected city in rent-equivalent table: ${city}`);
  const rate = Number(rawRate);
  assert.equal(rate, Number(indexValue.replace(",", ".")), `Rent-index value mismatch for ${city}`);
  for (const [, rawArea, amount] of row.matchAll(/<td data-area="(40|60|80)">([\d\s]+)\s*€/g)) {
    const area = Number(rawArea);
    const displayed = Number(amount.replace(/\s/g, ""));
    assert.equal(displayed, Math.round(rate * area), `Incorrect ${area} m² rent-index illustration for ${city}`);
  }
  assert.equal([...row.matchAll(/<td data-area="(40|60|80)">/g)].length, 3, `Expected 40, 60 and 80 m² illustrations for ${city}`);
}
assert.match(rentalPage, /vertailukelpoista aineistoa kalustetuille 1–6 kuukauden talvivuokrauksille ei ole käytettävissä/i, "Seasonal-rental data limitations must be clear");
assert.match(rentalPage, /ei ole talvikauden vuokrahinta|eivät ole[\s\S]{0,120}talviasuntojen hintoja/i, "The rent table must disclaim actual winter-rent pricing");
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
assert.equal(rentRows.length, expectedRents.size, "Each destination needs one dated rental index value");
for (const [, city, value, source] of rentRows) {
  assert.equal(value, expectedRents.get(city), `Rental index value changed or mismatched for ${city}`);
  assert.ok(source.startsWith("https://www.idealista.com/"), `Rental index needs an Idealista city report for ${city}`);
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

console.log(`OK: ${pages.length} indexable pages; ${sitemapUrls.length} sitemap URLs; internal href/src/srcset targets; metadata and canonicals; labelled forms and responsive/accessibility basics; ${destinationCards.length} destinations with unique, identified photos; ${equivalentRows.length} rent tables with 40/60/80 m² arithmetic; ${climateBlocks.length} climate tables × 12 months; ${rentRows.length} dated rental indices; budget arithmetic and invalid-input cases.`);
