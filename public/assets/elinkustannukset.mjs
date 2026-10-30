import {
  calculateRelativeRentIndex,
  normalizeRentalPlaceName,
  readComparisonRentRows,
} from "./rental-index.mjs";

export const NATIONAL_RENT_BENCHMARK = 15.1;
export const RENT_INDEX_PERIOD = "syyskuu 2026";
export const FOOD_PRICE_LEVEL = Object.freeze({ value: 94.9, reference: "EU = 100", year: 2025 });
export const MAPA_FOOD_PERIOD = "1.1.–31.12.2025";
export const MAPA_FOOD_REGIONS = Object.freeze([
  "España", "Comunitat Valenciana", "Región de Murcia", "Andalucía",
]);
export const MAPA_FOOD_REGION_DESTINATIONS = Object.freeze({
  "Comunitat Valenciana": Object.freeze([
    "Alicante / Alacant", "Torrevieja", "Benidorm", "Orihuela Costa", "Guardamar del Segura",
    "Dénia", "Jávea / Xàbia", "Calp / Calpe", "Valencia",
  ]),
  "Región de Murcia": Object.freeze([
    "Cartagena", "Los Alcázares", "San Pedro del Pinatar", "La Manga del Mar Menor",
    "Puerto de Mazarrón", "Águilas", "Murcia",
  ]),
  Andalucía: Object.freeze([
    "Málaga", "Fuengirola", "Almería", "Roquetas de Mar", "Almerimar", "Vera", "Cádiz", "Huelva",
  ]),
});
// Source of truth: MAPA's 2025 annual VALOR and VOLUMEN workbook values.
// Units are thousand euros and thousand physical units, respectively.
export const MAPA_FOOD_PRODUCTS = Object.freeze([
  Object.freeze({
    id: "eggs", name: "Kananmunat", sourceRow: "T.HUEVOS UNDS.", definition: "Kananmunat mitataan kappaleina.", unit: "€/kpl",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 1665346.2317, volumen: 6865713.825 }),
      "Comunitat Valenciana": Object.freeze({ valor: 197225.2387, volumen: 817173.9452 }),
      "Región de Murcia": Object.freeze({ valor: 48693.98298, volumen: 202365.0533 }),
      Andalucía: Object.freeze({ valor: 267157.9398, volumen: 1114535.907 }),
    }),
  }),
  Object.freeze({
    id: "milk", name: "Nestemäinen maito", sourceRow: "TOTAL LECHE LIQUIDA",
    definition: "Nestemäinen lehmän-, vuohen- tai lampaanmaito, myös raakamaito; ei rekonstituoitua maitoa eikä kasvipohjaisia juomia.", unit: "€/l",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 2783491.2, volumen: 2860234 }),
      "Comunitat Valenciana": Object.freeze({ valor: 277357.23, volumen: 280394.22 }),
      "Región de Murcia": Object.freeze({ valor: 78499.222, volumen: 77043.611 }),
      Andalucía: Object.freeze({ valor: 426971.91, volumen: 446621.05 }),
    }),
  }),
  Object.freeze({
    id: "bread", name: "Leipä", sourceRow: "PAN", definition: "Kaikenlainen pakattu tai pakkaamaton leipä.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 3480727.4, volumen: 1288521.55 }),
      "Comunitat Valenciana": Object.freeze({ valor: 384770.84, volumen: 137066.47 }),
      "Región de Murcia": Object.freeze({ valor: 97853.438, volumen: 36559.086 }),
      Andalucía: Object.freeze({ valor: 618629.98, volumen: 233700.34 }),
    }),
  }),
  Object.freeze({
    id: "meat", name: "Liha", sourceRow: "TOTAL CARNE", definition: "Tuore, pakastettu ja prosessoitu liha.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 17646595, volumen: 2019846.9 }),
      "Comunitat Valenciana": Object.freeze({ valor: 1940589, volumen: 229304.25 }),
      "Región de Murcia": Object.freeze({ valor: 510977.87, volumen: 59851.005 }),
      Andalucía: Object.freeze({ valor: 2785755.8, volumen: 337920.82 }),
    }),
  }),
  Object.freeze({
    id: "fish", name: "Kala", sourceRow: "PESCADOS", definition: "Tuore ja pakastettu kala.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 4625444, volumen: 423155.55 }),
      "Comunitat Valenciana": Object.freeze({ valor: 416335.44, volumen: 39008.316 }),
      "Región de Murcia": Object.freeze({ valor: 121182.93, volumen: 11251.2953 }),
      Andalucía: Object.freeze({ valor: 783069.29, volumen: 75177.921 }),
    }),
  }),
  Object.freeze({
    id: "fresh-fruit", name: "Tuoreet hedelmät", sourceRow: "T.FRUTAS FRESCAS", definition: "Tuoreet hedelmät, pakattuna tai irtona.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 8731228.9, volumen: 3821842 }),
      "Comunitat Valenciana": Object.freeze({ valor: 917085.36, volumen: 407235.88 }),
      "Región de Murcia": Object.freeze({ valor: 264904.45, volumen: 117048.568 }),
      Andalucía: Object.freeze({ valor: 1397621.68, volumen: 629119.07 }),
    }),
  }),
  Object.freeze({
    id: "fresh-vegetables", name: "Tuoreet vihannekset", sourceRow: "T.HORTALIZAS FRESCAS",
    definition: "Tuoreet vihannekset pakattuna tai irtona; tuoreet perunat eivät sisälly tähän ryhmään.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 5794030.2, volumen: 2299310.3 }),
      "Comunitat Valenciana": Object.freeze({ valor: 666974.88, volumen: 259170.04 }),
      "Región de Murcia": Object.freeze({ valor: 160333.89, volumen: 66726.639 }),
      Andalucía: Object.freeze({ valor: 909277.57, volumen: 382900.28 }),
    }),
  }),
  Object.freeze({
    id: "legumes", name: "Palkokasvit", sourceRow: "LEGUMBRES",
    definition: "Kuivat ja kypsennetyt palkokasvit, kuten kikherneet, linssit ja pavut.", unit: "€/kg",
    amounts: Object.freeze({
      "España": Object.freeze({ valor: 354738.24, volumen: 162362.99 }),
      "Comunitat Valenciana": Object.freeze({ valor: 34040.856, volumen: 17987.678 }),
      "Región de Murcia": Object.freeze({ valor: 9978.5457, volumen: 5069.2453 }),
      Andalucía: Object.freeze({ valor: 55207.869, volumen: 25950.535 }),
    }),
  }),
]);

