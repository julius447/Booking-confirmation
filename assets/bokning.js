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

  var omboka = { b: el("omboka-btn"), p: el("omboka-panel") };
  var avboka = { b: el("avboka-btn"), p: el("avboka-panel") };

  function stang(x) {
    if (!x.p) return;
    x.p.classList.remove("visible");
    if (x.b) x.b.setAttribute("aria-expanded", "false");
  }

  function koppla(mig, andra) {
    if (!mig.b || !mig.p) return;
    mig.b.addEventListener("click", function () {
      var oppen = mig.p.classList.toggle("visible");
      mig.b.setAttribute("aria-expanded", oppen ? "true" : "false");
      if (oppen) {
        // Två öppna paneler samtidigt ger två motstridiga uppmaningar under
        // varandra. Samma regel som på offertsidan.
        stang(andra);
        mig.p.scrollIntoView({ block: "nearest" });
        var forst = mig.p.querySelector("input, select, textarea");
        if (forst) forst.focus({ preventScroll: true });
      }
    });
  }
  koppla(omboka, avboka);
  koppla(avboka, omboka);

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
          if (f) f.focus();
          return;
        }
      }
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
      { sel: "[data-varfor]", saknas: "Skriv kort varför du avbokar. Det hjälper oss mer än tystnad." }
    ], "Avbokat. Vi har tagit emot ditt besked och hör inte av oss om den här tiden igen.");
  }

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
