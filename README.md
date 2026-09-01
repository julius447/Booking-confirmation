# Bokningsbekräftelsen — tre riktningar

Mallen kunden får när tiden är bokad och offerten accepterad.
Bygger på samma designsystem som [offertmallen](https://github.com/Ampy-nordic/offert-mall).

**→ [Öppna jämförelsesidan](https://julius447.github.io/Booking-confirmation/)**
**→ [Läs UX-analysen](UX-ANALYS.md)** (läs den först, den förklarar varför riktningarna
skiljer sig i struktur och inte bara i utseende)

| | Riktning | Karaktär | Öppna |
|---|---|---|---|
| **A** | Kallelsen | Dokument. Datumet i displaystorlek, en centrerad kolumn. | [Visa](https://julius447.github.io/Booking-confirmation/riktning-a-kallelsen/) |
| **B** | Dagen | Pedagogisk. Besöket som en tidslinje: innan, på plats, efteråt. | [Visa](https://julius447.github.io/Booking-confirmation/riktning-b-dagen/) |
| **C** | Kvittensen | Modulär. Ett rutnät av kort, snabbast att skanna. | [Visa](https://julius447.github.io/Booking-confirmation/riktning-c-kvittensen/) |

---

## Den bärande insikten

Offerten och bokningsbekräftelsen ser ut att vara syskon men gör motsatt jobb. Offerten
möter en kund som ska **bestämma sig**; bokningsbekräftelsen möter en kund som **redan
har gjort det**. Därför är det rätt att ta bort summeringspanelen: den fanns för att hålla
beslutet nåbart, och här finns inget beslut.

Det som tar panelens plats som ankare är **tid och elektriker**, inte priset. Kunden öppnar
sidan flera gånger — när den kommer, dagen innan, på morgonen — och ska aldrig behöva
scrolla efter svaret. Uppmätt vid 390 px står både datum och elektriker inom de översta
700 px i alla tre riktningarna.

Prishierarkin inverteras därmed:

```
Offert:   pris → arbete → trygghet → beslut
Bokning:  när + vem → vad → pris (som kvittens) → ändra (litet)
```

## Vad alla tre delar

- **Priset är formulerat som en kvittens, inte som ett betalkrav.** Offertens
  "ATT BETALA" följer inte med hit; arbetet är inte utfört och ingen ska betala något.
  Rubriken är "Överenskommet pris", med raden *"Ingenting ska betalas nu."*
- **Anledningen är obligatorisk** vid både omboka och avboka, enligt ägarkravet. Spärren
  säger vad som saknas och flyttar fokus dit. Ingen confirmshaming.
- **Omboka föreslår en ny tid** med datum, tidsfönster och en fritextrad, och säger tydligt
  att den nuvarande tiden står kvar tills vi bekräftat. Sidan låtsas inte boka om något.
- **Lägg till i kalendern** bygger .ics-filen i webbläsaren ur det som står på sidan, så
  kalendern aldrig kan säga en annan tid än sidan gör.
- **Ingen merförsäljning.** Inget serviceavtal, inga tillägg att lägga till. Kunden har
  köpt; sidans jobb är att vara pålitlig.
- Samma tokens, samma Outfit, samma komponentspråk som offertmallen.

## Två luckor som är markerade, inte ifyllda

- **Hur länge strömmen är av** under arbetet. Det är precis den pedagogik som minskar
  bomkörningar, men jag kan inte hitta på siffran. `[GAP]`
- **Vad en sen avbokning kostar.** Framkörning och minimidebitering är en öppen grind sedan
  tidigare. Sidan varken hittar på en avgift eller döljer att det kan finnas en. `[GAP]`

Lägg `?gaps=1` på URL:en för att se författaranteckningarna.

## Min rekommendation

**A om ni vill ha en sida, B om ni vill lösa ett problem.**

A är säkrast och närmast offertens formspråk. B är den enda som svarar på frågan kunden
faktiskt bär på inför ett hembesök: *vad förväntas av mig?* Den betalar sig i färre
bomkörningar och färre samtal, men bara om ni fyller i förberedelserna. Gör ni inte det
blir B en tom form och då är A bättre.

C är rätt om sidan mest kommer att öppnas om och om igen för att kolla en enda uppgift,
men den återinför en tvåkolumnskänsla på desktop, vilket ligger nära det ni bad mig ta bort.

## Filer

```
index.html                    jämförelsesidan
UX-ANALYS.md                  analysen bakom riktningarna
riktning-a-kallelsen/
riktning-b-dagen/
riktning-c-kvittensen/
assets/                       tokens, shared.css, typsnitt, logotyper
  bokning.css                 komponenterna som är nya för den här sidan
  bokning.js                  paneler, obligatorisk anledning, kalenderfil
```

Kör lokalt: `python3 -m http.server 8000` och öppna `http://localhost:8000/`.

## Status

Wireframes för riktningsval. Ingen backend: om- och avbokning är gränssnittsbeteende och
skickar ingenting. Datakontraktet följer samma mönster som offertmallen
(`window.AMPY_OFFER` + `data-oa`-hookar) men är inte inkopplat än — det görs när riktningen
är vald.

Uppmätt vid 320, 390, 768 och 1440 px: noll horisontellt överflöde, alla bilder laddar,
inga konsolfel.
