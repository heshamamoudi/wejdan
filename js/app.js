import { setLanguage, toggleLanguage, getLang, t } from "./i18n.js";
import { initAnimation, restartAnimation } from "./animation.js";
import {
  subscribeToGuests,
  addGuest,
  removeGuest,
  updateGuestField,
  addChildToGuest,
  removeChildFromGuest,
  importGuests,
} from "./firestore.js";
import { exportToExcel, parseExcelFile } from "./excel.js";

// State
let currentTab = "groom_guests";
let groomGuests = [];
let brideGuests = [];
let searchQuery = "";
let unsubGroom = null;
let unsubBride = null;

// DOM Elements
const langBtn = document.getElementById("lang-toggle");
const groomTabBtn = document.getElementById("groom-tab");
const brideTabBtn = document.getElementById("bride-tab");
const searchInput = document.getElementById("search-input");
const addGuestBtn = document.getElementById("add-guest-btn");
const importBtn = document.getElementById("import-btn");
const exportBtn = document.getElementById("export-btn");
const fileInput = document.getElementById("file-input");
const guestTableBody = document.getElementById("guest-table-body");
const modalOverlay = document.getElementById("modal-overlay");
const confirmOverlay = document.getElementById("confirm-overlay");
const toastContainer = document.getElementById("toast-container");

// Wedding date
const WEDDING_DATE = new Date("2026-04-16T00:00:00");

// ===== INIT =====
function init() {
  // Restore language from localStorage
  const savedLang = localStorage.getItem("wedding-lang") || "ar";
  setLanguage(savedLang);

  initAnimation(document.getElementById("monogram-canvas"));
  startCountdown();
  setupEventListeners();
  subscribeToData();
  renderAll();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  langBtn.addEventListener("click", () => {
    const newLang = toggleLanguage();
    localStorage.setItem("wedding-lang", newLang);
    restartAnimation();
    renderAll();
  });

  groomTabBtn.addEventListener("click", () => switchTab("groom_guests"));
  brideTabBtn.addEventListener("click", () => switchTab("bride_guests"));

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderGuestTable();
  });

  addGuestBtn.addEventListener("click", () => openAddModal());
  importBtn.addEventListener("click", () => fileInput.click());
  exportBtn.addEventListener("click", handleExport);

  fileInput.addEventListener("change", handleImport);

  // Close modal on overlay click
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  confirmOverlay.addEventListener("click", (e) => {
    if (e.target === confirmOverlay) closeConfirm();
  });
}

// ===== FIRESTORE SUBSCRIPTIONS =====
function subscribeToData() {
  unsubGroom = subscribeToGuests("groom_guests", (guests) => {
    groomGuests = guests;
    if (currentTab === "groom_guests") {
      renderSummary();
      renderGuestTable();
    }
  });

  unsubBride = subscribeToGuests("bride_guests", (guests) => {
    brideGuests = guests;
    if (currentTab === "bride_guests") {
      renderSummary();
      renderGuestTable();
    }
  });
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  currentTab = tab;
  groomTabBtn.classList.toggle("active", tab === "groom_guests");
  brideTabBtn.classList.toggle("active", tab === "bride_guests");
  renderSummary();
  renderGuestTable();
}

// ===== COUNTDOWN =====
function startCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  const container = document.getElementById("countdown");

  if (diff <= 0) {
    container.innerHTML = `<div class="wedding-day-msg">${t("weddingDay")}</div>`;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  container.innerHTML = `
    <div class="countdown-item">
      <span class="countdown-number">${days}</span>
      <span class="countdown-label">${t("days")}</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${hours}</span>
      <span class="countdown-label">${t("hours")}</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${minutes}</span>
      <span class="countdown-label">${t("minutes")}</span>
    </div>
    <div class="countdown-item">
      <span class="countdown-number">${seconds}</span>
      <span class="countdown-label">${t("seconds")}</span>
    </div>
  `;
}

