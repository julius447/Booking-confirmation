# Bokningsbekräftelsen

Sidan kunden får när offerten är accepterad och tiden är bokad. Syskon till
[offertmallen](https://github.com/Ampy-nordic/offert-mall): samma tokens, samma `shared.css`,
samma datakontrakt.

**Leverans: riktning B.** Utvecklardokumentationen på engelska finns i [HANDOVER.md](HANDOVER.md).

| | Öppna |
|---|---|
| **Den valda sidan** | https://julius447.github.io/Booking-confirmation/riktning-b-dagen/ |
| Integrationstest (byt tillstånd, mata in data) | https://julius447.github.io/Booking-confirmation/exempel-integration.html |
| Jämförelsesidan med de frysta utkasten A och C | https://julius447.github.io/Booking-confirmation/ |
| Analysen bakom riktningarna | [UX-ANALYS.md](UX-ANALYS.md) |

## Den bärande insikten

Offerten och bokningsbekräftelsen ser ut att vara syskon men gör motsatt jobb. Offerten möter en
kund som ska **bestämma sig**; bokningsbekräftelsen möter en kund som **redan har gjort det**.
Därför finns ingen summeringspanel och inget prisankare: det som tar deras plats är **tid och
elektriker**. Priset står med som kvittens, aldrig som betalkrav. Ingen merförsäljning.

```
Offert:   pris → arbete → trygghet → beslut
Bokning:  när + vem → vad → pris (som kvittens) → höra av sig
```

## Vad sidan gör

- **Fyller sig själv ur CRM:et** via `window.AMPY_BOKNING` och `data-oa`-hookar. Utan objektet
  visas exempelvärdena. Fritext tolkas aldrig som HTML.
- **Fyra tillstånd** (`bekraftad`, `ombokning_begard`, `avbokning_begard`, `avbokad`) styr
  etiketten över datumet, ankomstfaktan, statusraden, vilka knappar som är öppna och sidtiteln.
  Sidan påstår aldrig mer än »mottaget«; bekräftelsen kommer från CRM:et.
- **Tre vägar att höra av sig:** ställ en fråga, föreslå en ny tid, avboka. Anledningen är
  obligatorisk vid ny tid och avbokning (ägarkrav), datumet får inte ligga bakåt i tiden, en
  avbokning låser ombokningen. Skickas som JSON till `bokning.endpoint`; utan endpoint bara lokal
  kvittens.
- **»Imorgon,« framför datumet** när besöket är 0–2 dagar bort, räknat i kundens lokala tid.

## Filer

```
riktning-b-dagen/index.html    den valda sidan (leveransen)
assets/bokning.css             allt som är specifikt för sidan
assets/bokning.js              injektion, tillstånd, de tre vägarna, relativ tid
assets/shared.css              verbatim från offertmallen, rörs inte här
assets/tokens.css              verbatim produktionstokens, rörs inte
exempel-integration.html       testsidan för utvecklaren (kräver http, inte file://)
HANDOVER.md                    utvecklardokumentationen (engelska)
UX-ANALYS.md                   analysen bakom de tre riktningarna
index.html                     jämförelsesidan
riktning-a-kallelsen/          fryst utkast
riktning-c-kvittensen/         fryst utkast
assets/utkast/                 frysta kopior av css/js som utkasten A och C använder
```

Kör lokalt: `python3 -m http.server 8000` och öppna `http://localhost:8000/`.

## Status

Granskad inför utveckling 2026-09-02: HTML/tillgänglighet, CSS/responsivitet och JS/datakontrakt
av tre oberoende granskare, därefter mätt på 17 bredder 320–1920 med panelerna stängda och öppna
(noll överflöd, alla tapytor ≥ 44 px) och provkörd med fientlig testdata i alla fyra tillstånden.
Öppna ägarfrågor står i HANDOVER.md §10.

Två luckor är markerade i stället för ifyllda, och ska så förbli tills ägaren svarar:
**hur länge strömmen är av** under arbetet, och **vad en sen avbokning kostar**.
