# Booking confirmation — developer handover

For Yassine. This is the page a customer receives once a quote has been accepted and a time has
been booked. It is the sibling of the quote page (`Ampy-nordic/offert-mall`) and reuses its design
system, its `shared.css` and its data-injection pattern, so most of what you built for the quote
page carries over.

The deliverable is **one page**: `riktning-b-dagen/index.html` plus `assets/bokning.css` and
`assets/bokning.js`. The two other directions (`riktning-a-kallelsen/`, `riktning-c-kvittensen/`)
are frozen design drafts kept for comparison and are not to be implemented.

Live prototype: https://julius447.github.io/Booking-confirmation/riktning-b-dagen/
Integration test page: https://julius447.github.io/Booking-confirmation/exempel-integration.html

---

## 1. Files

| File | Role | Port? |
|---|---|---|
| `riktning-b-dagen/index.html` | The template. Every per-customer value carries a `data-oa` hook. | Yes |
| `assets/bokning.css` | Everything specific to this page. 218 lines, commented. | Yes |
| `assets/bokning.js` | Injection layer, state model, the three actions, relative date. ES5, no dependencies. | Yes |
| `assets/shared.css` | Verbatim copy of the quote page's stylesheet. This page uses ~19% of it (list in §7). | Already ported for the quote page |
| `assets/tokens.css` | Verbatim production design tokens. Loaded for parity; `shared.css` re-declares the values it needs. | Already ported |
| `assets/fonts/Outfit-latin.woff2` | Self-hosted font (latin subset is enough; latin-ext is never requested). | Already ported |
| `assets/ampy-logo-dark.png` | Header logo. | Already ported |
| `exempel-integration.html` | Test page: renders the template with a sample `AMPY_BOKNING`, switches states, feeds hostile strings. | No, dev only |

Load order in `<head>`: `tokens.css` → `shared.css` → `bokning.css`. Script at the end of `<body>`,
after the data object (§3).

---

## 2. Anatomy

```
header  .of-top             logo, booking ref, quote ref
main    .bk-flow
  card 1  .bk-hero          label ("Vi kommer") · date as <h1> · optional status line
                            facts: arrival time · address
  card 2                    electrician (photo, name, role) · "Det här gör vi hemma hos dig"
                            work items (h3 + optional p) · collapsible material list
  card 3                    receipt: base amount · add-on rows · total · collapsible terms
  card 4                    three actions: ask a question · propose a new time · cancel
footer  .of-foot            company, org. no., phone
```

The page deliberately has **no summary panel and no price anchor**: the customer has already
decided. The anchors are the time and the electrician. Nothing on the page is a sales device.

---

## 3. Data contract — `window.AMPY_BOKNING`

Place an inline script **immediately before** `bokning.js`:

```html
<script>window.AMPY_BOKNING = {…};</script>
<script src="assets/bokning.js"></script>
```

Serialise with `JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")`
so that free text can never terminate the script element. The page itself never interprets HTML:
every value is written with `textContent` or `createElement`. The test page feeds
`<script>`, `<img onerror>` and `javascript:` payloads and they render as literal text.

If `window.AMPY_BOKNING` is absent the page renders its example values (prototype mode). If it is
present, every hook is filled from it; a **missing required key leaves the example value in place
and logs `console.warn("[bokning] AMPY_BOKNING saknar …")`**. Treat any such warning as a data bug.

