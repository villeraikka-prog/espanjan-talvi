# Espanjan talviarki — staattinen sivusto

Suomenkielinen, Cloudflare Pagesiin soveltuva staattinen opas 1–6 kuukauden talvehtimisen suunnitteluun. Tämä hakemisto sisältää paikallisen, julkaisemattoman version. Mitään ei ole siirretty etärepoon, julkaistu verkkoon tai kytketty Google Search Consoleen. Mainoksia, affiliate-linkkejä, analytiikkaa, lomakkeita, tilejä tai tietokantaa ei ole.

## Rakenne

- `public/` — julkaistava sivusto: HTML-sivut, CSS, paikalliset kuvat, favicon, selainpuolen budjettilaskuri, `robots.txt` ja `sitemap.xml`.
- `scripts/check-site.mjs` — staattinen tarkistin: sivujen metatiedot, canonicals, sisäiset linkit ja kuvat, sitemap sekä budjettilaskurin laskenta ja reunatapaukset.
- `SOURCES.md` — ilmasto-, vuokra-, liikkumis-, hallinto-, julkaisu- ja mittauslähteiden rekisteri.
- `IMAGE-SOURCES.md` — kuvien lähdesivut, kuvaajat, käyttöehdot ja paikalliset tiedostot.
- Tutkimuskansiossa olevia alkuperäisiä raportteja ei ole muokattu.

Sivuston arkkitehtuuri on HTML/CSS/JavaScript ilman build-vaihetta tai riippuvuuksien asennusta. Cloudflare Pagesin julkaistava hakemisto on `public/`. Laskenta tapahtuu käyttäjän selaimessa. Ei backendia, CMS:ää, tietokantaa tai ulkoisia kuvapyyntöjä.

## Paikallinen käyttö ja testit

Avaa PowerShell tässä projektikansiossa:

```powershell
node scripts/check-site.mjs
py -m http.server 4173 --directory public
```

Avaa `http://localhost:4173/`. Pysäytä käynnistetty palvelin `Ctrl+C`-näppäinyhdistelmällä. Jos Python Launcher `py` puuttuu, kokeile `python -m http.server 4173 --directory public`.

**Build-komentoa ei tarvita.** `node scripts/check-site.mjs` on projektin tarkistuskomento; sivuston lähdetiedostot toimivat suoraan julkaisujuuren `public/` kautta. Node.js 24 tai uudempi on testattu, mutta itse julkaistu staattinen sivu ei tarvitse Nodea palvelimella.

## Sivuarkkitehtuuri ja sisältö

- `/` — etusivu ja opastuksen aloituspiste.
- `/talvehtiminen-espanjassa/` — 1–6 kuukauden suunnittelupolku, aikajana, talvikodin tarkistus, liikkuminen sekä viranomaislinkit ja yksilöllisyysrajaukset.
- `/aluevertailu/` — kymmenen kaupungin profiilit, kahdeksan AEMET-aseman kuukausinormaalit ja Idealistan ilmoitusindeksi.
- `/vuokraus/` — asunnon talvikunto, kysymykset ennen maksua, tyhjä saman ehtorakenteen vertailupohja sekä virallinen lakilähde.
- `/budjetti/` — selaimessa toimiva laskuri 1–2 matkustajalle ja 1–6 kuukaudelle. Käyttäjä syöttää kaikki kustannukset; laskuri ei sisällä hintaoletuksia.
- `/toimitusperiaatteet/` ja `/tietosuoja/` — sivuston rajat, lähteet ja nykyiset tietosuojatoiminnot.

Jokaisella indeksoitavalla sivulla on oma title, description, canonical ja yksi H1. `public/sitemap.xml` sisältää nykyiset seitsemän sivua; `robots.txt` osoittaa siihen. Canonical-origin on tällä hetkellä `https://espanjan-talvi.pages.dev/` vain ehdotettua Cloudflare Pages -osoitetta varten. Osoitteen saatavuus tai sivuston julkaisu ei ole vahvistettu. Älä julkaise eri projektinimellä ennen kuin vaihdat kaikki canonical-, `og:url`-, sitemap-, robots- ja tarkistusskriptin origin-arvot.

