// ---------------------------
// CALENDARIO
// ---------------------------
import { calcularPresupuestoDelMes } from "./presupuesto.js";
import { selectDate } from "./acciones.js";

export function generateCalendar(selectedDate, entries) {

    const fechaInicio = localStorage.getItem("fechaInicioPresupuesto");
    const inicio = fechaInicio ? new Date(fechaInicio) : null;

    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const today = new Date(selectedDate);
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    // Encabezado
    for (let dayName of daysOfWeek) {
        calendar.innerHTML += `<div class="day-header">${dayName}</div>`;
    }

    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const presupuestoDiario = Number(calcularPresupuestoDelMes()) || 0;

    const cards = JSON.parse(localStorage.getItem("cards") || "[]");

    // Espacios vacíos
    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div class="empty"></div>`;
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const gastosDelDia = entries
            .filter(e => e.date === dateStr && e.type === "gasto")
            .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

        let colorClass = "";
        if (inicio && new Date(dateStr) < inicio) {
            colorClass = "disabledDay";
        } else if (gastosDelDia <= presupuestoDiario) {
            colorClass = "greenDay";
        } else if (gastosDelDia <= presupuestoDiario * 1.2) {
            colorClass = "yellowDay";
        } else {
            colorClass = "redDay";
        }

        // Mostrar tarjetas solo dentro del día
        let cardInfoHTML = "";

        // Gastos con tarjeta
        entries
            .filter(e => e.date === dateStr && e.payment === "Tarjeta")
            .forEach(e => {
                const card = cards.find(c => c.name === e.cardName);
                if (card) {
                    cardInfoHTML += `<div class="calendar-card gasto">
                        ${card.name} - Gastado: $${e.amount.toFixed(2)}
                    </div>`;
                }
            });

        // Corte y pago
        cards.forEach(card => {
            // Corte
            if (card.cutDate) {
                const corteDate = new Date(card.cutDate);
                if (corteDate.getDate() === day && corteDate.getMonth() === month && corteDate.getFullYear() === year) {
                    cardInfoHTML += `<div class="calendar-card corte">
                        ${card.name} - Corte
                    </div>`;
                }
            }
            // Pago
            if (card.paymentDate) {
                const pagoDate = new Date(card.paymentDate);
                if (pagoDate.getDate() === day && pagoDate.getMonth() === month && pagoDate.getFullYear() === year) {
                    const pagosHoy = entries
                        .filter(e => e.date === dateStr && e.payment === "Tarjeta" && e.cardName === card.name)
                        .reduce((sum, e) => sum + Number(e.amount), 0);
                    cardInfoHTML += `<div class="calendar-card pago">
                        ${card.name} - Pago: $${pagosHoy.toFixed(2)}
                    </div>`;
                }
            }
        });

        calendar.innerHTML += `
            <div class="day ${dateStr === selectedDate ? "selected" : ""} ${colorClass}"
                 onclick="handleDayClick('${dateStr}')">
                ${day}
                ${cardInfoHTML}
            </div>
        `;
    }
}

// Cambiar fecha y abrir movimientos
window.handleDayClick = function(dateStr) {
    selectDate(dateStr);

    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

    const viewTabBtn = document.querySelector(`.tab-btn[data-tab="viewTab"]`);
    const viewTabContent = document.getElementById("viewTab");

    if (viewTabBtn && viewTabContent) {
        viewTabBtn.classList.add("active");
        viewTabContent.classList.add("active");
    }

    const entryList = document.getElementById("entryList");
    if (entryList) entryList.scrollIntoView({ behavior: "smooth" });
};
