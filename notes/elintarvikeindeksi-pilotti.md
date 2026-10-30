# MAPA:n elintarvikkeiden hintaindeksin datapilotti

**Tarkistuspäivä:** 29.10.2026

**Tila:** lähde- ja aineistopilotti; ei muutoksia sivuston toteutukseen
**Yksiselitteinen päätös:** MAPA-aineistosta ei tämän tarkistuksen perusteella pidä julkaista yhdistettyä 28 pääryhmän elintarvikkeiden hintaindeksiä. MAPA:n virallinen CCAA-sarjatyökirja sisältää käyttökelpoisia alueellisia ostojen keskihintoja, mutta virallinen online-kysely, jolla 28 ryhmän erilliset tulokset pitäisi varmistaa, palautti 404-virheen. Ohjesivu ei luettele kaikkia 28 ryhmää, eikä ladatun sarjatyökirjan riveistä voi luotettavasti päätellä niiden täsmällistä ryhmäkarttaa tai kattavuutta. Puuttuvia ryhmäarvoja tai painoja ei siksi täytetty eikä laskentaa arvattu.

## 1. MAPA:n tietomalli ja lähteet

MAPA:n kotitalouksien kulutustietokannan ohje kertoo, että tietokannasta voi hakea 28 suurta ruokaryhmää, jotka jakautuvat 624 erittelyriviin. Ohjeen mukaan suuret ryhmät ovat toisensa poissulkevia, mutta yksittäiset erittelyrivit voivat olla informatiivisia ja sisältää useampaan alaryhmään kuuluvia tuotteita. Siksi erittelyrivien summia ei pidä käsitellä ryhmien summana. Ohje kuvaa erilliset haut tuoteryhmille, ajanjaksoille ja maantieteelle; Espanja ja kukin itsehallintoalue haetaan erikseen. [MAPA:n tietokantaohje](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/base-de-datos-de-consumo-en-hogares/ayuconsum)

Ohjeessa nimetyt muuttujat ja niiden yksiköt ovat:

| MAPA-muuttuja | Yksikkö / merkitys |
|---|---|
| Cantidad / volumen | Tuhatta kg tai litraa; kananmunille myös kappaleita |
| Valor | Tuhatta euroa |
| Precio medio | Euroa tuoteryhmän fyysistä yksikköä kohti: tavallisesti €/kg tai €/l, kananmunilla yksikkö voi olla kappale |
| Penetración | Niiden kotitalouksien prosenttiosuus, jotka ostivat tuotetta tarkastelujaksolla |
| Consumo per cápita | kg tai litraa henkilöä ja ajanjaksoa kohti |
| Gasto per cápita | euroa henkilöä ja ajanjaksoa kohti |

Pilotissa ei käytetä eikä määritellä henkilökohtaista kulutusmäärää. Hintaindikaattoreihin tarvitaan vain saman ryhmän alueellinen ja kansallinen keskihinta. Mahdollisen painotuksen lähde olisi MAPA:n `Valor` eli ryhmän ostojen arvo, ei itse keksitty ostoskori.

MAPA:n metodologiasivu kuvaa kotitalouspaneelin kotitalouksien suoraan omaan käyttöön tekemiä ruoka- ja juomaostoja. Se ei ole alueen kaikkien kauppojen hyllyhintojen otanta eikä kuvaa ravintola- tai matkailukulutusta. MAPA myös kertoo maidon hintasivulla, että paneelin keskihinta on kotitalouksien tosiasiassa maksama ostohinta; se ei välttämättä vastaa kaupan tarjolla olevien tuotteiden hintaa, koska kuluttajat valitsevat eri tuotteita ja hintoja. [MAPA:n menetelmäkuvaus](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/metodologia/) · [MAPA: maitoaineiston selitys](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/ultimos-datos/consumo-leche-y-derivados)

### Käytetty viitejakso

