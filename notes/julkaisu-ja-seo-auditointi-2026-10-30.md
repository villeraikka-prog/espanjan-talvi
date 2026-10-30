# Espanjan talviarki — julkaisu- ja SEO-auditointi

**Tarkistuspäivä:** 30.10.2026
**Repository:** `villeraikka-prog/espanjan-talvi`
**Vertailuperusta:** `origin/main` = `be48ffbc1810aa89de4d63593d55dd5cf33160bc`
**Tila:** read-only-auditointi; tämän raportin luonti on tehtävän ainoa sallittu tiedostomuutos.

## 1. Yhteenveto

**Julkaisukelpoisuus: valmis korjausten ja ulkoisten tarkistusten jälkeen.** Paikallinen sivusto ja sen tarkistusskripti läpäisevät staattiset tarkistukset. Sitemap vastaa kahdeksaa indeksoitavaa canonical-sivua, paikallinen reititys ja resurssiviittaukset ovat johdonmukaiset, eikä testatuissa laskentamoduuleissa havaittu syntaksivirheitä.

Nykyistä tuotantojulkaisua ei voitu tässä ympäristössä vahvistaa: julkisen `pages.dev`-osoitteen GET-pyynnöt eivät saaneet yhteyttä palvelimeen eivätkä palauttaneet HTTP-vastausta. Tämä ei osoita, että sivusto olisi alhaalla; se tarkoittaa, ettei tuotannon tilaa voitu tämän auditin verkosta todentaa. Cloudflare Pagesin hallintapaneeliin tai Google Search Consoleen ei ollut käytettävissä kirjautunutta näkymää.

### Julkaisua edeltävät löydökset

- **ESTÄÄ JULKAISUN (sisällöllinen täydennys):** `public/toimitusperiaatteet/index.html` ja `public/tietosuoja/index.html` kertovat, että ylläpitäjän nimi ja toimiva korjaus-/yhteystieto puuttuvat ja ne pitää täydentää ennen julkaisua. Tämä on projektin oma, näkyvä julkaisutarkistus; raportti ei arvioi lakisääteisiä velvoitteita.
- **KORJAA ENNEN JULKAISUA (jäljitettävyys):** aktiivinen etusivun hero-kuva `public/assets/hero-coast.jpg` ei esiinny `IMAGE-SOURCES.md`-rekisterissä. Lisää kuvan tunnettu alkuperä ja käyttöoikeutta koskeva tieto rekisteriin ennen kuin väitetään kaikkien kuvien olevan dokumentoituja.
- **EI VARMENNETTU:** nykyinen tuotanto, sen sitemap-vastaus, palvelinotsakkeet, Pagesin deployment-asetukset ja Search Consolen virhetila jäivät tarkistamatta. Älä päättele tämän auditin verkkoyhteysvirheestä, että tuotanto olisi rikki.

## 2. Git-työpuu ja julkaisun rajaus

- Nykyinen branch on `main`; HEAD ja `origin/main` ovat sama commit. `git rev-list --left-right --count HEAD...origin/main` palautti `0 0`.
- Kaikki muutokset ovat unstaged-työpuussa; staging-alueella ei ole muutoksia.
- `git diff origin/main` sisältää **38 seurattua polkua**: 14 muokattua ja 24 poistettua. Tilasto on 1 722 lisäystä ja 685 poistoa; binäärikuvien sisältö ei sisälly rivi-/tavutilastoon.
- Ennen tätä raporttia oli **43 seuraamatonta polkua**. Raportti lisää yhden seuraamattoman tiedoston lisää.

### Seuratut muokatut tiedostot (14)

`IMAGE-SOURCES.md`, `README.md`, `SOURCES.md`, `public/404.html`, `public/aluevertailu/index.html`, `public/assets/site.css`, `public/budjetti/index.html`, `public/index.html`, `public/sitemap.xml`, `public/talvehtiminen-espanjassa/index.html`, `public/tietosuoja/index.html`, `public/toimitusperiaatteet/index.html`, `public/vuokraus/index.html`, `scripts/check-site.mjs`.

### Seuratut poistetut tiedostot (24)

