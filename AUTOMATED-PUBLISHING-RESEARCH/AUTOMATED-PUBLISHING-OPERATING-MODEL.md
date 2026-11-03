# Julkaisujärjestelmän toimintamalli

## Oletus

Codex valmistelee sisältöä, paikallinen jono säilyttää sitä ja Buffer lähettää vain hyväksytyn erän. Yleinen ennakkolupa ei oikeuta tulevien generoitujen julkaisujen lähettämiseen. Ihminen tarkistaa väitteet, kuvat, kohde-URL:n ja kanavakohtaisen esikatselun.

## Kolme tilaa

**Hyväksytyn jonon automaattinen lähetys:** Publisher voi ajastaa täsmälleen hyväksytyn, muuttumattoman version. Se ei luo uutta sisältöä, muuta tekstiä/URL:ää tai julkaise Mediumiin, Redditiin tai ryhmiin. Timeoutissa tarkistetaan etätila ennen uusintaa.

**Batch-hyväksyntä (suositus):** preview sisältää täsmällisen copyn, alustan ja tilin, median/altin/lisenssin, kohde-URL:n ja perustelun, UTM:n, ajastuksen, lähteet ja alustakohtaisen esikatselun. Editointi mitätöi hyväksynnän.

**Manuaalinen julkaisu:** Reddit, Quora, Medium ja yhteisöt saavat valmiin luonnoksen. Käyttäjä valitsee keskustelun, tarkistaa säännöt ja julkaisee itse. Ei selaimen ohjaamista rajoitusten kiertämiseksi.

## Esimerkkikomennot

**“Etsi kolme hyödyllistä aihetta tälle viikolle ja valmistele sisältö.”** Codex lukee repon ja aiemmat kampanjat, ehdottaa lukijan tarpeita, lähteistää tiedot, valitsee URL:t ja tuottaa alustaversiot. Tulos on esikatselu, ei julkaisu.

**“Tee seuraava kohdevertailukampanja.”** Codex käyttää vertailutyökalun tietoja oikein, säilyttää mittarien maantieteellisen tarkkuuden ja tekee alustakohtaiset muodot. Ei muuta aluehintaa kaupunkihinnaksi.

**“Luo ja ajasta tämän viikon Pinterest-sisältö.”** Codex tekee kaksi Pin-versiota ja näyttää kuvan, kopyn, URL:n, UTM:n ja ajastuksen. Buffer lähettää vasta hyväksynnän jälkeen; remote-ID ja lopullinen URL tallennetaan.

**“Valmistele ja julkaise hyväksytyt LinkedIn-artikkelit.”** Lähetetään vain nykyinen hyväksytty hash. Tarkista API-versio, tili ja oikeus; jos puuttuu, vie manuaaliseksi luonnokseksi.

**“Tee viikon jakeluraportti.”** Näytä julkaisut/jonot/virheet, URL:t, kohdesivut, UTM:t, saatavilla olevat alustamittarit, referralit ja lähteet. Puuttuva tieto näytetään puuttuvana.

**“Etsi epäonnistuneet julkaisut ja yritä uudelleen.”** Rate limit odottaa; auth-virhe pysäyttää; timeout tarkistaa remote-tilan. Uusinta vasta, kun julkaisemattomuus on varmistettu.

## Käyttörutiini ja alkuasetukset

1. Käyttäjä pyytää kampanjan.
2. Codex tutkii, kirjoittaa ja validoi.
3. Käyttäjä tarkistaa yhden erän.
4. Publisher ajastaa hyväksytyt.
5. Viikon jälkeen tarkistetaan näkyvyys ja mittarit.
6. Kuuden viikon jälkeen päätetään jatkosta.

Myöhemmin käyttäjä voi luoda Buffer Free -tilin, yhdistää Pinterest Business -kanavan ja tallentaa avaimen Windows Credential Manageriin. Tässä tutkimuksessa ei luotu tilejä, tunnuksia eikä julkaisuja.

## Autonomia ja lopullinen suositus

- Nykytilassa julkaisu ei onnistu suoraan: ei adaptereita/tunnuksia. Kuvanluonti on vuorovaikutteista, ei repon unattended-API.
- MVP:n jälkeen arviolta 60–75 % teknisistä vaiheista voidaan automatisoida hyväksynnän sisällä. Tämä on toteutusarvio, ei mitattu tulos.
- Paras ensimmäinen polku: Buffer Free + Pinterest Business; toinen kanava vain olemassa olevan yleisön mukaan.
- Pinterestin kohdelinkki on lupaavin suora referral-ehdokas, mutta toteutunutta liikennettä ei ole mitattu. YouTube long-form voi olla hyödyllinen myöhemmin; Shorts ei ole suora linkkikanava.
- Reddit/Quora/yhteisöjulkaisu pysyy manuaalisena. Hylkää Medium-automaatio, Facebook Group API -julkaisu, massahakemistot ja rinnakkaisblogit.
- Ulkoinen linkki voi olla legitiimi, mutta rel, indeksointi tai ranking-hyöty ei ole taattu.
- Buffer Free maksaa $0/kk. AI-/mediahintaa ei voitu vahvistaa. Essentials kolmelle kanavalle olisi $15/kk ekvivalentti ja $180 vuodessa ennakkoon, mutta MVP ei tarvitse sitä. [Pricing](https://buffer.com/pricing)
- Pienin hyödyllinen toteutus on preview-only Node/SQLite, Buffer-adapteri Pinterestille ja kuuden viikon hyväksytty pilotti.
- Vakaan käytön arvio: 30–60 min käsityötä viikossa; alussa 1–2 h. Video lisää arviolta 1–3 h kampanjaa kohti.
- Realistinen pitkäaikainen autonomia: noin 60–75 % teknisestä työstä erähyväksynnällä; keskusteluyhteisöissä ihminen julkaisee.

**Päätelmä:** voidaan rakentaa lähes maksuton hyväksytyn sisällön jakelija, ei nykytilassa täysin itsenäistä markkinointiagenttia. Julkaisua ei aloiteta ennen tilien käyttäjävaltuutusta, testipostausta, linkki-/mittaustarkistusta ja nimenomaista batch-hyväksyntää.