export function calculateMapaFoodMetrics(product, region) {
  const selected = product?.amounts?.[region];
  const national = product?.amounts?.España;
  if (!selected || !national || selected.volumen <= 0 || national.volumen <= 0) return null;
  const average = selected.valor / selected.volumen;
  const nationalAverage = national.valor / national.volumen;
  return {
    average,
    index: region === "España" ? 100 : Number(((average / nationalAverage) * 100).toFixed(1)),
  };
}
export const CTMAM_INTERURBAN_SINGLE_FARES = Object.freeze([
  { zoneChanges: 0, euros: 1.6 }, { zoneChanges: 1, euros: 1.75 },
  { zoneChanges: 2, euros: 2.5 }, { zoneChanges: 3, euros: 3.75 },
  { zoneChanges: 4, euros: 6.25 },
]);
export const HUELVA_ORDINARY_SINGLE_FARE = 1.1;

export const AIRPORTS = Object.freeze({
  ALC: { name: "Alicante-Elche Miguel Hernández", url: "https://www.aena.es/en/alicante-elche-miguel-hernandez/airlines-and-destinations/airport-destinations.html" },
  AGP: { name: "Málaga-Costa del Sol", url: "https://www.aena.es/en/malaga-costa-del-sol/airlines-and-destinations/airport-destinations.html" },
  RMU: { name: "Internacional Región de Murcia", url: "https://www.aena.es/es/internacional-region-de-murcia/aerolineas-y-destinos/destinos-del-aeropuerto.html" },
  LEI: { name: "Almería", url: "https://www.aena.es/es/almeria/aerolineas-y-destinos/destinos-del-aeropuerto-de-almeria.html" },
  VLC: { name: "Valencia", url: "https://www.aena.es/es/valencia/aerolineas-destinos/destinos-aeropuerto.html" },
  XRY: { name: "Jerez", url: "https://www.aena.es/en/jerez/airlines-and-destinations/.html" },
  SVQ: { name: "Sevilla", url: "https://www.aena.es/en/sevilla/airlines-and-destinations/airport-destinations.html" },
});