## Lähteet ja päiväykset

`SOURCES.md` sisältää kahdeksan AEMET-aseman tunnisteet, vertailukaudet, kuukausisarjat ja niiden lähde- sekä CSV-URL:t; lisäksi kunkin kaupungin Idealista-syyskuun 2026 arvon ja kaupunkiraportin. Kunkin taulukon rivit on linkitetty lähteeseen myös sivulla. Idealistan lukua kuvataan vain ilmoitustarjonnan €/m²-mittarina: sitä ei kerrota talvikauden kalustetun vuokrauksen hinnalla. Tällaisesta vertailukelpoisesta kausivuokrasta, sähköstä, internetistä tai vakuudesta ei esitetä yleishintaa.

Kaupunki- ja liikkumiskuvaukset linkittävät paikalliseen liikenneviranomaiseen tai operaattoriin. Aikatauluja tai taksoja ei kovakoodata, koska ne muuttuvat. Vuokra- ja viranomaisväitteet on rajattu ja BOE:n tekstit linkitetään suoraan; yksittäisiä sopimuksia ei tulkita.

Kuvat on kopioitu paikallisesti `public/assets/`-kansioon, pienennettyä JPEG-resoluutiota käyttäen, ja sivut valitsevat `srcset`-kautta 700 tai 1 400 pikselin version. Tekijät ja kuvasivut on hyvän tavan mukaisesti krediitoitu kuvateksteissä. Lisenssien tiedot ovat [IMAGE-SOURCES.md](IMAGE-SOURCES.md).

## Cloudflare Pages — käyttöönotto myöhemmin

Sivustoa ei ole julkaistu eikä käyttäjän tiliä tai kolmannen osapuolen yhteyttä käytetty. Älä jatka näitä vaiheita ilman omaa julkaisupäätöstä.

1. Täydennä ennen julkaisua ylläpitäjän/rekisterinpitäjän nimi, yhteydenotto- ja korjausosoite sekä hostingin tosiasialliset tietosuojatiedot sivuilla `public/toimitusperiaatteet/index.html` ja `public/tietosuoja/index.html`.
2. Tarkista lähderekisterin ja BOE-/viranomaislinkkien ajantasaisuus sekä uuden julkaistavan URL:n saatavuus. Aja `node scripts/check-site.mjs`.
3. Päätä julkaisumalli ennen projektin luontia: Cloudflaren nykyohjeen mukaan Direct Upload -projektia ei voi myöhemmin vaihtaa Git-integraatioksi eikä Git-projektia Direct Uploadiksi. Git-integraatio edellyttää, että omistaja luo GitHub-/GitLab-etärepositorion ja yhdistää sen omalta tililtään; tätä projektia ei ole pusketty tai liitetty etärepoon. Jos Git valitaan, yhdistä vain tämä projektihakemisto, älä sen yläpuolista `SideHustle`-kansiota.
4. **Direct Upload:** Cloudflare-hallintapaneelissa avaa **Workers & Pages → Create application → Get started → Drag and drop your files**, nimeä Pages-projekti ja lataa käyttöliittymän pyytämät julkaisutiedostot `public/`-kansiosta. Staattinen sivu ei vaadi build-komentoa. **Git-integraatio:** yhdistä valitsemasi etärepositorio tähän projektihakemistoon; aseta **Framework preset: None**, **Build command: tyhjä**, **Build output directory: `public`**. Älä lisää build-komentoa.
5. Jos valitsemasi `*.pages.dev`-osoite poikkeaa canonical-originista, päivitä osoite jokaiseen HTML-tiedostoon (canonical ja `og:url`), `public/sitemap.xml`, `public/robots.txt` ja `scripts/check-site.mjs`. Aja tarkistin uudelleen.
6. Tarkista Cloudflaren näyttämät asetukset ja julkaise itse. Maksullista domainia ei tarvita tälle testille.

