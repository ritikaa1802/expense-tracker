const form = document.getElementById("transaction-form");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const list = document.getElementById("transaction-list"); // Ensure your tbody has this id

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const search = document.getElementById("search");
const exportBtn = document.getElementById("export");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Save to localStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update Balance, Income, Expense
function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });
  balanceEl.textContent = "₹" + (income - expense).toFixed(2);
  incomeEl.textContent = "₹" + income.toFixed(2);
  expenseEl.textContent = "₹" + expense.toFixed(2);
}

// Render Transactions
function renderTransactions(filterText = "") {
  list.innerHTML = "";
  transactions
    .filter(t =>
      t.desc.toLowerCase().includes(filterText.toLowerCase()) ||
      t.category.toLowerCase().includes(filterText.toLowerCase()) ||
      t.type.toLowerCase().includes(filterText.toLowerCase())
    )
    .forEach((t, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${t.date}</td>
        <td>${t.desc}</td>
        <td>${t.category}</td>
        <td>${t.type}</td>
        <td>₹${t.amount}</td>
        <td><button class="delete" onclick="deleteTransaction(${index})">❌</button></td>
      `;
      list.appendChild(row);
    });
}

// Delete Transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();
  updateSummary();
  renderTransactions(search.value);
}

// Add Transaction
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!desc.value.trim() || isNaN(amount.value) || amount.value <= 0) {
    alert("Please enter valid description and amount.");
    return;
  }

  const today = new Date();
  const formattedDate = String(today.getDate()).padStart(2,'0') + '-' +
                        String(today.getMonth()+1).padStart(2,'0') + '-' +
                        today.getFullYear() + ' ' +
                        String(today.getHours()).padStart(2,'0') + ':' +
                        String(today.getMinutes()).padStart(2,'0');

  const transaction = {
    desc: desc.value.trim(),
    amount: parseFloat(amount.value),
    type: type.value,
    category: category.value,
    date: formattedDate
  };
  transactions.push(transaction);
  saveTransactions();

  desc.value = "";
  amount.value = "";

  updateSummary();
  renderTransactions(search.value);
});

// Search
search.addEventListener("input", () => {
  renderTransactions(search.value);
});

// Export to CSV
exportBtn.addEventListener("click", () => {
  let csv = "Date,Description,Category,Type,Amount\n";
  transactions.forEach(t => {
    csv += `${t.date},${t.desc},${t.category},${t.type},${t.amount}\n`; // backticks fixed
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "transactions.csv");
  a.click();
});

// Initialize on page load
updateSummary();
renderTransactions();
// Export to CSV functionality
document.getElementById("export").addEventListener("click", function () {
  let table = document.querySelector("table");
  let rows = table.querySelectorAll("tr");
  let csv = [];

  rows.forEach(row => {
    let cols = row.querySelectorAll("th, td");
    let rowData = [];
    cols.forEach(col => rowData.push(col.innerText));
    csv.push(rowData.join(","));
  });

  // Convert to CSV string
  let csvString = csv.join("\n");

  // Blob banakar download trigger karo
  let blob = new Blob([csvString], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transactions.csv";
  link.click();
});