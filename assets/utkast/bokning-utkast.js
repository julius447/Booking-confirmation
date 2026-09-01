/* =========================================================================
   FRYST KOPIA för utkasten A och C (riktningsval 2026-09-01). Rörs inte.
   Leveransen är riktning B: assets/bokning.css + assets/bokning.js.
   ========================================================================= */
/* =========================================================================
   BOKNINGSBEKRÄFTELSEN — delad logik för alla tre riktningarna.
   Ingen backend. Allt nedan är gränssnittsbeteende; utskicket kopplas in
   av utvecklaren, se README.
   ========================================================================= */
(function () {
  "use strict";

  var TEL = "010-265 79 79";

  /* ---- omboka / avboka: ömsesidigt uteslutande paneler ------------------ */
  function el(id) { return document.getElementById(id); }

  // Tre vägar: fråga, omboka, avboka. Bara en öppen åt gången — flera öppna
  // paneler ger flera motstridiga uppmaningar under varandra.
  var vagar = ["fraga", "omboka", "avboka"].map(function (n) {
    return { b: el(n + "-btn"), p: el(n + "-panel") };
  }).filter(function (v) { return v.b && v.p; });

  vagar.forEach(function (mig) {
    mig.b.addEventListener("click", function () {
      var oppen = mig.p.classList.toggle("visible");
      mig.b.setAttribute("aria-expanded", oppen ? "true" : "false");
      if (!oppen) return;
      vagar.forEach(function (annan) {
        if (annan === mig) return;
        annan.p.classList.remove("visible");
        annan.b.setAttribute("aria-expanded", "false");
      });
      mig.p.scrollIntoView({ block: "nearest" });
      var forst = mig.p.querySelector("input, select, textarea");
      if (forst) forst.focus({ preventScroll: true });
    });
  });

  var omboka = { p: el("omboka-panel") };
  var avboka = { p: el("avboka-panel") };
  var fraga  = { p: el("fraga-panel") };

  /* ---- anledningen är obligatorisk -------------------------------------
     Ägarkrav: kunden måste förklara varför, både vid omboka och avboka.
     Spärren ska vara ärlig, inte tjatig: den säger vad som saknas och
     flyttar fokus dit. Ingen confirmshaming, ingen skuld.                  */
  function skickaKnapp(panel, kravFalt, klartText) {
    var knapp = panel.querySelector("[data-skicka]");
    var status = panel.querySelector(".bk-status");
    if (!knapp || !status) return;

    knapp.addEventListener("click", function () {
      for (var i = 0; i < kravFalt.length; i++) {
        var f = panel.querySelector(kravFalt[i].sel);
        if (!f || !String(f.value).trim()) {
          status.className = "bk-status is-block";
          status.textContent = kravFalt[i].saknas;
          if (f) {
            // Utan detta lever felet i en fristående role="status" medan fokus
            // står i fältet: en skärmläsare kopplar dem aldrig till varandra.
            f.setAttribute("aria-invalid", "true");
            if (status.id) f.setAttribute("aria-describedby", status.id);
            f.focus();
          }
          return;
        }
      }
      panel.querySelectorAll("[aria-invalid]").forEach(function (n) {
        n.removeAttribute("aria-invalid"); n.removeAttribute("aria-describedby");
      });
      status.className = "bk-status is-ok";
      status.textContent = klartText;
      knapp.disabled = true;
      panel.querySelectorAll("input, select, textarea").forEach(function (f) {
        f.readOnly = true;
        if (f.tagName === "SELECT") f.disabled = true;
      });
      panel.classList.add("is-done");
    });
  }

  if (omboka.p) {
    skickaKnapp(omboka.p, [
      { sel: "[data-nytt-datum]", saknas: "Välj ett datum som skulle passa dig." },
      { sel: "[data-varfor]", saknas: "Skriv kort varför tiden inte passar, så vet vi hur vi ska lösa det." }
    ], "Tack. Vi hör av oss och bekräftar en ny tid. Den nuvarande tiden står kvar tills dess.");
  }
  if (avboka.p) {
    skickaKnapp(avboka.p, [
      { sel: "[data-varfor]", saknas: "Skriv kort varför du avbokar innan du skickar." }
    ], "Avbokat. Vi har tagit emot ditt besked och hör inte av oss om den här tiden igen.");
  }
  if (fraga.p) {
    skickaKnapp(fraga.p, [
      { sel: "[data-varfor]", saknas: "Skriv din fråga i rutan först, så vet vi vad du undrar över." }
    ], "Skickat. Du får svar inom 24 timmar på vardagar. Tiden står kvar oförändrad.");
  }

  /* ---- relativ tid ------------------------------------------------------
     »Imorgon« framför datumet. Sidan öppnas flera gånger — när den kommer,
     dagen innan, på morgonen — och relativ tid är det som gör den levande
     i stället för statisk. Räknas i lokal tid mot dygnsgränser, inte i
     timmar, så »imorgon« betyder imorgon och inte »om 24 timmar«.          */
  (function () {
    var t = document.querySelector("time[data-datum]");
    var ut = document.querySelector("[data-rel]");
    if (!t || !ut) return;
    var d = t.getAttribute("data-datum").split("-").map(Number);
    var mal = new Date(d[0], d[1] - 1, d[2]);
    var idag = new Date(); idag.setHours(0, 0, 0, 0);
    var dagar = Math.round((mal - idag) / 86400000);
    var ord = dagar === 0 ? "Idag" : dagar === 1 ? "Imorgon" : dagar === 2 ? "I övermorgon" : null;
    if (!ord) return;
    ut.textContent = ord + ",";
    ut.hidden = false;
    // Veckodagen gemeniseras när den följer efter ett komma. CRM:et levererar
    // »Torsdag 24 september« som fristående sträng; »Imorgon, Torsdag« är fel.
    var txt = t.textContent;
    if (txt && txt[0] === txt[0].toUpperCase()) {
      t.textContent = txt[0].toLowerCase() + txt.slice(1);
    }
  })();

  /* ---- tillägg är valfria ----------------------------------------------
     »Eventuella tillägg« betyder att listan kan vara tom. En tom tilläggsrad
     med etiketten kvar hade sett ut som ett fel.                            */
  (function () {
    var d = window.AMPY_BOKNING;
    if (!d || !Array.isArray(d["bokning.tillagg"])) return;
    var rad = document.querySelector("[data-oa-tillagg]");
    if (rad && !d["bokning.tillagg"].length) rad.remove();
  })();

  /* ---- lägg till i kalendern -------------------------------------------
     .ics byggs i webbläsaren av det som står på sidan, så att kalendern
     aldrig kan säga en annan tid än sidan gör.                             */
  var calBtn = document.querySelector("[data-kalender]");
  if (calBtn) {
    calBtn.addEventListener("click", function () {
      var d = calBtn.dataset;                       // start/slut i UTC-form
      if (!d.start || !d.slut) return;
      var ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ampy//Bokning//SV",
        "BEGIN:VEVENT",
        "UID:" + (d.uid || "ampy-bokning") + "@ampy.se",
        "DTSTAMP:" + d.start,
        "DTSTART:" + d.start,
        "DTEND:" + d.slut,
        "SUMMARY:" + (d.titel || "Elektriker från Ampy"),
        "DESCRIPTION:" + (d.text || "").replace(/,/g, "\\,"),
        "LOCATION:" + (d.plats || ""),
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ampy-bokning.ics";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    });
  }

  /* ---- kanonisk felsträng, samma som offertsidan ------------------------ */
  window.ampyBokningError = function (node) {
    if (node) node.textContent = "Vi kunde inte skicka just nu. Ring oss på " + TEL + " så tar vi det direkt.";
  };

  /* ---- ?gaps=1 visar författaranteckningarna --------------------------- */
  if (/[?&]gaps=1/.test(location.search)) document.body.classList.add("show-gaps");
})();
