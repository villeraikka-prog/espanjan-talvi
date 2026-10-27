# Espanjan talviarki — SEO-löydöt ja orgaanisen kasvun suunnitelma

**Tutkimuspäivä:** 27.10.2026 · **Sivusto:** [espanjan-talvi.pages.dev](https://espanjan-talvi.pages.dev/) · **GitHub:** [villeriikka-prog/espanjan-talvi](https://github.com/villeraikka-prog/espanjan-talvi)

## Toteutuksen tilanne 27.10.2026

Tämä raportti säilyttää tutkimushetken havainnot ja suositukset. Niiden jälkeen seuraavat muutokset on tehty paikalliseen projektikoodiin:

- **Käyttöliittymä:** aiemmin tehdyt rajatut CSS- ja responsiivisuusparannukset ovat paikallisessa työkopiossa. Niiden julkaisutilaa tai live-sivun ulkoasua ei tässä tilannepäivityksessä tarkistettu.
- **Tietosuoja, README ja tarkistin:** julkaisu- ja analytiikkatekstit on rajattu paikalliseen koodiin, Search Console -omistajuus erotetaan kävijäanalytiikasta, ja paikallinen sivutarkistin hyväksyy oikean vahvistusmetan. Budjettilomakkeen JavaScriptin puuttumiseen liittyvä GET-varatapa kuvataan.
- **Sisältö:** vuokraussivun varaus- ja talvikuntotarkistuslista, budjettilaskurin menetelmän ja vakuuden selitys sekä Alicante–Torrevieja-vertailu on toteutettu olemassa olevilla URL:eilla. Etusivun yleiskatsaus ja pääoppaan suunnitteluintentti on pidetty erillään.

Muutokset on tehty paikallisesti; niitä ei ole tämän päivityksen yhteydessä julkaistu eikä julkaistua HTML:ää tarkistettu. Search Consolen tämänhetkisiä indeksointi-, näyttökerta- tai klikkaustietoja ei ole tarkistettu, eikä SEO-tulosten paranemisesta tehdä väitettä. Cloudflare-tilin asetukset ja infrastruktuuritason lokitus-/säilytyskäytännöt ovat yhä varmentamatta.

## Tiivistelmä

Julkisessa sivustossa ei löytynyt vahvistettua indeksoinnin estettä eikä selvää tuotannon teknistä SEO-vikaa. Kaikki seitsemän sivukarttaan kuuluvaa URL:ia vastasivat tarkistushetkellä HTTP 200:lla. `robots.txt`, sitemap, HTTPS ja sivujen canonicalit osoittavat samaan `pages.dev`-originin; indeksoitavilla HTML-sivuilla on yksilölliset otsikot ja kuvaukset eikä niissä näy `noindex`-merkintää. Search Consolen 20 minuuttia julkaisun jälkeen näyttämä yleinen virhe ei yksinään todista sivustovikaa.

Realistisin kasvu ei tule uuden yleisen “talvehtiminen Espanjassa” -oppaan kirjoittamisesta: sellainen on jo julkaistu ja tuoreita kilpailijoita löytyy. Nykyiset sivut osuvat jo lupaaviin tarpeisiin. Tutkimuksen alkuperäiset sisältösuositukset olivat erottaa sivujen hakuaikeet, avata budjettilaskurin laskutapa ja tehdä aluevertailusta päätöstä aidosti helpottava; ne on nyt toteutettu paikallisesti. Täsmähakujen määristä ei ole luotettavaa lukua, joten prioriteetit ovat laadullisia — eivät hakuvolyymi- tai vaikeusaste-ennusteita.

## 1. Sivuston ja teknisen SEO:n auditointi

Tarkistin projektin `sites/espanjan-talvi`-repositoriossa (branch `main`, lähtötilanteessa puhdas työhakemisto), julkaistut sivut ja julkiset robots/sitemap-osoitteet. En muuttanut tuotantosivun HTML:ää, CSS:ää, JavaScriptiä, canonicaleja, sitemapia tai Cloudflare-asetuksia.

| Tarkistus | Havainto 27.10.2026 | Arvio |
|---|---|---|
| HTTPS ja HTTP-vastaukset | Etusivu, neljä sisältö-/työkalusivua, toimitusperiaatteet, tietosuoja sekä robots ja sitemap vastasivat kaikki HTTP 200:lla. | Ei havaittua saatavuus- tai uudelleenohjausvikaa. |
| Robots | `/robots.txt` sallii indeksoinnin ja ilmoittaa täsmälleen julkaistun sitemapin URL:n. | Kunnossa. |
| Sitemap | XML sisältää seitsemän varsinaista sivua; jokainen vastaa kyseisen HTML-sivun canonicalia ja samaa HTTPS-originia. 404-sivu ei ole mukana. | Kunnossa; 20 minuutin `Couldn't fetch` on Search Consolen tila, ei ristiriita selaimella vahvistetun 200-vastauksen kanssa. |
| Canonicalit | Kaikkien seitsemän indeksoitavan sivun julkaistu canonical vastaa niiden polkua `https://espanjan-talvi.pages.dev/`-osoitteessa. | Kunnossa. |
| Otsikot ja kuvaukset | Kaikilla seitsemällä sivulla on yksilöllinen title ja meta description; pituudet ovat noin 113–174 merkkiä. | Ei teknistä virhettä. Google voi valita hakutulokseen oman otsikon/katkelman; tärkeämpää on selkeä hakuaikomus kuin mekaaninen merkkiraja. |
| Indeksoinnin esto | Julkaistuilla sisältösivuilla ei havaittu `noindex`-meta- tai `X-Robots-Tag`-estettä. 404-sivun noindex on tarkoituksenmukainen. | Kunnossa. |
| Sisäiset linkit | Navigaatio ja sivujen väliset yhteydet vievät suunnitteluoppaaseen, aluevertailuun, vuokraukseen ja budjettiin. Paikallinen tarkistin ehti validoida sivujen paikalliset href/src/srcset-kohteet ennen seuraavaa testivirhettä. | Ei havaittua orpoa pääsivua. Ulkoisten lähteiden kaikkia vastauksia ei auditoitu kattavana linkkikierroksena. |
| Tietosuojatekstin ajantasaisuus | Tutkimushetkellä julkisessa `/tietosuoja/`-sivussa havaittiin vanhentuneet julkaisu-, hosting- ja Search Console -väitteet. | **Tutkimushetken vahvistettu sisältöhavainto.** Tietosuojatekstiä on sittemmin korjattu paikallisessa projektikoodissa; nykyistä julkaistua HTML:ää ei ole tämän tilannepäivityksen yhteydessä tarkistettu. Cloudflare-tilin asetukset ja infrastruktuurin loki-/säilytyskäytännöt ovat avoimia tarkistuksia. |
| Mobiilirakenne ja renderöinti | Sivut ovat staattista HTML:ää, niissä on viewport-meta ja CSS:n mobiilibreakpoint; leveille taulukoille on oma vaakavieritys. | Lähdekoodissa mobiilituki näkyy. Erillistä oikean laitteen, Lighthouse- tai Core Web Vitals -mittausta ei tehty, joten käytännön nopeustulosta ei väitetä. |
| Rakenteinen data | Sisällöstä ei löytynyt JSON-LD-merkintöjä. | Ei puute: tässä oppaassa ei ole arvosteluja, tuotteita tai muuta rikasta merkintää vaativaa sisältöä. Älä lisää tekaistuja FAQ-/review-/price-merkintöjä. |

### Julkaistujen indeksoitavien sivujen title-, description- ja canonical-lista

Meta descriptionit alla ovat julkaistun HTML:n sanamuodot. Kaikki seitsemän sivua palauttivat 200; myös H1:t ovat yksilöllisiä.

| Polku | Title | Meta description | Canonical |
|---|---|---|---|
| `/` | Talvehtiminen Espanjassa – suunnittele oma talvesi \| Espanjan talviarki | Suunnittele 1–6 kuukauden talvehtiminen Espanjassa. Vertaa alueita, tarkista vuokrauksen yksityiskohdat ja laske oma budjettisi. | `https://espanjan-talvi.pages.dev/` |
| `/talvehtiminen-espanjassa/` | Talvehtiminen Espanjassa: käytännön opas 1–6 kuukaudeksi | Suunnittele Espanjan-talvi arkea varten: valitse kaupunki, arvioi vuokra-asunnon talvikunto, tarkista viranomaisasiat ja kokoa realistinen budjetti 1–6 kuukaudelle. | `https://espanjan-talvi.pages.dev/talvehtiminen-espanjassa/` |
| `/aluevertailu/` | 10 Espanjan talvikohdetta vertailussa: sää, arki ja vuokraus | Vertaile Alicanten, Torreviejan, Benidormin, Málagan, Fuengirolan, Almerían, Valencian, Murcian, Cádizin ja Huelvan talviarkea, ilmastonormaaleja ja vuokramarkkinan mittaria. | `https://espanjan-talvi.pages.dev/aluevertailu/` |
| `/vuokraus/` | Mitä talviasunto maksaa Espanjassa? Vuokraindeksin vertailu | Vertaa kymmenen Espanjan kaupungin syyskuun 2026 vuokraindeksiä ja 40, 60 ja 80 m²:n laskennallisia esimerkkejä. Lue, mitä kausivuokrauksesta pitää tarkistaa. | `https://espanjan-talvi.pages.dev/vuokraus/` |
| `/budjetti/` | Mitä talvehtiminen Espanjassa maksaa? Laske oma budjetti | Laske 1–6 kuukauden Espanjan-talven kulut omilla vuokra-, arki-, matka- ja vakuutusluvuillasi. Yhdelle tai kahdelle matkustajalle, ilman valmiita hinta-arvioita. | `https://espanjan-talvi.pages.dev/budjetti/` |
| `/toimitusperiaatteet/` | Tietoa sivustosta ja toimitusperiaatteet \| Espanjan talviarki | Miksi Espanjan talviarki on tehty, miten lähteitä ja päivityksiä käsitellään ja mitä sivusto ei väitä tai tarjoa. | `https://espanjan-talvi.pages.dev/toimitusperiaatteet/` |
| `/tietosuoja/` | Tietosuoja \| Espanjan talviarki | Tietoa Espanjan talviarki -sivuston laskurista, evästeistä, analytiikasta ja suunnitellusta staattisesta hostingista. | `https://espanjan-talvi.pages.dev/tietosuoja/` |

Titleien aiheissa on yksi jatkossa selkeytettävä, ei-tekninen päällekkäisyys: etusivu ja pääopas aloittavat molemmat ilmauksella “Talvehtiminen Espanjassa”, ja vuokraussivun kysymys muistuttaa budjettisivua. Näkyvä sisältö on eri, joten tämä ei ole vahvistettu duplikaatti- tai canonical-virhe. Se on kuitenkin hyvä syy antaa etusivun toimia sivuston hubina, pääoppaan omistaa yleinen talvehtimishaku, vuokraussivun omistaa asunnon valinta ja budjettisivun koko matkan laskenta.

### Search Consolen virheet ja varsinainen tekninen löydös

- En päässyt käyttäjän Search Console -raporttinäkymään, joten `Couldn't fetch`- ja etusivun pyyntövirhe ovat käyttäjän ilmoittamia tiloja. Julkinen HTTP-tarkistus ei paljasta Googlen pyynnön tarkkaa tulosta.
- Käyttäjän mukaan omistajuus on vahvistettu. Etusivun julkaistussa HTML:ssä näkyy Google-vahvistusmeta; tunnistetta ei kopioida tähän raporttiin.
- Julkinen sitemap palautui `application/xml`-sisältötyypillä ja HTTP 200:lla. Google kuitenkin kertoo, että `Couldn't fetch` voi johtua muun muassa väliaikaisesta hausta, crawl-demandista, virheellisestä URL:sta tai Googlen hakupyynnön ongelmasta. Avaa Search Consolessa kyseisen sitemap-rivin virheen lisätiedot ja testaa sen URL:n saatavuus Googlelle ennen koodimuutosta ([Sitemaps-raportin ohje](https://support.google.com/webmasters/answer/7451001?hl=en-GB)).
- Julkinen `site:espanjan-talvi.pages.dev`-haku ei tuottanut tuloksia käyttämässäni verkkohakunäkymässä. Se ei ole Googlen indeksointiraportti eikä osoita vikaa; näin pian julkaisun jälkeen havainto on odotettavissa. Search Consolen URL Inspection on tämän sivuston tilanteen lähde.
- **Vahvistettu paikallisen testin virhe, ei tuotantovirhe:** `scripts/check-site.mjs` kaatuu rivin 110 tarkistukseen, joka kieltää etusivulta *kaiken* `google-site-verification`-tekstin. Nyt julkaistussa, vahvistetussa sivussa on tarvittava todellinen vahvistusmeta, joten tarkistin hylkää onnistuneen käyttöönoton. Tämä on testin väärä oletus, ei robots-, sitemap-, canonical- tai indeksointivika. Korjaa tarkistin erikseen hyväksymään oikea metatunniste mutta hylkäämään esimerkkitokenit.
- **Alkuperäisessä auditissa havaittu live-sisällön ajantasaisuusvika:** tuolloin tietosuojasivulla väitettiin sivuston olevan julkaisematta, Cloudflare Pages -hostingin olevan suunnitteilla ja Search Consolen olevan kytkemättä, vaikka omistajuus oli vahvistettu. Paikallinen tietosuojasivu ja README on sittemmin päivitetty; nykyistä julkaistua HTML:ää ei ole tarkistettu, joten korjauksen julkaisua ei väitetä. Tämä ei ollut indeksoinnin tekninen este.
- Myös README:n vanhat julkaisutilaa ja Search Consolea koskevat väitteet päivitettiin paikallisesti. Muutos ei ole näyttöä hakunäkyvyyden paranemisesta.

## 2. Hakumahdollisuudet ja nykyinen kattavuus

Hakutulokset tarkistettiin suomenkielisillä hauilla 27.10.2026 ja niitä verrattiin julkaistuun sisältöön. Edeltävässä projektin [SERP- ja Trends-muistiossa](../../../research/finnish-spain-wintering-seo/serp-havainnot.md) täsmällisten siemenfraasien Trends-aineisto oli riittämätön. Google Ads Keyword Plannerin tilikohtaisia lukuja ei ollut käytettävissä. Siksi alla ei esitetä volyymi-, KD-, klikki- tai tulolukuja. Google itsekin huomauttaa, että Plannerin luvut ovat sijainti- ja aikajaksoasetuksista riippuvia arvioita ja vähäisen volyymin haut voivat jäädä raportoimatta ([Keyword Plannerin mittarit ja rajoitteet](https://support.google.com/google-ads/answer/7337243?hl=en-en)).

Prioriteetti kuvaa yhdistelmää: suomalaiselle syntyvä käytännön hyöty, sivuston nykyinen osuvuus, hakutulosten kilpailutilanne ja se, kuinka rajattu kysymys on. Se ei tarkoita mitattua hakumäärää.

| Hakuteemojen klusteri | Aikomus ja yleisö | SERP / kilpailun taso | Nykyinen vastaus | Mahdollisuus ja prioriteetti |
|---|---|---|---|---|
| **talvehtiminen Espanjassa**, *Espanjassa talven viettäminen*, *talviasuminen Espanjassa* | Laaja suunnittelu; ensikertalainen, pariskunta tai eläkeläinen. | Korkea kilpailu: tuore Fuengirolaan.fi-opas kattaa jo sään, vuokran, kustannuksia, terveyttä ja käytäntöjä; lisäksi vanhoja kokemuksia, matkailusisältöjä ja kaupallisia oppaita. | Etusivu ja `/talvehtiminen-espanjassa/` vastaavat suoraan. | Pidä yksi selkeä pääopas; älä tee samasta aiheesta uutta URL:ia. Tavoittele ensin tarkempia osakysymyksiä. **Keskitaso, pitkän aikavälin aihe.** |
| **Espanjan talviasumisen kustannukset**, *paljonko talvehtiminen maksaa 1/3/6 kk*, *budjetti pariskunnalle* | Kustannusarvio ennen majoituksen varaamista; yksin tai kahdestaan matkustavat. | Korkea, mutta vastaukset ovat usein suuntaa-antavia ja keskittyvät koko vuoden asumiseen. Espanjassa.fi julkaisi 2026 Alicante-kustannusoppaan ja antaa budjettihaitareita, jotka se itse rajaa käytännön arvioiksi, ei viralliseksi hintatilastoksi. | `/budjetti/` laskee käyttäjän omilla syötteillä, mutta ei anna esimerkkilaskua tai valmiita hintoja. | Erota pitkäaikaiset vuokraindeksit kalustetuista talvikausitarjouksista. Näytä, mistä itse laskettu summa muodostuu ja mitä lähteitä tarvitaan. **Korkein sisältöprioriteetti.** |
| **Espanjan talviasunnon vuokraaminen**, *vuokra-asunto Espanjasta talveksi*, *kausivuokra*, *asunto kylmä talvella / lämmitys* | Käytännön ja kaupallinen harkinta juuri ennen varausta; talvehtija, jolla on päivät ja kohde valittuna. | Korkea: alustojen ilmoitukset, välittäjät ja tuoreet yleiset vuokra-/lakiohjeet. Esim. Espanja.com käsittelee kausivuokrausta ja Espanjan vuokrasääntöjä. | `/vuokraus/` sisältää jo lämmitys-, kosteus-, internet-, maksu- ja vertailutarkistuksia; pääoppaassa on samaan liittyvä muistilista. | Vahvista hakutarkoitus otsikossa ja aloituksessa, älä kirjoita kolmatta vuokrausopasta. Konkreettinen “ennen kuin maksat” -lista on selvästi hyödyllisempi kuin yleinen lakiselostus. **Korkea.** |
| **Espanjan talvikohteiden vertailu**, *Costa Blanca vai Costa del Sol talvella* | Sopivan paikan valinta; henkilö, jolle ratkaisevat liikkuminen, talvinen palvelutarjonta, sää ja kustannukset. | Keskikorkea: yleisiä matkailu- ja alueoppaita on paljon; kotimaisessa aineistossa näkyy myös paikallisia blogeja. | `/aluevertailu/` vertailee jo 10 kaupunkia ja lähteistettyjä ilmastoarvoja. | Älä tee lähes identtisiä Costa Blanca / Costa del Sol -artikkeleita. Rajaa vertailu talviarkeen ja auta valitsemaan kriteereillä. **Korkea.** |
| **Alicante vs. Torrevieja**, *Alicante vai Torrevieja talvella* | Tarkka kohdepäätös; erityisesti Costa Blancaa harkitseva talvehtija. | Keskitaso / epävarma kysyntä: Espanjassa.fi vertailee kaupunkeja elinkustannusten yhteydessä, mutta löytämäni vertailu painottuu ympärivuotiseen asumiseen, ei talven arkeen. | Molemmat kaupungit ovat laajalla aluevertailusivulla; suoraa päätöstaulukkoa ei ole. | Pieni, konkreettinen vertailu samalla AEMET-, joukkoliikenne- ja vuokrausvaroitusten menetelmällä voisi vastata paremmin kuin yleinen kohde-esittely. **Korkea long-tail-testinä.** |
| **Espanjan talven sää kuukausittain**, *Alicante tammikuussa*, *Espanjassa talvella lämpötila* | Sääodotus, vaatetus ja oleskelukuukauden valinta; ensimmäistä talvea suunnitteleva. | Keskikorkea: AEMET ja matkailusivustot tarjoavat kuukausitaulukoita, joskus eri asemista tai esitystavoista. | `/aluevertailu/` sisältää 8 aseman kuukausinormaalit ja mittauskaudet. | Sisältöetu on jo olemassa. Nosta helposti tulkittava talviyhteenveto esiin, mutta älä luo toista sääsivua. **Keskikorkea / nykyisen sisällön hyödyntäminen.** |
| **eläkeläinen talvehtii Espanjassa**, *terveydenhuolto ja sairaanhoitokortti*, *oleskelu yli 90 päivää* | Terveys-, oleskelu- ja vakuutusasioiden ennakkotarkistus. | Korkea luottamusvaatimus: talvehtimisoppaissa on jo hallinto- ja terveysosuuksia. Väitteet ovat myös henkilökohtaisesta tilanteesta riippuvia. | Pääopas linkittää EU:n oleskeluohjeisiin, poliisiin ja Kelaan; se rajaa vero-/terveysohjeet. | Pidä viranomaislinkit päivitettyinä, älä julkaise uutta yleistä eläkeläisopasta ilman erillistä tarvetta tai asiantuntijavarmistusta. **Matala uutena artikkelina.** |
| **etätyö Espanjasta talvella**, *talviasunto etätyöhön*, *internet ja työrauha talviasunnossa* | Majoituksen ja arjen soveltuvuus työntekoon; etätyöntekijä tai yrittäjä. | Otos ei vahvistanut merkittävää suomenkielistä hakukysyntää eikä kattavaa suoraa kilpailijaa. Yleiset oppaat sivuavat aihetta. | Vuokraus- ja pääoppaassa pyydetään yhteystyyppiä/nopeustestiä ja tarkistetaan työrauha; erillistä opasta ei ole. | Mahdollinen tarkka long-tail, mutta vero-, työnantaja- ja sosiaaliturvakysymykset kasvattavat ylläpitovastuuta. **Kokeile vasta, jos Search Console tai lukijapalaute osoittaa kysyntää.** |

## 3. Kilpailijat ja aidot sisältöaukot

- [Fuengirolaan.fi:n 28.8.2026 opas](https://fuengirolaan.fi/blog/talvehtiminen-fuengirolassa) on vahva, tuore suomalaiselle kirjoitettu paikallisopas. Se sisältää talvikuukausien lämpötiloja, talviasunnon lämmityshuomioita, esimerkkikustannuksia, vakuutus- ja oleskeluasioita sekä Fuengirolan käytännön arkea. Yleinen “mitä talvehtiminen on?” -teksti ei erotu siitä. Espanjan talviarki voi erottua usean kaupungin lähteistetyllä vertailulla ja kustannusväitteiden paremmalla rajauksella.
- [Espanjassa.fi:n Alicante-kustannusopas (9.8.2026)](https://www.espanjassa.fi/blogs/oppaat/elinkustannukset-alicantessa) tarjoaa kuukausibudjetteja, aluekuvauksia ja Alicante–Torrevieja-kustannusvertailun. Sen omassa johdannossa luvut kuvataan suuntaa-antaviksi käytännön budjeteiksi. Meidän mahdollinen etu ei ole luvata “oikeaa keskihintaa”, vaan esittää kunkin luvun lähde, päivämäärä, kattavuus ja laskutapa — sekä osoittaa, mikä ei ole talvikauden kalustettu vuokra.
- [Espanja.comin vuokrausopas](https://espanja.com/asuminen-ja-elaminen-espanjassa/viranomaisasiat-espanjassa/lyhyt-opas-asunnon-vuokraukseen-espanjassa/) selittää pitkäaikaisen, kausi- ja lomavuokrauksen eroja. Sääntelyssä yleinen vanha muistilista ei riitä: oikeusväitteet on tarkistettava julkaisuhetken [BOE-säädöksistä](https://www.boe.es/eli/es/rdl/2026/09/29/26) ja tarvittaessa paikallisista säännöistä. Sivusto ei saa neuvoa yksittäisen sopimuksen laillisuutta.
- Ilmastosisällön paras lähde-etu on sivuston omissa [AEMET-kuukausitaulukoissa](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=8025): asema, kausi ja mitattavat suureet voidaan ilmoittaa tarkasti. AEMETin 1981–2010 normaalit eivät ole ensi talven ennuste eivätkä aina kuvaa asuntoa tai naapurikuntaa.
- Vuokravertailussa olennainen rajaus: Idealista ilmoitti muuttaneensa indeksiään heinäkuussa 2026 ja erottavansa kausi-/loma-asuntoja tavanomaisen asuntovuokran laskennasta ([Idealistan metodologiauutinen](https://www.idealista.com/news/inmobiliario/vivienda/2026/08/03/908719-el-precio-del-alquiler-en-espana-sube-un-6-8-interanual-durante-el-mes-de-julio)). Näin ollen indeksin €/m²-luku ei ole mittari 1–6 kuukauden talviasunnon hinnalle. Nykyinen sivusto jo kertoo tämän rajoitteen oikein; pidä erottelu näkyvänä myös title-/snippet-tasolla.

## 4. Viisi parasta alkuvaiheen sisältöparannusta

Suositukset käyttävät ensisijaisesti olemassa olevia URL:eja. Julkaise uusi sivu vasta, jos se ratkaisee eri tarpeen kuin nykyinen sivu. Alkuperäisen tutkimusvaiheen jälkeen toteutettujen suositusten tila on merkitty kunkin kohdan alkuun.

### 1) Tee vuokraussivun hakuaie selväksi: talviasunnon tarkistus ennen maksua

**Toteutustila:** toteutettu paikallisesti olemassa olevalla `/vuokraus/`-sivulla. Sivun julkaistua versiota tai hakutuloksia ei tämän merkinnän perusteella ole vahvistettu.

1. **Päähaku:** *talviasunnon vuokraaminen Espanjasta*. **Tukihakuja:** *vuokra-asunto Espanjasta talveksi*, *Espanjan kausivuokra*, *Espanjan asunto kylmä talvella*, *mitä kysyä talviasunnosta*.
2. **Aikomus:** kaupallinen selvittely ja riskien vähentäminen juuri ennen varausta. Yleisö on talven päivät/kohteen jo päättänyt henkilö.
3. **Title:** `Talviasunnon vuokraaminen Espanjassa – tarkistuslista ja talvikunto`. **H1:** `Mitä tarkistaa ennen Espanjan talviasunnon varaamista?`
4. **URL:** pidä olemassa oleva [`/vuokraus/`](https://espanjan-talvi.pages.dev/vuokraus/) ja canonical; älä luo rinnalle lähes samaa vuokraus-URL:ia.
5. **Runko:** (a) yhden ruudun “ennen kuin maksat” -lista; (b) kokonaishinta samoille päiville: vuokra, sähkö/lämmitys ja kulutuskatto, vesi, netti, loppusiivous ja maksut; (c) vakuus erillään kulusta, palautusehto ja maksun saaja; (d) talvikunto: lämmityslaite ja huonekohtainen käyttö, kosteus, ikkunat, lämmin vesi; (e) etätyö: pyydä tuore nopeustesti ja yhteystyyppi, älä tyydy “Wi-Fi sisältyy” -lupaukseen; (f) sopimusmuotojen rajat ja viralliset lähteet, ilman yksittäisen sopimuksen oikeudellista tulkintaa; (g) täytettävä kolmen tarjouksen vertailupohja ja lyhyt viestipohja vuokranantajalle.
6. **Tarkistettavat lähteet/faktat:** ajantasainen [BOE](https://www.boe.es/eli/es/rdl/2026/09/29/26), [konsolidoitu LAU-teksti BOE:ssa](https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003), sopimustyypin nykyinen soveltuvuus, mahdolliset alue-/kuntakohtaiset vuokraehdot. Tarkista oikeuslähteet juuri ennen julkaisua; älä kopioi välittäjän neuvoa lakiväitteenä.
7. **Sisäiset linkit:** `/aluevertailu/` (kaupunkialueen valinta), `/budjetti/` (tarjousten kokonaissummat), `/talvehtiminen-espanjassa/` (valmistelun aikajana).
8. **Miksi mahdollisuus on realistinen:** tarkka, korkean harkintavaiheen ongelma; nykyinen sisältö on jo vahva, mutta page title painottaa “mitä talviasunto maksaa” ja vuokraindeksiä. Uusi title/aloitus voi erottaa tämän sivun budjettisivusta ja kohdistaa sen paremmin vuokrausintentiin. Ensimmäisiä kävijöitä voi tulla tarkemmista lämmitys-/maksu-/kulukysymyksistä, ei välttämättä yleishausta.

### 2) Vastaa budjettikysymykseen laskutavalla, ei keksityllä keskihinnalla

**Toteutustila:** laskentakaava, kuukausi- ja kertakulut, palautettava vakuus sekä tuloksen tulkinta on selitetty paikallisesti `/budjetti/`-sivulla; hinta-arvioita ei lisätty.

1. **Päähaku:** *Espanjan talvehtimisen kustannukset*. **Tukihakuja:** *paljonko talvehtiminen Espanjassa maksaa*, *Espanjan talvibudjetti 1/3/6 kuukautta*, *talvehtiminen Espanjassa pariskunnan budjetti*.
2. **Aikomus:** oman oleskelun kustannusten arviointi ja kohteiden/ajan vertailu.
3. **Title/H1:** säilytä nykyinen `Mitä talvehtiminen Espanjassa maksaa? Laske oma budjetti` / sama kysymys H1:ssä; se osuu aiheeseen. Lisää H2: `Näin rakennat vertailukelpoisen 1, 3 tai 6 kuukauden budjetin`.
4. **URL:** nykyinen [`/budjetti/`](https://espanjan-talvi.pages.dev/budjetti/).
5. **Runko:** (a) laskurin kaava ja mitä se sisältää/ei sisällä; (b) kiinteät kuukausikulut vs kertakulut; (c) palautettava vakuus “rahaa sitoutuu” -eränä, ei automaattisesti lopullisena kuluna; (d) asuntoesimerkit vain samoille päiville ja lähde-/päiväys-/kaupunkitiedoilla; (e) ruoka, vakuutus, sähkö ja kuljetus joko käyttäjän omiksi syötteiksi tai erikseen lähteistetyiksi oletuksiksi; (f) kolme laskuesimerkkiä vasta, kun syötteiden alkuperä ja ajanjakso on kerätty; (g) kehotus vertailla samaa oleskeluaikaa eikä sekoittaa vuokraindeksiä kausivuokraan.
6. **Tarkistettavat lähteet/faktat:** kausivuokrista ei ole vahvistettua, vertailukelpoista yleishintasarjaa. Kerää ilmoitusten/asuntojen kokonaishinta samoille saapumis- ja lähtöpäiville, säilytä päivämäärä ja sisältyvät kulut; merkitse saatavuuden rajat. Idealistan tavallisen vuokrauksen indeksiä ei saa esittää talvivuokrana. Älä julkaise esimerkkisummaa ennen kuin jokainen erä on jäljitettävissä.
7. **Sisäiset linkit:** `/vuokraus/` (todellinen asuntotarjous), `/aluevertailu/` (sijainti), `/talvehtiminen-espanjassa/` (matka-aikataulu).
8. **Miksi realistinen:** työkalu on jo sivuston oma ominaisuus, joka erottuu yleisistä kustannusartikkeleista. Tällä hetkellä laskuri auttaa laskemaan mutta ei vielä auta käyttäjää löytämään syötteitä tai ymmärtämään mistä suuri vaihtelu tulee. Läpinäkyvä menetelmä on uskottavampi erottautuja kuin yksittäinen “tyypillinen” summa.

### 3) Lisää aluevertailuun käytännön valinta: Alicante vai Torrevieja talvella?

**Toteutustila:** käytännön vertailu on lisätty paikallisesti `/aluevertailu/`-sivulle nykyisillä lähde- ja epävarmuusrajauksilla.

1. **Päähaku:** *Alicante vai Torrevieja talvella / talvehtimiseen*. **Tukihakuja:** *Alicante vai Torrevieja ilman autoa*, *Costa Blanca talvikohde*, *Torrevieja Alicante arki talvella*.
2. **Aikomus:** vertailla kahta kohdetta ja valita sopivampi arjen tarpeeseen.
3. **Sivun title/H1:** pidä nykyinen laaja title `10 Espanjan talvikohdetta vertailussa: sää, arki ja vuokraus` ja H1 `Espanjan talvikohteet: vertaa arkea, älä vain säätä`. Lisää selkeä H2: `Alicante vai Torrevieja talvella?` — ei uutta titleä/H1:tä samalle URL:lle.
4. **URL:** nykyinen [`/aluevertailu/`](https://espanjan-talvi.pages.dev/aluevertailu/), halutessa sisäinen ankkuri `#alicante-vai-torrevieja`.
5. **Runko:** nopea valinta käyttäjäprofiileittain; tiivis vertailu kaupungin koosta ja ympärivuotisesta palveluvalikoimasta; kävely/joukkoliikenne ja lentokentältä jatkaminen; ilmastoasema, mittauskausi ja talvikuukaudet; kustannusvertailun rajat; mitä selvittää asunnon tarkasta kaupunginosasta; milloin kolmas vaihtoehto (esim. Benidorm/Fuengirola) voi sopia paremmin. Päätöksen tulee perustua tarkistettaviin kriteereihin, ei absoluuttiseen “parempi”-väitteeseen.
6. **Tarkistettavat lähteet/faktat:** [AEMETin Alicante-asema](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=8025) ja muut sivulla jo käytetyt asemat; [Alicanten TAM](https://www.alicante.es/es/contenidos/transporte-alicante-metropolitano-tam), [TRAM d’Alacant](https://www.tramalacant.es/) sekä [Torreviejan kaupungin ajantasaiset bussitiedotteet](https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo). Älä esitä vuorovälejä tai aikatauluja pysyvinä.
7. **Sisäiset linkit:** `/vuokraus/` ja `/budjetti/` sekä pääopas; kaupungin profiileihin ankkurit jo nykyisellä sivulla.
8. **Miksi realistinen:** hyvin rajattu valintakysymys palvelee lukijaa ja on nykyistä 10 kohteen luetteloa helpompi hahmottaa. Espanjassa.fi käsittelee kaupunkiparia kustannusnäkökulmasta, mutta talviarki, liikkuminen ja AEMET-mittauksen rajat muodostavat aidon lisän. Kysynnän määrä on silti mittaamatta.

### 4) Tee olemassa olevasta ilmastoaineistosta nopeasti tulkittava talviyhteenveto

1. **Päähaku:** *Espanjan talven sää kuukausittain*. **Tukihakuja:** *Alicante sää tammikuussa*, *Costa Blanca talvella lämpötila*, *Málaga talvella yölämpötila*.
2. **Aikomus:** ymmärtää marras–maaliskuun olosuhteet ennen ajankohdan tai kohteen valintaa.
3. **Title/H1:** säilytä nykyinen vertailusivun title ja H1. Lisää H2: `Millainen Espanjan talvi on marraskuusta maaliskuuhun?`
4. **URL:** nykyinen [`/aluevertailu/`](https://espanjan-talvi.pages.dev/aluevertailu/), ankkuri esimerkiksi `#talvisaa-kuukausittain`; älä julkaise uutta yleistä sääartikkelia.
5. **Runko:** näkyvä yhteenvetotaulukko 3–4 kohteelle: päivittäinen keskimääräinen ylin ja alin, sade sekä aurinkotunnit lähteen sallimalla tarkkuudella; aseman nimi ja kaupunki/lentoasema selvästi; “miltä tämä tarkoittaa arjessa” -selite: päiväaurinko ei kerro yöstä tai asunnon sisälämpötilasta; poikkeuksellisen sään tarkistus erikseen AEMETin ennusteesta; linkit koko 12 kuukauden asema-aineistoihin.
6. **Tarkistettavat lähteet/faktat:** AEMETin viralliset kuukausinormaalit, asematunnukset ja vertailukaudet. Pidä normit erillään ennusteista, älä päättele Torreviejan arvoa Alicanten kaupungin mittauksesta.
7. **Sisäiset linkit:** pääopas (ajankohta), kaupunkiprofiilit, vuokrauksen talvikunto (ulkolämpö ei kerro asunnon lämmityksestä).
8. **Miksi realistinen:** kuukausittaisista säätaulukoista kilpaillaan, mutta nykyinen sivusto käyttää yhtenäistä ensisijaista aineistoa useista kohteista. Nopeasti luettava yhteenveto tekee jo kerätystä tiedosta hyödyllisen ja lähteistettävän ilman uutta yleisopasta.

### 5) Testaa etätyöntekijälle tarkoitettua sivua vasta kysyntäsignaalin jälkeen

1. **Päähaku:** *etätyö Espanjasta talvella*. **Tukihakuja:** *talviasunto etätyöhön Espanjassa*, *internet talviasunnossa Espanja*, *talvehtiminen Espanjassa etätyöntekijä*.
2. **Aikomus:** sovittaa pidempi oleskelu työhön ja varmistaa majoituksen, yhteyksien sekä hallinnon käytännöt.
3. **Title/H1:** `Etätyö Espanjasta talvella: asunto, yhteydet ja käytännöt` / sama H1.
4. **Mahdollinen URL:** `/etatyo-espanjasta-talvella/`. Julkaise vain, jos Search Consolen kyselyt, palaute tai hakumittari antaa aiheen; muuten laajenna vuokraussivun olemassa olevaa internet-/työrauhaosiota.
5. **Runko:** majoituksen yhteysnopeuden todentaminen ja varayhteys; työpiste, melu ja sähkökatkoihin/luotettavuuteen varautuminen; Suomen ja Espanjan työpäivän käytännöt; etätyö työnantajan luvat huomioiden; oleskelu-, sosiaaliturva- ja verotuskysymysten tarkistuslista; tilanteet, joissa pitää kysyä viranomaiselta/työnantajalta eikä päätellä yleisohjeesta.
6. **Tarkistettavat lähteet/faktat:** [EU Your Europe](https://europa.eu/youreurope/citizens/residence/residence-rights/index_fi.htm), [Verohallinnon ulkomailla työskentelyn verotus](https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/49111/ulkomailla-tyoskentelyn-verotus7/), [ETK:n etätyö ulkomailla -ohje](https://www.etk.fi/kansainvaliset-asiat/tyoskentely-ulkomailla/ulkomaantyon-vakuuttaminen/etatyo-ulkomailla/) ja Espanjan verohallinnon ajantasaiset ohjeet. ETK ilmoitti 27.10.2026 EU:n sosiaaliturvasääntöjen uudistusten tulevan voimaan 1.11.2026; tarkista uudet säännöt ja siirtymäajat uudelleen ennen julkaisua ([ETK:n tiedote](https://www.etk.fi/ajankohtaista/eun-sosiaaliturva-asetukset-uudistuvat-muutoksia-erityisesti-ulkomaantyoskentelya-koskeviin-saantoihin/)). Oleskelupäivät eivät yksin ratkaise vero- tai sosiaaliturvatilannetta.
7. **Sisäiset linkit:** pääopas, vuokraus ja aluevertailu.
8. **Miksi realistinen:** etätyö rajaa lukijan konkreettiseen tarpeeseen; nykyinen sivusto mainitsee nopeustestin ja työrauhan, mutta ei tarjoa etätyöntekijän kokonaischecklistiä. Kilpailu ja suomenkielinen hakuvolyymi ovat todentamatta, ja virheellinen vero-/työsuhdeohje olisi kallis virhe. Siksi tämä ei kuulu aivan ensimmäiseen julkaisuun.

**Eläkeläisyleisö:** sitä ei suositella omaksi uudeksi artikkeliksi vielä. Pääoppaassa on jo oleskelun, Kela-kortin, vakuutuksen ja verotuksen lähdeviitteet; julkaise uusi profiilisivu vasta, jos Search Console osoittaa eläke-/terveyshakuja ja tiedot voidaan tarkistaa viranomaisista.

## 5. Tekniset ja mittauksen seuraavat askeleet

### Heti (nyt, ilman tuotantokoodin muutoksia)

1. Varmista Search Consolessa oikea URL-prefix-ominaisuus: `https://espanjan-talvi.pages.dev/`.
2. Avaa Sitemaps-raportin kyseinen rivi ja kirjaa **Last read**, täsmällinen virhesyy ja Googlen ehdottama URL. Käytä URL Inspectionin **Live test** -toimintoa sitemapille ja etusivulle: tarkista *Page fetch successful* ja *Crawl allowed*. Julkinen selaintesti ei yksin todista, että Googlebotille kaikki reitit ovat saatavilla.
3. Älä lähetä muuttumatonta sitemapia tai samaa indeksointipyyntöä moneen kertaan nyt. Google sanoo sivun uudelleenhakupyynnön voivan kestää päivistä viikkoihin; toistaminen ei nopeuta sitä eikä takaa indeksointia ([Google: pyydä uudelleenhakua](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)). Sitemap on vihje, ei indeksointi- tai sijoitustakuu ([sitemap-ohje](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).
4. Paikallisen tietosuojasivun ja README:n julkaisu- ja analytiikkasanamuoto on korjattu; tarkasta ne seuraavan julkaisuvalmistelun yhteydessä. Julkaistua HTML:ää, Cloudflare-tilin asetuksia eikä infrastruktuurin lokitus- tai säilytyskäytäntöjä ei ole itsenäisesti varmennettu. Älä lisää niitä koskevia väitteitä ilman tarkistusta. Search Console -omistajuus ei ole kävijäanalytiikkaa eikä edellytä uuden analytiikkapalvelun lisäämistä.
5. Älä lisää vielä Google Analyticsia, Tag Manageria, mainoksia tai affiliate-linkkejä. Search Console riittää orgaanisen haun seurantaan; älä ota käyttöön uutta kävijäseurantaa ilman erillistä tietosuoja-arviota.

### 7–14 päivän kuluttua

- Tarkista sitemapin tila ja **Page indexing** -raportti uudelleen. Jos sitemap on yhä `Couldn't fetch`, käytä raportin tarkkaa virhesyytä ja URL Inspectionin live-testitulosta; vasta niiden perusteella korjaa este tai lähetä sama sitemap uudelleen. Google kertoo voivansa yrittää uudelleen usean päivän ajan ([Sitemaps-raportin vianmääritys](https://support.google.com/webmasters/answer/7451001?hl=en-GB)).
- Tarkista URL Inspectionista etusivu ja tärkein sisältösivu `/talvehtiminen-espanjassa/`: indeksointikelpoisuus, crawl-aika sekä Google-valitsema canonical. Jos live-testi onnistuu mutta URL ei ole indeksoitu, pyydä tarkastelua kerran tärkeimmille URL:eille ja odota.
- Jos sitemap fetch toimii mutta orgaanisia näyttökertoja ei vielä näy, älä tulkitse tätä markkinan puuttumiseksi. Tuoreelle pienelle sivustolle Google itse sanoo uusien sivujen löytymisen voivan kestää useita päiviä tai pidempään ([crawl-vianmääritys](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)).

### 28 päivän ja kuukausittainen mittaus

- Search Consolen **Performance → Search results**: impressions, clicks, CTR, position; suodata Suomi, sivu, laite ja kysely. Vertaa samoja ajanjaksoja ja tarkastele, mihin URL:iin kukin kysely ohjautuu. Näin näkee myös, kilpailevatko etusivu ja pääopas samasta hakuaikeesta.
- **Budjettilaskurin käyttö:** Search Console kertoo hakutuloksista ja laskeutumissivuista, ei siitä, täyttikö kävijä laskurin tai sai tuloksen. Jos tämä halutaan mitata myöhemmin, valitse ensin analytiikka-, suostumus- ja tietosuojaratkaisu; mittaa korkeintaan laskurin aloitus/laskentatapahtuma. Älä lähetä euromääriä, matkapäiviä tai muita lomakesyötteitä analytiikkaan.
- **Tulevat affiliate-linkit:** mittaa outbound-klikit vasta, jos kumppanuudet hyväksytään ja lukijalle näytetään kaupallinen ilmoitus. Erota klikki kumppanin vahvistamasta toteutuneesta varauksesta; älä raportoi konversioita tai tuloa ennen todellista dataa.
- **Structured data:** ei kiireellistä muutosta. Käytä myöhemmin vain näkyvää sisältöä vastaavia merkintöjä ja oikeita tekijä-/päiväystietoja.

## 6. Seuraavat prioriteetit ja avoimet työt

Raportin kolme alkuperäistä sisältösuositusta (vuokrauksen hakuaie, budjetin laskentatapa ja Alicante–Torrevieja-vertailu) sekä tässä projektissa aiemmin tehty UI-, tietosuoja/README/validator- ja sisältötyö ovat nyt toteutettu paikallisesti. Ne eivät ole enää seuraavia toteutustehtäviä. Niiden vaikutuksesta ei ole Search Console -tuloksia.

**Seuraavat kolme käytännön prioriteettia ovat:**

1. Tarkista Search Consolesta sitemapin nykyinen tila, täsmällinen virhe ja URL Inspectionin live-testitulokset. Päätä jatkotoimi vasta raportin perusteella; älä toista muuttumattomia pyyntöjä ilman syytä.
2. Palaa 7–14 päivän ja 28 päivän mittaussuunnitelmaan yllä. Kirjaa näyttökerrat, klikkaukset, kyselyt, laskeutumissivut ja indeksointitila vasta kun tiedot näkyvät Search Consolessa.
3. Pidä sääyhteenveto ja etätyöartikkeli avoimina sisältömahdollisuuksina. Julkaise tai laajenna niitä vasta lähteiden tarkistuksen ja todellisen kysyntäsignaalin perusteella; tarkista erityisesti ETK:n mainitut 1.11.2026 muutokset uudelleen ennen etätyöohjeita.

**Pieni seuraava tarkistustehtävä:** selvitä Cloudflare Pages -hallintapaneelista nykyisen projektin julkaisumalli ja tietosuojaan vaikuttavat asetukset sekä tutustu palvelun soveltuviin loki-/säilytystietoihin. Päivitä paikalliset tietosuojatiedot vain, jos tarkistus tuottaa varmennettavaa lisätietoa. Julkaistua HTML:ää ei ole tässä tilannepäivityksessä tarkistettu.

**Aiemman auditin havaintojen tila:** auditin aikana tuotannon tietosuojatekstissä havaittiin vanhentunut julkaisu-/Search Console -kuvaus; paikallinen tiedosto on sittemmin korjattu, mutta julkaistua kopiota ei ole varmennettu. `check-site.mjs`-tarkistimen vahvistusmetan käsittely ja README:n julkaisutila on korjattu paikallisesti. Search Consolen sitemap-/indeksointitilan tarkka syy pysyy avoimena, kunnes se tarkistetaan tilin raportista.

## Lähteet ja rajaukset

- [Google Search Central: Ask Google to recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [sitemapin rakentaminen ja lähettäminen](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [crawl-vianmääritys](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors), [Search Consolen Sitemaps-ohje](https://support.google.com/webmasters/answer/7451001?hl=en-GB) ja [Google Ads Keyword Planner](https://support.google.com/google-ads/answer/7337243?hl=en-en).
- [Fuengirolaan.fi: suomalaisen talvehtijan opas](https://fuengirolaan.fi/blog/talvehtiminen-fuengirolassa); [Espanjassa.fi: Alicanten elinkustannukset](https://www.espanjassa.fi/blogs/oppaat/elinkustannukset-alicantessa); [Espanja.com: asunnon vuokrausopas](https://espanja.com/asuminen-ja-elaminen-espanjassa/viranomaisasiat-espanjassa/lyhyt-opas-asunnon-vuokraukseen-espanjassa/).
- [AEMET: Alacant/Alicante normaalit](https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=8025); [Idealista: heinäkuun 2026 metodologiamuutos](https://www.idealista.com/news/inmobiliario/vivienda/2026/08/03/908719-el-precio-del-alquiler-en-espana-sube-un-6-8-interanual-durante-el-mes-de-julio); [BOE: LAU-konsolidoitu laki](https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003); [EU Your Europe](https://europa.eu/youreurope/citizens/residence/residence-rights/index_fi.htm); [Kela: eurooppalainen sairaanhoitokortti](https://www.kela.fi/european-health-insurance-card); [ETK: EU:n ulkomaantyön sosiaaliturvasääntöjen muutos 1.11.2026](https://www.etk.fi/ajankohtaista/eun-sosiaaliturva-asetukset-uudistuvat-muutoksia-erityisesti-ulkomaantyoskentelya-koskeviin-saantoihin/).
- Hakutulokset ovat 27.10.2026 otos ja vaihtelevat alueen, laitteen ja ajan mukaan. Trendsin riittämätön data ei tarkoita nollakysyntää. Raportti ei ole keyword-volyymitutkimus, lakineuvo eikä lupaus sijoituksista tai liikenteestä.
