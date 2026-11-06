import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID, DESTINATION_RECORDS_BY_ID, DESTINATION_REGIONS } from "../public/assets/destinations.mjs";
import { DESTINATION_SCORE_RECORDS_BY_ID } from "../public/assets/destination-scores.mjs";
import { AIRPORTS, DESTINATION_AIRPORTS } from "../public/assets/elinkustannukset.mjs";
import { normalizeRentalPlaceName } from "../public/assets/rental-index.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const canonicalOrigin = "https://espanjan-talvi.netlify.app";
const checkedOn = "6.11.2026";

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function textFromHtml(value) {
  return value.replace(/<[^>]*>/g, "").replaceAll("&amp;", "&").replaceAll("&nbsp;", " ").replaceAll("&#39;", "'").replaceAll("&quot;", '"').trim();
}

function readAnalyticsToken() {
  const home = readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const match = home.match(/data-cf-beacon='\{"token":\s*"([^"']+)"\}'/);
  assert.ok(match?.[1], "Cannot reuse the existing Cloudflare Web Analytics token from homepage HTML");
  return match[1];
}

function getDestinationCatalog() {
  const home = readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const headingById = new Map(DESTINATION_REGIONS.map(({ headingId, id, name }) => [headingId, { id, name }]));
  const regionHeadings = [...home.matchAll(/<h2\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
    .filter(([, headingId]) => headingById.has(headingId))
    .map((match) => ({ index: match.index, region: headingById.get(match[1]) }));
  const destinations = [...home.matchAll(/<article class="destination-card" id="([a-z0-9-]+)">([\s\S]*?)<\/article>/g)].map(([, id, card], index, cards) => {
    const region = [...regionHeadings].reverse().find(({ index: headingIndex }) => headingIndex < cards[index].index)?.region;
    const name = textFromHtml(card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] || "");
    assert.ok(region && name, `Missing current homepage identity or region for ${id}`);
    const baseRecord = DESTINATION_RECORDS_BY_ID.get(id);
    const contentRecord = DESTINATION_PROFILE_CONTENT_RECORDS_BY_ID.get(id);
    const scoreRecord = DESTINATION_SCORE_RECORDS_BY_ID.get(id);
    const profileRecord = baseRecord || contentRecord;
    assert.ok(profileRecord && scoreRecord, `Missing destination or assessment data for ${id}`);
    const walkability = scoreRecord.assessments.find(({ categoryId }) => categoryId === "walkability");
    const transit = scoreRecord.assessments.find(({ categoryId }) => categoryId === "public-transport");
    const transportClaim = profileRecord.claims?.find(({ categoryId }) => categoryId === "public-transport");
    assert.ok(walkability && transit, `Missing approved walkability or public transport assessment for ${id}`);
    const airportName = id === "alicante" ? "Alicante / Alacant" : name;
    const airportCodes = DESTINATION_AIRPORTS.get(normalizeRentalPlaceName(airportName));
    assert.ok(airportCodes?.length, `No mapped practical airport candidate for ${id}`);
    for (const code of airportCodes) assert.ok(AIRPORTS[code], `Unknown airport code ${code} for ${id}`);
    const transportSources = [...new Set([
      ...(transportClaim?.sources || []),
      ...transit.sources,
    ])];
    assert.ok(transportSources.length, `No verifiable transport sources for ${id}`);
    return {
      id,
      name,
      slug: id,
      regionId: region.id,
      regionName: region.name,
      walkability,
      transit,
      transportClaim,
      airportCodes,
      transportSources,
    };
  });
  assert.equal(destinations.length, 24, "Current homepage must list all 24 existing destinations");
  assert.equal(new Set(destinations.map(({ id }) => id)).size, 24, "Destination IDs must be unique");
  return destinations;
}

function breadcrumbs(items) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({ "@type": "ListItem", position: index + 1, name, item: url })),
  });
}