Seuraavat 12 vanhaa kuvanimeä ja niiden `-700`-versiot on poistettu työpuusta: `alicante-avenue`, `almeria-old-town`, `benidorm-street`, `cadiz-alley`, `calp`, `guardamar-del-segura`, `javea-xabia`, `los-alcazares`, `malaga-street`, `murcia-street`, `roquetas-de-mar` ja `torrevieja-homes` (kunkin `.jpg` sekä `-700.jpg`). Niiden tilalla ovat vastaavat `-v2.jpg`- ja `-v2-700.jpg`-tiedostot.

### Seuraamattomat tiedostot ennen tämän raportin lisäämistä (43)

- Muistiinpanot: `notes/elintarvikehintojen-validointi.md`, `notes/elintarvikeindeksi-pilotti.md`, `notes/elintarvikeindeksi-vaihtoehdot.md`.
- Cloudflare Pages -sääntö: `public/_redirects`.
- JavaScript-moduulit: `public/assets/area-comparison.mjs`, `public/assets/elinkustannukset.mjs`, `public/assets/rental-index.mjs`.
- Uudet sivut: `public/elinkustannukset/index.html`, `public/palvelut-ja-linkit/index.html`.
- 12 korvatun kohdekuvan parit: `alicante-avenue-v2`, `almeria-old-town-v2`, `benidorm-street-v2`, `cadiz-alley-v2`, `calp-v2`, `guardamar-del-segura-v2`, `javea-xabia-v2`, `los-alcazares-v2`, `malaga-street-v2`, `murcia-street-v2`, `roquetas-de-mar-v2` ja `torrevieja-homes-v2`; kustakin pääkuva `.jpg` ja responsiivinen `-700.jpg`.
- Viisi muuta kuva-/kuvaparia: `budget-cafe.jpg` ja `budget-cafe-700.jpg`; `elinkustannukset-market.jpg` ja `elinkustannukset-market-700.jpg`; `hero-coast.jpg` ja `hero-coast-700.jpg`; `rental-terrace.jpg` ja `rental-terrace-700.jpg`; `winter-guide-valencia.jpg` ja `winter-guide-valencia-700.jpg`.

Näistä seuraamattomista kohteista `_redirects`, kolme moduulia, kaksi sivuhakemistoa sekä aktiivisesti viitatut kuvat kuuluvat julkaisukokonaisuuteen, jos tämä paikallinen ehdokas julkaistaan. Kolme `notes/`-tutkimusraporttia eivät kuulu `public/`-julkaisuun. Tämä auditointi ei stageannut mitään.

## 3. Paikallinen URL- ja SEO-rakenne

### Kanoniset sivut ja sitemap

Paikallisessa `public/sitemap.xml`-tiedostossa on hyvin muodostettu UTF-8 XML -sitemap, jossa on kahdeksan uniikkia URL-osoitetta. Ne ovat täsmälleen näiden indeksoitavien sivujen canonicalit ja käyttävät samaa `https://espanjan-talvi.pages.dev`-hostia:

1. `/`
2. `/vuokraus/`
3. `/budjetti/`
4. `/talvehtiminen-espanjassa/`
5. `/palvelut-ja-linkit/`
6. `/elinkustannukset/`
7. `/tietosuoja/`
8. `/toimitusperiaatteet/`

Kaikilla kahdeksalla on paikallisesti oma `<title>`, meta description, canonical, suomenkielinen `lang` ja yksi H1. Sitemapissa ei ole `lastmod`-arvoja, joten tiedostossa ei ole keksittyjä tai epäluotettavia päivitysaikoja. Sivujen sisältökohtaiset otsikot ja kuvaukset vastaavat niiden eri tehtäviä. `scripts/check-site.mjs` vertaa sitemapin, canonicalien ja indeksointitilan vastaavuutta.

Julkaistavissa HTML-sivuissa ei havaittu `noindex`-direktiivejä. Sivustossa ei havaittu JSON-LD-rakenteista dataa; tätä ei pidetty puutteena, koska tarkistetuille sivuille ei ole perusteltua lisätä keinotekoista schema-merkintää. Julkaisujuuresta ei löytynyt `_headers`-tiedostoa eikä paikallista `X-Robots-Tag`-sääntöä. Tuotannon HTTP-headerit jäivät kuitenkin mittaamatta.

