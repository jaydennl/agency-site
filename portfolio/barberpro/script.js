const slotsEl = document.getElementById("slots");
const yearEl = document.getElementById("year");
const demoBtn = document.getElementById("demoSubmit");
const msgEl = document.getElementById("msg");

if (yearEl) yearEl.textContent = new Date().getFullYear();

const slots = ["10:30", "11:15", "12:00", "14:10", "15:40", "17:20"];

if (slotsEl) {
  slotsEl.innerHTML = slots.map(t => `
    <button class="slot" type="button" data-time="${t}">
      <span>${t}</span>
      <span class="pill">Beschikbaar</span>
    </button>
  `).join("");

  slotsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".slot");
    if (!btn) return;
    const t = btn.getAttribute("data-time");
    document.querySelectorAll(".slot .pill").forEach(p => p.textContent = "Beschikbaar");
    btn.querySelector(".pill").textContent = "Gekozen";
    if (msgEl) msgEl.textContent = `Gekozen tijd: ${t} (demo)`;
  });
}

if (demoBtn) {
  demoBtn.addEventListener("click", () => {
    if (msgEl) msgEl.textContent = "✅ Demo: aanvraag verstuurd (hier kun je later Formspree aan hangen).";
  });
}
