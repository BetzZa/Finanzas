export function actualizarDashboard() {
    const totalIngresosEl = document.getElementById("totalIngresos");
    const totalGastosEl = document.getElementById("totalGastos");
    const saldoRestanteEl = document.getElementById("saldoRestante");
    const progressBarEl = document.getElementById("progressBar");
    const resumenMesEl = document.getElementById("resumenMes"); // Nuevo elemento

    if (!totalIngresosEl || !totalGastosEl || !saldoRestanteEl || !progressBarEl) return;

    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const ingresos = entries.filter(e => e.type === "ingreso").reduce((acc, e) => acc + e.amount, 0);
    const gastos = entries.filter(e => e.type === "gasto").reduce((acc, e) => acc + e.amount, 0);
    const saldoTotal = Number(localStorage.getItem("saldoTotal") || 0);
    const saldoRestante = saldoTotal + ingresos - gastos;

    // Nombre del mes actual
    const fecha = new Date();
    const nombreMes = fecha.toLocaleString("es-ES", { month: "long" });

    // Actualizamos el DOM
    if (resumenMesEl) {
        resumenMesEl.textContent = `📊 Resumen de ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`;
    }
    totalIngresosEl.textContent = `Ingresos: $${ingresos}`;
    totalGastosEl.textContent = `Gastos: $${gastos}`;
    saldoRestanteEl.textContent = `Saldo restante: $${saldoRestante}`;

    const porcentaje = ((ingresos + saldoTotal - gastos) / (saldoTotal + ingresos)) * 100;
    progressBarEl.style.width = `${Math.min(Math.max(porcentaje, 0), 100)}%`;
}