`public/robots.txt` sallii crawlaamisen (`Allow: /`) ja ilmoittaa saman canonical-hostin sitemapin. Paikallisissa HTML-tiedostoissa `noindex` esiintyy vain `public/404.html`-virhesivulla ja vanhan vertailureitin fallbackissa. 404-sivu ei ole sitemapissa.

`public/aluevertailu/index.html` on noindex-fallback, jossa on canonical etusivulle sekä selainpuolen/meta-refresh-siirtymä. Lisäksi `public/_redirects` sisältää pysyvän 301-säännön sekä `/aluevertailu`- että `/aluevertailu/`-reitille. Sääntö on tällä hetkellä seuraamaton ja tulee sisällyttää tulevaan julkaisuun. Cloudflare Pagesin dokumentaatio sanoo, että `_redirects`-sääntöjä sovelletaan riippumatta siitä, vastaako pyyntö myös staattista assetia; tämä tukee rinnakkaisen fallback-tiedoston käyttöä, mutta tuotannon 301-vastausta ei saatu tässä ympäristössä mitattua. [Cloudflare Pages: Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)

Paikallisella esikatselupalvelimella `/aluevertailu/` palautti 200 ja fallback-HTML:n, koska tämä palvelin ei toteuta Cloudflare Pagesin `_redirects`-käsittelyä. Tätä paikallista 200-vastausta ei pidä tulkita Pages-julkaisun lopulliseksi reittikäyttäytymiseksi.

### Paikalliset GET-pyynnöt

Aiemmin käynnissä olleeseen paikalliseen palvelimeen `http://127.0.0.1:4175` tehtiin GET-pyynnöt. Kaikki kahdeksan pääsivua palauttivat 200 ja `text/html`; `/robots.txt` palautti 200 ja `text/plain`; `/sitemap.xml` palautti 200 ja `text/xml`; `/aluevertailu/` palautti 200 yllä kuvattuna paikallisena fallbackina.

### Julkisen tuotannon GET-pyynnöt

`https://espanjan-talvi.pages.dev`-osoitteen kaikkiin kahdeksaan reittiin sekä `/robots.txt`, `/sitemap.xml` ja `/aluevertailu/`-reittiin yritettiin GET-pyyntöjä. Node `fetch` palautti yhteysvirheen ennen HTTP-vastausta; `curl.exe` ei saanut yhteyttä porttiin 443 ja palautti juuripolulle tilan `000`. Web-sivun lukutyökalu ilmoitti osoitteen saavuttamattomaksi. Siksi **tuotannon HTTP-statuskoodeja, redirect-ketjuja, Content-Type- tai cache-otsakkeita ja julkaistua sisältöä ei voitu raportoida**. Tämä on auditointiympäristön havainto, ei vahvistus palvelun häiriöstä.

README dokumentoi 29.10.2026 tehdyn aiemman tuotantotarkistuksen, jossa uusien kustannus- ja palvelusivujen osoitteet palauttivat 404:n ja vanha vertailureitti 200:n. Se on päivätty havainto, ei tämän päivän live-tulos. Nykytilanne on tarkistettava uudella GET-kierroksella toimivasta verkosta.

## 4. Sisältö, kohdedata ja laskennat

