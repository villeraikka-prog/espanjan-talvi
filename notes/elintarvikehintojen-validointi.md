# MAPA-elintarvikehintojen validointi

**Tarkistuspäivä:** 30.10.2026

**Rajaus:** read-only-analyysi. Sivuston HTML-, CSS- ja JavaScript-tiedostoja ei muutettu.

## Johtopäätös

MAPA:n vuoden 2025 täydestä vuosiaineistosta voidaan laskea kahdeksalle tuoteryhmälle jäljitettävä **kotitalouksien ostojen keskihinta** Espanjalle, Comunitat Valencianalle, Región de Murcialle ja Andalusialle. Lisäksi kullekin ryhmälle voidaan laskea alueen suhde saman ryhmän Espanjan keskihintaan (Espanja = 100).

Tulos ei ole vakioidun tuotteen eikä yhtenäisen ostoskorin hintaindeksi. Se kuvaa MAPA-paneelissa toteutuneiden kotitalousostojen arvoa ja määrää kyseisessä luokassa. Tuotevalikoiman, laadun, tuotemerkkien, pakkauskoon ja ostovalintojen erot voivat vaikuttaa keskihintaan. Siksi tulos kannattaa nimetä **MAPA-kotitalousostojen alueelliseksi hintamittariksi**, ja sen yhteydessä pitää kertoa alueellinen tarkkuus ja lähdejakso. Sitä ei pidä esittää yleisenä elinkustannuslukuna eikä kaupunkikohtaisena mittauksena.

Nykyinen syyskuu 2025 – elokuu 2026 -pilotti ei ole luotettava 12 kuukauden vertailu. Vuoden 2026 työkirjan tammikuuksi, helmikuuksi ja maaliskuuksi nimetyt välilehdet sisältävät kaikki helmikuun otsikon ja täsmälleen samat tiedot. Pilotin kolmen tuotteen arvot ovat laskettavissa käytetyistä työkirjoista, mutta aineiston kuukausikattavuus on virheellinen. Niitä ei pidä julkaista vahvistettuina 12 kuukauden keskiarvoina.

**Suositus:** jos sivulle lisätään elintarviketietoa, käytetään kahdeksaa erillistä tuoteryhmää ja kalenterivuoden 2025 arvoja. Näytetään kunkin ryhmän hinta ja suhde Espanjaan erillisinä mittareina. Ei lasketa niistä yhdistettyä elintarvikeindeksiä.

## Lähdeaineisto ja tarkistusmenetelmä

Käytetty yhteinen viitejakso on **1.1.–31.12.2025**. MAPA:n julkaisema vuoden 2025 vuosityökirja sisältää `VALOR`-, `VOLUMEN`- ja `PRECIO`-välilehdet. Sen pohjana on INE:n väestöpohja 2021. Vertailu tehtiin saman työkirjan neljälle alueelle.

Tarkistin tiedot myös MAPA:n vuoden 2025 kuukausittaisesta CCAA-työkirjasta:

- Kaikki 12 kuukausivälilehteä löytyivät, ja niiden otsikkokuukaudet vastasivat välilehtiä.
- Kaikilla kahdeksalla valitulla rivillä oli arvo jokaiselta 12 kuukaudelta kaikille neljälle alueelle.
- Kuukausien `VALOR`- ja `VOLUMEN`-summat täsmäsivät vuosityökirjan vastaaviin lukuihin jokaisella rivillä ja alueella.
- Vuosityökirjan `PRECIO` täsmäsi laskentaan `VALOR / VOLUMEN`.

Laskenta:

```text
vuoden keskihinta = vuoden VALOR / vuoden VOLUMEN
alueen ryhmäindeksi = 100 × alueen ryhmän keskihinta / Espanjan saman ryhmän keskihinta
```

MAPA ilmoittaa `VALOR`-arvot tuhansina euroina ja `VOLUMEN`-arvot tuhansina ostoyksikköinä. Tuhannet supistuvat osamäärässä: kananmunille saadaan €/kpl, nestemäiselle maidolle €/l ja muille valituille ryhmille €/kg. Hintataulukon hinnat on pyöristetty kolmeen ja indeksit yhteen desimaaliin. Laskenta ja indeksi tehdään pyöristämättömistä arvoista.

MAPA:n AYUCONSUM-ohjeen mukaan tietokannassa on 28 toisensa poissulkevaa suurta ruokaryhmää sekä 624 tarkempaa nimikeriviä. Tarkemmat informatiiviset rivit voivat sisällyttää samoja ostoja kuin laajemmat luokat. Tässä raportissa käytetään yhtä ryhmäriviä kustakin kahdeksasta luokasta; luokittelutyökirjan informatiivisen rivin kenttä oli näillä riveillä tyhjä. Samasta sisältöluokasta ei otettu rinnalle vaihtoehtoista yksikkö- tai alaryhmäriviä.

