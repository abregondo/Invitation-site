/* ============================================================
   Fairy First — Invitation interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Personalization: resolve ?to= guest ---------- */
  var guest = null;
  (function resolveGuest() {
    var to = "";
    try {
      to = new URLSearchParams(window.location.search).get("to") || "";
    } catch (e) { to = ""; }
    to = to.trim().toLowerCase();
    if (!to || typeof GUESTS === "undefined" || !GUESTS) return;
    if (GUESTS[to]) { guest = GUESTS[to]; return; }
    for (var key in GUESTS) {
      if (Object.prototype.hasOwnProperty.call(GUESTS, key) &&
          GUESTS[key] && (GUESTS[key].name || "").toLowerCase() === to) {
        guest = GUESTS[key];
        return;
      }
    }
  })();

  function guestLabel() {
    return guest ? guest.title + " " + guest.name : "";
  }

  /* ---------- Landing: personalize envelope letter ---------- */
  var envLetterB = document.querySelector(".env-letter b");
  if (guest && envLetterB) {
    envLetterB.textContent = "Dear " + guestLabel();
  }

  /* ---------- Landing: envelope open → navigate (keep ?to=) ---------- */
  var envelope = document.getElementById("envelope");
  if (envelope) {
    var opened = false;
    envelope.addEventListener("click", function () {
      if (opened) return;
      opened = true;
      envelope.classList.add("open");
      envelope.setAttribute("aria-expanded", "true");
      setTimeout(function () {
        window.location.href = "invite.html" + window.location.search;
      }, 1150);
    });
  }

  /* ---------- Invite page: apply personalization ---------- */
  var greet = document.getElementById("guestGreet");
  var footerLine = document.getElementById("footerLine");
  if (guest) {
    document.title = guestLabel() + " \u2014 Xiannara Amethyst\u2019s Fairy First";

    if (greet) {
      greet.textContent = "Dear " + guestLabel() + " \u2014 you\u2019re specially invited \u2728";
      greet.hidden = false;
    }
    if (footerLine) {
      footerLine.textContent = "See you there, " + guestLabel() + "!";
    }

    var gpItems = document.querySelectorAll(".gp-list li[data-gp-name]");
    var target = guest.name.trim().toLowerCase();
    for (var i = 0; i < gpItems.length; i++) {
      var gpName = (gpItems[i].getAttribute("data-gp-name") || "").trim().toLowerCase();
      if (gpName === target) {
        gpItems[i].classList.add("gp-me");
      }
    }
  }

  /* ---------- Scroll reveal (IntersectionObserver + rect fallback) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var rect = revealEls[i].getBoundingClientRect();
      if (rect.top < vh * 0.92) {
        revealEls[i].classList.add("visible");
        revealEls.splice(i, 1);
      }
    }
    if (!revealEls.length) {
      window.removeEventListener("scroll", onRevealScroll);
      window.removeEventListener("resize", onRevealScroll);
    }
  }

  var revealTick = false;
  function onRevealScroll() {
    if (revealTick) return;
    revealTick = true;
    setTimeout(function () {
      revealTick = false;
      revealInView();
    }, 60);
  }

  if (revealEls.length) {
    window.addEventListener("scroll", onRevealScroll, { passive: true });
    window.addEventListener("resize", onRevealScroll);
    revealInView();

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.slice().forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Music toggle ---------- */
  var musicBtn = document.getElementById("musicBtn");
  var music = document.getElementById("bgMusic");
  if (musicBtn && music) {
    musicBtn.addEventListener("click", function () {
      if (music.paused) {
        var playPromise = music.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            musicBtn.classList.remove("playing");
            musicBtn.setAttribute("aria-pressed", "false");
          });
        }
        musicBtn.classList.add("playing");
        musicBtn.setAttribute("aria-pressed", "true");
        musicBtn.setAttribute("aria-label", "Pause music");
      } else {
        music.pause();
        musicBtn.classList.remove("playing");
        musicBtn.setAttribute("aria-pressed", "false");
        musicBtn.setAttribute("aria-label", "Play music");
      }
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbEmoji = document.getElementById("lightboxEmoji");
  var lbLabel = document.getElementById("lightboxLabel");
  var lbClose = document.getElementById("lightboxClose");
  var items = document.querySelectorAll(".gallery-item");

  function openLightbox(item) {
    if (!lightbox) return;
    var emoji = item.querySelector(".g-emoji");
    var img = item.querySelector("img");
    var inner = lightbox.querySelector(".lightbox-inner");

    if (lbEmoji) lbEmoji.style.display = img ? "none" : "";
    if (lbLabel) {
      lbLabel.textContent = item.getAttribute("data-label") || "Photo";
    }

    if (img && inner) {
      var existing = inner.querySelector("img");
      if (existing) existing.remove();
      var clone = img.cloneNode(true);
      clone.style.position = "absolute";
      clone.style.inset = "0";
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.objectFit = "cover";
      inner.insertBefore(clone, inner.firstChild);
      if (lbLabel) lbLabel.style.position = "relative";
      if (lbLabel) lbLabel.style.zIndex = "2";
    } else if (emoji && lbEmoji) {
      lbEmoji.textContent = emoji.textContent;
    }

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    var inner = lightbox.querySelector(".lightbox-inner");
    var img = inner && inner.querySelector("img");
    if (img) img.remove();
  }

  items.forEach(function (item) {
    item.addEventListener("click", function () { openLightbox(item); });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  if (lbClose) lbClose.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
})();