- Etusivun vertailutyökalussa on 24 uniikkia kohdeprofiilia viidessä ryhmässä: Costa Blanca 8, Costa del Sol 2, Costa Cálida 6, Costa de Almería 4 ja muut Espanjan kohteet 4. Valitsimen profiili-ID:t ja aluejaot tarkistetaan skriptissä.
- Etusivun 24 syyskuun 2026 Idealista-ilmoitusindeksiä ja lähdelinkkiä käytetään vuokraussivulla ja Elinkustannukset-sivulla yhteisestä lähdetaulukosta/parsimesta. Indeksit on rajattu ilmoitusten pyyntihintoihin (€/m²/kk), eivätkä ne ole toteutuneita tai kalustettujen talviasuntojen hintoja.
- Vuokraussivun 40 m²- ja 60 m²-arviot ovat indeksin kertomista pinta-alalla ja pyöristämistä kokonaisiin euroihin. Testit tarkistavat sivujen hintarivien ja laskentakaavojen vastaavuuden.
- Budjettilaskurin JavaScript testaa kuukausi- ja kertakulujen summauksen, matkustaja- ja kuukausimäärien rajat sekä virheelliset syötteet. Laskuri ei sisällä yleisiä hinta-arvioita; sen normaali laskenta tapahtuu selaimessa.
- Elinkustannukset-sivun MAPA-moduulissa on kahdeksan erillistä vuoden 2025 tuoteryhmää, neljä tasoa (Espanja, Comunitat Valenciana, Región de Murcia, Andalucía) sekä raaka `VALOR`/`VOLUMEN`-aineisto. Keskihinta on `VALOR / VOLUMEN`; tuoteryhmäkohtainen suhde on alueen hinta suhteessa saman ryhmän Espanjan hintaan. Tiedot ovat itsehallintoalueen kotitalousostojen keskihintoja, eivät kaupunkihintoja, vakioidun tuotteen hintoja tai yhdistetty elintarvikekori. Näistä rajoitteista kerrotaan sivulla.
- MAPA-ryhmät: kananmunat kappaleina; nestemäinen maito; leipä; liha; kala; tuoreet hedelmät; tuoreet vihannekset; palkokasvit. Tarkistusraportti dokumentoi, että valittujen ryhmien vuosiarvot ja kuukausisummat täsmäsivät vuoden 2025 työvihkoon. Aiemman 9/2025–8/2026 pilotin päällekkäisiä 2026 kuukausivälilehtiä ei käytetä nykyisessä datassa.
- Eurostatin vuoden 2025 elintarvikkeiden hintatasoluku 94,9 (EU = 100) näytetään erillisenä Espanjan kansallisena vertailuna, ei paikallisena mittauksena.
- Vertailutyökalu, reittihakujen linkit, liikennelipputiedot ja lentokenttäkartoitus ovat validoituja staattisen tarkistimen ja moduulien sisältötestien tasolla. Dynaamisten valitsinten ja selaimen todellisen DOM-päivityksen kattavaa selaintestiä ei tehty.

## 5. Kuvat, lisenssimerkinnät ja lähderekisteri

- `public/assets/` sisältää 60 `.jpg`-tiedostoa. Kaikkien tiedostojen JPEG-alku/loppumerkit ja kuvan mitat pystyttiin lukemaan. 24 kohdeprofiilin pää- ja responsiiviset tiedostot ovat olemassa; uudet `-v2`-pääkuvat ovat 1 400 px leveitä ja pienet versiot 700 px. Kaikilla 24 profiililla on oma tiedostopari. Validator tarkistaa aktiiviset profiiliviittaukset, lähderekisterimerkinnät, yksilölliset polut, `src`/`srcset`-kohteet ja kuvan mitat.
- Kaikissa tarkastetuissa HTML:n `<img>`-elementeissä oli alt-attribuutti; yhtään tyhjää alt-tekstiä ei löytynyt. Tämä on perusmuotoinen tarkistus eikä sisällöllisen osuvuuden täydellinen arvio.
- Kahdeksan Pexels-kohdekuvan yksittäistä kuvasivua ja/tai kuvaajaa/sijaintia ei ole rekisterissä vahvistettu: Alicante, Murcia, Cádiz, Guardamar del Segura, Jávea/Xàbia, Calp, Los Alcázares ja Roquetas de Mar. Rekisterissä on alkuperäiset Pexels-kuvatiedosto-URL:t ja yleinen Pexels-lisenssi, eikä kuvia esitetä kaikissa tapauksissa varmasti kyseisessä kaupungissa otettuina. Vahvista lähdesivut/kuvien provenienssi mahdollisuuksien mukaan; auditointi ei ratkaise oikeudellista käyttöoikeutta.
- **Hero-kuvan lähde puuttuu rekisteristä:** aktiivista `hero-coast.jpg`/`hero-coast-700.jpg`-paria käytetään etusivulla, mutta `IMAGE-SOURCES.md` ei dokumentoi sitä. Alkuperäistä lähde-URL:ia, tekijää tai käyttöoikeutta ei voi vahvistaa paikallisista tiedostoista. Tämä on jäljitettävyyden puute.
- Orihuela Costan Cabo Roigin kuva on rekisterissä CC BY-SA 4.0 -lisenssillä; kuvaaja, tiedostosivu, lisenssi sekä koonmuutos ja rajaus mainitaan. Aiemmin hyväksytty käyttöpäätös on dokumentoitu.
- Águilasin `Aguilasmurcia.JPG`-lähdesivun public domain -dedikaatio on kirjattu, mutta Vicrogon tekijyys on lähdesivulla oletus. Rekisteri ei nimitä sitä CC0:ksi ja jättää tekijyysepävarmuuden näkyviin.
- Los Alcázaresin vanhan kuvan public domain -dedikaatio on erotettu rekisterissä historialliseksi tiedoksi; nykyinen kuva on Pexelsistä eikä vanha dedikaatio koske sitä.

