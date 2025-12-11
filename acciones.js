// ---------------------------
// ACCIONES / MOVIMIENTOS
// ---------------------------

import { actualizarDashboard } from "./dashboard.js";

// Variable global de fecha seleccionada
let currentSelectedDate = new Date().toISOString().slice(0, 10);

export function getSelectedDate() {
    return currentSelectedDate;
}

// ---------------------------
// SELECCIÓN DE FECHA
// ---------------------------
export function selectDate(date) {
    currentSelectedDate = date;

    // Resaltar día seleccionado en el calendario
    document.querySelectorAll(".day").forEach(d => {
        d.classList.remove("selected");
        if (d.dataset.date === date) d.classList.add("selected");
    });

    // Cambiar a la pestaña de movimientos
    const viewTabBtn = document.querySelector(".tab-btn[data-tab='viewTab']");
    if (viewTabBtn) {
        // Desactivar todas las pestañas
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

        // Activar pestaña de Movimientos
        viewTabBtn.classList.add("active");
        document.getElementById("viewTab").classList.add("active");
    }

    // Cerrar sidebar si está abierto
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("active");

    // Recargar entradas y dashboard
    loadEntries(currentSelectedDate);
    actualizarDashboard();
}


// ---------------------------
// ÍCONOS DE CATEGORÍAS
// ---------------------------
export function getCategoryIcon(category) {
    const c = category.toLowerCase();
    if (c.includes("comida") || c.includes("rest")) return "🍔";
    if (c.includes("transporte") || c.includes("uber") || c.includes("taxi")) return "🚕";
    if (c.includes("ropa") || c.includes("tienda") || c.includes("compras")) return "🛍️";
    if (c.includes("casa") || c.includes("renta") || c.includes("hogar")) return "🏠";
    if (c.includes("salud") || c.includes("doctor") || c.includes("medicina")) return "💊";
    if (c.includes("entretenimiento") || c.includes("cine")) return "🎬";
    if (c.includes("super") || c.includes("mercado")) return "🛒";
    return "📌"; // por defecto
}

// ---------------------------
// ENTRADAS
// ---------------------------
export function loadEntries(date = currentSelectedDate) {
    const entryList = document.getElementById("entryList");
    if (!entryList) return;

    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const filtered = entries.filter(e => e.date === date);

    entryList.innerHTML = "";

    filtered.forEach((e, index) => {
        const icon = getCategoryIcon(e.category);
        entryList.innerHTML += `
            <li class="entry-item">
                <div class="entry-text entry-${e.type}">
                    ${icon} <strong>${e.type.toUpperCase()}</strong>: $${e.amount} — ${e.category} — ${e.payment || ''}
                </div>
                <div class="entry-actions">
                    <button class="editBtn" onclick="editEntry(${index}, '${date}')">✏️</button>
                    <button class="deleteBtn" onclick="deleteEntry(${index}, '${date}')">🗑️</button>
                </div>
            </li>
        `;
    });
}

export function addEntry(entry) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));
}

export function deleteEntry(index, date = currentSelectedDate) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const filtered = entries.filter(e => e.date === date);
    const entryToDelete = filtered[index];

    const updatedEntries = entries.filter(e =>
        !(e.date === entryToDelete.date &&
          e.amount === entryToDelete.amount &&
          e.type === entryToDelete.type &&
          e.category === entryToDelete.category)
    );

    localStorage.setItem("entries", JSON.stringify(updatedEntries));

    // Actualizar vista
    loadEntries(date);
    actualizarDashboard();
}

export function editEntry(index, date = currentSelectedDate) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const filtered = entries.filter(e => e.date === date);
    const entry = filtered[index];

    // Llenar formulario
    const dateInput = document.getElementById("date");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("type");
    const categoryInput = document.getElementById("category");
    const paymentInput = document.getElementById("payment");

    if (dateInput) dateInput.value = entry.date;
    if (amountInput) amountInput.value = entry.amount;
    if (typeInput) typeInput.value = entry.type;
    if (categoryInput) categoryInput.value = entry.category;
    if (paymentInput) paymentInput.value = entry.payment || "Efectivo";

    // Eliminar la entrada original
    const updatedEntries = entries.filter(e =>
        !(e.date === entry.date &&
          e.amount === entry.amount &&
          e.type === entry.type &&
          e.category === entry.category)
    );

    localStorage.setItem("entries", JSON.stringify(updatedEntries));

    // Actualizar vista
    loadEntries(date);
    actualizarDashboard();
}