## Vuoden 2025 vertailutulokset

Hinta on MAPA:n toteutuneiden kotitalousostojen suhdeluku (`VALOR / VOLUMEN`), ei kaupan hyllyhinta. Indeksi 100 on aina saman ryhmän Espanjan vuoden 2025 keskihinta.

| MAPA-rivi | Määritelmä lyhyesti | Yksikkö | Espanja: hinta / indeksi | Comunitat Valenciana: hinta / indeksi | Región de Murcia: hinta / indeksi | Andalucía: hinta / indeksi |
|---|---|---:|---:|---:|---:|---:|
| `T.HUEVOS UNDS.` | Kananmunat kappaleina | €/kpl | 0,243 / 100,0 | 0,241 / 99,5 | 0,241 / 99,2 | 0,240 / 98,8 |
| `TOTAL LECHE LIQUIDA` | Nestemäinen lehmän-, vuohen- tai lampaanmaito; ei kasvipohjaisia juomia eikä rekonstituoitua maitoa | €/l | 0,973 / 100,0 | 0,989 / 101,6 | 1,019 / 104,7 | 0,956 / 98,2 |
| `PAN` | Kaikenlainen pakattu tai pakkaamaton leipä | €/kg | 2,701 / 100,0 | 2,807 / 103,9 | 2,677 / 99,1 | 2,647 / 98,0 |
| `TOTAL CARNE` | Tuore, pakastettu ja prosessoitu liha | €/kg | 8,737 / 100,0 | 8,463 / 96,9 | 8,537 / 97,7 | 8,244 / 94,4 |
| `PESCADOS` | Tuore ja pakastettu kala | €/kg | 10,931 / 100,0 | 10,673 / 97,6 | 10,771 / 98,5 | 10,416 / 95,3 |
| `T.FRUTAS FRESCAS` | Tuoreet hedelmät, pakattuna tai irtona | €/kg | 2,285 / 100,0 | 2,252 / 98,6 | 2,263 / 99,1 | 2,222 / 97,2 |
| `T.HORTALIZAS FRESCAS` | Tuoreet vihannekset; tuoreet perunat rajattu pois | €/kg | 2,520 / 100,0 | 2,574 / 102,1 | 2,403 / 95,4 | 2,375 / 94,2 |
| `LEGUMBRES` | Kuivat ja kypsennetyt palkokasvit, kuten kikherneet, linssit ja pavut | €/kg | 2,185 / 100,0 | 1,892 / 86,6 | 1,968 / 90,1 | 2,127 / 97,4 |

> **Maantieteellinen tarkkuus:** kaikki aluearvot ovat itsehallintoalueen tasoisia. Saman itsehallintoalueen sivustokohteet näyttäisivät saman MAPA-arvon; luku ei ole kaupungin mittaus.

## Jäljitettävät lähdearvot

Alla `VALOR / VOLUMEN` ovat työkirjan alkuperäiset numeeriset arvot. `VALOR` on tuhansia euroja. `VOLUMEN` on tuhansia kappaleita kananmunille, tuhansia litroja maidolle ja tuhansia kiloja muille riveille. Desimaalierotin on piste eikä luvuissa ole tuhaterottimia.

### VALOR (tuhatta euroa)

| MAPA-rivi | Espanja | Comunitat Valenciana | Región de Murcia | Andalucía |
|---|---:|---:|---:|---:|
| `T.HUEVOS UNDS.` | 1665346.231700 | 197225.238700 | 48693.982980 | 267157.939800 |
| `TOTAL LECHE LIQUIDA` | 2783491.200000 | 277357.230000 | 78499.222000 | 426971.910000 |
| `PAN` | 3480727.400000 | 384770.840000 | 97853.438000 | 618629.980000 |
| `TOTAL CARNE` | 17646595.000000 | 1940589.000000 | 510977.870000 | 2785755.800000 |
| `PESCADOS` | 4625444.000000 | 416335.440000 | 121182.930000 | 783069.290000 |
| `T.FRUTAS FRESCAS` | 8731228.900000 | 917085.360000 | 264904.450000 | 1397621.680000 |
| `T.HORTALIZAS FRESCAS` | 5794030.200000 | 666974.880000 | 160333.890000 | 909277.570000 |
| `LEGUMBRES` | 354738.240000 | 34040.856000 | 9978.545700 | 55207.869000 |

### VOLUMEN (tuhatta ostoyksikköä)

