# API- ja tilivaatimukset

**Tarkistettu 3.11.2026.** Virallisen dokumentaation kuvaama mahdollisuus ei tarkoita, että käyttäjän omalle tilille olisi myönnetty oikeus.

## Buffer — suositeltu ensimmäinen integraatio

- GraphQL API on saatavilla myös Free-tasolla; sillä voi luoda ja ajastaa sisältöä sekä lukea kanavia/postauksia. [API](https://buffer.com/api), [API support](https://support.buffer.com/articles/using-buffers-api-GtIYIQilz5)
- Free: enintään 3 kanavaa, 10 ajastettua postausta/kanava, 1 API-avain ja 1 000 pyyntöä/kanava/30 päivää, enintään 3 000.
- Käyttäjä yhdistää kanavat Bufferiin. Organisaation omistaja luo API-avaimen. Tässä ympäristössä ei ole Buffer-yhdistintä; Node GraphQL-adapteri tarvitaan.
- Testaa media upload, scheduling, post URL, status, rate limits, timeout ja delete. Salaisuus Windows Credential Manageriin/DPAPI:hin.

## Pinterest suora API — varareitti

- API v5 käyttää OAuthia, client ID/secretia, rekisteröityä redirect URI:a, scopeja ja tokenien hallintaa. Pin- ja Board-oikeudet valitaan käytön mukaan.
- Trialilla luodut Pin/Board-kohteet näkyvät vain tekijälle. Julkinen suora käyttö edellyttää Standard access -hyväksyntää sekä demoa oikeasta OAuth/live-integraatiosta. [Access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/), [auth](https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/)
- Pin tukee kohdelinkkiä. Rate limit riippuu tasosta ja endpointista; yleisohjeessa Trial on 1 000 pyyntöä/päivä ja Standard enintään 100 pyyntöä/sekunti/käyttäjä/sovellus, lisäksi endpoint-rajoitukset. [Rate limits](https://developers.pinterest.com/docs/reference/rate-limits/)
- MVP:ssä Buffer vähentää oman Pinterest-sovelluksen hyväksyntätyötä.

## LinkedIn

- Jäsenpostaus: OAuth 2.0, Share on LinkedIn ja w_member_social. [Access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- Posts API tukee tekstiä, kuvia, videoita, dokumentteja ja Article-tyyppiä. Media ladataan ensin. Käytä LinkedIn-Version- ja X-Restli-Protocol-Version-headereita; voimassa oleva API-versio tarkistetaan toteutushetkellä. [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-09)
- Organisaatiopostaus tarvitsee w_organization_social-oikeuden ja organisaatioroolin; tarkista Developer Portalista. [Organic posts](https://learn.microsoft.com/en-us/linkedin/marketing/usecases/page-management/organic-posts-usecase?view=li-lms-2026-04)
- Rate limitit ovat app-/endpoint-kohtaisia. Julkaisuoikeus ei takaa analytics-oikeutta.

## Meta: Facebook ja Instagram

- Facebook Page tarvitsee Page-roolin, Page access tokenin ja tarvittavat API-oikeudet. Pages API dokumentoi postausten luontia. Tarkka permission set, Advanced Access, App Review ja Business Verification varmistetaan Meta App Dashboardissa. [Pages API](https://developers.facebook.com/docs/pages-api/posts/)
- Tokenien uusinta/peruutus testataan; käytä vähimpiä scopeja. Bufferin kautta käyttäjä yhdistää tilin, mutta julkaistu sisältö varmennetaan.
- Kolmannen osapuolen Facebook Group -julkaisu poistui publish_to_groups-oikeuden lakkautuksessa 22.4.2024. Ei workaroundia.
- Instagram Content Publishing vaatii Professional-tilin ja Meta OAuth/app-oikeudet; varmista nykyiset tilityyppi-, linkitys- ja review-ehdot. [Instagram API](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/)

## YouTube

- Google Cloud -projekti, YouTube Data API v3, OAuth consent ja scope https://www.googleapis.com/auth/youtube.upload.
- videos.insert lataa videon ja metatiedot. Endpoint-dokumentaatio listaa 100 insert-kutsua päivässä; tarkista projektin todellinen quota Consolesta. [Insert](https://developers.google.com/youtube/data/reference/rest/v3/videos/insert), [quota](https://developers.google.com/youtube/v3/determine_quota_cost)
- **Dokumentaatioristiriita:** nykyinen endpoint sanoo, ettei unverified-projekti ole rajoitettu privateen; revision history säilyttää 2020-ohjeen private-rajoituksesta ja auditoinnista. Varmista oman projektin tila ja tee private test upload ennen julkisuutta. [Current reference](https://developers.google.com/youtube/data/reference/rest/v3/videos), [revision history](https://developers.google.com/youtube/v3/revision_history)
- Analytics API vaatii erillisen OAuthin. [Analytics](https://developers.google.com/youtube/analytics)
- Realistisesti synteettinen tai merkittävästi muokattu media voi vaatia disclosurea. [Disclosure](https://support.google.com/youtube/answer/14328491?hl=en)
- Shorts-kuvauksen ja kommentin URL:t eivät ole klikattavia. [Shorts links](https://support.google.com/youtube/answer/13748639?hl=en)

## Reddit, Quora ja Medium

- Reddit OAuth API tukee postauksia. Noudata tunnistautumista, User-Agentia, rate limitejä ja sovellusehtoja. Data API Terms voi vaatia erillisen sopimuksen kaupalliseen tai nimenomaista lupaa laajempaan käyttöön; tämä on tarkistettava, jos sivusto kaupallistuu. [API](https://www.reddit.com/dev/api/), [Terms](https://redditinc.com/policies/data-api-terms)
- MVP ei scrapea Reddit-keskusteluja eikä julkaise APIlla. Käyttäjä tuo ketjun; Codex luonnostelee ja käyttäjä tarkistaa säännöt/julkaisee.
- Quoran virallista julkaisun kirjoitus-APIa ei vahvistettu. [Guidance](https://business.quora.com/resources/writing-on-quora-as-a-business)
- Medium ei myönnä uusia API-tokeneita/integraatioita ja julkaisu vaatii kirjautumisen; sääntöjen vuoksi ei promoautomaatiota. [API/import](https://help.medium.com/hc/en-us/articles/213480228-API-Importing), [rules](https://help.medium.com/hc/en-us/articles/213477928-Medium-Rules)

## Muita vaihtoehtoja

| Palvelu | Virallinen kyky ja päätös |
|---|---|
| WordPress.com | OAuth REST post API; ei rinnakkaisblogia ilman yleisöstrategiaa. [Docs](https://developer.wordpress.com/docs/api/1/post/sites/$site/posts/new/) |
| Blogger | OAuth API insert/publish; ei backlink-blogia. [Insert](https://developers.google.com/blogger/docs/3.0/reference/posts/insert) |
| Ghost | Admin API integration tokenilla; ei uutta julkaisualustaa MVP:hen. [Docs](https://docs.ghost.org/admin-api/) |
| Write.as | Julkaisun API, mutta yleisöfit puuttuu. [Docs](https://developers.write.as/docs/api/) |
| Hashnode | GraphQL API on muuttunut maksulliseksi vuonna 2026; teknologiayleisö ei sovi. [Change](https://hashnode.com/changelog/2026-05-13-graphql-api-paid-access) |
| Forem/DEV | Article API; kehittäjäyleisö ei sovi. [Docs](https://developers.forem.com/api) |
| Flipboard | RSS-publisher-prosessi, write APIa ei vahvistettu; repo ei sisällä RSS:ää. [RSS](https://about.flipboard.com/rss-guidelines/) |
| Flickr | Upload API, mutta kaupallinen käyttö vaatii ennakkosopimisen. [Terms](https://www.flickr.com/services/api/) |
| TikTok | video.publish, käyttäjän suostumus ja public-julkaisussa auditointi. [Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines) |
| Product Hunt | API tuotelanseeraukseen; ei sisältösivustolle. [API](https://api.producthunt.com/v2/docs) |

## Windows-salaisuudet

API-avaimet ja refresh-tokenit Windows Credential Manageriin tai käyttäjäkohtaiseen DPAPI-suojaukseen. Ei repoon, keskusteluun, komentoriviargumenttiin tai lokiin. Least-privilege scope. Tokenin vanheneminen pysäyttää kanavan needs_auth-tilaan; käyttäjä valtuuttaa uudelleen.
