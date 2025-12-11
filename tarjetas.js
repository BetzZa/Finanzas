// tarjetas.js

// Cargar y mostrar tarjetas
export function loadCards() {
    const cards = JSON.parse(localStorage.getItem("cards") || "[]");
    const cardsList = document.getElementById("cardsList");
    const cardDetails = document.getElementById("cardDetails");
    
    cardsList.innerHTML = "";
    cardDetails.innerHTML = "";

    cards.forEach((card, index) => {
        // Lista desplegable
        const option = document.createElement("option");
        option.value = card.name;
        option.textContent = card.name;
        cardsList.appendChild(option);

        // Detalles de cada tarjeta
        const used = card.spent || 0;
        const free = card.limit - used;
        const percentUsed = Math.min((used / card.limit) * 100, 100);

        const div = document.createElement("div");
        div.className = "card-item";
        div.innerHTML = `
            <strong>${card.name}</strong>
            <p>Monto máximo: $${card.limit.toFixed(2)}</p>
            <p>Gastado: $${used.toFixed(2)}</p>
            <p>Disponible: $${free.toFixed(2)}</p>
            <p>Fecha de corte: ${card.cutDate}</p>
            <p>Fecha de pago: ${card.paymentDate}</p>
            <div class="card-progress-container">
                <div class="card-progress" style="width:${percentUsed}%"></div>
            </div>
        `;
        cardDetails.appendChild(div);
    });
}

// Agregar tarjeta nueva
export function addCard(card) {
    const cards = JSON.parse(localStorage.getItem("cards") || "[]");

    card.spent = card.spent || 0;
    card.cutDate = card.cutDate || "";
    card.paymentDate = card.paymentDate || "";

    cards.push(card);
    localStorage.setItem("cards", JSON.stringify(cards));
    loadCards();
}

// Actualizar gasto de tarjeta
export function updateCardUsage(cardName, amount) {
    const cards = JSON.parse(localStorage.getItem("cards") || "[]");

    const updatedCards = cards.map(card => {
        if (card.name === cardName) {
            card.spent = (card.spent || 0) + Number(amount);
        }
        return card;
    });

    localStorage.setItem("cards", JSON.stringify(updatedCards));
    loadCards();
}

// Retornar tarjetas para calendario
export function getCards() {
    return JSON.parse(localStorage.getItem("cards") || "[]");
}
// Agregar pago mensual de tarjeta
export function addCardMonthlyPayment(paymentData) {
    const payments = JSON.parse(localStorage.getItem("cardMonthlyPayments") || "[]");
    payments.push(paymentData);
    localStorage.setItem("cardMonthlyPayments", JSON.stringify(payments));
}

