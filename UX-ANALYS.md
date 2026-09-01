# Bokningsbekräftelsen — UX-analys

Underlaget till de tre riktningarna. Läs den här först; den förklarar varför de skiljer sig
åt i struktur och inte bara i utseende.

---

## 1. Den bärande insikten: sidan gör motsatt jobb mot offerten

Offertmallen och bokningsbekräftelsen ser ut att vara syskon. De är det inte. De möter
kunden i två helt olika tillstånd, och det ska styra allt annat.

| | Offerten | Bokningsbekräftelsen |
|---|---|---|
| Kundens läge | Ska bestämma sig | Har redan bestämt sig |
| Frågan hen bär på | "Ska jag?" | "När, och vem kommer?" |
| Prisets roll | Variabeln som vägs | En uppgörelse som redan är gjord |
| Huvudhandling | Acceptera | **Ingen.** Sidan lyckas när kunden stänger den lugn |
| Utvägen | Avböj, ett riktigt utfall | Om/avboka, ett fel vi ska hantera väl men inte inbjuda till |

**Därför är det rätt att ta bort summeringspanelen.** Den fanns för att hålla *beslutet*
alltid nåbart. Här finns inget beslut. Att behålla panelen vore att behålla möbleringen i
ett rum vars syfte har ändrats.

**Och därför räcker det inte att göra samma sida bredare.** Något måste ta panelens plats
som ankare, och det är inte priset.

---

## 2. Vad som blir det nya ankaret

**Tid och elektriker.** Det är vad kunden öppnar sidan för att kolla.

Och hen öppnar den **flera gånger**. Offerten läses en eller två gånger och avgörs.
Bokningsbekräftelsen öppnas när den kommer, dagen innan, och på morgonen samma dag. Det
ger ett hårt krav:

> Datum, tid och vem som kommer ska besvaras **utan att kunden scrollar**, på mobil, varje
> gång sidan öppnas.

Det flyttar också elektrikern uppåt i hierarkin. På offerten var bokaren en liten
trovärdighetsbricka. Här är det en människa som ska in i kundens hem. Namn, bild och
telefonnummer förtjänar riktig tyngd.

**Prishierarkin inverteras:**

```
Offert:   pris → arbete → trygghet → beslut
Bokning:  när + vem → vad → pris (som kvittens) → ändra (litet)
```

---

## 3. Beslut som analysen tvingar fram

### 3.1 Priset får inte läsa som "betala nu"

Arbetet är inte utfört. Ingen ska betala något när de läser det här. Prisrutan från
offerten säger **"ATT BETALA"** i versaler ovanför beloppet — den formuleringen får inte
följa med hit. Rubriken ska säga vad det är: en uppteckning av vad som är överenskommet.

Alla tre riktningarna använder **"Så här ser din beställning ut"** i stället.

### 3.2 Kravet på anledning ändrar mönstret

Du kräver att kunden förklarar varför vid både omboka och avboka. Det betyder att
skicka-knappen måste vara **spärrad tills en anledning finns**, och spärren måste vara
ärlig, inte tjatig.

Offertsidan har redan exakt det mönstret: tom frågeruta ger *"Skriv din fråga eller ändring
i rutan först."* Vi återanvänder tonen. **Ingen confirmshaming** — kunden får inte känna
sig dum som ombokar.

### 3.3 Omboka behöver ett tidsförslag, och det är en ny komponent

Offertmallen har inget datumfält. Här behövs ett. Tre möjliga former:

| Form | För | Emot |
|---|---|---|
| Fritext | Ärligast mot hur det faktiskt hanteras: en människa läser och ringer upp | Ingen struktur att mata in i bokningssystemet |
| Datumväljare | Strukturerad data | Låtsas att tiden är bokad i samma stund, vilket den inte är |
| Datum + tidsfönster (fm/em) | Strukturerat nog att mata in, ärligt om att det är ett *önskemål* | Kräver att ni definierar fönstren |

**Rekommendation: datum + fönster + en fritextrad.** Det ger er något att arbeta med utan
att lova en bekräftad tid. Formuleringen måste vara tydlig: *"Vi hör av oss och bekräftar."*

