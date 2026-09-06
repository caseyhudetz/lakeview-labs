/* Lakeview Labs — address handoff and pitch modal. */
(function () {
  "use strict";

  var addressForm = document.getElementById("address-form");
  if (addressForm) {
    addressForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var address = addressForm.elements.address.value.trim();
      if (!address) return;
      /* Jurisdiction does not yet expose a documented query-string contract.
         Preserve the address for the handoff, then open the tool. */
      try { sessionStorage.setItem("lakeviewLabsAddress", address); } catch (e) {}
      window.location.href = "https://jurisdiction.caseymhudetz.workers.dev/";
    });
  }

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

  function canSubmit(){return idea.value.trim().length>0&&EMAIL_RE.test(email.value)}
  function syncSubmit(){submit.disabled=!canSubmit()}
  function openModal(){lastFocused=document.activeElement;modal.hidden=false;document.body.classList.add("is-modal-open");form.hidden=false;done.hidden=true;syncSubmit();idea.focus()}
  function closeModal(){modal.hidden=true;document.body.classList.remove("is-modal-open");if(lastFocused&&lastFocused.focus)lastFocused.focus()}
  document.querySelectorAll("[data-open-pitch]").forEach(function(btn){btn.addEventListener("click",openModal)});
  document.querySelectorAll("[data-close-pitch]").forEach(function(btn){btn.addEventListener("click",closeModal)});
  modal.addEventListener("click",function(event){if(event.target===modal)closeModal()});
  document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!modal.hidden)closeModal()});
  idea.addEventListener("input",syncSubmit);email.addEventListener("input",syncSubmit);
  function showDone(){form.hidden=true;done.hidden=false;form.reset();syncSubmit()}
  function mailtoFallback(){var subject=encodeURIComponent("Pitch for Lakeview Labs");var body=encodeURIComponent(idea.value.trim()+"\n\n— "+email.value.trim());window.location.href="mailto:hello@lakeviewlabs.org?subject="+subject+"&body="+body}
  form.addEventListener("submit",function(event){event.preventDefault();if(!canSubmit())return;error.hidden=true;var endpoint=modal.dataset.endpoint;if(!endpoint){mailtoFallback();showDone();return}submit.disabled=true;submit.textContent="Sending…";fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({idea:idea.value.trim(),email:email.value.trim()})}).then(function(response){if(!response.ok)throw new Error("Request failed");showDone()}).catch(function(){error.textContent="That didn't go through. Email us at hello@lakeviewlabs.org.";error.hidden=false}).finally(function(){submit.textContent="Send it over";syncSubmit()})});
})();