## 6. Analytiikka, tietosuoja ja toimitusperiaatteet

- Paikallisessa HTML:ssä Cloudflare Web Analytics -snippet esiintyy **kerran kullakin kahdeksalla indeksoitavalla sivulla** (8 yhteensä). Sitä ei ole 404-sivulla eikä noindex-merkityllä vanhan vertailureitin fallbackilla.
- README, tietosuojasivu ja toimitusperiaatteet erottavat tagin koodissa, aiemmin HTTP-vastauksissa havaittuun tagiin liittyvän päivätyn tiedon sekä mittauksen todellisen toiminnan. Ne eivät väitä, että beacon-pyyntö tai raporttidatan kertyminen olisi tässä auditissa vahvistettu. Cloudflare-tilin asetuksia ja infrastruktuuritason lokitus-/säilytyskäytäntöjä ei voi päätellä tästä staattisesta projektista.
- Search Console -vahvistuksen meta-elementti on paikallisessa etusivussa. Sen läsnäolo ei yksin vahvista, että käyttäjätilin property on edelleen vahvistettu tai että sitemap olisi käsitelty. Search Consolen käyttöliittymää ei saatu avattua, eikä uusia URL Inspection -pyyntöjä tehty.
- Paikallisessa toimitusperiaatesivussa ja tietosuojasivussa ylläpitäjän nimi ja yhteydenottokanava ovat vielä avoimia paikkamerkkejä. Tietosuojateksti myös rajaa oikein sen, ettei Cloudflaren asetuksia tai palvelinpuolen käytäntöjä ole itsenäisesti varmennettu.

## 7. Cloudflare Pagesin julkaisuprosessi

Paikallisesta repositoriosta ei löytynyt Pages-projektin asetustiedostoa, `wrangler`-konfiguraatiota tai GitHub Actions -deployment-workflow’ta, joka osoittaisi tuotannon julkaisumallin. README sanoo, ettei se pysty vahvistamaan, käyttääkö nykyinen Pages-projekti Git-integraatiota vai Direct Uploadia; tämä vastaa auditin paikallista havaintoa. `public/` on kuitenkin rakenteen ja dokumentaation mukaan valmis staattinen julkaisuhakemisto, eikä projektissa ole build-vaihetta.

Cloudflare-hallintapaneelista pitää ennen seuraavaa julkaisua vahvistaa:

1. Pages-projektin nimi ja yhdistetty Git-repository (tai se, että käytössä on Direct Upload).
2. Production branch `main`, jos Git-integraatio on käytössä.
3. Build command tyhjä ja output directory `public`.
4. Onko production-branchin pushille automaattinen deployment käytössä; `main`-push voi tällöin julkaista automaattisesti.
5. Uusimman production deploymentin tila ja commit SHA.

Näitä asetuksia ei tarkistettu eikä muutettu tässä auditissa. Paikallinen preview-palvelin vastasi jo portissa 4175; muita paikallisia esikatselupalvelimia ei käynnistetty.

## 8. Google Search Console ja sitemap-virheen selvitys

