export function normalizeRentalPlaceName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fi")
    .replace(/[^a-z0-9]/g, "");
}

function decodeHtmlText(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Read the existing homepage Idealista table instead of maintaining rent values a second time. */
export function readComparisonRentRows(html) {
  const sourceTable = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)]
    .map(([table]) => table)
    .find((table) => /<caption>\s*Idealista:/i.test(table));
  if (!sourceTable) return [];

  const records = [];
  for (const [, body] of sourceTable.matchAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi)) {
    const region = decodeHtmlText(body.match(/<th\s+scope="rowgroup"[^>]*>([^<]+)<\/th>/i)?.[1]?.trim() || "");
    if (!region) continue;

    const rowPattern = /<tr\b[^>]*>\s*<th\s+scope="row"[^>]*>([^<]+)<\/th>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>\s*<a\s+href="([^"]+)"/gi;
    for (const [, rawName, rawRate, sourceUrl] of body.matchAll(rowPattern)) {
      const name = decodeHtmlText(rawName.trim());
      const rate = Number(rawRate.trim().replace(",", "."));
      if (!name || !Number.isFinite(rate) || rate <= 0) continue;
      records.push({ name, key: normalizeRentalPlaceName(name), region, rate, sourceUrl });
    }
  }
  return records;
}

export function calculateRelativeRentIndex(localRate, nationalRate) {
  const local = Number(typeof localRate === "string" ? localRate.replace(",", ".") : localRate);
  const national = Number(typeof nationalRate === "string" ? nationalRate.replace(",", ".") : nationalRate);
  if (!Number.isFinite(local) || local <= 0 || !Number.isFinite(national) || national <= 0) return null;
  return Math.round((100 * local / national) * 10) / 10;
}

export function rentalRowsForRegion(rows, region) {
  return region === "all" ? [...rows] : rows.filter((row) => row.dataset.rentalRegion === region);
}

if (typeof document !== "undefined") {
  const filter = document.getElementById("rental-region-filter");
  const table = document.getElementById("rental-index-table");
  const status = document.getElementById("rental-index-status");

  if (filter && table && status) {
    const rows = [...table.querySelectorAll("tbody tr[data-rental-region]")];
    filter.addEventListener("change", () => {
      const visibleRows = new Set(rentalRowsForRegion(rows, filter.value));
      for (const row of rows) row.hidden = !visibleRows.has(row);

      if (filter.value === "all") {
        status.textContent = `Näytetään kaikki ${visibleRows.size} kohdetta.`;
      } else {
        const region = filter.selectedOptions[0]?.textContent.trim() || "valitulta alueelta";
        status.textContent = `Näytetään ${visibleRows.size} kohdetta alueelta ${region}.`;
      }
    });
  }
}
