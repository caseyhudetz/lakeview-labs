/* Lakeview Labs — project filtering and the pitch modal.
   Plain ES2018, no build step. The page works without it; this adds the
   filter buttons and the pitch form. */

(function () {
  "use strict";

  /* ---- Filters ----
     The status buttons are off the page for now. Cards still carry
     data-status, so putting the buttons back in index.html is all it takes
     to switch filtering on again. */

  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));
  var empty = document.getElementById("projects-empty");

  function applyFilter(value) {
    var shown = 0;
    projects.forEach(function (card) {
      var match = value === "all" || card.dataset.status === value;
      card.hidden = !match;
      if (match) shown++;
    });
    filters.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === value));
    });
    if (empty) empty.hidden = shown > 0;
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.dataset.filter);
    });
  });

  /* ---- Pitch modal ---- */

  var modal = document.getElementById("pitch-modal");
  if (!modal) return;

  var form = document.getElementById("pitch-form");
  var done = document.getElementById("pitch-done");
  var error = document.getElementById("pitch-error");
  var submit = form.querySelector("button[type=submit]");
  var idea = form.elements.idea;
  var email = form.elements.email;
  var lastFocused = null;

  var EMAIL_RE = /\S+@\S+\.\S+/;

  function canSubmit() {
    return idea.value.trim().length > 0 && EMAIL_RE.test(email.value);
  }

  function syncSubmit() {
    submit.disabled = !canSubmit();
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    form.hidden = false;
    done.hidden = true;
    syncSubmit();
    idea.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll("[data-open-pitch]").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  document.querySelectorAll("[data-close-pitch]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  // Keep tab focus inside the open dialog.
  modal.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    var focusable = modal.querySelectorAll(
      "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])"
    );
    var visible = Array.prototype.filter.call(focusable, function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!visible.length) return;
    var first = visible[0];
    var last = visible[visible.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  idea.addEventListener("input", syncSubmit);
  email.addEventListener("input", syncSubmit);

  function showDone() {
    form.hidden = true;
    done.hidden = false;
    var doneButton = done.querySelector("button");
    if (doneButton) doneButton.focus();
    form.reset();
    syncSubmit();
  }

  function mailtoFallback() {
    var subject = encodeURIComponent("Pitch for Lakeview Labs");
    var body = encodeURIComponent(idea.value.trim() + "\n\n— " + email.value.trim());
    window.location.href =
      "mailto:hello@lakeviewlabs.org?subject=" + subject + "&body=" + body;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!canSubmit()) return;

    error.hidden = true;
    var endpoint = modal.dataset.endpoint;

    if (!endpoint) {
      mailtoFallback();
      showDone();
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ idea: idea.value.trim(), email: email.value.trim() })
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed: " + response.status);
        showDone();
      })
      .catch(function () {
        error.textContent =
          "That didn't go through. Email us at hello@lakeviewlabs.org and we'll pick it up there.";
        error.hidden = false;
      })
      .finally(function () {
        submit.textContent = "Send it over";
        syncSubmit();
      });
  });
})();
