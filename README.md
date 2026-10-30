# Espanjan talviarki — staattinen sivusto

Suomenkielinen staattinen opas 1–6 kuukauden talvehtimisen suunnitteluun. Julkinen sivusto on Cloudflare Pagesissa osoitteessa <https://espanjan-talvi.pages.dev/>; tämän repositorion GitHub-etärepo on [villeraikka-prog/espanjan-talvi](https://github.com/villeraikka-prog/espanjan-talvi). Google Search Console -omistajuus on vahvistettu etusivun HTML-meta-tunnisteella. Se on erillinen asia kävijäanalytiikasta. Paikallisessa julkaisukandidaatissa Cloudflare Web Analytics -tagi on kerran jokaisella kahdeksalla indeksoitavalla HTML-sivulla; 404- ja vanhan vertailureitin fallback-sivulta se on poistettu. Julkisen sivuston HTTP-vastauksissa tagi havaittiin 29.10.2026, mutta tagin näkyminen HTML:ssä ei vahvista mittauspyynnön onnistumista tai raporttidatan kertymistä. Samassa tarkistuksessa uudet `/elinkustannukset/`- ja `/palvelut-ja-linkit/`-reitit palauttivat 404:n ja vanha `/aluevertailu/`-reitti palautti sivun 200-vastauksella; tämän työpuun reitti- ja sitemap-päivityksiä ei ole julkaistu. Cloudflare-tilin asetuksia tai infrastruktuuritason lokitus- ja säilytyskäytäntöjä ei ole itsenäisesti varmennettu. Sivusto on staattinen ja julkaistaan `public/`-hakemistosta ilman build-komentoa. Kun budjettilaskurin JavaScript-moduuli toimii, se käsittelee syötteet selaimessa ja estää lomakkeen tavallisen lähetyksen. HTML-lomake ei määritä `method`-arvoa, joten jos JavaScript ei toimi, selaimen oletusarvoinen GET-lähetys voi liittää nimetyt kenttäarvot URL:iin. Paikallisessa projektissa ei ole omaa backendia, kirjautumista, uutiskirjettä, mainoksia tai affiliate-seurantaa.

## Rakenne

- `public/` — julkaistava sivusto: HTML-sivut, CSS, paikalliset kuvat, favicon, selainpuolen budjettilaskuri, `robots.txt` ja `sitemap.xml`.
- `scripts/check-site.mjs` — staattinen tarkistin: sivujen metatiedot, canonicals, sisäiset linkit ja kuvat, sitemap sekä budjettilaskurin laskenta ja reunatapaukset.
- `SOURCES.md` — ilmasto-, vuokra-, liikkumis-, hallinto-, julkaisu- ja mittauslähteiden rekisteri.
- `IMAGE-SOURCES.md` — kuvien lähdesivut, kuvaajat, käyttöehdot ja paikalliset tiedostot.
- Tutkimuskansiossa olevia alkuperäisiä raportteja ei ole muokattu.

Sivuston arkkitehtuuri on HTML/CSS/JavaScript ilman build-vaihetta tai riippuvuuksien asennusta. Cloudflare Pagesin julkaistava hakemisto on `public/`. Kun laskurin JavaScript toimii, laskenta tapahtuu käyttäjän selaimessa. Tämän repositorion lomakkeen tavallinen GET-varatapa voi JavaScriptin puuttuessa liittää syötteet URL:iin. Tässä projektikoodissa ei ole omaa backendia, CMS:ää, tietokantaa tai ulkoisia kuvapyyntöjä.

## Paikallinen käyttö ja testit

Avaa PowerShell tässä projektikansiossa:

```powershell
node scripts/check-site.mjs
py -m http.server 4173 --directory public
```

Avaa `http://localhost:4173/`. Pysäytä käynnistetty palvelin `Ctrl+C`-näppäinyhdistelmällä. Jos Python Launcher `py` puuttuu, kokeile `python -m http.server 4173 --directory public`.

