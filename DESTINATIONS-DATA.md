# Kohdedatan ylläpito

## Nykyinen julkaisutilanne

Sivustossa on 24 kohdetta ja 24 julkaistua, generoituvaa kohdeprofiilisivua sekä `/kohteet/`-hakemisto. Viiden ryhmän nykyinen jako on:

| Alue | Profiilit |
| --- | --- |
| Costa Blanca (8) | Alicante, Torrevieja, Benidorm, Orihuela Costa, Guardamar del Segura, Dénia, Jávea / Xàbia, Calp / Calpe |
| Costa del Sol (2) | Málaga, Fuengirola |
| Costa Cálida (6) | Cartagena, Los Alcázares, San Pedro del Pinatar, La Manga del Mar Menor, Puerto de Mazarrón, Águilas |
| Costa de Almería (4) | Almería, Roquetas de Mar, Almerimar, Vera |
| Muut kohteet Espanjassa (4) | Valencia, Murcia, Cádiz, Huelva |

Molemmissa sitemap-tiedostoissa (`public/sitemap.xml` ja `public/sitemap-google.xml`) on sama 33 canonical-URL:n joukko: kahdeksan muuta indeksoitavaa sivua, kohdehakemisto ja 24 profiilia. Generaattori ja tarkistusskripti vahvistavat määrän ja vastaavuuden.

## Tietomallin vastuut

- `public/assets/destinations.mjs` sisältää kolme täydellistä kohdefaktatietuetta (Torrevieja, Fuengirola ja Benidorm) sekä 21 muun profiilin lähteistetyt toimitukselliset sisältötietueet. Näiden 21 profiilin yhteisiä faktatietoja, kuten ilmastoasemia ja Idealista-rivejä, luetaan edelleen nykyisistä lähdetaulukoista tai vertailumoduulista. Siksi kaikkien kohteiden faktat eivät vielä asu yhdessä täydellisessä tietueessa.
- `public/assets/destination-scores.mjs` sisältää kaikkien 24 kohteen hyväksytyt, seitsemän kategorian toimitukselliset tähtiarviot. Asteikko sallii puolikkaat tähdet. `null` merkitsee arvioimatonta tapahtumakategoriaa eikä nollaa. Pisteet ovat erillisiä ilmasto-, merivesi- ja vuokratiedoista, eikä niitä summata yleisarvosanaksi.
- `public/assets/destination-directory.mjs` ja hakemiston staattinen HTML esittävät 24 kohdetta viidessä alueessa.
- `scripts/generate-destination-pages.mjs` kokoaa yhteisen lähdedatan ja sisältömallit staattisiksi HTML-sivuiksi. Profiilisivujen URL-slugit ovat nykyisiä pysyviä tunnisteita.
- `scripts/check-site.mjs` tarkistaa sivujen generoidun sisällön, metatiedot, lähteet, kuvat, sisäiset linkit, tähtiarvot, canonicalit ja sitemapit.

Tietomallien ID:t, lähteistetyt arvot ja luokittelut ovat ylläpidettäviä tietoja. Generoitu HTML on julkaistava tulos, eikä sitä pidä muokata käsin; tee muutokset ensin malliin tai generaattoriin ja generoi sivut sen jälkeen.

## Profiilin generointi ja tarkistus

Sivusto julkaistaan staattisena `public/`-hakemistosta ilman tuotannon build-vaihetta. Kun tietomallia tai generaattoria on muutettu, suorita:

```sh
node scripts/generate-destination-pages.mjs
node scripts/generate-destination-pages.mjs --check
node scripts/check-site.mjs
```

Ensimmäinen komento päivittää hakemiston ja kaikki 24 profiilisivua. `--check` varmistaa, ettei generoitu tulos ole vanhentunut; sivuston tarkistusskripti ajaa tämän tarkistuksen ja validoi lisäksi kokonaisuuden. Älä lisää sitemap-URL:ää käsin ilman canonical-sivua ja vastaavia testejä.

## Tietojen ylläpidon periaatteet

1. Säilytä nykyinen kohde-ID, slug, nimi ja aluekytkentä. Nimen toimituksellinen muutos ei saa muuttaa reittiä tai vertailun tunnistetta.
2. Lisää faktaväitteeseen luonne, maantieteellinen kattavuus, tarkistuspäivä ja lähde-URL:t. Erota lähteestä vahvistettu tieto toimituksellisesta tulkinnasta.
3. Ilmastotiedoissa säilytä aseman ID ja nimi, aseman rooli, vertailujakso, kattavuus ja AEMET-lähde. Kuukausitaulukoiden kaikki arvot kuuluvat omiin taulukoihinsa; niitä ei kopioida profiiliteksteihin vaihtoehtoisena tietolähteenä.
4. Meriveden lämpötila on NOAA/NCEI OISST -ruudun alueellinen arvo, ei rantamittaus. Säilytä aineisto, normaalijakso, kuukausi, ruudun sijainti ja yksikkö.
5. Idealista-arvo on päivätty vuokrailmoitusten pyyntihintaindeksi yksikössä €/m²/kk. Säilytä raporttialue, havaintokuukausi ja täsmällinen raporttilinkki. Se ei ole toteutunut vuokra, saatavuusmittari eikä talvikauden kalustetun vuokrauksen hinta.
6. Kun kuvaa vaihdetaan, päivitä pää- ja responsiiviset polut, kuvasuhde, alt-teksti, lähdesivu, tekijä, lisenssi ja muutosmerkintä. Päivitä myös `IMAGE-SOURCES.md`; älä päättele puuttuvia käyttöoikeustietoja.
7. Pidä toimitukselliset arviot ja lähteistetyt faktat erillään. Yhteiset tähtikategorioiden tulkintarajaukset näytetään kerran profiilin metodiosiossa; kategoriakohtaiset lähteet, tarkistuspäivät ja erityiset rajaukset säilyvät korttien omissa avattavissa osioissa.
8. Älä täytä tuntemattomia tietoja arvauksilla. Kattavuusmerkinnät, kuten `proxy-data`, `not-assessed`, `sources-not-comparable`, `qualitative-only` ja `rental-index-only`, kuvaavat tiedon rajoja eivätkä ole tähtipisteitä.

## Aluevalitsimen ja etusivun vertailun rajat

Etusivun 24 kohteen vertailutyökalu säilyttää nykyisen HTML-korttien ja lähdetaulukoiden rakenteen. `public/assets/area-comparison.mjs` käyttää kohdedataa siellä, missä tietue on jo täydellinen, ja sovittaa muut kohteet edelleen vanhasta staattisesta HTML-lähteestä. Älä muuta aluejakoa, valitsimen järjestystä, ilmastoarvoja, meriruudun arvoja, vuokralukuja tai kuvia osana profiilien toimituksellista päivitystä.

Etusivun vertailun muutokset ja profiilien tähtiarviot ovat eri ominaisuuksia. Profiilisivujen metoditekstin tiivistäminen ei saa muuttaa pisteitä, valitsinta, vertailurivejä tai etusivun ulkoasua.
