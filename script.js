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
    const defaultMinQuantity = 5; // Set a default minimum quantity for items

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
        const minQuantity = parseInt(document.getElementById("expense-min-quantity").value) || defaultMinQuantity; // Use default if no input
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

        if (e.target.classList.contains("restock-btn")) {
            const id = parseInt(e.target.dataset.id);
            const expense = expenses.find(expense => expense.id === id);
            expense.amount += 5; // Add fixed number of quantities (e.g., 5)
            if (expense.amount < expense.minQuantity) {
                expense.amount = expense.minQuantity; // Ensure the amount is not less than the minimum quantity
            }
            displayExpenses(expenses);
            updateTotals();

            // Save expenses to local storage
            localStorage.setItem("expenses", JSON.stringify(expenses));
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
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>${expense.amount}</td>
                <td>${expense.minQuantity}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="btn edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="btn delete-btn" data-id="${expense.id}">Delete</button>
                    <button class="btn restock-btn" data-id="${expense.id}">Restock</button>
                </td>
            `;
            if (expense.amount < expense.minQuantity) {
                row.style.backgroundColor = "#ffcccc"; // Highlight row if quantity is below minimum
            }
            expenseList.appendChild(row);
        });
    }

    function updateTotals() {
        const total = expenses.length;
        const totalFoodItems = expenses.filter(expense => expense.category === "Food").length;
        const totalBeverageItems = expenses.filter(expense => expense.category === "Beverage").length;
        const totalSnackItems = expenses.filter(expense => expense.category === "Snack").length;

        totalAmount.textContent = `Total Items: ${total}`;
        totalFood.textContent = `Total Food Items: ${totalFoodItems}`;
        totalBeverage.textContent = `Total Beverage Items: ${totalBeverageItems}`;
        totalSnack.textContent = `Total Snack Items: ${totalSnackItems}`;
    }
});