**Build-komentoa ei tarvita.** `node scripts/check-site.mjs` on projektin tarkistuskomento; sivuston lähdetiedostot toimivat suoraan julkaisujuuren `public/` kautta. Node.js 24 tai uudempi on testattu, mutta itse julkaistu staattinen sivu ei tarvitse Nodea palvelimella.

## Sivuarkkitehtuuri ja sisältö

- `/` — etusivu ja interaktiivinen vertailutyökalu: 24 kohdeprofiilia viidessä kategoriassa (kahdeksan Costa Blancalla), kahdeksan AEMET-aseman kuukausinormaalit ja Idealistan ilmoitusindeksit.
- `/vuokraus/` — asunnon talvikunto, kysymykset ennen maksua, tyhjä saman ehtorakenteen vertailupohja sekä virallinen lakilähde.
- `/budjetti/` — selaimessa toimiva laskuri 1–2 matkustajalle ja 1–6 kuukaudelle. Käyttäjä syöttää kaikki kustannukset; laskuri ei sisällä hintaoletuksia.
- `/talvehtiminen-espanjassa/` — 1–6 kuukauden suunnittelupolku, aikajana, talvikodin tarkistus, liikkuminen sekä viranomaislinkit ja yksilöllisyysrajaukset.
- `/toimitusperiaatteet/` ja `/tietosuoja/` — sivuston rajat, lähteet ja nykyiset tietosuojatoiminnot.
- `/aluevertailu/` — pysyvä 301-uudelleenohjaus vertailun etusivulle.

Jokaisella kahdeksalla indeksoitavalla sivulla on oma title, description, canonical ja yksi H1. `public/sitemap.xml` sisältää kaikki kahdeksan kanonista sivua eikä listaa noindex- tai uudelleenohjattuja reittejä. Vanha `/aluevertailu/`-osoite ohjataan `public/_redirects`-säännöllä etusivulle; paikallinen fallback on noindex eikä sisällä rinnakkaista vertailusisältöä. `robots.txt` osoittaa sitemap-tiedostoon. Canonical-origin on `https://espanjan-talvi.pages.dev/`, sama kuin nykyinen julkinen osoite. Jos käytät myöhemmin muuta domainia, päivitä kaikki canonical-, `og:url`-, sitemap-, robots- ja tarkistusskriptin origin-arvot yhtenäisesti.

## Lähteet ja päiväykset

`SOURCES.md` sisältää kahdeksan AEMET-aseman tunnisteet, vertailukaudet, kuukausisarjat ja niiden lähde- sekä CSV-URL:t; lisäksi kunkin kaupungin Idealista-syyskuun 2026 arvon ja kaupunkiraportin. Kunkin taulukon rivit on linkitetty lähteeseen myös sivulla. Idealistan lukua kuvataan vain ilmoitustarjonnan €/m²-mittarina: sitä ei kerrota talvikauden kalustetun vuokrauksen hinnalla. Tällaisesta vertailukelpoisesta kausivuokrasta, sähköstä, internetistä tai vakuudesta ei esitetä yleishintaa.

Kaupunki- ja liikkumiskuvaukset linkittävät paikalliseen liikenneviranomaiseen tai operaattoriin. Aikatauluja tai taksoja ei kovakoodata, koska ne muuttuvat. Vuokra- ja viranomaisväitteet on rajattu ja BOE:n tekstit linkitetään suoraan; yksittäisiä sopimuksia ei tulkita.

Kuvat on kopioitu paikallisesti `public/assets/`-kansioon, pienennettyä JPEG-resoluutiota käyttäen, ja sivut valitsevat `srcset`-kautta 700 tai 1 400 pikselin version. Tekijät ja kuvasivut on hyvän tavan mukaisesti krediitoitu kuvateksteissä. Lisenssien tiedot ovat [IMAGE-SOURCES.md](IMAGE-SOURCES.md).

## Cloudflare Pages — nykyinen julkaisu ja muutokset