// ===== RENDER ALL =====
function renderAll() {
  // Update all translatable text
  langBtn.textContent = getLang() === "ar" ? "EN" : "AR";
  groomTabBtn.textContent = t("groomTab");
  brideTabBtn.textContent = t("brideTab");
  searchInput.placeholder = t("search");
  addGuestBtn.innerHTML = `<span>+</span> ${t("addGuest")}`;
  importBtn.textContent = t("importExcel");
  exportBtn.textContent = t("exportExcel");

  // Update table headers
  renderTableHeaders();
  renderSummary();
  renderGuestTable();
  updateCountdown();
}

// ===== SUMMARY CARDS =====
function renderSummary() {
  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;
  const total = guests.length;
  const accepted = guests.filter((g) => g.confirmed).length;
  const notAccepted = total - accepted;
  const totalChildren = guests.reduce(
    (sum, g) => sum + (g.children?.length || 0),
    0
  );

  document.getElementById("summary-cards").innerHTML = `
    <div class="summary-card">
      <div class="summary-value">${total}</div>
      <div class="summary-label">${t("totalGuests")}</div>
    </div>
    <div class="summary-card green">
      <div class="summary-value">${accepted}</div>
      <div class="summary-label">${t("confirmed")}</div>
    </div>
    <div class="summary-card red">
      <div class="summary-value">${notAccepted}</div>
      <div class="summary-label">${t("notConfirmed")}</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${totalChildren}</div>
      <div class="summary-label">${t("totalChildren")}</div>
    </div>
  `;
}

// ===== TABLE HEADERS =====
function renderTableHeaders() {
  document.getElementById("guest-table-head").innerHTML = `
    <tr>
      <th></th>
      <th>${t("name")}</th>
      <th>${t("phone")}</th>
      <th>${t("childrenCount")}</th>
      <th>${t("communicated")}</th>
      <th>${t("confirmed")}</th>
      <th>${t("notes")}</th>
      <th></th>
    </tr>
  `;
}

