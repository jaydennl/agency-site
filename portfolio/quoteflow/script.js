// ===== Helpers =====
const euro = (n) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);

const STORAGE_KEY = "quoteflow_quotes_v1";
const SESSION_KEY = "quoteflow_loggedin_v1";

function loadQuotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveQuotes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function setSession(on) {
  localStorage.setItem(SESSION_KEY, on ? "1" : "0");
}
function hasSession() {
  return localStorage.getItem(SESSION_KEY) === "1";
}

// ===== Mobile menu =====
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

// ===== Login =====
const loginView = document.getElementById("loginView");
const appView = document.getElementById("app");

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

function showApp() {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  renderAll();
}
function showLogin() {
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

if (hasSession()) showApp();

if (loginForm && loginMsg) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (loginEmail.value || "").trim().toLowerCase();
    const pass = (loginPass.value || "").trim();

    if (email === "demo@quoteflow.nl" && pass === "demo123") {
      setSession(true);
      loginMsg.textContent = "✅ Ingelogd!";
      showApp();
      loginForm.reset();
    } else {
      loginMsg.textContent = "❌ Verkeerde login. Gebruik demo@quoteflow.nl / demo123";
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    setSession(false);
    showLogin();
  });
}

// ===== Quote form elements =====
const quoteForm = document.getElementById("quoteForm");
const itemsEl = document.getElementById("items");
const addItemBtn = document.getElementById("addItemBtn");

const clientName = document.getElementById("clientName");
const clientEmail = document.getElementById("clientEmail");
const statusEl = document.getElementById("status");
const vatEl = document.getElementById("vat");

const subTotalEl = document.getElementById("subTotal");
const vatTotalEl = document.getElementById("vatTotal");
const grandTotalEl = document.getElementById("grandTotal");

const saveMsg = document.getElementById("saveMsg");

// KPI elements
const kpiCount = document.getElementById("kpiCount");
const kpiTotal = document.getElementById("kpiTotal");
const kpiOpen = document.getElementById("kpiOpen");
const kpiPaid = document.getElementById("kpiPaid");

// List & details
const quoteListEl = document.getElementById("quoteList");
const detailBox = document.getElementById("detailBox");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

// ===== Items handling =====
function itemRowTemplate(id) {
  return `
    <div class="itemRow" data-id="${id}">
      <label>
        <span>Omschrijving</span>
        <input class="it_desc" type="text" placeholder="Bijv. Website (5 pagina's)" required>
      </label>
      <label>
        <span>Aantal</span>
        <input class="it_qty" type="number" min="1" value="1" required>
      </label>
      <label>
        <span>Prijs</span>
        <input class="it_price" type="number" min="0" step="0.01" value="250" required>
      </label>
      <button class="iconBtn danger" type="button" title="Verwijder item">✕</button>
    </div>
  `;
}

function addItem(prefill) {
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  itemsEl.insertAdjacentHTML("beforeend", itemRowTemplate(id));

  if (prefill) {
    const row = itemsEl.querySelector(`[data-id="${id}"]`);
    if (row) {
      row.querySelector(".it_desc").value = prefill.desc ?? "";
      row.querySelector(".it_qty").value = prefill.qty ?? 1;
      row.querySelector(".it_price").value = prefill.price ?? 0;
    }
  }
  calcTotals();
}

function removeItem(btn) {
  const row = btn.closest(".itemRow");
  if (row) row.remove();
  calcTotals();
}

function getItems() {
  const rows = [...itemsEl.querySelectorAll(".itemRow")];
  return rows.map(r => {
    const desc = r.querySelector(".it_desc").value.trim();
    const qty = Number(r.querySelector(".it_qty").value || 0);
    const price = Number(r.querySelector(".it_price").value || 0);
    return { desc, qty, price, line: qty * price };
  }).filter(it => it.desc && it.qty > 0);
}

function calcTotals() {
  const items = getItems();
  const sub = items.reduce((a, b) => a + b.line, 0);
  const vatRate = Number(vatEl.value || 0) / 100;
  const vat = sub * vatRate;
  const total = sub + vat;

  subTotalEl.textContent = euro(sub);
  vatTotalEl.textContent = euro(vat);
  grandTotalEl.textContent = euro(total);
  return { sub, vat, total, vatRate, items };
}

if (addItemBtn) {
  addItemBtn.addEventListener("click", () => addItem());
}

if (itemsEl) {
  itemsEl.addEventListener("input", () => calcTotals());
  itemsEl.addEventListener("click", (e) => {
    const del = e.target.closest(".iconBtn.danger");
    if (del) removeItem(del);
  });
}

if (vatEl) vatEl.addEventListener("change", () => calcTotals());

// Start met 2 items (demo)
if (itemsEl && itemsEl.children.length === 0) {
  addItem({ desc: "Website (5 pagina's)", qty: 1, price: 750 });
  addItem({ desc: "SEO basis + snelheid", qty: 1, price: 250 });
}

// ===== Quotes data =====
let quotes = loadQuotes();
let selectedId = null;

function updateKpis() {
  const count = quotes.length;
  const total = quotes.reduce((a, q) => a + q.total, 0);
  const open = quotes.filter(q => q.status === "Open").length;
  const paid = quotes.filter(q => q.status === "Betaald").length;

  kpiCount.textContent = String(count);
  kpiTotal.textContent = euro(total);
  kpiOpen.textContent = String(open);
  kpiPaid.textContent = String(paid);
}