Sivusto on jo julkaistu Cloudflare Pagesissa. Tämä repositorio ei kerro, onko nykyinen Pages-projekti yhdistetty GitHubiin vai käyttääkö se Direct Upload -julkaisutapaa; tarkista menetelmä Pages-hallintapaneelista ennen seuraavaa julkaisuaskelta. Projektin Git-remote osoittaa GitHub-repositorioon. Cloudflare ei salli saman Pages-projektin vaihtamista Git-integraation ja Direct Uploadin välillä, joten säilytä nykyinen julkaisumalli tai tee erillinen päätös ennen uuden projektin luomista.

1. Ylläpitäjän nimeä tai yhteystietoa ei ole toimitettu projektitiedostoihin. Täydennä ne sivuille `public/toimitusperiaatteet/index.html` ja `public/tietosuoja/index.html`, jos haluat julkaista ne; älä arvaa puuttuvia tietoja. Hosting-palvelun teknisiä loki- tai säilytyskäytäntöjä ei voi todentaa sivuston lähdekoodista.
2. Ennen seuraavaa julkaisua tarkista lähderekisterin ja BOE-/viranomaislinkkien ajantasaisuus sekä aja `node scripts/check-site.mjs`.
3. Tarkista olemassa olevan Pages-projektin yhteystapa hallintapaneelista. Älä luo uutta projektia vain siksi, että tässä repossa on GitHub-remote. Jos projekti käyttää Git-integraatiota, käytä nykyistä yhdistettyä repositoriota ja projektin build-asetuksia. Jos se käyttää Direct Uploadia, jatka saman projektin Direct Upload -menetelmällä. Git-integraatio- ja Direct Upload -projektien julkaisumallia ei voi vaihtaa toiseen saman projektin sisällä. GitHub-etäosoite: `https://github.com/villeraikka-prog/espanjan-talvi`.
4. Tämä staattinen sivu ei vaadi build-komentoa; julkaistava hakemisto on `public/`. **Git-integraatio:** Framework preset `None`, build command tyhjä ja output directory `public` (ellei nykyisen Pages-projektin asetus toisin määrää). **Direct Upload:** valitse nykyinen Pages-projekti Cloudflare-hallintapaneelista ja lataa sen uuden deploymentin yhteydessä `public/`-kansion tiedostot. Cloudflaren nykyiset ohjeet ovat alla.
5. Jos julkinen osoite joskus vaihtuu, päivitä se jokaiseen HTML-tiedostoon (canonical ja `og:url`), `public/sitemap.xml`, `public/robots.txt` ja `scripts/check-site.mjs`. Aja tarkistin uudelleen.
6. Tarkista asetukset ja julkaise itse vasta muutosten tarkistamisen jälkeen. Maksullista domainia ei tarvita nykyiseen `pages.dev`-osoitteeseen.