| Key | Type | Example | Notes |
|---|---|---|---|
| `bokning.status` | string | `"bekraftad"` | One of §4. Unknown values fall back to `bekraftad`. |
| `bokning.referens` | string | `"#B-2026-0431"` | Header pill. Sent with every action. |
| `offert.referens` | string | `"#2026-0187"` | Header. Sent with every action. |
| `bokning.dag_lang` | string | `"Torsdag 24 september"` | Visible date, capitalised. The script lower-cases the weekday when it prefixes "Imorgon,". |
| `bokning.datum_iso` | `YYYY-MM-DD` | `"2026-09-24"` | **Must agree with `dag_lang`.** Written to `<time datetime>`; "Idag / Imorgon / I övermorgon" is computed from it in the customer's local time. Missing → relative time is switched off. |
| `bokning.tid` | string | `"08:00"` | One arrival time, not a window (owner decision). |
| `bokning.adress_rad1` | string | `"Exempelgatan 12"` | Street line. |
| `bokning.adress_rad2` | string | `"123 45 Exempelstad"` | Postcode and town. |
| `elektriker.namn` | string | | The assigned electrician. |
| `elektriker.profilbild_url` | string | `"https://…/foto.jpg"` | **https only**; anything else keeps the silhouette. Rendered 64×64, `object-fit: cover`. |
| `bokning.arbetsbeskrivning` | array | `[{ "rubrik": "…", "beskrivning": "…" }, "plain string"]` | `beskrivning` optional. Rendered as `<li><h3>…</h3><p>…</p></li>`. Empty → the whole work block and its heading are removed (and a warning). |
| `bokning.material` | `string[]` | | Empty → the "Material som ingår" expander is removed. |
| `bokning.grundbelopp_text` | string | `"11 900 kr"` | **Pre-formatted** by the CRM: NBSP as thousands separator, "kr". The page does no arithmetic. |
| `bokning.tillagg` | array | `[{ "namn": "…", "belopp_text": "+ 850 kr" }]` | One receipt row per item. `[]` or missing → no add-on rows. The example row in the markup is a template and is always removed when data is present. |
| `bokning.total_text` | string | `"12 750 kr"` | Pre-formatted. Must equal base + add-ons; the page does not check. |
| `bokning.total_not` | string | `"inkl. moms, efter ROT-avdrag"` | The qualifier under the total. Send `"inkl. moms"` for a booking without ROT. |
| `bokare.villkorstext` | string | | Booker's job-specific terms. Empty → the paragraph is removed (`data-oa-valfri`); the link to the general terms stays. |
| `bokning.token` | string | | Unguessable per-booking secret. Sent in every action payload; the server must reject actions without a valid one. References look sequential, so without this anyone could cancel a booking. |
| `bokning.endpoint` | URL | `"/api/bokning/handling"` | Where the three actions POST (§5). Missing → prototype mode: local receipt only, payload logged to the console. |

Hook types in the markup: `data-oa="key"` (text), `data-oa-valfri` (remove when empty),
`data-oa-list="key"` (rebuild list), `data-oa-photo="key"` (swap silhouette for `<img>`),
`data-oa-tillagg` (row template with `data-t="namn"` / `data-t="belopp_text"` inside),
`<time datetime>` (from `bokning.datum_iso`).

---

## 4. States — `bokning.status`

The page never claims more than "received". Confirmation comes from the CRM on the next load.
`applyState()` runs at load and again after a successful action; server and client share one code
path. Variants live in the markup as `data-state-show="a b"` / `data-state-hide="a b"`.

| Status | Label over the date | Arrival fact | Status line under the date | Actions available | `<title>` |
|---|---|---|---|---|---|
| `bekraftad` (default) | Vi kommer | shown | none | all three | Din bokning är klar · Ampy |
| `ombokning_begard` | Vi kommer | shown | "Du har föreslagit en ny tid. Den här tiden gäller tills vi har bekräftat något annat." | question, cancel | Din bokning är klar · Ampy |
| `avbokning_begard` | Avbokning mottagen | hidden | "Vi har tagit emot din avbokning." | question | Avbokning mottagen · Ampy |
| `avbokad` | Avbokad | hidden | "Tiden är avbokad. Vill du boka en ny tid, ring oss på 010-265 79 79." | question | Bokningen är avbokad · Ampy |

In `avbokning_begard` and `avbokad` the intro of card 4 also switches to "Ändrade du dig? Ring
oss …". A locked action is a disabled button (`.of-btn-secondary:disabled`); a panel that was
completed in the same session stays open with its receipt text. If a customer cancels after having
proposed a new time, that panel's receipt is rewritten to "Förslaget gäller inte längre eftersom du
avbokade efteråt."

`window.ampyBokningState()` returns `{ status, referens, skickat: [...] }` for tests.

---

## 5. Actions — what the server must provide

All three buttons validate locally (reason is mandatory; the proposed date must be today or later,
computed in local time), then `POST` JSON to `bokning.endpoint`. A 2xx response means "received";
anything else, or a network error, re-enables the button and shows "Vi kunde inte skicka just nu.
Ring oss på 010-265 79 79 så tar vi det direkt." No retries.

Common fields on every payload: `typ`, `bokning` (reference), `offert` (reference), `token`.

| `typ` | Extra fields | Server side |
|---|---|---|
| `fraga` | `text` | Create a chat thread on the booking; notify Slack. Status unchanged. |
| `omboka` | `nytt_datum` (`YYYY-MM-DD`), `fonster` (`fm` / `em` / `nar`), `anledning` | Set `bokning.status = ombokning_begard`; notify Slack. The booked time stays until someone confirms a new one. |
| `avboka` | `anledning` | Set `bokning.status = avbokning_begard`; notify Slack. Cancel any scheduled reminders for the slot. |

Never call Slack from the browser; a webhook URL in the page is a public secret. The page talks to
one endpoint and the CRM fans out.

Double submit: the button is disabled while the request is in flight and stays disabled on success.

---

## 6. Behaviour worth knowing

