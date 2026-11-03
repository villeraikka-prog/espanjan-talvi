# Sisällönjakelustrategia

**Tarkistettu 3.11.2026.** Tavoitteena ovat hyödylliset lukijat ja mitattava referral-liikenne, ei linkkien määrän kasvattaminen.

## Kuuden viikon pilotti

- **Pinterest Business/Buffer:** 2 erilaista Pin-julkaisua viikossa: yksi kohdekohtainen hyöty ja yksi todellinen vertailu/tarkistuslista. Ei 24 lähes samaa korttia.
- **Toinen kanava vain olemassa olevan yleisön perusteella:** Facebook Page tai LinkedIn-jäsenprofiili, yksi viikkopostaus.
- **Reddit/Quora:** ei ajastusta. Käyttäjä tuo aidon kysymyksen, Codex laatii lähteistetyn vastauksen, ihminen tarkistaa säännöt ja julkaisee.
- **YouTube:** myöhempi vaihe; videoiden kustannus, oikeudet, laatu ja API-projektin näkyvyys selvitettävä.

Rytmi on kokeilusuositus, ei mitattu optimaalinen määrä.

## Kanavamuoto ja laskeutumissivu

| Kanava | Muoto | Sopiva URL |
|---|---|---|
| Pinterest | Pystygrafiikka, yksi luettava kysymys/johtopäätös, lähde ja päiväys. | Kaupunki → vastaava kohdeprofiili; vertailu → etusivun työkalu. |
| Facebook Page | Yksi paikallinen havainto, kuva tai linkkiesikatselu. | Profiili, vuokraus, opas tai palvelut kysymyksen mukaan. |
| LinkedIn | Lähteistetty data-/metodihavainto, ei matkailumainos. | Elinkustannukset tai vertailu. |
| YouTube long-form | Harva tekstityksellinen ja lähteistetty opas; kuvauslinkki. | Vertailu tai profiili. |
| Reddit/Quora | Oikeaan kysymykseen vastaava teksti; linkki vain täydentävänä. | Täsmällinen sivu, jos siitä on suora hyöty. |
| Medium | Ei automaatiota; vain itsenäinen artikkeli, jos alustalla on aito lukijahyöty. | Canonical-suunnitelma tarkistettava. |

Kohdesivun säännöt: kaikkien kohteiden vertailu → etusivu; hakemisto → /kohteet/; kaupunki → /kohteet/{slug}/; yleisopas → /talvehtiminen-espanjassa/; vuokraus → /vuokraus/; henkilökohtainen budjetti → /budjetti/; alueellisen hintatiedon tulkinta → /elinkustannukset/; palvelulinkit → /palvelut-ja-linkit/.

Tallenna URL, valinnan syy, luonnollinen linkkikonteksti sekä utm_source, utm_medium, utm_campaign ja utm_content. Älä käytä agressiivista exact-match-ankkuria. [Google campaign tagging](https://support.google.com/analytics/answer/10917952?hl=en)

## Tuotantoputki ja media

1. Valitse talvehtijan kysymys, ei pelkkä avainsana.
2. Tarkista reposta ja ajantasaisista lähteistä väitteet; päiväystä vaativat hinnat, liikenne ja tapahtumat päivätään.
3. Tee alustakohtainen versio, ei identtistä crosspostia.
4. Kuva/kaavio tarvitsee lähteen, aluetarkkuuden, ajanjakson, lisenssin ja alt-tekstin.
5. Älä generoi faktalta näyttävää karttaa ilman dataa.
6. Esikatsele copy, media, URL, UTM, ajankohta ja kanava yhdessä.
7. Käyttäjä hyväksyy batchin; publisher tallentaa remote-ID:n ja URL:n.
8. Kuuden viikon jälkeen arvioi kanavakohtainen yleisö ja referral-hyöty.

Nykyisen Codex-ympäristön kuvanluonti on interaktiivinen työkalu, ei repon taustalla kutsuttava API. Sen lisäkäyttöhintaa ei voitu vahvistaa. MVP käyttää lisensoituja kuvia tai paikallisia SVG/HTML-datagrafiikoita.

## Mittaus ja esimerkit

Kirjaa julkinen post URL/ID, kohdelinkki, UTM, linkin klikattavuus, rel vain varmennettuna, julkisuus/indeksointi päiväyksellä ja alustamittarit niiden alkuperäisin nimityksin. Cloudflare Web Analytics -tagi on lähdekoodissa, mutta tuotannon toimintaa tai UTM-kampanjaraporttia ei tässä vahvistettu; GA4 ei ole vahvistettu. GSC Links on näyte eikä anna rel-arvoa. [GSC links](https://support.google.com/webmasters/answer/9049606?hl=en), [link attributes](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)

Hoomfyn Costa Blanca -long-stay-opas, Gold & Gris Benidorm -vertailu ja Rantapallon alueopas tarjoavat sisältöformaatteja, eivät näyttöä jakeluautomaatiosta tai tuloksista: [Hoomfy](https://hoomfy.nl/en/blog/wintering-costa-blanca-long-stay-guide/), [Gold & Gris](https://goldgrisbenidorm.com/guide/wintering-on-the-costa-blanca/), [Rantapallo](https://www.rantapallo.fi/matkakohteet/costa-blanca/). Visit Finlandin kanavaopas on jakelukartta, ei automaation tulostutkimus: [PDF](https://www.visitfinland.fi/globalassets/visitfinland.fi/vf-julkaisut/2023/vf_digitaaliset_jakelukanavat_fr_it_spa_eng_052023.pdf).

Tarkkaa, julkisesti dokumentoitua matkailusivuston API-julkaisuprosessia ei tässä tutkimuksessa vahvistettu.