function renderList() {
  if (!quoteListEl) return;
  if (quotes.length === 0) {
    quoteListEl.innerHTML = `<p class="muted">Nog geen offertes. Maak er één 😊</p>`;
    return;
  }

  quoteListEl.innerHTML = quotes
    .slice()
    .reverse()
    .map(q => `
      <div class="listItem" data-id="${q.id}">
        <div class="listTop">
          <div>
            <strong>${q.clientName}</strong><br>
            <span class="muted mini">${q.clientEmail}</span>
          </div>
          <div style="text-align:right">
            <div class="status ${q.status === "Open" ? "open" : "paid"}">${q.status}</div>
            <div class="mini muted">${euro(q.total)}</div>
          </div>
        </div>
        <div class="mini muted" style="margin-top:8px">#${q.nr} • ${new Date(q.createdAt).toLocaleDateString("nl-NL")}</div>
      </div>
    `).join("");
}

function renderDetails(id) {
  const q = quotes.find(x => x.id === id);
  selectedId = id;

  if (!q || !detailBox) return;

  const rows = q.items.map(it => `
    <tr>
      <td>${it.desc}</td>
      <td style="text-align:right">${it.qty}</td>
      <td style="text-align:right">${euro(it.price)}</td>
      <td style="text-align:right">${euro(it.line)}</td>
    </tr>
  `).join("");

  detailBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
      <div>
        <strong style="font-size:18px">Offerte #${q.nr}</strong><br>
        <span class="muted mini">${new Date(q.createdAt).toLocaleString("nl-NL")}</span>
      </div>
      <div class="status ${q.status === "Open" ? "open" : "paid"}">${q.status}</div>
    </div>

    <div style="margin:12px 0 10px">
      <strong>${q.clientName}</strong><br>
      <span class="muted mini">${q.clientEmail}</span>
    </div>

    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid rgba(255,255,255,.12);padding:8px 0">Omschrijving</th>
            <th style="text-align:right;border-bottom:1px solid rgba(255,255,255,.12);padding:8px 0">Aantal</th>
            <th style="text-align:right;border-bottom:1px solid rgba(255,255,255,.12);padding:8px 0">Prijs</th>
            <th style="text-align:right;border-bottom:1px solid rgba(255,255,255,.12);padding:8px 0">Totaal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.12);padding-top:12px">
      <div class="totRow"><span class="muted">Subtotaal</span><strong>${euro(q.sub)}</strong></div>
      <div class="totRow"><span class="muted">BTW (${Math.round(q.vatRate*100)}%)</span><strong>${euro(q.vat)}</strong></div>
      <div class="totRow big"><span>Totaal</span><strong>${euro(q.total)}</strong></div>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
      <button class="btn ghost" type="button" id="deleteBtn">Verwijderen</button>
      <button class="btn ghost" type="button" id="toggleStatusBtn">Status wijzigen</button>
    </div>
  `;

  // bind buttons inside details
  const delBtn = document.getElementById("deleteBtn");
  const toggleBtn = document.getElementById("toggleStatusBtn");

  if (delBtn) {
    delBtn.addEventListener("click", () => {
      quotes = quotes.filter(x => x.id !== q.id);
      saveQuotes(quotes);
      selectedId = null;
      detailBox.innerHTML = `<p class="muted">Selecteer een offerte uit de lijst.</p>`;
      renderAll();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      q.status = q.status === "Open" ? "Betaald" : "Open";
      saveQuotes(quotes);
      renderAll();
      renderDetails(q.id);
    });
  }
}

function renderAll() {
  updateKpis();
  renderList();
  if (selectedId) renderDetails(selectedId);
}

if (quoteListEl) {
  quoteListEl.addEventListener("click", (e) => {
    const item = e.target.closest(".listItem");
    if (!item) return;
    const id = item.getAttribute("data-id");
    renderDetails(id);
  });
}

// ===== Save quote =====
let quoteCounter = 1001;

if (quoteForm && saveMsg) {
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const { sub, vat, total, vatRate, items } = calcTotals();
    if (items.length === 0) {
      saveMsg.textContent = "❌ Voeg minstens 1 item toe.";
      return;
    }

    const q = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      nr: quoteCounter++,
      clientName: clientName.value.trim(),
      clientEmail: clientEmail.value.trim(),
      status: statusEl.value,
      vatRate,
      items,
      sub,
      vat,
      total,
      createdAt: Date.now(),
    };

    quotes.push(q);
    saveQuotes(quotes);
    saveMsg.textContent = "✅ Offerte opgeslagen!";
    renderAll();
    quoteForm.reset();

    // voeg 1 default item terug voor gemak
    itemsEl.innerHTML = "";
    addItem({ desc: "Website (5 pagina's)", qty: 1, price: 750 });
    addItem({ desc: "SEO basis + snelheid", qty: 1, price: 250 });

    // status/vat terugzetten
    statusEl.value = "Open";
    vatEl.value = "21";
  });
}

// ===== Clear all =====
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    quotes = [];
    saveQuotes(quotes);
    selectedId = null;
    if (detailBox) detailBox.innerHTML = `<p class="muted">Selecteer een offerte uit de lijst.</p>`;
    renderAll();
  });
}

// ===== Export =====
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    if (!selectedId) {
      alert("Selecteer eerst een offerte.");
      return;
    }
    alert("✅ Demo: export gestart. (Later kun je PDF export toevoegen.)");
  });
}

// init KPIs/list when app is visible (after login)
if (hasSession()) renderAll();
