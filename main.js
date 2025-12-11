import { generateCalendar } from "./calendar.js";
import { loadEntries, deleteEntry, editEntry, selectDate } from "./acciones.js";
import { guardarSaldo, calcularPresupuestoDelMes } from "./presupuesto.js";
import { actualizarDashboard } from "./dashboard.js";
import { updateCardUsage, addCard } from "./tarjetas.js";
import { addEntry } from "./movimientos.js";

let selectedDate = new Date().toISOString().slice(0, 10);

// --------------------------
// INDEXEDDB TARJETAS (corregido)
// --------------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('finanzas-db', 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tarjetas')) {
        db.createObjectStore('tarjetas', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Guardar tarjeta
async function guardarTarjeta(tarjeta) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tarjetas', 'readwrite');
    const store = tx.objectStore('tarjetas');
    store.add(tarjeta);
    tx.oncomplete = () => resolve();
    tx.onerror = e => reject(e);
  });
}

// Obtener todas las tarjetas
async function obtenerTarjetas() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tarjetas', 'readonly');
    const store = tx.objectStore('tarjetas');
    const getAll = store.getAll();
    getAll.onsuccess = () => resolve(getAll.result);
    getAll.onerror = e => reject(e);
  });
}


// --------------------------
// DOMContentLoaded
// --------------------------
document.addEventListener("DOMContentLoaded", () => {

  // FORMULARIOS Y ELEMENTOS
  const entryForm = document.getElementById("entryForm");
  const saldoBtn = document.getElementById("saldoTotal") ? document.getElementById("saldoBtn") : null;

  const paymentSelect = document.getElementById("payment");
  const mesesContainer = document.getElementById("mesesContainer");
  const esMeses = document.getElementById("esMeses");
  const detalleMeses = document.getElementById("detalleMeses");
  const mesesInput = document.getElementById("meses");
  const mensualidadInput = document.getElementById("mensualidad");
  const ultimoPago = document.getElementById("ultimoPago");

  const cardForm = document.getElementById('cardForm');

  // --------------------------
  // AGREGAR MOVIMIENTO
  // --------------------------
  entryForm?.addEventListener("submit", e => {
    e.preventDefault();

    const amount = Number(document.getElementById("amount").value);
    const paymentMethod = paymentSelect.value;
    const cardName = paymentMethod === "Tarjeta" ? document.getElementById("cardsList")?.value : null;

    const entry = {
      date: document.getElementById("date").value,
      amount,
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      payment: paymentMethod,
      esMeses: esMeses.value,
      meses: Number(mesesInput.value),
      mensualidad: Number(mensualidadInput.value),
      cardName
    };

    addEntry(entry);

    if (paymentMethod === "Tarjeta" && cardName) {
      updateCardUsage(cardName, amount);
    }

    calcularPresupuestoDelMes();
    generateCalendar(
      selectedDate,
      JSON.parse(localStorage.getItem("entries") || "[]"),
      Number(localStorage.getItem("saldoTotal") || 0)
    );

    loadEntries(selectedDate);
    actualizarDashboard();

    entryForm.reset();
    mesesContainer.style.display = "none";
    detalleMeses.style.display = "none";
  });

  // --------------------------
  // GUARDAR SALDO PRESUPUESTO
  // --------------------------
  saldoBtn?.addEventListener("click", () => {
    const saldo = Number(document.getElementById("saldoTotal").value);
    const fechaInicio = document.getElementById("inputFechaInicio").value;

    if (!saldo || !fechaInicio) {
      alert("Debes ingresar saldo y fecha de inicio");
      return;
    }

    guardarSaldo(saldo, fechaInicio);

    generateCalendar(
      selectedDate,
      JSON.parse(localStorage.getItem("entries") || "[]"),
      saldo
    );

    actualizarDashboard();
  });

  // --------------------------
  // TARJETA: MOSTRAR OPCIONES
  // --------------------------
  paymentSelect?.addEventListener("change", () => {
    if (paymentSelect.value === "Tarjeta") {
      mesesContainer.style.display = "block";
    } else {
      mesesContainer.style.display = "none";
      detalleMeses.style.display = "none";
    }
  });

  esMeses?.addEventListener("change", () => {
    detalleMeses.style.display = esMeses.value === "si" ? "block" : "none";
  });

  mesesInput?.addEventListener("input", () => {
    const total = Number(document.getElementById("amount").value);
    const m = Number(mesesInput.value);
    if (m > 0) {
      const mensualidad = (total / m).toFixed(2);
      mensualidadInput.value = mensualidad;
      const ultimo = (total - (mensualidad * (m - 1))).toFixed(2);
      ultimoPago.textContent = `Último pago: $${ultimo}`;
    }
  });

  // --------------------------
  // PESTAÑAS
  // --------------------------
  const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    const tabContent = document.getElementById(btn.dataset.tab);
    if (tabContent) tabContent.classList.add("active");

    document.getElementById("sidebar")?.classList.remove("active");

    // --- Si es la pestaña de calendario
    if (btn.dataset.tab === "calendarTab") {
      const entries = JSON.parse(localStorage.getItem("entries") || "[]");
      const saldo = Number(localStorage.getItem("saldoTotal") || 0);
      generateCalendar(selectedDate, entries, saldo);
    }
  });
});



  document.querySelector(".tab-btn.active")?.click();

  // --------------------------
  // SIDEBAR CASITA
  // --------------------------
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  menuBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // --------------------------
  // TARJETA POR DEFECTO
  // --------------------------
  const tarjetasEnStorage = localStorage.getItem("cards");
  if (!tarjetasEnStorage) {
    addCard({ name: "Mi Tarjeta", limit: 1000, spent: 200, cutDate: "", paymentDate: "" });
  }

  // --------------------------
  // FORM TARJETAS
  // --------------------------
  cardForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const tarjeta = {
      nombre: document.getElementById('cardName').value,
      limite: parseFloat(document.getElementById('cardLimit').value),
      fechaCorte: document.getElementById('cutDate').value,
      fechaPago: document.getElementById('paymentDate').value
    };

    await guardarTarjeta(tarjeta);
    mostrarTarjetas();
    cardForm.reset();
  });

  // --------------------------
  // MOSTRAR TARJETAS
  // --------------------------
  async function mostrarTarjetas() {
    const cardsList = document.getElementById('cardsList');
    const tarjetas = await obtenerTarjetas();
    cardsList.innerHTML = '';
    tarjetas.forEach(t => {
      const option = document.createElement('option');
      option.value = t.id;
      option.textContent = `${t.nombre} - Límite: $${t.limite}`;
      cardsList.appendChild(option);
    });
  }

  mostrarTarjetas();

  // --------------------------
  // INICIALIZACIÓN CALENDARIO Y DASHBOARD
  // --------------------------
  generateCalendar(
    selectedDate,
    JSON.parse(localStorage.getItem("entries") || "[]"),
    Number(localStorage.getItem("saldoTotal") || 0)
  );
  loadEntries(selectedDate);
  actualizarDashboard();

  // --------------------------
  // EXPONER FUNCIONES GLOBALES
  // --------------------------
  window.editEntry = editEntry;
  window.deleteEntry = (index) => deleteEntry(index, selectedDate);
  window.selectDate = selectDate;
  window.guardarSaldo = guardarSaldo;
});