Ohjeet: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) ja [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Google Search Console — omistajuus vahvistettu

Google Search Console -omistajuus on vahvistettu URL-prefix-ominaisuudelle `https://espanjan-talvi.pages.dev/`. Etusivun `google-site-verification`-meta-tunniste tarvitaan tähän vahvistukseen, joten älä poista sitä. Search Console -vahvistus itsessään ei asenna Google Analyticsia tai muuta kävijämittausta; Cloudflare Web Analytics on tästä erillinen, HTML-koodissa oleva toteutus.

1. Tarkista Search Consolen nykyisestä Sitemaps-raportista, onko `https://espanjan-talvi.pages.dev/sitemap.xml` vastaanotettu ja käsitelty. Lähetä se, jos sitä ei ole vielä lisätty. Seuraa, löytyivätkö URL:t ja ovatko ne indeksoituneet; sitemapin lähetys ei takaa indeksointia. [Googlen sitemap-ohje](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
2. Käytä URL inspection -työkalua etusivuun ja tärkeimpiin laskeutumissivuihin. Tarkista canonicalit, crawl- ja indexing-virheet sekä löytyneiden sivujen tila.
3. Performance-raportista voi seurata näyttökertoja, klikkauksia, CTR:ää, keskimääräistä sijaintia ja hakukyselyjä sekä laskeutumissivuja. Tuloksia ei pidä olettaa ennen kuin ne näkyvät raportissa.

## Mittaussuunnitelma ja mitä ei vielä mitata

- **Indeksointi/sitemap:** omistajuus on vahvistettu. Tarkista Sitemaps- ja Page indexing -raporttien tämänhetkinen tila; älä päättele indeksointia pelkästä vahvistuksesta.
- **Hakutulokset:** tarkista Performance-raportista impressions/clicks/queries/pages sekä ajan myötä CTR. Tämänhetkisiä lukuja ei ole tarkistettu eikä niitä päätellä lähdekoodista.
- **Budjettilaskurin käyttö:** tällä hetkellä ei mitata. Search Console näyttää budjettisivun haku- ja laskeutumissivutietoja, ei lomakkeen käyttöä. Jos erillinen mittaus myöhemmin hyväksytään, mittaa korkeintaan laskurin aloitus/laskentatapahtuma suostumus- ja tietosuojaratkaisun jälkeen; älä koskaan lähetä euroarvoja, matkan päivämääriä tai muita lomakekenttien sisältöjä analytiikkaan.
- **Affiliate-linkit ja tulokset:** tarkastetussa koodissa ei ole affiliate-seurantaa; mahdollisten linkkien kumppanuussuhteita ei ole tässä tarkistuksessa erikseen vahvistettu. Jos kumppanuusmarkkinointia myöhemmin lisätään, päivitä sitä koskevat tiedot ja mittaa linkkien tuloksia vain erillisellä päätöksellä. Erota kumppanin raportoimat varaukset klikkauksista äläkä esitä provisioita tai konversioita ilman todellista dataa.
- **Nykyinen tila:** Search Console -omistajuus on vahvistettu, mutta sen tämänhetkisiä haku- tai indeksointituloksia ei ole tässä README:ssä todennettu. Cloudflare Web Analytics -tagi on paikallisessa julkaisukandidaatissa kahdeksalla indeksoitavalla sivulla. Julkisissa HTTP-vastauksissa tagi näkyi 29.10.2026, mutta beacon-pyynnön onnistumista tai Cloudflare-raporttien dataa ei tarkistettu. Julkaisukandidaatin reitti- ja sitemap-korjaukset eivät vielä näy tuotannossa. Budjettilaskurin käyttöä, affiliate-klikkauksia tai myyntejä ei mitata erillisinä tapahtumina.

## Avoimet tietotäydennykset ja ylläpito

- Lisää sivuston ylläpitäjän nimi, julkinen korjauskanava ja tietosuojayhteyshenkilön tiedot.
- Tarkista vuokrausta koskevat lakilinkit ja omaan tilanteeseen soveltuvat viranomaisohjeet uudelleen; yleisopas ei ole juridinen tarkistus.
- Varmista kaikki vuokraraporttien syyskuu 2026 arvot uudestaan, jos julkaisu siirtyy tai raportointi päivittyy. Päivitä taulukko ja lähderekisteri yhdessä.
- Nykyinen canonical-osoite on `https://espanjan-talvi.pages.dev/`. Jos käyttöön otetaan muu domain, vaihda kaikki SEO-URL:t yhdessä.
- Harkitse omistajan tarkistusta kaupungin arjen kuvauksiin sekä kunkin lainatun kuvan käyttöön ennen kaupallista muutosta. Sivuston kuvat ovat peräisin useista lähteistä, kuten Unsplashista ja Wikimedia Commonsista. Kuvatiedostojen lähteet, tekijätiedot ja käyttöoikeudet on dokumentoitu `IMAGE-SOURCES.md`-tiedostossa; yksittäisten kuvien lisenssit ja attribuutiovaatimukset vaihtelevat lähteen mukaan.