### 3.4 Lägg till i kalendern

Den enskilt mest värdefulla funktionen på en bokningsbekräftelse, och den saknas i din
kravlista. En kalenderfil betyder att kunden slipper komma ihåg, och att ni slipper en
bomkörning. Alla tre riktningarna har den.

### 3.5 Vad som INTE ska finnas här

**Ingen merförsäljning.** Inget serviceavtal, inga tillägg att lägga till. Kunden har köpt.
Sidans uppgift är att vara pålitlig, inte att sälja igen. Att pitcha här är det snabbaste
sättet att göra en trygg kund misstänksam.

### 3.6 Två saker jag inte kan fylla i

- **Förberedelser.** "Röj framför elcentralen", "någon behöver vara hemma", "strömmen är
  av i X timmar" är precis den pedagogik du efterfrågar, och det som mest minskar
  bomkörningar. Men jag kan inte hitta på hur länge strömmen är av. `[GAP]`
- **Vad en avbokning kostar.** Framkörningsavgift eller minimidebitering är en öppen grind
  sedan tidigare. Sidan får varken hitta på en avgift eller dölja att det kan finnas en.
  `[GAP]`

Båda står som markerade platshållare i riktningarna.

---

## 4. De tre riktningarna

De är **strukturellt** olika, inte tre färgsättningar av samma sida.

### A · Kallelsen
En centrerad kolumn. Öppnar med datumet satt i displaystorlek, som en biljett, med
elektrikern direkt under. Därefter uppteckningen: arbete, material, tillägg, pris, villkor.
Om/avboka som ett stilla par längst ner.

**Karaktär:** dokument. Lugn, saklig, närmast offertens DNA.
**Stark när:** kunden vill ha ett papper att spara och känna sig trygg med.
**Svaghet:** uppteckningen blir en lång, likformig sträcka.

### B · Dagen
Besöket som en tidslinje: **Innan** (vad du gör i förväg) → **På plats** (vad som händer,
vem som kommer) → **Efteråt** (intyg och faktura). Elektrikern ligger i "På plats", där hen
hör hemma i berättelsen. Beställningen fälls ihop i ett eget block.

**Karaktär:** pedagogisk. Svarar på frågor kunden inte ställer högt.
**Stark när:** kunden aldrig har haft en elektriker hemma förut.
**Svaghet:** står och faller med att ni fyller i förberedelserna. Utan dem blir tidslinjen
en tom form.

### C · Kvittensen
Ett rutnät av fristående kort: Tid · Elektriker · Arbete · Material · Pris · Ändra. Två
kolumner på desktop, staplade på mobil. Varje kort är en faktagrupp med egen etikett.

**Karaktär:** modulär, snabbast att skanna, känns som en orderbekräftelse.
**Stark när:** kunden öppnar sidan för femte gången och bara vill se en sak.
**Svaghet:** minst varm. Ett rutnät kan läsa som en instrumentpanel i stället för ett
besked från en människa. Och den återinför en tvåkolumnskänsla på desktop, vilket ligger
nära det du bad mig ta bort.

---

## 5. Så bedömer du dem

Ställ tre frågor till varje riktning, på mobil:

1. **Får jag veta när och vem utan att scrolla?**
2. **Om jag öppnar sidan för femte gången, hur snabbt hittar jag det jag kom för?**
3. **Om jag måste omboka, känner jag mig dum?**

Min rekommendation står i README, men frågorna ovan avgör bättre än jag gör.

---

# Del 2 · Genomgången av riktning A

Skriven efter att A valts. Allt nedan är uppmätt i webbläsaren, inte tyckt.

## Vad mätningen hittade