const airportAssignments = [
  ["Alicante / Alacant", ["ALC"]], ["Torrevieja", ["ALC"]], ["Benidorm", ["ALC"]],
  ["Orihuela Costa", ["ALC"]], ["Guardamar del Segura", ["ALC"]], ["Dénia", ["ALC", "VLC"]],
  ["Jávea / Xàbia", ["ALC", "VLC"]], ["Calp / Calpe", ["ALC", "VLC"]],
  ["Málaga", ["AGP"]], ["Fuengirola", ["AGP"]], ["Cartagena", ["RMU"]],
  ["Los Alcázares", ["RMU"]], ["San Pedro del Pinatar", ["RMU"]],
  ["La Manga del Mar Menor", ["RMU"]], ["Puerto de Mazarrón", ["RMU"]], ["Águilas", ["RMU", "LEI"]],
  ["Almería", ["LEI"]], ["Roquetas de Mar", ["LEI"]], ["Almerimar", ["LEI"]],
  ["Vera", ["LEI", "RMU"]], ["Valencia", ["VLC"]], ["Murcia", ["RMU"]],
  ["Cádiz", ["XRY", "SVQ"]], ["Huelva", ["SVQ"]],
];

export const DESTINATION_AIRPORTS = new Map(
  airportAssignments.map(([place, codes]) => [normalizeRentalPlaceName(place), codes]),
);

