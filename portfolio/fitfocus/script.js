const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

const form = document.getElementById("leadForm");
const msg = document.getElementById("formMsg");
if (form && msg) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "✅ Demo: aanvraag verstuurd. (Hier kun je later Formspree aan koppelen.)";
    form.reset();
  });
}