| # | Fynd | Bevis | Åtgärdat |
|---|---|---|---|
| 1 | **Sidan hade ingen `<h1>`.** Datumet, sidans viktigaste innehåll, låg i en `<span>`. I rubrikträdet fanns bara H2 och H3, alltså ingen sidrubrik alls för en skärmläsare. | `document.querySelectorAll('h1').length === 0` | Datumet är nu `<h1>` med `<time datetime>` |
| 2 | **Ingen adress.** En bokningsbekräftelse som aldrig säger var. Det är dessutom det vanligaste felet en kund upptäcker i en bekräftelse. | Sökning på adressmönster i sidtexten: noll träffar | Adressblock med datakrokar, direkt under tiden |
| 3 | **Totalplattan var omkastad.** Beloppet låg till vänster och etiketten till höger, tvärtemot varje annan rad på sidan och tvärtemot offertmallen. | Uppmätt vid 390 px: belopp x18–117, etikett x131–303 | Explicit rutnätsplacering. Nu etikett x18, belopp högerställt |
| 4 | **»08:00 till 12:00« var tvetydigt.** Ankomstfönster eller arbetstid? Skillnaden avgör om kunden kan gå till jobbet eller inte. | Ingen text på sidan angav vilket | »Elektrikern kommer mellan 08:00 och 12:00«, plus en rad om hur länge arbetet tar |
| 5 | **Ingen väg att bara fråga.** De enda två handlingarna var omboka och avboka, båda ingripande. En kund som ville säga »adressen är fel« eller »kan ni titta på uttaget i garaget också« hade ingen väg alls. | Två knappar i ändra-sektionen | Tre vägar: Ställ en fråga · Föreslå en ny tid · Avboka |
| 6 | **»Tillägg«-etiketten var ett CSS-`::before`.** Den fanns varken i tillgänglighetsträdet, i utskriftens textlager eller vid kopiering. | `/tillägg/i` mot sidtexten: falskt | Riktig text i markupen |
| 7 | **Tilläggsraden var hårdkodad** och kunde inte försvinna. Kravet säger »eventuella tillägg«, alltså kan listan vara tom, och en tom rad med etiketten kvar hade sett ut som ett fel. | Ingen datakrok på raden | Datakrok; tom lista tar bort raden |
| 8 | **Ingen relativ tid.** Sidan öppnas flera gånger, och »Torsdag 24 september« säger mindre än »Imorgon« när det är imorgon. | Sökning på idag/imorgon: noll träffar | »Idag« / »Imorgon« / »I övermorgon« sätts i webbläsaren, räknat mot dygnsgränser och inte i timmar |
| 9 | **Elektrikernamnet låg på 19 px mot sektionsrubrikens 20,1.** Platt steg, och namnet är semantiskt ingen rubrik. | Uppmätt | 17,5 px |

Kontrasten mättes på sex textytor och låg mellan 5,75:1 och 18,24:1, alltså med marginal
över kravet. Inga träffytor under 44 × 44 px vid någon bredd. Noll horisontellt överflöde
vid 320, 390, 768 och 1440. Långa namn och långa arbetsrader spränger inte layouten.
Utskriften innehåller allt, inklusive materiallistan och villkorstexten.

## En detalj värd att nämna

Veckodagen gemeniseras när den följer efter »Imorgon,«. CRM:et levererar
»Torsdag 24 september« som fristående sträng, och »Imorgon, Torsdag« är inte svenska.

## Kvarstående luckor

Tre saker kan inte fyllas i utan dig. De står som markerade platshållare, aldrig som
gissningar:

1. **Hur länge arbetet tar** från att elektrikern är på plats. Det är den enskilt viktigaste
   uppgiften för en kund som ska planera sin dag.
2. **Vad en sen avbokning kostar.** Framkörning och minimidebitering är en öppen grind sedan
   tidigare.
3. **Om kunden behöver göra något för ROT-avdraget** inför besöket.

## Två tillstånd som inte är byggda

- **Besöket har passerat.** Öppnar kunden länken dagen efter står det fortfarande
  »Vi kommer«. Samma klass av defekt som en utgången offert utan utgångsläge.
- **Redan ombokad eller avbokad.** Sidan renderar som en aktiv bokning även efter att
  kunden avbokat.

Båda kräver ett beslut om vad kunden ska se, och sedan en flagga från CRM:et. Säg till så
bygger jag dem.