MAPA:n sarjasivulla oli tarkistushetkellä vuoden 2026 CCAA-kuukausiaineisto elokuuhun asti. Yhteiseksi viimeisimmäksi täydelliseksi 12 kuukauden ikkunaksi valittiin **syyskuu 2025 – elokuu 2026**. Se muodostettiin saman INE 2021 -pohjan CCAA-työkirjoista: syyskuu–joulukuu 2025 MAPA:n joulukuun 2025 työkirjasta ja tammi–elokuu 2026 elokuun 2026 työkirjasta. Molemmissa ovat Espanja, Comunitat Valenciana, Región de Murcia ja Andalucía.

- [MAPA:n sarjasivu ja uusimmat kuukausittaiset CCAA-Excelit](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/series-anuales)
- [2025 joulukuun kuukausittainen CCAA-työkirja, INE 2021 -pohja](https://www.mapa.gob.es/es/dam/jcr:fbc5c7de-ac34-4dde-aaf5-5c490165ff05/2025dic-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.2026-09-03-13-12-58.xlsx)
- [2026 elokuun kuukausittainen CCAA-työkirja, INE 2021 -pohja](https://www.mapa.gob.es/es/dam/jcr:acba6f6e-34b8-4038-85e9-37231e9fe983/2026ago-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.e3a4eccb7d9e3a1d689120ea8cbbcb85.xlsx)

MAPA kertoo sarjasivulla vuoden 2024 kesäkuusta alkaen uudelleen lasketuista tiedoista, jotka johtuivat tuotteiden viivakoodi-/QR-merkintöjen muutoksesta. Käytetyt 2025–2026 tiedostot ovat molemmat INE 2021 -pohjaisia; tämä rajaa pois vanhemman väestöpohjan sarjojen yhdistämisen.

## 2. Miksi 28 pääryhmän taulukkoa ei voitu varmentaa

MAPA:n ohjesivu vahvistaa 28 ryhmän olemassaolon ja kertoo, että ryhmä- ja aluetulokset haetaan erikseen. Ohjesivulla annetaan esimerkkeinä liha, kala, maito, tuoreet hedelmät ja tuoreet vihannekset, mutta **kaikkien 28 kyselyvalinnan nimeä tai niiden vakaita tunnisteita ei luetella**.

Ohjesivun linkittämä varsinainen online-kysely (`https://www.mapa.gob.es/app/consumo-en-hogares/consulta.asp`) palautti tarkistuspäivänä HTTP 404:n. Siksi 28 ryhmän erillisiä hakuja ei voitu tehdä tai tallentaa lähteen mukaisina kyselytuloksina.

Ladattava kuukausittainen CCAA-työkirja on käyttökelpoinen raakadata: esimerkiksi elokuun 2026 välilehdellä on 731 taulukkoriviä ja neljän alueen muuttujat. Se sisältää kuitenkin satoja hierarkkisia nimikkeitä ja erittelyjä eikä nimeä yhtä yksiselitteistä riviä jokaiselle ohjeessa mainitulle 28 online-kyselyryhmälle. MAPA:n heinäkuun 2025 luokittelu-/määrittelytyökirja kuvaa nomenklatuuria ja informatiivisia rivejä, mutta tarkistetuista julkaistuista aineistoista ei löytynyt varmennettua crosswalkia 28 kyselyvalinnan ja kuukausityökirjan rivien välille. [MAPA:n määritelmät ja luokitukset, heinäkuu 2025](https://www.mapa.gob.es/dam/mapa/contenido/alimentacion/temas/consumo-y-tendencias-en-alimentacion/panel-de-consumo-alimentario/metodologia/definiciones-y-clasificaciones-panel-hogares-rev-julio2025_v1.xlsx)

Tämä on rajattu tiedonhaku-/luokitteluestä, **ei näyttö siitä, että MAPA:lla ei olisi näitä tietoja**. MAPA:n ohje sanoo ryhmien olevan toisensa poissulkevia, mutta se ei oikeuta päättelemään ryhmävalintoja työkirjan riveistä tai summaamaan kaikkia näkyviä alaeriä. Tämän vuoksi 28 rivin taulukkoa, puuttuvien arvojen luetteloa tai 28 ryhmän painoja ei voi tässä raportissa esittää ilman oletuksia. N/A-arvoja ei ole muutettu nolliksi.

## 3. Mitä työkirjasta pystyttiin laskemaan

Alla ovat empiiriset tarkistusrivit MAPA:n julkaistusta sarjatyökirjasta. Ne ovat **nimikekohtaisia esimerkkejä**, eivät väite siitä, että nämä olisivat kaikki 28 pääryhmää, eivätkä ne muodosta ostoskoria. Jokaisen rivin maantieteellinen tarkkuus on itsehallintoalue, vertailualue Espanja. Jokaisella neljällä alueella oli arvo kaikilta 12 kuukaudelta.

Jakson keskihinta on laskettu summatuista lähdearvoista: `Σ Valor / Σ Volumen`. Tämä on volyymillä painotettu keskihinta tarkastelujaksolle, ei 12 kuukausihinnan aritmeettinen keskiarvo. Indikaattori on `100 × alueen keskihinta / Espanjan saman nimikkeen keskihinta`. Espanja = 100. Luvut on pyöristetty taulukossa; indeksit ovat johdettuja, eivät MAPA:n valmiiksi julkaisemia hintatasoindeksejä.

| MAPA:n täsmällinen rivi | MAPA:n määritelmän mukainen yksikkö | Espanja €/yks. (indeksi) | Comunitat Valenciana €/yks. (indeksi) | Región de Murcia €/yks. (indeksi) | Andalucía €/yks. (indeksi) |
|---|---|---:|---:|---:|---:|
| `.TOTAL ALIMENTACION` | €/kg tai l; koko elintarvike- ja juomaryhmän keskihinta | 3,261 (100,0) | 3,129 (95,9) | 3,201 (98,2) | 3,134 (96,1) |
| `T.HUEVOS UNDS.` | €/muna; munat yksikköinä | 0,271 (100,0) | 0,269 (99,3) | 0,272 (100,4) | 0,269 (99,4) |
| `TOTAL LECHE LIQUIDA` | €/l; nestemäinen maito | 0,983 (100,0) | 1,000 (101,7) | 1,031 (104,9) | 0,961 (97,8) |
| `PAN` | €/kg; kaiken tyyppinen pakattu tai pakkaamaton leipä | 2,853 (100,0) | 2,951 (103,5) | 2,821 (98,9) | 2,815 (98,7) |
| `ARROZ` | €/kg; MAPA:n määritelmä kattaa riisin lisäksi myös riisipohjaisia valmisruokia ja eri riisilajikkeita | 2,399 (100,0) | 2,344 (97,7) | 2,230 (93,0) | 2,386 (99,4) |

**Lähteen raakamuuttujat:** jokaisen esimerkkirivin `VALOR` ja `VOLUMEN` olivat saatavilla 12/12 kuukaudelta kaikilla alueilla. Yksiköt ovat Excelissä `VALOR (Miles Euros)` ja `VOLUMEN (Miles kg ó litros)`; kananmunarivillä määrä on kappaleina. Esimerkiksi `.TOTAL ALIMENTACION`-rivillä koko ikkunan lähdearvot olivat Espanjassa 87 591 662,072 tuhatta euroa / 26 857 800,753 tuhatta kg/l; Comunitat Valencianassa 9 454 901,707 / 3 022 110,191; Región de Murciassa 2 766 386,057 / 864 231,741; Andaluciassa 14 507 584,165 / 4 629 716,895. Näiden osamäärät tuottavat taulukon keskihinnat.

Esimerkkirivit osoittavat, että alueellisia keskihintoja voi laskea ladatusta työkirjasta. Ne eivät ratkaise 28 ryhmän kartoitusta. Lisäksi esimerkiksi `ARROZ`-rivi ei ole yhden vakioidun riisipakkauksen hinta ja koko ruokaryhmän rivi yhdistää eri ruokia, juomia sekä niiden määrien koostumuksen.

## 4. Painojen ja yhdistelmäindeksin arvio

MAPA:n muuttujissa on ryhmäkohtainen `VALOR (Miles Euros)`, joten Espanjan ostomenojen painot olisivat **periaatteessa** lähteeseen perustuvia:

```text
w_i = Espanjan VALOR_i / Σ(Espanjan VALOR_j, kaikki mukaan otetut 28 ryhmää)
ryhmäsuhde_i,alue = alueen PRECIO MEDIO_i / Espanjan PRECIO MEDIO_i
yhdistelmä = 100 × Σ(w_i × ryhmäsuhde_i,alue)
```

Tämä laskenta jätettiin tekemättä, koska 28 ryhmän tunnisteita ja kaikkien ryhmien erillisiä tuloksia ei saatu varmennettua. Siksi ei voitu tarkistaa, että:

1. painojen nimittäjä sisältää täsmälleen kaikki 28 toisensa poissulkevaa ryhmää eikä päällekkäisiä erittelyrivejä;
2. ryhmät kattavat koko `TOTAL ALIMENTACION`-arvon (ja kuinka suuri kattavuus on);
3. yhtään ryhmäarvoa ei puutu tai ole nolla;
4. ryhmien yksikköhinnat ovat samalle määritellylle tuotteiden kattavuudelle ja jaksolle.

Näitä ehtoja ei pidä korvata painojen hiljaisella uudelleennormalisoinnilla tai arvojen imputoinnilla. Vaikka ehdot täyttyisivät, tulos olisi **kansallisilla ostomeno-osuuksilla painotettu ryhmäkohtaisten ostojen keskihintojen suhteiden yhdistelmä**, ei vakioidun ostoskorin hintaindeksi. MAPA:n ryhmän sisäinen keskihinta voi muuttua tuotelaadun, pakkauskoon, merkin, tarjousten ja alueellisen ostovalikoiman vuoksi. Sama ongelma näkyy MAPA:n metodologisessa kuvauksessa tosiasiallisesti maksetuista hinnoista ja kuluttajan tuotevalinnasta.

### Onko vaihtoehtona erillisiä ryhmäindikaattoreita?

Erilliset MAPA:n lähderivien hinnat ovat yhdistelmäindeksiä läpinäkyvämpi vaihtoehto, kun rivin rajaus ja yksikkö voidaan nimetä täsmällisesti. Yllä olevat muna-, nestemäisen maidon ja leivän hinnat ovat teknisesti laskettavissa; nekin ovat alueellisia toteutuneita kotitalousostojen keskihintoja, eivät vakioidun tuotteen kauppahintoja. Riisirivi on erityisen laaja, koska MAPA:n määritelmä sisältää useita riisilajeja ja riisipohjaisia valmisruokia.

Näitä neljää ei pidä ottaa lopulliseksi tuotelistaksi niiden tulosten perusteella. Ne ovat teknisiä esimerkkejä muuttujista ja yksiköistä. Jos erillisiä indikaattoreita halutaan myöhemmin, valitaan ryhmät etukäteen toimituksellisin perustein, tarkistetaan määritelmä ja riittävä alueellinen havaintopohja sekä julkaistaan jokaiselle oma yksikkö, ajanjakso, lähde ja rajoite. Työkirja ei tässä muodossa anna rivikohtaista luottamusväliä tai virhemarginaalia, joten aineistosta ei voi arvioida kaupunkien tai alueiden erojen tilastollista merkitsevyyttä.

## 5. Suositus Elinkustannukset-sivulle

1. **Älä julkaise yhdistettyä MAPA-elintarvikeindeksiä tässä vaiheessa.** 28 ryhmän kyselytulokset ja kattavuuden tarkistus puuttuvat, ja yksikköhintojen ryhmäsisältö voi vaihdella alueittain.
2. **Älä esitä `.TOTAL ALIMENTACION`-rivin suhdetta alueiden yleisenä ruokakustannustasona.** Se on hyödyllinen lähteen oma aggregaattinen ostojen keskihinta, mutta ei sama kuin vakioidun korin hintaero.
3. **Erilliset tuoteryhmäindikaattorit ovat mahdollisia myöhemmässä vaiheessa**, jos MAPA:n kysely saadaan toimimaan tai 28 ryhmän ja sarjatyökirjan rivien virallinen vastaavuus vahvistetaan. Esitä ne nimellä “kotitalousostojen keskihinta” tai “suhde Espanjan MAPA-keskihintaan”, ei yleisenä elintarvikkeiden hintaindeksinä.
4. Näytä saman itsehallintoalueen arvo kaikille sen alla oleville kohteille ja merkitse alueellinen tarkkuus näkyvästi. Älä johda kaupunkitason eroja CCAA-datasta.
5. Älä laske kokonaispistemäärää muiden kustannuskategorioiden kanssa.

### Pienin seuraava tutkimusaskel

MAPA:lta tarvitaan joko (a) toimiva virallinen 28 ryhmän kysely ja sen tulosten lataus tai (b) MAPA:lta vahvistettu lista 28 kyselyryhmän tunnisteista sekä niiden täsmällinen vastaavuus CCAA-sarjatyökirjan riveihin. MAPA:n tietokantaohjeessa annetaan yhteystiedoksi [consumoalimentario@mapa.es](mailto:consumoalimentario@mapa.es). Kun vastaavuus on saatu, seuraava testi on kerätä kaikkien 28 ryhmän `PRECIO MEDIO` ja `VALOR` samalta 12 kuukaudelta neljälle alueelle, laskea kansalliset painot ja tarkistaa arvosumman kattavuus `TOTAL ALIMENTACION`-rivistä. Julkaisupäätös tehdään vasta tämän jälkeen.

## 6. Lähdeluettelo ja jäljitettävyys

- [MAPA: tietokannan käyttöohje ja muuttujat](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/base-de-datos-de-consumo-en-hogares/ayuconsum) — 28 ryhmän määrä, muuttujat, maantieteellinen kysely ja päällekkäisten informatiivisten erittelyrivien varoitus.
- [MAPA: paneelin metodologia](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/metodologia/) — kotitalouksien ostotutkimuksen rajaus ja virallinen metodologia.
- [MAPA: sarjasivu](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/series-anuales) — kuukausittaiset CCAA-tiedostot sekä vuoden 2024 uudelleenlaskentahuomautus.
- [MAPA: 2025 CCAA Excel](https://www.mapa.gob.es/es/dam/jcr:fbc5c7de-ac34-4dde-aaf5-5c490165ff05/2025dic-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.2026-09-03-13-12-58.xlsx) ja [2026 CCAA Excel](https://www.mapa.gob.es/es/dam/jcr:acba6f6e-34b8-4038-85e9-37231e9fe983/2026ago-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.e3a4eccb7d9e3a1d689120ea8cbbcb85.xlsx) — käytetty raakadata; välilehdet kattavat valitun 12 kuukauden ikkunan ja alueet.
- [MAPA: heinäkuun 2025 tuote- ja luokittelusanasto](https://www.mapa.gob.es/dam/mapa/contenido/alimentacion/temas/consumo-y-tendencias-en-alimentacion/panel-de-consumo-alimentario/metodologia/definiciones-y-clasificaciones-panel-hogares-rev-julio2025_v1.xlsx) — muun muassa esimerkkirivien nimikkeet, määritelmät ja informatiiviset rivit.
- [MAPA: nestemäisen maidon tiedot ja hintatulkinta](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/ultimos-datos/consumo-leche-y-derivados) — tosiasiassa maksetun keskihinnan tulkinta.

## 7. Muutosten rajaus

Tässä työssä luotiin vain tämä analyysiraportti. MAPA:n Excelit ladattiin tarkastelua varten käyttöjärjestelmän väliaikaiseen hakemistoon; niitä ei lisätty projektiin. Sivuston HTML-, CSS- tai JavaScript-tiedostoja, dataa, lähderekisteriä, riippuvuuksia tai asetuksia ei muutettu. Gitissä ennestään olleet paikalliset muutokset säilytettiin.