- **Relative date.** "Idag," / "Imorgon," / "I övermorgon," is prefixed to the date when the
  booking is 0–2 days away, computed against local midnight (so "imorgon" means tomorrow, not "in
  24 hours"). Only in `bekraftad` and `ombokning_begard`.
- **Panels.** One open at a time; opening one closes the others unless they are completed. Focus
  moves into the first field on open, and to the status line after sending. Errors set
  `aria-invalid` + `aria-describedby` on the offending field and focus it.
- **Print.** `shared.css` hides the buttons; `bokning.css` hides the panels; `bokning.js` opens
  the two `<details>` on `beforeprint` so the material list and the terms print.
- **Reduced motion** is honoured by `shared.css` (all animations and transitions off).
- **No calendar file.** The "Lägg till i kalendern" button was removed by the owner; there is no
  `.ics` code in the shipped script.

---

## 7. CSS

`bokning.css` is self-contained apart from what it inherits from `shared.css`. Spacing sits on
the scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Two breakpoints: `480px` (phone) and `680px` (the
three action buttons go on one row). Three rules carry the rhythm: siblings in a card are 16 apart,
a heading is 24 from its content, a divider line has 24 on both sides.

From `shared.css` the page uses only: `@font-face`; the `:root` tokens; the base reset, `body`,
`a`, `:focus-visible`, forced-colours, `.nb`, `.sr-only`; `.of-top`, `.of-top__logo`,
`.of-top__meta`, `.of-pill`, `.of-top__valid` and their two media blocks; `.of-h2`; `.of-work`,
`.w-check`, `.of-work h3/p`; `.of-material`, its `summary`, `.m-arrow`, `ul`, `li::before`;
`@keyframes of-fade`; `.of-legal`, `.l-body`, `.l-unique`, `.of-terms-link`; `.of-btn-secondary`;
`.of-btn-send` and its `:disabled`; `.of-foot`; the reduced-motion block; and from the print block
the lines naming `.of-btn-secondary`, `details::details-content`, `.of-legal .l-body`,
`.of-material ul`. Everything else in `shared.css` is quote-page only.

Verified at 320 / 360 / 375 / 390 / 414 / 480 / 481 / 540 / 600 / 679 / 680 / 768 / 834 / 1024 /
1280 / 1440 / 1920 with each panel open and closed: no horizontal overflow, no element outside the
viewport, every interactive element ≥ 44 px, header and cards share one content edge. Form controls
are 48 px tall with 16 px text (below 16 px iOS Safari zooms on focus).

Long CRM strings: the work and material columns are `minmax(0, 1fr)` with `overflow-wrap: anywhere;
hyphens: auto` (`lang="sv"` is set), so a 250 px compound word at 320 px wraps instead of pushing
the grid past the card.

---

## 8. Accessibility

One `h1` (the date), `h2` per card, `h3` per work item and panel. Sections are labelled by their
headings; the electrician block is a named group. All fields have `<label for>`, `name`, `required`
and `aria-required`; the status lines are `role="status"`. Decorative SVGs are `aria-hidden`. The
new-tab terms link says so for screen readers. Colour contrast was computed on the composited
surfaces: the tightest pair on the page is the footer at 4.83:1; everything else is ≥ 5.2:1.

---

## 9. Testing

Open `exempel-integration.html` over http(s) (not `file://`). It fetches the template, injects a
sample `AMPY_BOKNING`, and renders it in an iframe. Use it to: switch between the four states,
remove add-ons / material / terms text, set the date to tomorrow, view at 390 px, and edit the JSON
by hand. The console shows warnings for missing keys and the payload of every action.

---

## 10. Open items (owner gates, not blockers for the build)

- **Org. number `559254-9819`** in the footer is unconfirmed; carry it as-is and confirm with the owner.
- **Late cancellation cost.** The page states nothing about it. If a fee exists it belongs in
  `bokare.villkorstext` or in the general terms, never invented here.
- **"Vi svarar inom 24 timmar på vardagar"** (question receipt) is carried over from the quote page.
  Confirm the promise holds.
- **"Behörig elektriker som ansvarar för din installation"** is static; fine as long as every
  assigned person is behörig. Otherwise make it a hook.
- **Phone number** appears in the footer, the cancelled-state copy and the error string. One source
  in the CRM template if it can ever change.
- **Favicon.** The prototype suppresses the request with `href="data:,"`; production should use the
  domain's icon.
- **`shared.css` defect (quote page).** Lines 640–650 are prose outside a comment; the parser
  discards them together with the following rule `.of-svc__ingar .ig-note {…}`, so that note has never
  been styled on the quote page. This page does not use the rule. Fix in the quote-page repo after
  the owner has seen what changes.

---

## 11. Not in scope

The `.ics` calendar file, an end time for the visit, and any "visit completed" state. The A and C
directions. Anything that would turn the page into a sales device: no upsell, no urgency.