| MAPA-rivi | Espanja | Comunitat Valenciana | Región de Murcia | Andalucía |
|---|---:|---:|---:|---:|
| `T.HUEVOS UNDS.` | 6865713.825000 | 817173.945200 | 202365.053300 | 1114535.907000 |
| `TOTAL LECHE LIQUIDA` | 2860234.000000 | 280394.220000 | 77043.611000 | 446621.050000 |
| `PAN` | 1288521.550000 | 137066.470000 | 36559.086000 | 233700.340000 |
| `TOTAL CARNE` | 2019846.900000 | 229304.250000 | 59851.005000 | 337920.820000 |
| `PESCADOS` | 423155.550000 | 39008.316000 | 11251.295300 | 75177.921000 |
| `T.FRUTAS FRESCAS` | 3821842.000000 | 407235.880000 | 117048.568000 | 629119.070000 |
| `T.HORTALIZAS FRESCAS` | 2299310.300000 | 259170.040000 | 66726.639000 | 382900.280000 |
| `LEGUMBRES` | 162362.990000 | 17987.678000 | 5069.245300 | 25950.535000 |

## Nykyisen 12 kuukauden pilotin tarkistus

Sivuston `public/assets/elinkustannukset.mjs` ilmoittaa nykyiseksi MAPA-jaksoksi syyskuu 2025 – elokuu 2026. Moduuli näyttää hinnat kolmen desimaalin ja alueindeksit yhden desimaalin tarkkuudella. Sen kolmen ryhmän näkyvät luvut voidaan toistaa kyseisistä lähdetaulukoista summaamalla ensin jakson `VALOR` ja `VOLUMEN` ja jakamalla summat.

Ongelma on vuoden 2026 MAPA-kuukausityökirjassa: `Enero 2026`, `Febrero 2026` ja `Marzo 2026` -nimisten välilehtien otsikkosolu ilmoittaa kaikissa `FEBRERO 26`. Kaikkien solujen aineisto näillä kolmella välilehdellä on identtinen. Huhtikuun välilehdellä otsikko on `ABRIL 26` ja aineisto poikkeaa. Tämä on vahvistettu ristiriita itse työkirjassa; MAPA:n selitystä siitä, syntyikö virhe julkaisussa vai työkirjan luonnissa, ei löytynyt.

Kun tammikuuksi ja maaliskuuksi nimetyt välilehdet tulkitaan kalenterikuukausiksi, sama helmikuun aineisto tulee mukaan kolmesti. Laskentakaava ei itsessään ole ongelma, mutta väitetty kuukausikattavuus ei vastaa lähdettä. Jakson nimeäminen 12 kuukauden jaksoksi ei korjaa puuttuvia tai duplikoituja kuukausihavaintoja.

| Ryhmä | Alue | Syyskuu 2025–elokuu 2026 -pilotissa: hinta ja indeksi* | Kalenterivuosi 2025: hinta ja indeksi |
|---|---|---:|---:|
| Kananmunat | Espanja | 0,271 / 100,0 | 0,243 / 100,0 |
|  | Comunitat Valenciana | 0,269 / 99,3 | 0,241 / 99,5 |
|  | Región de Murcia | 0,272 / 100,4 | 0,241 / 99,2 |
|  | Andalucía | 0,269 / 99,4 | 0,240 / 98,8 |
| Nestemäinen maito | Espanja | 0,983 / 100,0 | 0,973 / 100,0 |
|  | Comunitat Valenciana | 1,000 / 101,7 | 0,989 / 101,6 |
|  | Región de Murcia | 1,031 / 104,9 | 1,019 / 104,7 |
|  | Andalucía | 0,961 / 97,8 | 0,956 / 98,2 |
| Leipä | Espanja | 2,853 / 100,0 | 2,701 / 100,0 |
|  | Comunitat Valenciana | 2,951 / 103,5 | 2,807 / 103,9 |
|  | Región de Murcia | 2,821 / 98,9 | 2,677 / 99,1 |
|  | Andalucía | 2,815 / 98,7 | 2,647 / 98,0 |

* Pilotin hinnat ovat €/kpl kananmunille, €/l maidolle ja €/kg leivälle. Ne ovat työkirjoista toistettuja mutta päällekkäisen kuukausitiedon vuoksi **ei-validiä 12 kuukauden lukuaineistoa**. Vertailu vuoden 2025 lukuihin käyttää eri viitejaksoa; eroa ei pidä tulkita vuosimuutokseksi tai inflaatioksi.

