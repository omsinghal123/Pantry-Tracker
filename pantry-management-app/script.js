document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list-body");
    const totalAmount = document.getElementById("total-amount");
    const totalFood = document.getElementById("total-food");
    const totalBeverage = document.getElementById("total-beverage");
    const totalSnack = document.getElementById("total-snack");
    const filterCategory = document.getElementById("filter-category");
    const searchInput = document.getElementById("search-input");
    const exportCsvBtn = document.getElementById("export-csv");
    let expenses = [];

    // Retrieve expenses from local storage
    const storedExpenses = localStorage.getItem("expenses");
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
        displayExpenses(expenses);
        updateTotals();
    }

    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("expense-name").value;
        const amount = parseInt(document.getElementById("expense-amount").value);
        const minQuantity = parseInt(document.getElementById("expense-min-quantity").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;
        const expense = {
            id: Date.now(),
            name,
            amount,
            minQuantity,
            category,
            date
        };
        expenses.push(expense);
        displayExpenses(expenses);
        updateTotals();
        expenseForm.reset();

        // Save expenses to local storage
        localStorage.setItem("expenses", JSON.stringify(expenses));
    });

    expenseList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = parseInt(e.target.dataset.id);
            expenses = expenses.filter(expense => expense.id !== id);
            displayExpenses(expenses);
            updateTotals();

            // Save expenses to local storage
            localStorage.setItem("expenses", JSON.stringify(expenses));
        }

        if (e.target.classList.contains("edit-btn")) {
            const id = parseInt(e.target.dataset.id);
            const expense = expenses.find(expense => expense.id === id);
            document.getElementById("expense-name").value = expense.name;
            document.getElementById("expense-amount").value = expense.amount;
            document.getElementById("expense-min-quantity").value = expense.minQuantity;
            document.getElementById("expense-category").value = expense.category;
            document.getElementById("expense-date").value = expense.date;
            expenseForm.dataset.id = id;
        }
    });

    filterCategory.addEventListener("change", () => {
        const category = filterCategory.value;
        const filteredExpenses = expenses.filter(expense => expense.category === category || category === "All");
        displayExpenses(filteredExpenses);
        updateTotals(); // Update totals after filtering
    });

    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredExpenses = expenses.filter(expense => expense.name.toLowerCase().includes(searchTerm));
        displayExpenses(filteredExpenses);
        updateTotals(); // Update totals after searching
    });

    exportCsvBtn.addEventListener("click", () => {
        const csvRows = [];
        const headers = ["Item Name", "Quantity", "Minimum Quantity", "Category", "Date"];
        csvRows.push(headers.join(","));
        expenses.forEach(expense => {
            const row = [
                expense.name,
                expense.amount,
                expense.minQuantity,
                expense.category,
                expense.date
            ];
            csvRows.push(row.join(","));
        });
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expenses.csv";
        a.click();
        URL.revokeObjectURL(url);
    });

    function displayExpenses(expenses) {
        expenseList.innerHTML = "";
        expenses.forEach(expense => {
            const row = document.createElement("tr");
            row.classList.add("expense-row");
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>${expense.amount}</td>
                <td>${expense.minQuantity}</td>
                <td>${expense.category}</td>
                <td class="expiration-date ${isExpired(expense.date) ? 'expired' : ''}">${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    }

    function updateTotals() {
        const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        const totalFoodAmount = expenses.filter(exp => exp.category === "Food").reduce((acc, exp) => acc + exp.amount, 0);
        const totalBeverageAmount = expenses.filter(exp => exp.category === "Beverage").reduce((acc, exp) => acc + exp.amount, 0);
        const totalSnackAmount = expenses.filter(exp => exp.category === "Snack").reduce((acc, exp) => acc + exp.amount, 0);

        totalAmount.textContent = `Total Items: ${total}`;
        totalFood.textContent = `Total Food Items: ${totalFoodAmount}`;
        totalBeverage.textContent = `Total Beverage Items: ${totalBeverageAmount}`;
        totalSnack.textContent = `Total Snack Items: ${totalSnackAmount}`;
    }

    function isExpired(date) {
        const today = new Date();
        const expirationDate = new Date(date);
        return expirationDate < today;
    }
});
