// Crear calendario
const calendar = document.getElementById("calendar");
const entryList = document.getElementById("entryList");
const form = document.getElementById("entryForm");
let selectedDate = new Date().toISOString().slice(0, 10);

// Generar calendario del mes actual
function generateCalendar() {
    calendar.innerHTML = "";
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    
    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // Relleno vacío al inicio
    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div></div>`;
    }

    // Días reales
    for (let day = 1; day <= daysInMonth; day++) {
        let dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        calendar.innerHTML += `
            <div class="day ${dateStr === selectedDate ? "selected" : ""}" 
                 onclick="selectDate('${dateStr}')">
                 ${day}
            </div>`;
    }
}

function selectDate(date) {
    selectedDate = date;
    document.getElementById("date").value = date;
    generateCalendar();
    loadEntries();
}

form.addEventListener("submit", e => {
    e.preventDefault();
    
    let entries = JSON.parse(localStorage.getItem("entries") || "[]");

    entries.push({
        date: document.getElementById("date").value,
        amount: Number(document.getElementById("amount").value),
        type: document.getElementById("type").value,
        category: document.getElementById("category").value
    });

    localStorage.setItem("entries", JSON.stringify(entries));
    
    loadEntries();
    form.reset();
});

function loadEntries() {
    let entries = JSON.parse(localStorage.getItem("entries") || "[]");
    
    let filtered = entries.filter(e => e.date === selectedDate);
    entryList.innerHTML = "";

    filtered.forEach(e => {
        entryList.innerHTML += `
            <li>${e.type.toUpperCase()}: $${e.amount} — ${e.category}</li>
        `;
    });
}

generateCalendar();
selectDate(selectedDate);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