Pilotin kolme lukua poikkeavat vuoden 2025 vuosihinnasta, mutta vain vuoden 2025 luku on tässä tarkistuksessa validoitu täyden kalenterivuoden havainto. Esimerkiksi kananmunien aluejärjestys muuttuu, mikä korostaa sitä, ettei epävarmaa liukuvaa pilottia pidä käyttää rinnakkain validoitujen vuosiarvojen kanssa.

## Ryhmät, joita ei valittu kahdeksikkoon

- **`ARROZ`:** määritelmä sisältää luonnollisen riisin lisäksi riisipohjaisia valmisruokia sekä erilaisia riisilajeja. Rivi ei siten mittaa rajatusti riisin hintaa.
- **`TOTAL PATATAS`:** yhdistää tuoreet, pakastetut ja jalostetut perunat; MAPA käyttää jalostetuille perunoille muuntokerrointa. `PATATAS FRESCAS` on sen alaryhmä, joten molempien lisääminen aiheuttaisi päällekkäisyyttä.
- **`TOTAL ACEITE`:** kattaa kaikki kasviöljytyypit. Rivi on laskettavissa, mutta yksittäisen öljytuotteen tulkinta olisi liian laaja; kahdeksan valittua luokkaa kattavat jo selkeästi rajattuja ostoryhmiä.

Näissäkin ryhmissä on arvoja neljälle alueelle, mutta niitä ei otettu mukaan vain tavoitteen täyttämiseksi. Tuoteryhmävalinta on pidetty kahdeksassa MAPA:n määritelmän ja vertailun ymmärrettävyyden perusteella.

## Käyttöä koskeva rajaus

MAPA-paneeli kuvaa kotitalouksien ostamia tuotteita ja niiden ostohintoja. Se ei ole kauppojen kaikkien tarjolla olevien tuotteiden hyllyhintakysely, eikä samaa tuotetta, laatua, merkkiä tai pakkauskokoa vakioida alueiden välillä. Tuoteryhmän keskiarvo voi muuttua myös siksi, että kotitaloudet ostavat ryhmän sisällä eri koostumuksen tuotteita.

Suositeltu esitystapa on nimetä sarakkeet itsehallintoalueiksi, näyttää ryhmän mittayksikkö ja viitejakso sekä selittää, että indeksi vertaa ryhmän ostojen keskimääräistä yksikköhintaa Espanjan vastaavaan. Samalla alueella oleville kaupungeille ei pidä luoda erillisiä lukuja. MAPA-arvoja ei tule yhdistää yleiseksi elintarvikkeiden kustannusindeksiksi ilman lähteeseen perustuvaa painotusta ja metodologista perustetta.

## Lähteet

Kaikki tiedostot ovat MAPA:n virallisia julkaisuja. Excelit ladattiin väliaikaiseen hakemistoon analyysia varten; niitä ei lisätty repositorioon.

- [MAPA: sarja-aineistot, vuosittaiset ja kuukausittaiset CCAA-työkirjat](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/series-anuales)
- [MAPA: AYUCONSUM-tietokannan hakuohje ja muuttujien määritelmät](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/base-de-datos-de-consumo-en-hogares/ayuconsum)
- [MAPA: kotitalouksien kulutuspaneelin menetelmä](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/metodologia/)
- [Vuoden 2025 vuosityökirja, korjattu, INE 2021 -pohja](https://www.mapa.gob.es/es/dam/jcr:709a23d0-3e92-4368-9872-c52ad957742a/2025-datos-anuales-panel-consumo-hogares-base2021_corregido.2026-09-03-13-09-59.xlsx)
- [Vuoden 2025 kuukausittainen CCAA-työkirja, INE 2021 -pohja](https://www.mapa.gob.es/es/dam/jcr:fbc5c7de-ac34-4dde-aaf5-5c490165ff05/2025dic-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.2026-09-03-13-12-58.xlsx)
- [MAPA:n määritelmät ja luokitukset, heinäkuu 2025](https://www.mapa.gob.es/dam/mapa/contenido/alimentacion/temas/consumo-y-tendencias-en-alimentacion/panel-de-consumo-alimentario/metodologia/definiciones-y-clasificaciones-panel-hogares-rev-julio2025_v1.xlsx)
- [MAPA: vuoden 2026 elokuun CCAA-työkirja, jonka alkuvuoden välilehtien ristiriita havaittiin](https://www.mapa.gob.es/es/dam/jcr:acba6f6e-34b8-4038-85e9-37231e9fe983/2026ago-datos-mensuales-panel-consumo-hogares-ccaa-base2021-ok2.e3a4eccb7d9e3a1d689120ea8cbbcb85.xlsx)
- [MAPA: uusimmat kulutustiedot](https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/ultimos-datos/)
