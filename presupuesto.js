// ---------------------------
// PRESUPUESTO
// ---------------------------

// Guardar saldo inicial y fecha de inicio
export function guardarSaldo(saldo, fechaInicio) {
    localStorage.setItem("saldoTotal", saldo);
    localStorage.setItem("fechaInicioPresupuesto", fechaInicio); // fecha de inicio
    calcularPresupuestoDelMes();
}

// Calcular presupuesto diario considerando saldo inicial, quincena y gastos registrados
export function calcularPresupuestoDelMes() {
    const saldoTotal = Number(localStorage.getItem("saldoTotal") || 0);
    const fechaInicio = localStorage.getItem("fechaInicioPresupuesto");

    if (!fechaInicio) return 0; // no se configuró inicio

    const inicio = new Date(fechaInicio);
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");

    function getEndOfQuincena(date) {
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.getMonth();
        if (day <= 15) return new Date(year, month, 15);
        else return new Date(year, month + 1, 0);
    }

    const finQuincena = getEndOfQuincena(inicio);

    const movimientosValidos = entries.filter(e => {
        const eDate = new Date(e.date);
        return eDate >= inicio && eDate <= finQuincena;
    });

    const ingresos = movimientosValidos
        .filter(e => e.type === "ingreso")
        .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const gastos = movimientosValidos
        .filter(e => e.type === "gasto")
        .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const saldoRestante = saldoTotal + ingresos - gastos;

    const diasRestantes = Math.ceil((finQuincena - inicio) / (1000 * 60 * 60 * 24)) + 1;

    const presupuestoDiario = diasRestantes > 0 ? saldoRestante / diasRestantes : 0;

    localStorage.setItem("presupuestoDiario", presupuestoDiario.toFixed(2));

    const gastoDiarioElem = document.getElementById("gastoDiario");
    if (gastoDiarioElem) {
        gastoDiarioElem.textContent =
            `💵 Presupuesto diario: $${presupuestoDiario.toFixed(2)}`;
    }

    // Mostrar fecha inicio formateada en UI
    const fechaMontoElem = document.getElementById("fechaMonto");
    const fechaMontoValorElem = document.getElementById("fechaMontoValor");

    if (fechaMontoElem && fechaMontoValorElem && fechaInicio) {
        const fechaObj = new Date(fechaInicio);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        fechaMontoValorElem.textContent = fechaObj.toLocaleDateString('es-ES', opciones);
        fechaMontoElem.style.display = 'block';
    }

    return presupuestoDiario;
}

