# Espanjan talviarki — staattinen sivusto

Suomenkielinen staattinen opas 1–6 kuukauden talvehtimisen suunnitteluun. Tuotantosivusto on [Netlifyssä](https://espanjan-talvi.netlify.app/); tämän repositorion GitHub-etärepo on [villeraikka-prog/espanjan-talvi](https://github.com/villeraikka-prog/espanjan-talvi). Google Search Console -omistajuus on vahvistettu, ja sitemapin tila on ilmoitettu onnistuneeksi. Cloudflare Web Analytics -tagi on koodissa kahdeksalla indeksoitavalla HTML-sivulla; tagin näkyminen HTML:ssä ei yksin vahvista mittauspyynnön onnistumista tai raporttidatan kertymistä. Cloudflaren asetuksia tai infrastruktuuritason lokitus- ja säilytyskäytäntöjä ei ole itsenäisesti varmennettu. Sivusto julkaistaan staattisena `public/`-hakemistosta ilman build-komentoa. Kun budjettilaskurin JavaScript-moduuli toimii, se käsittelee syötteet selaimessa ja estää lomakkeen tavallisen lähetyksen. HTML-lomake ei määritä `method`-arvoa, joten jos JavaScript ei toimi, selaimen oletusarvoinen GET-lähetys voi liittää nimetyt kenttäarvot URL:iin. Paikallisessa projektissa ei ole omaa backendia, kirjautumista, uutiskirjettä, mainoksia tai affiliate-seurantaa.

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

Jokaisella kahdeksalla indeksoitavalla sivulla on oma title, description, self-referencing canonical, vastaava `og:url` ja yksi H1. `public/sitemap.xml` sisältää kaikki kahdeksan kanonista sivua eikä listaa noindex- tai uudelleenohjattuja reittejä. `public/sitemap-google.xml` on vaihtoehtoinen, sisällöltään identtinen sitemap. Vanha `/aluevertailu/`-osoite ohjataan `public/_redirects`-säännöllä etusivulle; paikallinen fallback on noindex eikä sisällä rinnakkaista vertailusisältöä. `robots.txt` osoittaa ensisijaiseen sitemap-tiedostoon. SEO-URL-osoitteiden ensisijainen origin on `https://espanjan-talvi.netlify.app/`; originin vaihtuessa päivitä HTML:n canonical- ja `og:url`-arvot, molemmat sitemap-tiedostot, robots.txt sekä tarkistusskriptin origin yhdessä.

## Lähteet ja päiväykset

`SOURCES.md` sisältää kahdeksan AEMET-aseman tunnisteet, vertailukaudet, kuukausisarjat ja niiden lähde- sekä CSV-URL:t; lisäksi kunkin kaupungin Idealista-syyskuun 2026 arvon ja kaupunkiraportin. Kunkin taulukon rivit on linkitetty lähteeseen myös sivulla. Idealistan lukua kuvataan vain ilmoitustarjonnan €/m²-mittarina: sitä ei kerrota talvikauden kalustetun vuokrauksen hinnalla. Tällaisesta vertailukelpoisesta kausivuokrasta, sähköstä, internetistä tai vakuudesta ei esitetä yleishintaa.

Kaupunki- ja liikkumiskuvaukset linkittävät paikalliseen liikenneviranomaiseen tai operaattoriin. Aikatauluja tai taksoja ei kovakoodata, koska ne muuttuvat. Vuokra- ja viranomaisväitteet on rajattu ja BOE:n tekstit linkitetään suoraan; yksittäisiä sopimuksia ei tulkita.

Kuvat on kopioitu paikallisesti `public/assets/`-kansioon, pienennettyä JPEG-resoluutiota käyttäen, ja sivut valitsevat `srcset`-kautta 700 tai 1 400 pikselin version. Tekijät ja kuvasivut on hyvän tavan mukaisesti krediitoitu kuvateksteissä. Lisenssien tiedot ovat [IMAGE-SOURCES.md](IMAGE-SOURCES.md).

## Netlify — tuotanto ja julkaisu

Tuotanto-osoite on <https://espanjan-talvi.netlify.app/>. Netlify käyttää GitHub-repositoriota `villeraiikka-prog/espanjan-talvi`, tuotantohaaraa `main` ja julkaistavaa hakemistoa `public`; build-komento on tyhjä ja automaattijulkaisut ovat käytössä. Sivusto on staattinen eikä tarvitse build-vaihetta. `main`-haaraan pushaaminen voi käynnistää tuotantodeployn automaattisesti. Tarkista Netlifyn deploy-tila ennen kuin ilmoitat julkaisun onnistuneeksi.

Ylläpitäjän nimeä tai yhteystietoa ei ole toimitettu projektitiedostoihin. Täydennä ne sivuille `public/toimitusperiaatteet/index.html` ja `public/tietosuoja/index.html`, jos haluat julkaista ne; älä arvaa puuttuvia tietoja. Hosting-palvelun teknisiä loki- tai säilytyskäytäntöjä ei voi todentaa sivuston lähdekoodista. Ennen julkaisua tarkista lähderekisterin ja BOE-/viranomaislinkkien ajantasaisuus sekä aja `node scripts/check-site.mjs`.

## Google Search Console — omistajuus vahvistettu

Google Search Console -omistajuus on vahvistettu URL-prefix-ominaisuudelle `https://espanjan-talvi.netlify.app/`. Etusivun `google-site-verification`-meta-tunniste tarvitaan tähän vahvistukseen, joten älä poista sitä. Search Console -vahvistus itsessään ei asenna Google Analyticsia tai muuta kävijämittausta; Cloudflare Web Analytics on tästä erillinen, HTML-koodissa oleva toteutus.

1. Sitemap `https://espanjan-talvi.netlify.app/sitemap.xml` on ilmoitettu Search Consolessa vastaanotetuksi. Seuraa edelleen Sitemaps- ja Page indexing -raportteja; sitemapin käsittely ei takaa sivujen indeksointia. [Googlen sitemap-ohje](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
2. Käytä URL inspection -työkalua etusivuun ja tärkeimpiin laskeutumissivuihin. Tarkista canonicalit, crawl- ja indexing-virheet sekä löytyneiden sivujen tila.
3. Performance-raportista voi seurata näyttökertoja, klikkauksia, CTR:ää, keskimääräistä sijaintia ja hakukyselyjä sekä laskeutumissivuja. Tuloksia ei pidä olettaa ennen kuin ne näkyvät raportissa.

## Mittaussuunnitelma ja mitä ei vielä mitata

- **Indeksointi/sitemap:** omistajuus on vahvistettu. Tarkista Sitemaps- ja Page indexing -raporttien tämänhetkinen tila; älä päättele indeksointia pelkästä vahvistuksesta.
- **Hakutulokset:** tarkista Performance-raportista impressions/clicks/queries/pages sekä ajan myötä CTR. Tämänhetkisiä lukuja ei ole tarkistettu eikä niitä päätellä lähdekoodista.
- **Budjettilaskurin käyttö:** tällä hetkellä ei mitata. Search Console näyttää budjettisivun haku- ja laskeutumissivutietoja, ei lomakkeen käyttöä. Jos erillinen mittaus myöhemmin hyväksytään, mittaa korkeintaan laskurin aloitus/laskentatapahtuma suostumus- ja tietosuojaratkaisun jälkeen; älä koskaan lähetä euroarvoja, matkan päivämääriä tai muita lomakekenttien sisältöjä analytiikkaan.
- **Affiliate-linkit ja tulokset:** tarkastetussa koodissa ei ole affiliate-seurantaa; mahdollisten linkkien kumppanuussuhteita ei ole tässä tarkistuksessa erikseen vahvistettu. Jos kumppanuusmarkkinointia myöhemmin lisätään, päivitä sitä koskevat tiedot ja mittaa linkkien tuloksia vain erillisellä päätöksellä. Erota kumppanin raportoimat varaukset klikkauksista äläkä esitä provisioita tai konversioita ilman todellista dataa.
- **Nykyinen tila:** Search Console -omistajuus ja ensisijaisen sitemapin käsittely on ilmoitettu vahvistetuiksi. Cloudflare Web Analytics -tagi on kahdeksalla indeksoitavalla sivulla; mittauspyynnön onnistumista tai raporttidatan kertymistä ei ole vahvistettu. Budjettilaskurin käyttöä, affiliate-klikkauksia tai myyntejä ei mitata erillisinä tapahtumina.

## Avoimet tietotäydennykset ja ylläpito

- Lisää sivuston ylläpitäjän nimi, julkinen korjauskanava ja tietosuojayhteyshenkilön tiedot.
- Tarkista vuokrausta koskevat lakilinkit ja omaan tilanteeseen soveltuvat viranomaisohjeet uudelleen; yleisopas ei ole juridinen tarkistus.
- Varmista kaikki vuokraraporttien syyskuu 2026 arvot uudestaan, jos julkaisu siirtyy tai raportointi päivittyy. Päivitä taulukko ja lähderekisteri yhdessä.
- Ensisijainen canonical-origin on `https://espanjan-talvi.netlify.app/`; tarkista se sekä Search Consolen propertyn host ennen mahdollista uutta domainmigraatiota.
- Harkitse omistajan tarkistusta kaupungin arjen kuvauksiin sekä kunkin lainatun kuvan käyttöön ennen kaupallista muutosta. Sivuston kuvat ovat peräisin useista lähteistä, kuten Unsplashista ja Wikimedia Commonsista. Kuvatiedostojen lähteet, tekijätiedot ja käyttöoikeudet on dokumentoitu `IMAGE-SOURCES.md`-tiedostossa; yksittäisten kuvien lisenssit ja attribuutiovaatimukset vaihtelevat lähteen mukaan.