// ===== GUEST TABLE =====
function renderGuestTable() {
  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;

  const filtered = searchQuery
    ? guests.filter(
        (g) =>
          g.name?.toLowerCase().includes(searchQuery) ||
          g.phone?.includes(searchQuery) ||
          g.notes?.toLowerCase().includes(searchQuery) ||
          g.children?.some((c) => c.name?.toLowerCase().includes(searchQuery))
      )
    : guests;

  if (filtered.length === 0) {
    guestTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>${t("noGuests")}</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  guestTableBody.innerHTML = filtered
    .map(
      (guest) => `
    <tr>
      <td data-label="">
        <button class="expand-btn" onclick="window.app.toggleChildren('${guest.id}')">
          <span id="expand-icon-${guest.id}">▶</span>
        </button>
      </td>
      <td data-label="${t("name")}">
        <strong>${escapeHtml(guest.name)}</strong>
      </td>
      <td data-label="${t("phone")}">${escapeHtml(guest.phone || "—")}</td>
      <td data-label="${t("childrenCount")}">
        <span class="badge badge-blue">${guest.children?.length || 0}</span>
      </td>
      <td data-label="${t("communicated")}">
        <label class="toggle">
          <input type="checkbox" ${guest.communicated ? "checked" : ""}
            onchange="window.app.toggleField('${guest.id}', 'communicated', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td data-label="${t("confirmed")}">
        <label class="toggle">
          <input type="checkbox" ${guest.confirmed ? "checked" : ""}
            onchange="window.app.toggleField('${guest.id}', 'confirmed', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td data-label="${t("notes")}">
        <span class="notes-text">${escapeHtml(guest.notes || "—")}</span>
      </td>
      <td data-label="" class="actions-cell">
        <button class="btn btn-outline btn-sm" onclick="window.app.openEditModal('${guest.id}')">
          ${t("edit")}
        </button>
        <button class="btn btn-danger btn-sm" onclick="window.app.confirmDelete('${guest.id}')">
          ${t("deleteGuest")}
        </button>
      </td>
    </tr>
    <tr class="children-row" id="children-row-${guest.id}">
      <td colspan="8">
        <div class="children-container">
          ${(guest.children || [])
            .map(
              (child, idx) => `
            <span class="child-chip">
              ${escapeHtml(child.name)}
              <button class="remove-child" onclick="window.app.removeChild('${guest.id}', ${idx})">&times;</button>
            </span>
          `
            )
            .join("")}
          <div class="add-child-inline">
            <input type="text" id="new-child-${guest.id}" placeholder="${t("childName")}"
              onkeydown="if(event.key==='Enter') window.app.addChild('${guest.id}')">
            <button class="btn btn-gold btn-sm" onclick="window.app.addChild('${guest.id}')">+</button>
          </div>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

// ===== TOGGLE CHILDREN ROW =====
function toggleChildren(guestId) {
  const row = document.getElementById(`children-row-${guestId}`);
  const icon = document.getElementById(`expand-icon-${guestId}`);
  if (row) {
    row.classList.toggle("open");
    icon.textContent = row.classList.contains("open") ? "▼" : "▶";
  }
}

// ===== TOGGLE FIELD =====
async function toggleField(guestId, field, value) {
  try {
    await updateGuestField(currentTab, guestId, { [field]: value });
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===== ADD CHILD =====
async function handleAddChild(guestId) {
  const input = document.getElementById(`new-child-${guestId}`);
  const name = input?.value.trim();
  if (!name) return;

  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;
  const guest = guests.find((g) => g.id === guestId);
  if (!guest) return;

  try {
    await addChildToGuest(currentTab, guestId, guest.children || [], name);
    input.value = "";
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===== REMOVE CHILD =====
async function handleRemoveChild(guestId, childIndex) {
  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;
  const guest = guests.find((g) => g.id === guestId);
  if (!guest) return;

  try {
    await removeChildFromGuest(currentTab, guestId, guest.children || [], childIndex);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===== MODAL =====
function openAddModal() {
  const modal = document.getElementById("modal-content");
  modal.innerHTML = `
    <h2>${t("addGuest")}</h2>
    <div class="form-group">
      <label>${t("name")} *</label>
      <input type="text" id="modal-name" required>
    </div>
    <div class="form-group">
      <label>${t("phone")}</label>
      <input type="text" id="modal-phone">
    </div>
    <div class="form-group">
      <label>${t("notes")}</label>
      <textarea id="modal-notes"></textarea>
    </div>
    <div class="form-group">
      <label>${t("children")}</label>
      <div class="form-children" id="modal-children"></div>
      <div class="add-child-inline" style="margin-top:8px">
        <input type="text" id="modal-child-input" placeholder="${t("childName")}"
          onkeydown="if(event.key==='Enter'){event.preventDefault();window.app.addModalChild()}">
        <button type="button" class="btn btn-gold btn-sm" onclick="window.app.addModalChild()">+</button>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="window.app.closeModal()">${t("cancel")}</button>
      <button class="btn btn-gold" onclick="window.app.saveNewGuest()">${t("save")}</button>
    </div>
  `;
  modalOverlay.classList.add("active");
  setTimeout(() => document.getElementById("modal-name")?.focus(), 100);
}

function openEditModal(guestId) {
  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;
  const guest = guests.find((g) => g.id === guestId);
  if (!guest) return;

  const modal = document.getElementById("modal-content");
  modal.innerHTML = `
    <h2>${t("edit")}</h2>
    <div class="form-group">
      <label>${t("name")} *</label>
      <input type="text" id="modal-name" value="${escapeAttr(guest.name)}" required>
    </div>
    <div class="form-group">
      <label>${t("phone")}</label>
      <input type="text" id="modal-phone" value="${escapeAttr(guest.phone || "")}">
    </div>
    <div class="form-group">
      <label>${t("notes")}</label>
      <textarea id="modal-notes">${escapeHtml(guest.notes || "")}</textarea>
    </div>
    <div class="form-group">
      <label>${t("children")}</label>
      <div class="form-children" id="modal-children">
        ${(guest.children || [])
          .map(
            (c) => `
          <span class="child-chip">
            ${escapeHtml(c.name)}
            <button class="remove-child" onclick="this.parentElement.remove()">&times;</button>
          </span>
        `
          )
          .join("")}
      </div>
      <div class="add-child-inline" style="margin-top:8px">
        <input type="text" id="modal-child-input" placeholder="${t("childName")}"
          onkeydown="if(event.key==='Enter'){event.preventDefault();window.app.addModalChild()}">
        <button type="button" class="btn btn-gold btn-sm" onclick="window.app.addModalChild()">+</button>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="window.app.closeModal()">${t("cancel")}</button>
      <button class="btn btn-gold" onclick="window.app.saveEditGuest('${guestId}')">${t("save")}</button>
    </div>
  `;
  modalOverlay.classList.add("active");
  setTimeout(() => document.getElementById("modal-name")?.focus(), 100);
}

function addModalChild() {
  const input = document.getElementById("modal-child-input");
  const name = input?.value.trim();
  if (!name) return;

  const container = document.getElementById("modal-children");
  const chip = document.createElement("span");
  chip.className = "child-chip";
  chip.innerHTML = `${escapeHtml(name)} <button class="remove-child" onclick="this.parentElement.remove()">&times;</button>`;
  container.appendChild(chip);
  input.value = "";
  input.focus();
}

async function saveNewGuest() {
  const name = document.getElementById("modal-name")?.value.trim();
  if (!name) {
    showToast(t("requiredField"), "error");
    return;
  }

  const phone = document.getElementById("modal-phone")?.value.trim();
  const notes = document.getElementById("modal-notes")?.value.trim();
  const childChips = document.querySelectorAll("#modal-children .child-chip");
  const children = Array.from(childChips).map((chip) => ({
    name: chip.textContent.replace("×", "").trim(),
  }));

  try {
    await addGuest(currentTab, { name, phone, notes, children });
    closeModal();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function saveEditGuest(guestId) {
  const name = document.getElementById("modal-name")?.value.trim();
  if (!name) {
    showToast(t("requiredField"), "error");
    return;
  }

  const phone = document.getElementById("modal-phone")?.value.trim();
  const notes = document.getElementById("modal-notes")?.value.trim();
  const childChips = document.querySelectorAll("#modal-children .child-chip");
  const children = Array.from(childChips).map((chip) => ({
    name: chip.textContent.replace("×", "").trim(),
  }));

  try {
    await updateGuestField(currentTab, guestId, { name, phone, notes, children });
    closeModal();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

// ===== CONFIRM DELETE =====
let pendingDeleteId = null;

function showConfirmDelete(guestId) {
  pendingDeleteId = guestId;
  document.getElementById("confirm-message").textContent = t("confirmDelete");
  document.getElementById("confirm-yes").textContent = t("yes");
  document.getElementById("confirm-no").textContent = t("cancel");
  confirmOverlay.classList.add("active");
}

document.getElementById("confirm-yes")?.addEventListener("click", async () => {
  if (pendingDeleteId) {
    try {
      await removeGuest(currentTab, pendingDeleteId);
    } catch (err) {
      showToast(err.message, "error");
    }
  }
  closeConfirm();
});

document.getElementById("confirm-no")?.addEventListener("click", closeConfirm);

function closeConfirm() {
  pendingDeleteId = null;
  confirmOverlay.classList.remove("active");
}

// ===== EXCEL IMPORT/EXPORT =====
async function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const guests = await parseExcelFile(file);
    await importGuests(currentTab, guests);
    showToast(t("importSuccess").replace("{count}", guests.length), "success");
  } catch (err) {
    showToast(t("importError"), "error");
  }

  fileInput.value = "";
}

function handleExport() {
  const guests = currentTab === "groom_guests" ? groomGuests : brideGuests;
  const sheetName =
    currentTab === "groom_guests"
      ? getLang() === "ar"
        ? "قائمة_العريس"
        : "Groom_Guests"
      : getLang() === "ar"
        ? "قائمة_العروس"
        : "Bride_Guests";
  exportToExcel(guests, sheetName);
}

// ===== TOAST =====
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== UTILS =====
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ===== EXPOSE TO GLOBAL =====
window.app = {
  toggleChildren,
  toggleField,
  addChild: handleAddChild,
  removeChild: handleRemoveChild,
  openEditModal,
  closeModal,
  addModalChild,
  saveNewGuest,
  saveEditGuest,
  confirmDelete: showConfirmDelete,
};

// ===== START =====
init();