Paikallisessa koodissa sitemap on validi, siinä on kahdeksan oikeaa canonical-URL:ia, ja `robots.txt` ilmoittaa absoluuttisen sitemap-osoitteen. Tämä ei osoita, että Google olisi hakenut tai käsitellyt tuotannon tiedoston. Search Consolen aiempaa “Sitemap could not be read” -virhettä ei voi selittää varmaksi syyksi ilman tuotannon GET-vastausta ja Search Consolen tarkkaa virhetilaa.

Seuraavassa GSC-tarkistuksessa tarvitaan:

- Search Consolen Sitemaps-raportin sitemap-URL, viimeisin lukuaika ja virheen tarkka teksti/yksityiskohdat;
- URL Inspectionin live-/indeksointitila juurisivulle ja keskeisille canonical-reiteille (käyttäjä voi tehdä nämä itse; tässä auditissa ei tehty pyyntöjä);
- Page indexing-, Manual actions- ja Security issues -raporttien nykytila.

## 9. Testit ja niiden rajat

Suoritettu:

- `node scripts/check-site.mjs` — **läpäisi**. Se tarkisti muun muassa 8 sitemap/canonical-sivua, Analytics-tagien lukumäärän, sisäiset linkit ja paikalliset resurssit, navigaation, 24 profiilia, 24 vuokraindeksiä, MAPA:n 8 mittaria, lentoasema- ja ilmastokytkennät sekä budjettilaskennan.
- `node --check public/assets/elinkustannukset.mjs` — **läpäisi**.
- `node --check public/assets/rental-index.mjs` — **läpäisi**.
- `node --check public/assets/area-comparison.mjs` — **läpäisi**.
- `node --check scripts/check-site.mjs` — **läpäisi**.
- `git diff --check` — **ei whitespace-virheitä**. Git tulosti lisäksi Windowsin LF→CRLF-muunnosvaroituksia muuttuneista tiedostoista; ne eivät olleet diff-check-virheitä.
- Paikallinen sitemap parsittiin XML:ksi; kahdeksan URL:ia olivat uniikkeja ja vastasivat indeksoitavien sivujen canonicaleja.
- Paikallisen esikatselupalvelimen GET-reitit tarkistettiin edellä.
- 60 JPEG-tiedostosta tarkistettiin JPEG-merkki ja luettavat mitat; virheellisiä tiedostoja ei löytynyt.

Ei varmennettu:

- nykyisen tuotannon HTTP-status/otsakkeet/redirectit ja sivusisällöt, koska julkinen host ei vastannut tämän ympäristön pyynnöille;
- Cloudflare-asetukset, deployment ja GSC-raportit;
- selaimen renderöinti, responsiivisuus ja interaktiivisten valitsinten täydellinen päästä päähän -toiminta. CUA-selaimen välilehden valinta epäonnistui ilmoitukseen `browser.user is unavailable`; visuaalista selaintestiä ei väitetä tehdyksi.
- kaikkien ulkoisten linkkien tämänhetkiset vastaukset, kunkin kuvan pikselisisällön ja kohteen paikkansapitävyys tai lisenssiehtojen oikeudellinen tulkinta.

Nykyinen validator on staattisen, yhden julkaisuhakemiston sivuston kannalta varsin kattava. Se ei korvaa live-HTTP-/GSC-tarkistusta eikä selainpohjaista e2e-testiä. Ulkoisten lähteiden saavutettavuus, tuotannon kuvavälimuisti, selaimen käyttäytyminen ja Cloudflare-mittausdatan syntyminen jäävät sen ulkopuolelle.

## 10. Seuraava toimenpide

Täydennä ensin julkaisuun tarkoitettuihin sivuihin ylläpitäjän nimi ja toimiva korjausyhteys sekä dokumentoi `hero-coast`-kuvan alkuperä. Sen jälkeen varmista Pages-hallintapaneelissa julkaisumalli ja aja toimivasta ulkoisesta verkosta yksi GET-kierros kaikille kahdeksalle canonical-reitille, sitemapille, robots.txt:lle ja vanhalle vertailureitille. Tarkista samalla GSC:n sitemap-virheen tarkka tila ennen johtopäätöstä sen syystä.