Ohjeet: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) ja [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Google Search Console — vasta julkaisun jälkeen

Search Consolea ei ole vahvistettu eikä yhdistetty. Kun oikea URL on julkinen:

1. Lisää Search Consoleen [URL-prefix-ominaisuus](https://support.google.com/webmasters/answer/10432366?hl=en) täsmällisellä protokollalla ja projektiosoitteella, esim. `https://<valittu-projekti>.pages.dev/`.
2. Vahvista omistajuus Googlen antamalla HTML-tiedostolla tai täsmällisellä meta-tagilla. Julkaise tiedosto/tagi sivulle ja säilytä se vahvistuksen jälkeenkin. Älä käytä esimerkkitunnistetta tai julkaise arvattua tokenia.
3. Lähetä `https://<valittu-projekti>.pages.dev/sitemap.xml` Search Consolen Sitemaps-raportissa. [Googlen sitemap-ohje](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Seuraa raportista, löytyikö tiedosto, löytyivätkö URL:t ja ovatko ne indeksoituneet. Sitemapin lähetys ei takaa indeksointia.
4. Käytä URL inspection -työkalua etusivuun ja tärkeimpiin laskeutumissivuihin. Tarkista canonicalit, crawl- ja indexing-virheet sekä löytyneiden sivujen tila.
5. Performance-raportista seuraa näyttökertoja, klikkauksia, CTR:ää, keskimääräistä sijaintia ja hakukyselyjä sekä mitkä laskeutumissivut saavat niitä. Tarkastele kuukausittain ja vertaile samankestoisia jaksoja; älä tulkitse pientä aineistoa kysyntäennusteeksi.

## Mittaussuunnitelma ja mitä ei vielä mitata

- **Indeksointi/sitemap:** Search Consolen Sitemaps- ja Page indexing -raportit julkaisemisen jälkeen; korjaa virheet ja testaa tärkeät URL:t.
- **Hakutulokset:** Performance-raportin impressions/clicks/queries/pages sekä ajan myötä CTR; dataa ei ole vielä olemassa.
- **Budjettilaskurin käyttö:** tällä hetkellä ei mitata. Search Console näyttää budjettisivun haku- ja laskeutumissivutietoja, ei lomakkeen käyttöä. Jos erillinen mittaus myöhemmin hyväksytään, mittaa korkeintaan laskurin aloitus/laskentatapahtuma suostumus- ja tietosuojaratkaisun jälkeen; älä koskaan lähetä euroarvoja, matkan päivämääriä tai muita lomakekenttien sisältöjä analytiikkaan.
- **Tulevat affiliate-linkit ja tulokset:** niitä ei ole. Lisää vasta erillisellä hyväksynnällä, päivitä kaupallinen ilmoitus ja tietosuojatiedot, käytä linkkien klikkausmittausta vain soveltuvin luvin ja erottele kumppanin raportoimat toteutuneet/kelvolliset varaukset klikkauksista. Älä esitä provisioita tai konversioita ennen todellista dataa.
- **Nykyinen tila:** analytiikkaa, Search Console -dataa, liikennettä, indeksoitumista, affiliate-klikkauksia tai myyntejä ei ole yhdistetty tai mitattu.

## Ennen julkista julkaisua vielä täydennettävä

- Lisää sivuston ylläpitäjän nimi, julkinen korjauskanava ja tietosuojayhteyshenkilön tiedot.
- Tarkista vuokrausta koskevat lakilinkit ja omaan tilanteeseen soveltuvat viranomaisohjeet uudelleen; yleisopas ei ole juridinen tarkistus.
- Varmista kaikki vuokraraporttien syyskuu 2026 arvot uudestaan, jos julkaisu siirtyy tai raportointi päivittyy. Päivitä taulukko ja lähderekisteri yhdessä.
- Varmista, että Cloudflare Pages -projektin lopullinen canonical-osoite on valittu ennen ensimmäistä julkaisua ja että kaikki SEO-URL:t on päivitetty.
- Harkitse omistajan tarkistusta kaupungin arjen kuvauksiin sekä kunkin lainatun kuvan käyttöön ennen kaupallista muutosta. Kuvat on lisensoitu Unsplashissa, ja niiden tekijät on nimetty.
