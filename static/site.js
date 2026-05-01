// Mark the current page in the top nav with aria-current="page".
// Walks nav.top a[href] and matches normalized hrefs against the
// current pathname.
(function markActiveNav() {
  function run() {
    var here = location.pathname.replace(/\/+$/, "") || "/";
    document.querySelectorAll("nav.top a[href]").forEach(function (a) {
      var u;
      try { u = new URL(a.getAttribute("href"), location.href); }
      catch (_) { return; }
      var p = u.pathname.replace(/\/+$/, "") || "/";
      if (p === here) { a.setAttribute("aria-current", "page"); }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

// Esc dismisses an open theorem-card popover by blurring the trigger
// (the card hides via CSS :focus-within once focus is released).
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var el = document.activeElement;
  if (el && el.classList && el.classList.contains("problem-id-trigger")) {
    el.blur();
  }
});

// Live filter for the Problems index. Hides any per-problem `<section>`
// whose accumulated text doesn't include the query (case-insensitive).
// Group sections (the two outer wrappers under <main>) stay visible
// even when all of their nested per-problem sections are filtered out,
// but display a "(all hidden)" hint so users aren't left wondering.
(function setupProblemsFilter() {
  function run() {
    var box = document.querySelector(".problems-filter[data-problems-filter]");
    if (!box) return;
    var input = box.querySelector(".problems-filter-input");
    var counter = box.querySelector(".problems-filter-count");
    if (!input) return;
    // Per-problem sections are the leaf <section>s with a nested h3[id].
    var leafSections = Array.prototype.slice.call(
      document.querySelectorAll("main section")
    ).filter(function (s) { return !!s.querySelector(":scope > h3[id]"); });
    // Pre-compute the lower-case haystack for each leaf so input is fast.
    var entries = leafSections.map(function (sec) {
      return { el: sec, text: (sec.innerText || sec.textContent || "").toLowerCase() };
    });
    function update() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      for (var i = 0; i < entries.length; i++) {
        var match = !q || entries[i].text.indexOf(q) !== -1;
        entries[i].el.hidden = !match;
        if (match) shown++;
      }
      if (counter) {
        if (!q) counter.textContent = "";
        else counter.textContent = shown + " of " + entries.length + " match";
      }
      // Update group-section "all hidden" hint.
      document.querySelectorAll("main section").forEach(function (parent) {
        var children = parent.querySelectorAll(":scope > section");
        if (!children.length) return;
        var anyVisible = false;
        children.forEach(function (c) { if (!c.hidden) anyVisible = true; });
        parent.classList.toggle("group-empty", !anyVisible && !!q);
      });
    }
    input.addEventListener("input", update);
    // If the user navigated here with #fragment, focus the matching section.
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
