# Granskning inför utveckling, 2026-09-02

Vad som granskades, vad som hittades och vad som gjordes. Skrivet för att kunna svara på
frågan "varför ser koden ut så här" utan att gräva i git-historiken.

## Upplägg

Tre oberoende granskare läste koden med var sitt uppdrag: HTML och tillgänglighet,
CSS och responsivitet, JavaScript och datakontrakt. Parallellt mättes sidan deterministiskt
i headless Chrome på 17 bredder (320, 360, 375, 390, 414, 430, 480, 481, 540, 600, 679, 680,
768, 834, 1024, 1280, 1440, 1920) med panelerna stängda och var och en öppen. Mobilbredder
mäts i en iframe: headless Chrome klämmer viewporten till minst 500 px, så en direkt mätning
på 390 ljuger.

Efter åtgärd provkördes sidan med fientlig testdata (`<script>`, `<img onerror>`,
`</script>` i strängar, `javascript:`-URL till porträttet) i alla fyra tillstånden, och med
extremvärden (belopp 1 299 750 kr, not med ROT och grön teknik, 250 px långt sammansatt ord).

## Blockerare (alla åtgärdade)

| # | Fynd | Åtgärd |
|---|---|---|
| 1 | `bokning.js` saknade injektionslager. Alla `data-oa`-hookar på sidan var döda; inget värde gick att fylla från CRM:et. | Lager skrivet efter offertsidans mönster: `textContent`/`createElement`, aldrig HTML. |
| 2 | Adressens hookar var nästlade: `adress_rad1` omslöt `adress_rad2`, så injektionen av rad 1 raderade rad 2. | Syskon-spans. |
| 3 | Tilläggsraden var hårdkodad ("Extra arbetstimme på plats", "+ 850 kr") utan hookar och kunde bara visa ett tillägg. | Mallrad med `data-oa-tillagg` + `data-t`, klonas per post, tas alltid bort när riktig data finns. |
| 4 | Sändknapparna skickade ingenting; ingen endpoint, ingen token. | POST JSON till `bokning.endpoint` med `bokning.token`; prototypläge utan endpoint. |
| 5 | "Imorgon" räknades från ett hårdkodat `data-datum`; injektionen satte bara texten. | `time[datetime]` är enda källan, fylls ur `bokning.datum_iso`. Felformaterat värde stänger av relativ tid. |

## Allvarliga (alla åtgärdade)

- Efter avbokning ändrades ingenting på sidan: rubriken sa fortfarande "Vi kommer", ombokning gick att skicka
  och svarade motstridigt. → Tillståndsmodell `bokning.status` med varianter i markupen; avbokning låser
  ombokning; ett tidigare skickat förslag skrivs om.
- Datumfältet saknade golv; ett passerat datum accepterades. → `min` = dagens datum i lokal tid, plus kontroll
  vid sändning.
- Headerns referensrad överflödade 23 px vid 360 och 9 px vid 375 (nowrap i shared.css). → Bryts under 480,
  scopat i bokning.css.
- Totalplattan sprack vid 320–375: "ÖVERENSKOMMET PRIS" ur sin cell, plattan 111 px hög. → Flex med två
  avsiktliga lägen på 480-brytpunkten (ägaren såg första versionen som "slarvig": beloppet hade `margin-left:
  auto` och skapade en diagonal när det låg ensamt på sin rad).
- Formulärkontrollerna hade 15 px text: iOS Safari zoomar in sidan vid fokus under 16. → 16 px, 48 px höjd
  (datumfältet var 49,5 mot selectens 46).
- Print: shared.css förlitar sig på en `beforeprint`-hanterare som bara offertsidan hade. → Portad.
- `?gaps=1` och en författaranteckning låg i kundens DOM. → Borta.
- `.ics`-byggaren var död kod på B (kalenderknappen borttagen av ägaren) och hade konstant UID + oescapade
  fält. → Borttagen.
- `hidden`-attributet neutraliserades av `.w-rel { display:block }`. → `.bk-shell [hidden] { display:none
  !important }`.

## Kodkvalitet

- Inline-stilen (95 rader) flyttad till `bokning.css`; `b-*` döpt om till `bk-*`; döda klasser
  (`co-shell`, `co-top`, `bk-row--add`) borta; död regel `.bk-when .w-time [data-oa]` borta.
- Utkasten A och C fryser på `assets/utkast/bokning-utkast.{css,js}` så leveransfilerna bara bär B.
- Fyra brytpunkter (420/460/560/680) → två (480/680). Alla lodräta avstånd på skalan 4/8/12/16/24/32/48/64.
  Tre regler bär rytmen: syskon i kort 16, rubrik → innehåll 24, avdelarlinje 24 på båda sidor.
- `--r-sm` var odefinierad (fältens radie kom från en fallback). → `--r-md`.
- `hyphens: auto` provades och togs bort: den avstavade "and-ra" mitt i en vanlig mening vid 390.
  `overflow-wrap: anywhere` räcker för att ett långt ord aldrig ska spränga spalten.
- Placeholder-kontrast (WebKit-standard 2,35:1) → `--faint`, 5,25:1.
- `required`/`aria-required`/`name` på fälten, `role="list"` på listor med `list-style: none` (WebKit
  tappar annars listrollen), gruppetikett på elektrikern, sr-only-text på ny-flik-länken.
- Fyra partnerlogotyper och `offer-logic.js` som ingenting refererade togs bort ur repot.
- Jämförelsesidan påstod "58 procent av kunderna läser i mobilen" utan källa. → Borttaget.

## Uppmätt efter åtgärd

Noll horisontellt överflöd på alla 17 bredder, panelerna stängda och öppna. Alla interaktiva
element ≥ 44 px (fotens telefonlänk 83×44, expanderarna 53). Rubrik → innehåll 24 i alla kort.
Logotypen linjerar exakt med kortens innehållskant. Kontrast: tätaste paret på sidan är foten,
4,83:1; allt annat ≥ 5,2:1.

## Hittat men INTE rättat (ägargrindat)

`shared.css` rad 640–650 är prosa utanför kommentar (ett granskarmeddelande inklistrat i CSS:en).
Parsern sväljer den tillsammans med regeln efter, `.of-svc__ingar .ig-note {…}`, så noten i
offertsidans serviceavtal har aldrig varit stylad. Bokningssidan använder inte regeln. Kopian i
Desktop-mappen till Yassine är identisk. Rättas i offertmallens repo när ägaren sett vad som
ändras, eftersom det rör offertsidans godkända rendering.