const sourceLink = (label, url) => Object.freeze({ label, url });
export const DESTINATION_TRANSPORT_LINKS = new Map([
  ["alicantealacant", [sourceLink("Alicanten TAM: kaupunki- ja seutuliikenne", "https://www.alicante.es/es/contenidos/transporte-alicante-metropolitano-tam"), sourceLink("TRAM d’Alacant: reitit ja aikataulut", "https://www.tramalacant.es/")]],
  ["torrevieja", [sourceLink("Torreviejan virallinen liikkumisohje", "https://turismo.torrevieja.es/es/planifica/como-desplazarse"), sourceLink("Kaupungin bussiverkon ajankohtaiset tiedotteet", "https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo")]],
  ["benidorm", [sourceLink("TRAM d’Alacant: reitit ja aikataulut", "https://www.tramalacant.es/")]],
  ["denia", [sourceLink("TRAM d’Alacant: reitit ja aikataulut", "https://www.tramalacant.es/")]],
  ["calpcalpe", [sourceLink("TRAM d’Alacant: reitit ja aikataulut", "https://www.tramalacant.es/")]],
  ["malaga", [sourceLink("Málagan alueen CTMAM-tariffit", "https://ctmam.es/tarifas/"), sourceLink("Kertalipun ehdot ja vaihtojen rajaus", "https://ctmam.es/titulos-de-transporte/"), sourceLink("CTMAM-vyöhykkeet ja palvelualue", "https://ctmam.es/sistema-tarifario/"), sourceLink("Cercanías Málaga: linjat", "https://www.renfe.com/es/es/cercanias/cercanias-malaga/lineas")]],
  ["fuengirola", [sourceLink("Málagan alueen CTMAM-tariffit", "https://ctmam.es/tarifas/"), sourceLink("Kertalipun ehdot ja vaihtojen rajaus", "https://ctmam.es/titulos-de-transporte/"), sourceLink("CTMAM-vyöhykkeet ja palvelualue", "https://ctmam.es/sistema-tarifario/"), sourceLink("Cercanías Málaga: linjat", "https://www.renfe.com/es/es/cercanias/cercanias-malaga/lineas")]],
  ["cartagena", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["losalcazares", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["sanpedrodelpinatar", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["lamangadelmarmenor", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["puertodemazarron", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["aguilas", [sourceLink("Murcian alueen MOVIBUS-liikennetiedot", "https://sede.carm.es/web/pagina?IDCONTENIDO=3749&IDTIPO=240&RASTRO=c%24m40293")]],
  ["almeria", [sourceLink("Almerían kaupungin kaupunkibussit", "https://almeriaciudad.es/autobuses-urbanos"), sourceLink("Surbús: linjat ja reitit", "https://www.surbusalmeria.es/lineas")]],
  ["roquetasdemar", [sourceLink("Almerían alueellinen liikennekonsortio", "https://www.ctal.es/")]],
  ["almerimar", [sourceLink("Almerían alueellinen liikennekonsortio", "https://www.ctal.es/")]],
  ["vera", [sourceLink("Almerían alueellinen liikennekonsortio", "https://www.ctal.es/")]],
  ["valencia", [sourceLink("Metrovalencia: reitit ja lipputiedot", "https://www.metrovalencia.es/")]],
  ["murcia", [sourceLink("Murcian raitiotie: verkko ja liput", "https://www.tranviademurcia.es/"), sourceLink("Murcian kaupunkibussin tariffit", "https://tmurcia.com/informacion-de-lineas/tarifas/")]],
  ["cadiz", [sourceLink("Cádiz: Cercanías", "https://www.renfe.com/es/es/cercanias/cercanias-cadiz"), sourceLink("Cádiz: Trambahía", "https://www.renfe.com/es/es/cercanias/cercanias-cadiz/tranvia-bahia-cadiz")]],
  ["huelva", [sourceLink("EMTUSA: ajantasaiset liput ja tariffit", "https://www.emtusahuelva.com/titulos-de-viaje"), sourceLink("EMTUSA: linjat ja aikataulut", "https://www.emtusahuelva.com/lineas")]],
]);

export function createFlightsSearchUrl(iata, departure, returning) {
  if (!/^[A-Z]{3}$/.test(iata) || !departure || !returning || returning <= departure) return null;
  const query = `Flights from Helsinki (HEL) to ${iata} departing ${departure} returning ${returning}`;
  const params = new URLSearchParams({ hl: "fi", curr: "EUR", q: query });
  return `https://www.google.com/travel/flights?${params.toString()}`;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(label, url) {
  const link = element("a", "cost-source-link", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function formatFoodPrice(value) {
  return value.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function formatFoodIndex(value) {
  return value.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function renderMapaFoodTable(tbody, caption) {
  if (!tbody) return;
  tbody.replaceChildren();
  if (caption) caption.textContent = `MAPA-kotitalousostojen keskihinnat · ${MAPA_FOOD_PERIOD}`;

  for (const product of MAPA_FOOD_PRODUCTS) {
    const row = element("tr");
    row.dataset.productId = product.id;
    row.dataset.sourceRow = product.sourceRow;

    const label = element("th", "", product.name);
    label.scope = "row";
    label.append(element("small", "", `${product.unit} · ${product.sourceRow}`));
    label.append(element("span", "cost-food-definition", product.definition));
    row.append(label);

    for (const region of MAPA_FOOD_REGIONS) {
      const metrics = calculateMapaFoodMetrics(product, region);
      const cell = element("td");
      cell.dataset.average = String(metrics.average);
      cell.dataset.index = formatFoodIndex(metrics.index).replace(",", ".");
      cell.append(element("span", "cost-food-cell-price", `${formatFoodPrice(metrics.average)} ${product.unit}`));
      const indexClass = region === "España" ? "cost-food-cell-index cost-food-baseline" : "cost-food-cell-index";
      cell.append(element("span", indexClass, `${formatFoodIndex(metrics.index)} · Espanja = 100`));
      row.append(cell);
    }
    tbody.append(row);
  }
}

function appendMetric(parent, label, value, detail) {
  const card = element("div", "cost-metric");
  card.append(element("span", "cost-metric__label", label), element("strong", "cost-metric__value", value));
  if (detail) card.append(element("span", "cost-metric__detail", detail));
  parent.append(card);
}

function renderHousing(container, record) {
  container.replaceChildren();
  if (!record) {
    container.append(element("p", "small-note", "Vuokraindeksin lähdetaulukkoa ei saatu luettua. Päivitä sivu tai tarkista lähteistetty vertailu etusivulta."));
    return;
  }
  const grid = element("div", "cost-metrics-grid");
  const relativeIndex = calculateRelativeRentIndex(record.rate, NATIONAL_RENT_BENCHMARK);
  appendMetric(grid, "Valitun Idealista-raporttialueen indeksi", `${record.rate.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} €/m²/kk`, `${record.name} · ${RENT_INDEX_PERIOD}`);
  appendMetric(grid, "Espanjan vertailuarvo", `${NATIONAL_RENT_BENCHMARK.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} €/m²/kk`, `${RENT_INDEX_PERIOD} · koko Espanja`);
  appendMetric(grid, "Suhteellinen vuokraindeksi", relativeIndex === null ? "—" : relativeIndex.toLocaleString("fi-FI", { minimumFractionDigits: 1, maximumFractionDigits: 1 }), "Espanja = 100");
  container.append(grid);
  const method = element("p", "small-note", "Kaava: 100 × kohteen pyyntihintaindeksi / Espanjan pyyntihintaindeksi. Kyseessä ovat vuokrailmoitusten pyyntihinnat, eivät toteutuneet vuokrat tai kalustetun talviasunnon tarjoushinnat. Raporttialue voi olla kunta tai sitä pienempi alue; indeksi ei takaa alueiden täysin samanlaista kattavuutta.");
  const localSource = externalLink(`Idealistan raportti: ${record.name}`, record.sourceUrl);
  const nationalSource = externalLink("Espanjan syyskuun 2026 vertailuraportti", "https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/alquiler/report/");
  method.append(document.createTextNode(" Lähteet: "), localSource, document.createTextNode(" · "), nationalSource, document.createTextNode(". Laskettu indeksi pyöristetään yhteen desimaaliin."));
  container.append(method);
}

function renderTransport(container, record) {
  container.replaceChildren();
  const key = record?.key || "";
  if (key === "malaga" || key === "fuengirola") {
    container.append(element("p", "cost-lead", "Málagan alueen CTMAM-konsortion tavallisen aikuisen kertalippu kaukoliikenteen bussissa määräytyy vyöhykkeiden ylitysten mukaan. Lippu ei ole yleinen kaupungin kuukausikulu eikä yksittäisen matkan hinta ilman reittitietoa."));
    const tableWrap = element("div", "table-wrap cost-fare-table-wrap");
    const table = element("table", "cost-fare-table");
    table.append(element("caption", "", "Yksi matka · kaukoliikenteen bussi · tavallinen tariffi 15.7.–31.12.2026"));
    const thead = element("thead");
    const headerRow = element("tr");
    const zoneHeading = element("th", "", "Vyöhykesiirtymiä");
    zoneHeading.scope = "col";
    const fareHeading = element("th", "", "Kertamaksu");
    fareHeading.scope = "col";
    headerRow.append(zoneHeading, fareHeading);
    thead.append(headerRow);
    const tbody = element("tbody");
    for (const fare of CTMAM_INTERURBAN_SINGLE_FARES) {
      const row = element("tr");
      const zone = element("th", "", String(fare.zoneChanges));
      zone.scope = "row";
      const price = element("td", "", `${fare.euros.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
      row.append(zone, price);
      tbody.append(row);
    }
    table.append(thead, tbody);
    container.append(tableWrap);
    tableWrap.append(table);
    container.append(element("p", "small-note", "CTMAM:n palvelualueeseen kuuluvat sekä Málaga että Fuengirola. Kertalippu maksetaan käteisellä bussiin noustessa, se ei oikeuta vaihtoon, ja vyöhykesiirtymien määrä riippuu reitistä; erikoislinjoilla voi olla eri hinta. Tariffi voimassa 15.7.–31.12.2026. Tarkistettu 29.10.2026."));
  } else if (key === "huelva") {
    container.append(element("p", "cost-lead", `EMTUSA:n tavallinen yleisen matkustajaprofiilin kertalippu Huelvan kaupunkibussissa: ${HUELVA_ORDINARY_SINGLE_FARE.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / matka. Lippu on yhden matkan tuote; tämä ei ole 10 matkan kortin yksikköhinta.`));
    container.append(element("p", "small-note", "EMTUSA merkitsee hinnat voimassa oleviksi hyväksytyiksi tariffeiksi, mutta sivu ei ilmoita hinnan päättymispäivää. Tarkistettu 29.10.2026; tarkista tariffi uudelleen ennen matkaa."));
  } else {
    container.append(element("p", "cost-lead", "Tälle kohteelle ei näytetä numeroarvoa: tavallisen aikuisen kertalipun tuotetta, palvelualueen kattavuutta ja ajantasaista voimassaoloa ei ole tässä vertailussa varmennettu riittävästi."));
    container.append(element("p", "small-note", "Tarkista valitsemasi reitin hinta ja lippuehdot suoraan liikennöitsijältä. Naapurikunnan, eri liikennevälineen tai eri käyttöoikeuden lippua ei käytetä tämän kohteen hintana."));
  }

  const links = DESTINATION_TRANSPORT_LINKS.get(key) || [];
  if (links.length) {
    const list = element("ul", "cost-link-list");
    for (const item of links) {
      const li = element("li");
      li.append(externalLink(item.label, item.url));
      list.append(li);
    }
    container.append(list);
  } else if (key !== "malaga" && key !== "fuengirola" && key !== "huelva") {
    container.append(element("p", "small-note", "Tähän paikallisuuteen kohdistuvaa virallista tariffi- tai reittihakua ei saatu vahvistettua tässä tarkistuksessa."));
  }
}

function renderAirportOptions(container, select, record) {
  container.replaceChildren();
  select.replaceChildren();
  const key = record?.key || "";
  const codes = DESTINATION_AIRPORTS.get(key) || [];
  if (!codes.length) {
    select.disabled = true;
    container.append(element("p", "small-note", "Lentoasemavaihtoehtoa ei ole määritelty."));
    return;
  }
  select.disabled = false;
  for (const code of codes) {
    const airport = AIRPORTS[code];
    const option = element("option", "", `${airport.name} (${code})`);
    option.value = code;
    select.append(option);
    const card = element("article", "airport-option");
    card.append(element("h3", "", `${airport.name} · ${code}`));
    card.append(externalLink("Tarkista lentoaseman reitit Aenasta", airport.url));
    card.append(element("p", "small-note", "Mahdollinen lentoasema sijaintialueen perusteella; ei ensisijaisuus- tai matka-aikaväitettä."));
    container.append(card);
  }
}

if (typeof document !== "undefined") {
  renderMapaFoodTable(document.getElementById("cost-food-rows"), document.getElementById("cost-food-caption"));
  const selector = document.getElementById("cost-destination");
  const airportSelect = document.getElementById("cost-airport");
  const rentOutput = document.getElementById("cost-housing-result");
  const transportOutput = document.getElementById("cost-transport-result");
  const airportOutput = document.getElementById("cost-airport-options");
  const status = document.getElementById("cost-data-status");
  const departure = document.getElementById("cost-departure");
  const returning = document.getElementById("cost-return");
  const flightLink = document.getElementById("cost-flight-search");
  const flightMessage = document.getElementById("cost-flight-status");
  let rentRows = new Map();

  function selectedRecord() {
    return rentRows.get(selector.value) || null;
  }

  function updateFlightSearch() {
    const url = createFlightsSearchUrl(airportSelect.value, departure.value, returning.value);
    if (url) {
      flightLink.href = url;
      flightLink.hidden = false;
      flightMessage.textContent = "Haku avautuu uuteen välilehteen. Hinnat, lentoyhtiöt ja suorat yhteydet riippuvat päivistä, matkatavaroista ja saatavuudesta.";
    } else {
      flightLink.removeAttribute("href");
      flightLink.hidden = true;
      flightMessage.textContent = departure.value && returning.value
        ? "Paluupäivän tulee olla lähtöpäivän jälkeen."
        : "Valitse lähtö- ja paluupäivä, niin saat päivämäärärajatun Helsinki–lentoasema-haun.";
    }
  }

  function updateDestination() {
    const record = selectedRecord();
    renderHousing(rentOutput, record);
    renderTransport(transportOutput, record);
    renderAirportOptions(airportOutput, airportSelect, record);
    updateFlightSearch();
  }

  if (selector && airportSelect && rentOutput && transportOutput && airportOutput && status && departure && returning && flightLink && flightMessage) {
    fetch("/", { headers: { Accept: "text/html" } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const rows = readComparisonRentRows(html);
        rentRows = new Map(rows.map((row) => [row.key, row]));
        if (rows.length !== 24) throw new Error("Vuokraindeksitaulukossa ei ole odotettua 24 kohdetta.");
        status.textContent = "Kohdekohtainen vuokraindeksi on luettu etusivun lähdetaulukosta.";
        selector.disabled = false;
        updateDestination();
      })
      .catch(() => {
        status.textContent = "Vuokraindeksin tietoja ei voitu ladata. Tarkista yhteys tai avaa vertailu etusivulta.";
        selector.disabled = true;
      });

    selector.addEventListener("change", updateDestination);
    airportSelect.addEventListener("change", updateFlightSearch);
    departure.addEventListener("change", () => {
      returning.min = departure.value;
      updateFlightSearch();
    });
    returning.addEventListener("change", updateFlightSearch);
    updateFlightSearch();
  }
}