function renderHead({ title, description, route, breadcrumb }) {
  const canonical = `${canonicalOrigin}${route}`;
  const jsonLd = breadcrumbs(breadcrumb);
  const token = readAnalyticsToken();
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
    <script type="application/ld+json">${jsonLd}</script>
    <!-- Cloudflare Web Analytics -->
    <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script>
    <!-- End Cloudflare Web Analytics -->
  </head>`;
}

function renderHeader(activeHref) {
  const links = [["/", "Vertaa"], ["/kohteet/", "Kohteet"], ["/vuokraus/", "Vuokraus"], ["/budjetti/", "Budjetti"], ["/elinkustannukset/", "Elinkustannukset"], ["/talvehtiminen-espanjassa/", "Talvehtimisen opas"], ["/palvelut-ja-linkit/", "Palvelut ja linkit"]];
  return `<a class="skip-link" href="#sisalto">Siirry sisältöön</a><header class="site-header"><a class="brand" href="/" aria-label="Espanjan talviarki – etusivu"><span class="brand-mark" aria-hidden="true">ET</span><span>Espanjan<br>talviarki</span></a><nav class="site-nav" aria-label="Päänavigaatio">${links.map(([href, label]) => `<a href="${href}"${href === activeHref ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav></header>`;
}

function renderFooter() {
  return `<footer class="site-footer"><a class="footer-brand" href="/">Espanjan talviarki</a><p>Suunnitteluapua pidempään talveen — lähteet näkyviin, oletukset erilleen faktoista.</p><nav aria-label="Alatunniste"><a href="/toimitusperiaatteet/">Tietoa ja toimitusperiaatteet</a><a href="/tietosuoja/">Tietosuoja</a></nav><p class="footer-meta">Liikennelähteet tarkistettu ${checkedOn}. Reitit, aikataulut ja lentoaseman yhteydet on tarkistettava ennen matkaa.</p></footer>`;
}

function renderBreadcrumbs(name) {
  return `<nav class="breadcrumbs" aria-label="Murupolku"><a href="/">Etusivu</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(name)}</span></nav>`;
}

function renderScore(assessment, label) {
  if (assessment.score === null || assessment.score === undefined) return `<span aria-label="${escapeHtml(label)}: ei arvioitu">Ei arvioitu</span>`;
  return `<span aria-label="${escapeHtml(label)}: ${escapeHtml(assessment.score.toLocaleString("fi-FI", { maximumFractionDigits: 1 }))} viidestä">${escapeHtml(assessment.score.toLocaleString("fi-FI", { maximumFractionDigits: 1 }))}/5</span>`;
}

function renderTransportSources(destination) {
  return `<ul class="destination-source-links">${destination.transportSources.map((url) => `<li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(new URL(url).hostname.replace(/^www\./, ""))}</a></li>`).join("")}</ul>`;
}

function renderAirportOptions(destination) {
  return destination.airportCodes.map((code) => {
    const airport = AIRPORTS[code];
    return `<a href="${escapeHtml(airport.url)}" rel="noopener" title="Avaa lentoaseman kohdelista">${escapeHtml(airport.name)} (${escapeHtml(code)})</a>`;
  }).join("<br>");
}

function renderCarFreeGuide(destinations) {
  const route = "/espanja-ilman-autoa/";
  const title = "Espanja ilman autoa talvella – 24 kohteen vertailu | Espanjan talviarki";
  const description = "Vertaa 24 Espanjan talvikohteen käveltävyyttä, joukkoliikennettä, palvelujen sijaintia ja lentoasemavaihtoehtoja. Arvioi myös oma vuokraosoitteesi.";
  const canonical = `${canonicalOrigin}${route}`;
  const breadcrumb = [{ name: "Etusivu", url: `${canonicalOrigin}/` }, { name: "Espanja ilman autoa talvella", url: canonical }];
  const rows = destinations.map((destination) => {
    const claim = destination.transportClaim;
    const claimStatement = claim?.statement;
    const transportNote = claim
      ? `<p>${escapeHtml(claimStatement)}</p><p class="small-note">${escapeHtml(claim.geographicScope)}</p>`
      : `<p>Arvioi paikallisliikenne kohteen omista lähteistä ja tarkista, miten yhteydet vastaavat suunnittelemaasi arkea.</p>`;
    return `<tr><th scope="row"><a href="/kohteet/${escapeHtml(destination.slug)}/">${escapeHtml(destination.name)}</a><span class="small-note">${escapeHtml(destination.regionName)}</span></th><td>${renderScore(destination.walkability, "Käveltävyys")}</td><td>${renderScore(destination.transit, "Julkinen liikenne")}</td><td>${transportNote}${renderTransportSources(destination)}</td><td>${renderAirportOptions(destination)}</td></tr>`;
  }).join("");
  return `${renderHead({ title, description, route, breadcrumb })}
  <body>
    ${renderHeader(route)}
    <main id="sisalto" class="article-shell article-shell-wide">
      ${renderBreadcrumbs("Espanja ilman autoa talvella")}
      <header class="page-heading"><p class="eyebrow">Liikkuminen · 24 talvikohdetta</p><h1>Espanja ilman autoa talvella: vertaa paikkakuntia ja tarkista osoite</h1><p class="lede">Autoton talviarki ei ratkea sillä, onko kaupungissa bussi tai juna. Ratkaisevaa on, pääsetkö juuri harkitsemastasi asunnosta kauppaan, terveyspalveluihin ja sinulle tärkeisiin paikkoihin ympäri vuoden.</p><p class="page-date">Kohdearviot ja lähteet tarkistettu ${checkedOn}</p></header>
      <div class="article-layout"><article class="prose">
        <section id="miten-vertailu-toimii"><p class="eyebrow">Näin käytät vertailua</p><h2>Kaksi eri arviota, ei yhtä autottomuuspistettä</h2><p>Alla olevat käveltävyyden ja julkisen liikenteen tähdet ovat sivuston aiemmin hyväksyttyjä toimituksellisia arvioita. Ne eivät ole uusi laskelma, reittitiheysmittaus tai lupaus siitä, että kohteessa pärjää autotta. Arviot pidetään erillisinä: kävelyyn liittyvä yleisarvio ei korvaa bussin, junan tai raitiotien tarkastelua.</p><p>Kohteiden maantiede vaihtelee. Taulukossa voi olla kokonainen kunta, kaupunki, rannikkoalue tai hajautuneiden asuinalueiden kokonaisuus. Liikennetiedon aluerajaus kertoo, mitä lähde kuvaa. Se ei todista yhteyttä jokaiselta vuokra-asunnolta.</p><p>Taulukon lentoasemat ovat nykyisen kohdeaineiston käytännöllisiksi ehdokkaiksi merkitsemiä kenttiä. Ne eivät ole automaattisesti lähimmät kentät tai osoitekohtainen kuljetussuositus.</p></section>
        <section id="vertailu"><p class="eyebrow">24 kohdetta · viisi aluetta</p><h2>Käveltävyys, paikallisliikenne ja lentoasemavaihtoehdot</h2><div class="table-wrap" role="region" tabindex="0" aria-label="24 talvikohteen käveltävyys-, joukkoliikenne- ja lentoasemavertailu"><table><caption>Toimitukselliset tähtiarviot ja nykyisiin kohdetietoihin tallennetut liikennelähteet. Käytä näitä aloituspisteenä, älä osoitekohtaisena palvelutakuuna.</caption><thead><tr><th scope="col">Kohde</th><th scope="col">Käveltävyys</th><th scope="col">Julkinen liikenne</th><th scope="col">Liikennehuomio ja lähteet</th><th scope="col">Aineistoon merkityt lentoasemat</th></tr></thead><tbody>${rows}</tbody></table></div><p class="small-note">Tähtien asteikko ja rajaukset on kuvattu kunkin kohdeprofiilin arvio-osiossa. Arviot tarkistettu 1.11.2026; alla olevat liikenneväitteet ja lähdelinkit tulevat kohteiden yhteisestä sisältöaineistosta, jonka tarkistuspäivät näkyvät profiileissa.</p></section>
        <section id="lento-suomesta"><p class="eyebrow">Saapuminen Suomesta</p><h2>Reitti ja viimeinen siirtymä ovat kaksi eri asiaa</h2><p>Finavian talvikauden 2026–2027 reittilistassa Helsingin lentoaseman kohteisiin kuuluvat Alicante (ALC) ja Málaga (AGP), ja Tampere-Pirkkalan listalla on Málaga. Finavia ilmoittaa kohteet varmistetuiksi 8.10.2026. Tämä on tarkistushetken reittilista, ei takuu tietyn päivän yhteydestä; tarkista lennon saatavuus suoraan lentoyhtiöltä.</p><p>Kaikkien kohteiden lentoasemakandidaatit ja lentoasemien omat kohdelistat näkyvät taulukossa. Matkaa suunnitellessa laske erikseen lento, kentältä kaupunkiin pääsy ja viimeinen osuus asemalta asuntoon. Aikainen tai myöhäinen saapuminen, matkatavarat, esteettömyys ja talvikauden liikennöintipäivät voivat muuttaa järkevintä vaihtoehtoa.</p><p>Lähde: <a href="https://www.finavia.fi/fi/uutishuone/2026/reittilistaus-minne-finavian-lentoasemilta-voi-lentaa-talvikaudella-2026-2027">Finavian talvikauden 2026–2027 reittilista</a>. Se ei sisällä charter-lentoja ja reitit voivat muuttua.</p></section>
        <section id="osoitetesti"><p class="eyebrow">Ennen asuntopäätöstä</p><h2>Tee sama kuuden kohdan testi jokaiselle osoitteelle</h2><ol class="numbered-list"><li>Merkitse karttaan tarkka sisäänkäynti, ruokakauppa, apteekki ja sinulle tärkeät terveys- tai asiointipalvelut.</li><li>Tarkista kävelyreitti maaston, jalkakäytävien, ylitysten ja mahdollisten esteiden kannalta, ei vain linnuntie-etäisyys.</li><li>Etsi virallisesta reittihausta matka asuntoalueelta keskustaan, palveluun ja lähimmälle asemalle. Tarkista arkipäivä, viikonloppu ja matkustuskuukausi erikseen.</li><li>Varmista liikennöitsijältä vuorojen liikennöintipäivät, vaihtotarve, häiriöilmoitukset ja paluuvuoro. Vanha kartta ei todista nykyistä palvelua.</li><li>Tarkista, ovatko lähialueen kaupat, terveyspalvelut ja muut sinulle tärkeät paikat avoinna talvikaudella.</li><li>Laske taksi tai satunnainen autonvuokra varavaihtoehtona. Älä oleta, että paikallisliikenne kattaa päiväretket tai matkat matkatavaroiden kanssa.</li></ol><p>Jos arjen perusmatka ei toimi kävellen tai julkisella liikenteellä itsellesi sopivaan aikaan, lähde siitä, että auto tai muu varajärjestely voi olla tarpeen. Tämä on oman osoite- ja aikataulutarkistuksen tulos, ei kaupungille annettava yleinen tähtiluokitus.</p></section>
        <section id="jatka"><p class="eyebrow">Seuraava askel</p><h2>Rajaa vaihtoehdot ja tarkista oma suunnitelma</h2><p><a href="/#comparison-app">Vertaa kaikki 24 kohdetta etusivun työkalussa</a>, avaa <a href="/kohteet/">kohdehakemisto</a> ja lue kiinnostavan paikan <a href="/kohteet/torrevieja/">Torreviejan profiilin</a> tai muun kohdeprofiilin lähteet. Ennen sitoutumista käy läpi <a href="/vuokraus/">vuokrauksen tarkistuslista</a> ja lisää omat matkakulusi <a href="/budjetti/">budjettilaskuriin</a>.</p></section>
        <section class="source-list"><h2>Lähteet ja rajaukset</h2><ul><li><a href="https://www.finavia.fi/fi/uutishuone/2026/reittilistaus-minne-finavian-lentoasemilta-voi-lentaa-talvikaudella-2026-2027">Finavia: talvikauden 2026–2027 reitit</a></li><li><a href="https://www.aena.es/fi/alicante-elche-miguel-hernandez/index.html">Aena: Alicante-Elche Miguel Hernández</a></li><li><a href="https://www.aena.es/en/malaga-costa-del-sol/index.html">Aena: Málaga-Costa del Sol</a></li><li><a href="/toimitusperiaatteet/">Kohteiden lähteet ja toimitusperiaatteet</a></li></ul><p class="small-note">Kaupunkien tähtiarviot ovat nykyisen aineiston mukaisia; niitä ei ole laskettu yhteen, muutettu tai järjestetty uudelleen. Reitit ja palvelut on tarkistettava matkapäivälle sekä vuokra-asunnon tarkasta osoitteesta.</p></section>
      </article><aside class="article-rail"><p class="eyebrow">Tässä oppaassa</p><ol><li><a href="#miten-vertailu-toimii">Näin vertaat</a></li><li><a href="#vertailu">24 kohdetta</a></li><li><a href="#lento-suomesta">Lennot ja kentät</a></li><li><a href="#osoitetesti">Osoitetesti</a></li><li><a href="#jatka">Jatka suunnittelua</a></li></ol><div class="rail-card"><span class="note-kicker">Vertailu</span><p>Vertaa ilmastoa ja vuokran ilmoitusindeksiä erikseen.</p><a href="/#comparison-app">Avaa etusivun työkalu <span aria-hidden="true">↗</span></a></div></aside></div>
    </main>${renderFooter()}
  </body>
</html>`;
}

function renderAlicanteTorreviejaGuide() {
  const route = "/alicante-vai-torrevieja/";
  const title = "Alicante vai Torrevieja talvella? Arjen vertailu | Espanjan talviarki";
  const description = "Alicante vai Torrevieja 1–6 kuukauden talveen? Vertaa kaupunkirakennetta, palveluja, joukkoliikennettä, lentoasemaa ja asunnon sijaintia.";
  const canonical = `${canonicalOrigin}${route}`;
  const breadcrumb = [{ name: "Etusivu", url: `${canonicalOrigin}/` }, { name: "Alicante vai Torrevieja?", url: canonical }];
  return `${renderHead({ title, description, route, breadcrumb })}
  <body>
    ${renderHeader("")}
    <main id="sisalto" class="article-shell article-shell-wide">
      ${renderBreadcrumbs("Alicante vai Torrevieja?")}
      <header class="page-heading"><p class="eyebrow">Costa Blanca · päätösopas</p><h1>Alicante vai Torrevieja talvella? Valitse arki, älä vain rantaa</h1><p class="lede">Molemmat voivat sopia pidempään oleskeluun, mutta arjen mittakaava on erilainen. Alicante on suuri kaupunki, Torrevieja rannikkokaupunki, jonka palvelut ja etäisyydet vaihtelevat keskustan ja asuinalueiden välillä.</p><p class="page-date">Liikennetiedot tarkistettu ${checkedOn}</p></header>
      <div class="article-layout"><article class="prose">
        <section><p>Jos suunnittelet yhtä talvea tai usean kuukauden oleskelua, ratkaiseva kysymys ei ole kumpi kaupunki on yleisesti “parempi”. Mieti, millaiset tavalliset viikot haluat: kuljetko useisiin kaupunginosiin, haluatko kävellä useimpiin asioihin, tarvitsetko paikallisbussia tai aiotko tehdä paljon retkiä.</p><p>Alla on itsenäinen päätösopas. <a href="/#alicante-vai-torrevieja">Etusivun vertailutyökalu</a> pysyy kaikkien 24 kohteen ilmasto- ja vuokramittareiden paikkana; tällä sivulla keskitytään näiden kahden vaihtoehdon arjen eroihin.</p></section>
        <section id="pikaero"><p class="eyebrow">Pikaero</p><h2>Alicante tarjoaa kaupunkiverkon, Torrevieja rannikkokaupungin rytmin</h2><div class="table-wrap" role="region" tabindex="0" aria-label="Alicanten ja Torreviejan talviarjen vertailu"><table><thead><tr><th scope="col">Mieti tätä</th><th scope="col">Alicante</th><th scope="col">Torrevieja</th></tr></thead><tbody><tr><th scope="row">Ympäristö</th><td>Varsinainen aluekeskus, jossa asuinalueiden ja palvelujen mittakaava on kaupunkimainen.</td><td>Rannikkokaupunki; keskusta, satama, rannat ja laajat asuinalueet ovat eri sijainteja.</td></tr><tr><th scope="row">Kävelyarki</th><td>Keskusta ja Postiguetin ympäristö ovat eri kokonaisuus kuin Playa de San Juan. Tarkista oma lähtöosoite.</td><td>Keskusta ja keskeiset rannat voivat olla käveltäviä valitusta osoitteesta; etäiset urbanisaatiot vaativat reittitarkistuksen.</td></tr><tr><th scope="row">Joukkoliikenne</th><td>Kaupungin tieto listaa C6-lentoasemabussin sekä bussi- ja TRAM-yhteyksiä.</td><td>Kaupunkibusseja on; omaa rautatieasemaa ei ole. Linjojen 1, 2 ja 8 muutokset tulivat voimaan 2.11.2026.</td></tr><tr><th scope="row">Lentoasema</th><td>Alicante-Elche on kaupungin oma lentoasemavaihtoehto; C6-yhteys yhdistää lentoaseman kaupunkialueeseen.</td><td>Alicante-Elche on aineiston käytännöllinen lentoasemakandidaatti. Tarkista lentokentältä edelleen kaupungin perillemenoyhteys.</td></tr><tr><th scope="row">Asunnon valinta</th><td>Valitse kaupunginosa suhteessa työ-/asiointitarpeeseen, rantaan ja käytettävään pysäkkiin.</td><td>Varmista, että valitsemasi urbanisaatio ja vuokraosoite sopivat omaan bussin, kävelyn tai taksin käyttöön.</td></tr><tr><th scope="row">Retket</th><td>Juna-, raitiotie- ja bussiverkot tarjoavat useita suunnitteluvaihtoehtoja; reitti ja vaihtotarve tarkistetaan kohde kerrallaan.</td><td>Alueelliset bussiyhteydet voivat toimia, mutta suoraa rautatieasemaa ei ole; arvioi yhteys jokaista retkeä varten.</td></tr></tbody></table></div></section>
        <section id="kaupunki"><p class="eyebrow">Kaupunkirakenne ja palvelut</p><h2>Arvioi missä palvelut ovat suhteessa asuntoon</h2><p>Alicanten etu on vaihtoehtojen määrä: sen kaupunkiliikenteen järjestelmiin kuuluvat bussi ja raitiotie, ja kaupungin matkailusivusto luettelee lentoaseman C6-bussiyhteyden. Se ei tarkoita, että jokainen vuokra-asunto olisi lähellä pysäkkiä tai että kaikki kaupunginosat olisivat samanlaisia. Keskustan, sataman, Postiguetin ja San Juanin välinen sijainti muuttaa tavallisen päivän reittejä.</p><p>Torreviejassa talviarki voi olla kävelyn kannalta sujuva keskustassa tai rannan lähellä, mutta kunnan alueeseen kuuluu myös etäämpiä asuinalueita. Pysäkin tai ruokakaupan läheisyys kannattaa tarkistaa kartalta ja operaattorin reittihausta täsmällisellä osoitteella. Älä päättele palvelua siitä, että kohteessa ylipäätään on kaupunkibusseja.</p></section>
        <section id="liikenne"><p class="eyebrow">Ilman autoa</p><h2>Paikallisverkko ja osoite ratkaisevat</h2><p>Alicanten kaupungin julkisen liikenteen ohje listaa C6-yhteyden lentoasemalta sekä kaupunki- ja raitiotieverkkoja. <a href="https://alicanteturismo.com/en/public-transport/">Tarkista kaupungin liikenneohjeesta</a> omalle matkustuspäivällesi reitit ja palvelut. Torreviejan kaupunki ilmoitti lokakuussa, että linjojen 1 ja 2 reitit yhdistävät tietyt eteläiset asuinalueet keskustaan ilman sairaalan vaihtoa ja linja 8 sai muuttuneen reitin; muutokset tulivat voimaan 2.11.2026. Tarkista käyttöpäivän vuorot <a href="https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo">kunnan tiedotteesta</a> ja <a href="https://turismo.torrevieja.es/es/planifica/como-desplazarse">matkailusivun liikkumisohjeesta</a>.</p><p>Yhteys voi olla olemassa mutta silti epäkäytännöllinen, jos asunnolta on pitkä matka pysäkille, vuoro ei kulje sopivaan aikaan tai reitti vaatii vaihtoja. Tee <a href="/espanja-ilman-autoa/">sama osoitetesti myös muille 22 kohteelle</a> ennen päätöstä.</p></section>
        <section id="talvikuukaudet"><p class="eyebrow">1–6 kuukauden oleskelu</p><h2>Talviasunnossa sijainti ja sopimus ovat erillisiä kysymyksiä</h2><p>Lyhyt talviloma voi painottua rantaan ja ravintoloihin. Kuukausien mittaisessa oleskelussa mukaan tulevat ruokakauppa, apteekki, mahdolliset terveyspalvelut, työrauha, lämmitys, internet sekä yhteys niihin paikkoihin, joissa asioit viikoittain. Alicante tarjoaa kaupunkimaisia aluevaihtoehtoja; Torreviejassa kannattaa punnita keskusta ja rannikkoalueet asunnon osoitteen mukaan.</p><p>Talvikauden kalustetut vuokrahinnat vaihtelevat päivien, sopimuksen pituuden, talon varustelun ja kulujen mukaan. Sivuston Idealista €/m²-mittari kuvaa pitkäaikaisten ilmoitusten pyyntihintaa, ei kalustettua sesonkivuokraa. Käytä <a href="/vuokraus/">vuokrauksen kysymyslistaa</a> kirjallisten tarjousten vertailuun ja syötä vain omat vahvistetut kulusi <a href="/budjetti/">budjettilaskuriin</a>.</p></section>
        <section id="valitse"><p class="eyebrow">Päätöskehikko</p><h2>Kumpi voi sopia sinun talveesi?</h2><div class="comparison-grid"><article class="comparison-column"><span class="card-index">Alicante</span><h3>Harkitse, jos…</h3><ul><li>haluat varsinaisen kaupungin palveluja ja useampia liikennemuotoja;</li><li>aiot liikkua kaupunginosien tai lähialueen välillä;</li><li>lentoaseman ja keskustan yhteys on tärkeä osa matkasuunnitelmaa.</li></ul></article><article class="comparison-column"><span class="card-index">Torrevieja</span><h3>Harkitse, jos…</h3><ul><li>haet rannikkokaupungin arkea ja aiot valita asunnon keskustan, rantojen tai tietyn asuinalueen tarpeiden mukaan;</li><li>hyväksyt sen, että paikallisliikenteen nykyiset reitit ja asunnon sijainti on tarkistettava yhdessä;</li><li>suunnittelet retkesi yksitellen etkä oleta rautatieyhteyttä kaupungista.</li></ul></article></div></section>
        <section id="osoitetesti"><p class="eyebrow">Ennen varausta</p><h2>Testaa asuntoehdokas tavallisena arkipäivänä</h2><ol class="numbered-list"><li>Merkitse karttaan asunto, lähikauppa, apteekki, pysäkki ja tärkein palvelu.</li><li>Tarkista kävelyreitti ja sen esteet, ei pelkkää linnuntie-etäisyyttä.</li><li>Avaa virallinen reittihaku päivämäärälläsi ja tarkista meno, paluu sekä viikonloppu.</li><li>Selvitä, mitkä palvelut toimivat talvella ja kuinka myöhään.</li><li>Pyydä vuokranantajalta tarkka osoite ja koko oleskelun sopimus- sekä kulutiedot kirjallisesti.</li></ol><p>Vertaa sitten molempia profiileja ja kaikkia omia mittareitasi <a href="/#comparison-app">etusivun 24 kohteen työkalussa</a>. Työkalu auttaa rajaamaan, ei valitse asuntoa osoitteen tai omien tarpeiden puolesta.</p><p><a href="/kohteet/alicante/">Alicanten lähteistetty kohdeprofiili</a> · <a href="/kohteet/torrevieja/">Torreviejan lähteistetty kohdeprofiili</a></p></section>
        <section class="source-list"><h2>Lähteet ja rajaukset</h2><ul><li><a href="https://alicanteturismo.com/en/public-transport/">Alicante City &amp; Beach: julkinen liikenne</a></li><li><a href="https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo">Torreviejan kunta: linjamuutokset 2.11.2026</a></li><li><a href="https://turismo.torrevieja.es/es/planifica/como-desplazarse">Torreviejan virallinen liikkumisohje</a></li><li><a href="https://www.finavia.fi/fi/uutishuone/2026/reittilistaus-minne-finavian-lentoasemilta-voi-lentaa-talvikaudella-2026-2027">Finavia: talvikauden 2026–2027 reittilista</a></li></ul><p class="small-note">Liikenne ja lentoreitit tarkistettu ${checkedOn}. Finavian listauksen tarkistusajankohta on 8.10.2026; reitit voivat muuttua, joten varmista matkustuspäivän saatavuus lentoyhtiöltä. Asumisen talvikuukausihintoja ei päätellä Idealistan ilmoitusindeksistä.</p></section>
      </article><aside class="article-rail"><p class="eyebrow">Tässä oppaassa</p><ol><li><a href="#pikaero">Pikaero</a></li><li><a href="#kaupunki">Kaupunkirakenne</a></li><li><a href="#liikenne">Ilman autoa</a></li><li><a href="#talvikuukaudet">Pidempi talvi</a></li><li><a href="#valitse">Kenelle kumpi?</a></li><li><a href="#osoitetesti">Osoitetesti</a></li></ol><div class="rail-card"><span class="note-kicker">Seuraavaksi</span><p>Vertaa myös muita alueita ja paikkakuntia.</p><a href="/kohteet/">Avaa kohdehakemisto <span aria-hidden="true">↗</span></a></div></aside></div>
    </main>${renderFooter()}
  </body>
</html>`;
}

export function renderOrganicGuideOutputs() {
  const destinations = getDestinationCatalog();
  return new Map([
    [path.join(publicRoot, "espanja-ilman-autoa", "index.html"), renderCarFreeGuide(destinations)],
    [path.join(publicRoot, "alicante-vai-torrevieja", "index.html"), renderAlicanteTorreviejaGuide()],
  ]);
}

function run() {
  const checkOnly = process.argv.includes("--check");
  const outputs = renderOrganicGuideOutputs();
  for (const [filePath, html] of outputs) {
    if (checkOnly) {
      assert.ok(existsSync(filePath), `Generated organic guide is missing: ${path.relative(publicRoot, filePath)}`);
      assert.equal(readFileSync(filePath, "utf8").replaceAll("\r\n", "\n"), html.replaceAll("\r\n", "\n"), `Generated organic guide is stale: ${path.relative(publicRoot, filePath)}`);
    } else {
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, html, "utf8");
    }
  }
  console.log(`${checkOnly ? "OK" : "Generated"}: ${outputs.size} static organic decision guides for ${getDestinationCatalog().length} current destinations`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
