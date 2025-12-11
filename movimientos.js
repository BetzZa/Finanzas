// movimientos.js
import { updateCardUsage, addCardMonthlyPayment } from "./tarjetas.js";

export function addEntry(entry) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));

    // Si es tarjeta a meses → registrar mensualidad
    if (entry.payment === "Tarjeta" && entry.esMeses === "si") {
        const pagos = JSON.parse(localStorage.getItem("cardMonthlyPayments") || "[]");

        pagos.push({
            nombre: entry.category,
            total: entry.amount,
            meses: entry.meses,
            mensualidad: entry.mensualidad,
            fecha: entry.date
        });

        localStorage.setItem("cardMonthlyPayments", JSON.stringify(pagos));
    }
}

