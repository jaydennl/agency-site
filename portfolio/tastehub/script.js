const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

const dishes = [
  { name: "Truffle Pasta", price: "€16", desc: "Romig, paddenstoel, parmezaan.", cat: "mains", badge: "Populair" },
  { name: "Smash Burger", price: "€14", desc: "Cheddar, ui, pickles, saus.", cat: "mains", badge: "Chef tip" },
  { name: "Chicken Gyoza", price: "€9", desc: "6 stuks, dip sauce.", cat: "starters", badge: "Starter" },
  { name: "Caesar Salad", price: "€11", desc: "Kip, croutons, parmezaan.", cat: "mains", badge: "Fresh" },
  { name: "Brownie", price: "€7", desc: "Warm, ijs erbij.", cat: "desserts", badge: "Zoet" },
  { name: "Tiramisu", price: "€8", desc: "Klassiek, koffie, cacao.", cat: "desserts", badge: "Klassiek" },
  { name: "Mocktail Citrus", price: "€6", desc: "Fris, citroen, mint.", cat: "drinks", badge: "0.0" },
  { name: "Iced Latte", price: "€5", desc: "Koffie, melk, ijs.", cat: "drinks", badge: "Koffie" },
];

const grid = document.getElementById("menuGrid");
const tabs = document.querySelectorAll(".tab");

function render(cat) {
  if (!grid) return;
  const list = cat === "all" ? dishes : dishes.filter(d => d.cat === cat);
  grid.innerHTML = list.map(d => `
    <article class="item">
      <div class="itemTop">
        <div>
          <h3>${d.name}</h3>
          <p class="desc">${d.desc}</p>
          <span class="badge2">${d.badge}</span>
        </div>
        <div class="price">${d.price}</div>
      </div>
    </article>
  `).join("");
}

tabs.forEach(t => {
  t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("is-active"));
    t.classList.add("is-active");
    render(t.dataset.cat);
  });
});

render("all");

const reserveForm = document.getElementById("reserveForm");
const reserveMsg = document.getElementById("reserveMsg");
if (reserveForm && reserveMsg) {
  reserveForm.addEventListener("submit", (e) => {
    e.preventDefault();
    reserveMsg.textContent = "✅ Demo: reservering ontvangen. (Later kun je dit naar e-mail/Formspree sturen.)";
    reserveForm.reset();
  });
}
