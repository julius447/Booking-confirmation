/* =========================================================================
   BOKNINGSBEKRÄFTELSEN — sidlogik. ES5, inga beroenden.

   Fyra delar, i den ordning de körs:
     1. CRM-injektion   window.AMPY_BOKNING fyller sidan via data-oa-hookar.
     2. Tillstånd       bokning.status styr vad sidan påstår (applyState).
     3. Vägarna         fråga / föreslå ny tid / avboka: paneler, spärrar,
                        sändning till bokning.endpoint.
     4. Relativ tid     »Imorgon,« framför datumet.

   Prototypläge: saknas window.AMPY_BOKNING står exempelvärdena i markupen
   kvar och sändknapparna ger bara lokal kvittens. Datakontraktet i sin
   helhet: HANDOVER.md.
   ========================================================================= */
(function () {
  "use strict";

  var TEL = "010-265 79 79";
  var D = (window.AMPY_BOKNING && typeof window.AMPY_BOKNING === "object") ? window.AMPY_BOKNING : null;

  function el(id) { return document.getElementById(id); }
  function alla(sel, rot) { return Array.prototype.slice.call((rot || document).querySelectorAll(sel)); }
  function har(k) { if (!D) return false; var v = D[k]; return v !== undefined && v !== null && v !== ""; }
  function varna(msg) { if (window.console && console.warn) console.warn("[bokning] " + msg); }

  /* ---- vägarna finns före allt annat: applyState() låser dem ---------- */
  var vagar = {};
  ["fraga", "omboka", "avboka"].forEach(function (n) {
    var b = el(n + "-btn"), p = el(n + "-panel");
    if (b && p) vagar[n] = { namn: n, b: b, p: p };
  });

  // Låser en väg: knappen dör, en oavslutad panel stängs. En AVSLUTAD panel
  // står kvar öppen, den bär kundens enda kvittens.
  function las(n) {
    var v = vagar[n]; if (!v) return;
    v.b.disabled = true; v.b.setAttribute("aria-disabled", "true");
    if (!v.p.classList.contains("is-done")) {
      v.p.classList.remove("visible"); v.b.setAttribute("aria-expanded", "false");
    }
  }

  /* =====================================================================
     1. CRM-INJEKTION
        data-oa="nyckel"          -> textContent. Aldrig HTML: fritext ur ett
                                     CRM får inte kunna injicera markup.
        data-oa-valfri            -> noden tas bort om nyckeln är tom.
        data-oa-list="nyckel"     -> listan byggs om ur en array, eller tas
                                     bort om arrayen är tom eller saknas.
        data-oa-photo="nyckel"    -> silhuetten byts mot <img>, bara https.
        data-oa-tillagg           -> mallraden klonas per tillägg.
        time[datetime]            -> bokning.datum_iso, samma källa som texten.
     Saknas en obligatorisk nyckel står exempelvärdet kvar och konsolen
     varnar: hellre en synlig platshållare i test än ett tomt fält hos kund.
     ===================================================================== */
  (function () {
    if (!D) return;

    alla("[data-oa]").forEach(function (n) {
      var k = n.getAttribute("data-oa");
      if (har(k)) n.textContent = String(D[k]);
      else if (n.hasAttribute("data-oa-valfri")) n.remove();
      else varna("AMPY_BOKNING saknar " + k + "; exempelvärdet står kvar.");
    });

    var t = document.querySelector("time[datetime]");
    if (t) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(D["bokning.datum_iso"] || ""))) t.setAttribute("datetime", D["bokning.datum_iso"]);
      else varna("AMPY_BOKNING saknar bokning.datum_iso; relativ tid är avstängd.");
    }

    function tom(ul) { while (ul.firstChild) ul.removeChild(ul.firstChild); }

    // Arbetsbeskrivningen: [{rubrik, beskrivning?}] eller [sträng].
    // <li> byggs av samma delar som mallraden i markupen, bocken klonas.
    var work = document.querySelector('[data-oa-list="bokning.arbetsbeskrivning"]');
    if (work) {
      var punkter = Array.isArray(D["bokning.arbetsbeskrivning"]) ? D["bokning.arbetsbeskrivning"] : [];
      var bock = work.querySelector(".w-check");
      tom(work);
      punkter.forEach(function (p) {
        var x = typeof p === "string" ? { rubrik: p } : (p || {});
        if (!x.rubrik) return;
        var li = document.createElement("li");
        if (bock) li.appendChild(bock.cloneNode(true));
        var div = document.createElement("div");
        var h3 = document.createElement("h3"); h3.textContent = String(x.rubrik); div.appendChild(h3);
        if (x.beskrivning) { var pp = document.createElement("p"); pp.textContent = String(x.beskrivning); div.appendChild(pp); }
        li.appendChild(div); work.appendChild(li);
      });
      if (!work.children.length) {
        varna("bokning.arbetsbeskrivning är tom; arbetsblocket tas bort.");
        var blk = work.closest(".bk-work"), h2 = el("arbetet-h");
        if (blk) blk.remove(); if (h2) h2.remove();
      }
    }

    // Materialet: [sträng]. Tom lista tar bort hela expandern, annars står
    // rubriken »Material som ingår« kvar över ingenting.
    var mat = document.querySelector('[data-oa-list="bokning.material"]');
    if (mat) {
      var rader = (Array.isArray(D["bokning.material"]) ? D["bokning.material"] : []).filter(function (x) { return x; });
      if (!rader.length) { var box = mat.closest("details"); if (box) box.remove(); }
      else {
        tom(mat);
        rader.forEach(function (s) { var li = document.createElement("li"); li.textContent = String(s); mat.appendChild(li); });
      }
    }

    // Porträttet. Bara en https-URL får ersätta silhuetten.
    alla("[data-oa-photo]").forEach(function (ph) {
      var url = D[ph.getAttribute("data-oa-photo")];
      if (typeof url !== "string" || !/^https:\/\/[^\s"'<>]+$/i.test(url)) return;
      var img = document.createElement("img");
      img.src = url; img.alt = ""; img.setAttribute("aria-hidden", "true");
      img.width = 64; img.height = 64; img.decoding = "async";
      ph.replaceWith(img);
    });

    // Tilläggen: [{namn, belopp_text}]. Mallraden bär exempeltext för
    // prototypen och tas ALLTID bort när riktig data finns.
    var mall = document.querySelector("[data-oa-tillagg]");
    if (mall) {
      var lista = Array.isArray(D["bokning.tillagg"]) ? D["bokning.tillagg"] : [];
      lista.filter(function (x) { return x && x.namn; }).forEach(function (x) {
        var rad = mall.cloneNode(true);
        rad.removeAttribute("data-oa-tillagg");
        alla("[data-t]", rad).forEach(function (n) { n.textContent = String(x[n.getAttribute("data-t")] || ""); });
        mall.parentNode.insertBefore(rad, mall);
      });
      mall.remove();
    }
  })();

  /* =====================================================================
     2. TILLSTÅND
        bekraftad          tiden gäller
        ombokning_begard   kunden har föreslagit ny tid; den bokade gäller
        avbokning_begard   kunden har avbokat; CRM:et har inte bekräftat
        avbokad            CRM:et har bekräftat avbokningen
     Markupen bär varianterna: data-state-show="a b" visas i a och b,
     data-state-hide="a b" döljs i a och b. Sidan påstår aldrig mer än
     »mottaget«; bekräftelsen kommer från CRM:et.
     ===================================================================== */
  var STATUS = ["bekraftad", "ombokning_begard", "avbokning_begard", "avbokad"];
  var TITEL = {
    bekraftad: "Din bokning är klar · Ampy",
    ombokning_begard: "Din bokning är klar · Ampy",
    avbokning_begard: "Avbokning mottagen · Ampy",
    avbokad: "Bokningen är avbokad · Ampy"
  };
  var state = "bekraftad";

  function applyState(s) {
    if (STATUS.indexOf(s) < 0) s = "bekraftad";
    state = s;
    document.body.setAttribute("data-status", s);
    alla("[data-state-show]").forEach(function (n) { n.hidden = n.getAttribute("data-state-show").split(/\s+/).indexOf(s) < 0; });
    alla("[data-state-hide]").forEach(function (n) { n.hidden = n.getAttribute("data-state-hide").split(/\s+/).indexOf(s) >= 0; });
    document.title = TITEL[s];
    if (s === "ombokning_begard") las("omboka");
    if (s === "avbokning_begard" || s === "avbokad") { las("omboka"); las("avboka"); }
  }
  applyState(D && D["bokning.status"] ? String(D["bokning.status"]) : "bekraftad");

  /* =====================================================================
     3. VÄGARNA
     ===================================================================== */
  // En öppen åt gången: flera öppna paneler ger flera motstridiga
  // uppmaningar under varandra. Avslutade paneler rörs inte.
  Object.keys(vagar).forEach(function (n) {
    var mig = vagar[n];
    mig.b.addEventListener("click", function () {
      if (mig.p.classList.contains("is-done")) return;
      var oppen = mig.p.classList.toggle("visible");
      mig.b.setAttribute("aria-expanded", oppen ? "true" : "false");
      if (!oppen) return;
      Object.keys(vagar).forEach(function (m) {
        var annan = vagar[m];
        if (annan === mig || annan.p.classList.contains("is-done")) return;
        annan.p.classList.remove("visible"); annan.b.setAttribute("aria-expanded", "false");
      });
      mig.p.scrollIntoView({ block: "nearest" });
      var forst = mig.p.querySelector("input, select, textarea");
      if (forst) forst.focus({ preventScroll: true });
    });
  });

  // Lokal tid, inte toISOString(): den är UTC och ger gårdagen 00:00-02:00.
  function idagISO() {
    var n = new Date(), p = function (x) { return (x < 10 ? "0" : "") + x; };
    return n.getFullYear() + "-" + p(n.getMonth() + 1) + "-" + p(n.getDate());
  }
  var datumFalt = document.querySelector("[data-nytt-datum]");
  if (datumFalt) datumFalt.min = idagISO();

  alla(".bk-status").forEach(function (s) { s.setAttribute("tabindex", "-1"); });

  function ref(k) {
    if (har(k)) return String(D[k]);
    var n = document.querySelector('[data-oa="' + k + '"]');
    return n ? n.textContent.trim() : "";
  }
  function visa(status, klass, text) { status.className = "bk-status " + klass; status.textContent = text; }

  // Sändningen. Med bokning.endpoint: POST JSON, 2xx betyder mottaget.
  // Utan: prototypläge, bara lokal kvittens. Slack och chatt kopplas på
  // serversidan; en webhook-URL i sidan vore en offentlig hemlighet.
  function sand(payload) {
    var url = D && D["bokning.endpoint"];
    if (!url) {
      if (window.console && console.info) console.info("[bokning] prototypläge, ingen bokning.endpoint:", payload);
      return Promise.resolve();
    }
    return fetch(url, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); });
  }

  function markeraKlar(v, status, text) {
    visa(status, "is-ok", text);
    alla("input, select, textarea", v.p).forEach(function (f) { f.readOnly = true; if (f.tagName === "SELECT") f.disabled = true; });
    v.p.classList.add("is-done");
    status.focus({ preventScroll: true });
  }

  /* Anledningen är obligatorisk (ägarkrav) vid både omboka och avboka.
     Spärren är ärlig, inte tjatig: den säger vad som saknas, märker fältet
     och flyttar fokus dit. Ingen confirmshaming. */
  function koppla(v, krav, bygg, klart, nyttStatus) {
    var knapp = v.p.querySelector("[data-skicka]"), status = v.p.querySelector(".bk-status");
    if (!knapp || !status) return;
    knapp.addEventListener("click", function () {
      alla("[aria-invalid]", v.p).forEach(function (n) { n.removeAttribute("aria-invalid"); n.removeAttribute("aria-describedby"); });
      for (var i = 0; i < krav.length; i++) {
        var f = v.p.querySelector(krav[i].sel);
        if (!f) { varna("fältet " + krav[i].sel + " saknas i " + v.namn + "-panelen."); continue; }
        var val = String(f.value).trim();
        var fel = !val ? krav[i].saknas : (krav[i].kontroll ? krav[i].kontroll(val) : null);
        if (fel) {
          visa(status, "is-block", fel);
          f.setAttribute("aria-invalid", "true");
          if (status.id) f.setAttribute("aria-describedby", status.id);
          f.focus();
          return;
        }
      }
      var payload = bygg(v.p);
      payload.typ = v.namn;
      payload.bokning = ref("bokning.referens");
      payload.offert = ref("offert.referens");
      if (D && D["bokning.token"]) payload.token = String(D["bokning.token"]);
      knapp.disabled = true;
      sand(payload).then(function () {
        markeraKlar(v, status, klart);
        if (nyttStatus) applyState(nyttStatus);
        // Ett tidigare skickat förslag om ny tid är överspelat av avbokningen.
        if (v.namn === "avboka" && vagar.omboka && vagar.omboka.p.classList.contains("is-done")) {
          visa(vagar.omboka.p.querySelector(".bk-status"), "is-ok", "Förslaget gäller inte längre eftersom du avbokade efteråt.");
        }
      }).catch(function () {
        knapp.disabled = false;
        status.className = "bk-status is-block";
        window.ampyBokningError(status);
        status.focus({ preventScroll: true });
      });
    });
  }

  function varde(p, sel) { var f = p.querySelector(sel); return f ? String(f.value).trim() : ""; }

  if (vagar.fraga) koppla(vagar.fraga,
    [{ sel: "[data-varfor]", saknas: "Skriv din fråga i rutan först, så vet vi vad du undrar över." }],
    function (p) { return { text: varde(p, "[data-varfor]") }; },
    "Skickat. Vi svarar inom 24 timmar på vardagar. Tiden står kvar oförändrad.",
    null);

  if (vagar.omboka) koppla(vagar.omboka,
    [{ sel: "[data-nytt-datum]", saknas: "Välj ett datum som skulle passa dig.",
       kontroll: function (v) { return v < idagISO() ? "Det datumet har redan varit. Välj ett datum framåt i tiden." : null; } },
     { sel: "[data-varfor]", saknas: "Skriv kort varför tiden inte passar, så vet vi hur vi ska lösa det." }],
    function (p) { return { nytt_datum: varde(p, "[data-nytt-datum]"), fonster: varde(p, "[data-nytt-fonster]"), anledning: varde(p, "[data-varfor]") }; },
    "Tack. Vi hör av oss och bekräftar en ny tid. Den nuvarande tiden gäller tills dess.",
    "ombokning_begard");

  if (vagar.avboka) koppla(vagar.avboka,
    [{ sel: "[data-varfor]", saknas: "Skriv kort varför du avbokar innan du skickar." }],
    function (p) { return { anledning: varde(p, "[data-varfor]") }; },
    "Vi har tagit emot din avbokning. Du behöver inte göra något mer.",
    "avbokning_begard");

  /* =====================================================================
     4. RELATIV TID
        »Imorgon,« framför datumet. Sidan öppnas flera gånger, och relativ
        tid är det som gör den levande i stället för statisk. Räknas i lokal
        tid mot dygnsgränser, så »imorgon« betyder imorgon och inte »om 24
        timmar«. Källan är time[datetime], samma som CRM:et fyller.
     ===================================================================== */
  (function () {
    var t = document.querySelector("time[datetime]"), ut = document.querySelector("[data-rel]");
    if (!t || !ut) return;
    // Med riktig data räknas bara från ett giltigt bokning.datum_iso; ett saknat
    // eller felformaterat värde får aldrig ge »Imorgon« från exempeldatumet.
    if (D && !/^\d{4}-\d{2}-\d{2}$/.test(String(D["bokning.datum_iso"] || ""))) return;
    if (state !== "bekraftad" && state !== "ombokning_begard") return;
    var d = t.getAttribute("datetime").split("-").map(Number);
    if (d.length !== 3 || isNaN(d[0] + d[1] + d[2])) return;
    var mal = new Date(d[0], d[1] - 1, d[2]);
    var idag = new Date(); idag.setHours(0, 0, 0, 0);
    var dagar = Math.round((mal - idag) / 86400000);
    var ord = dagar === 0 ? "Idag" : dagar === 1 ? "Imorgon" : dagar === 2 ? "I övermorgon" : null;
    if (!ord) return;
    ut.textContent = ord + ",";
    ut.hidden = false;
    // Veckodagen gemeniseras efter kommat: »Imorgon, torsdag«, inte »Torsdag«.
    var txt = t.textContent;
    if (txt && txt[0] === txt[0].toUpperCase()) t.textContent = txt[0].toLowerCase() + txt.slice(1);
  })();

  /* ---- utskrift: en stängd <details> målas inte, öppna dem tillfälligt -- */
  var printOpened = [];
  window.addEventListener("beforeprint", function () {
    printOpened = alla("details").filter(function (x) { return !x.open; });
    printOpened.forEach(function (x) { x.open = true; });
  });
  window.addEventListener("afterprint", function () {
    printOpened.forEach(function (x) { x.open = false; });
    printOpened = [];
  });

  /* ---- publikt: felsträng + läsbart tillstånd för tester ---------------- */
  window.ampyBokningError = function (node) {
    if (node) node.textContent = "Vi kunde inte skicka just nu. Ring oss på " + TEL + " så tar vi det direkt.";
  };
  window.ampyBokningState = function () {
    return {
      status: state,
      referens: ref("bokning.referens"),
      skickat: Object.keys(vagar).filter(function (n) { return vagar[n].p.classList.contains("is-done"); })
    };
  };
})();
