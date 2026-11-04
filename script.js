
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // SHJ AUTO STOCK BALANCE CALCULATOR
    // =====================================

    // ALL STOCK VARIANTS
    const variants = [
        "std",
        "adv",
        "rws",
        "aruzStd",
        "aruzAdv",
        "aruzRws"
    ];

    // VARIANT DISPLAY NAMES
    const variantNames = {
        std: "BEZZA STD",
        adv: "BEZZA ADV",
        rws: "BEZZA RWS",
        aruzStd: "ARUZ STD",
        aruzAdv: "ARUZ ADV",
        aruzRws: "ARUZ RWS"
    };

    // =====================================
    // READ STOCK QUANTITY
    // =====================================

    function getStock(id) {

        const input = document.getElementById(id);

        if (!input) {
            return 0;
        }

        const value = Number(input.value);

        if (!Number.isFinite(value) || value < 0) {
            return 0;
        }

        return Math.floor(value);
    }

    // =====================================
    // CALCULATE STOCK
    // =====================================

    function calculateStock() {

        let totalMain = 0;
        let totalSub = 0;

        variants.forEach(function (variant) {

            const main = getStock(variant + "Main");
            const sub = getStock(variant + "Sub");

            const total = main + sub;

            document.getElementById(
                variant + "Total"
            ).textContent = total;

            totalMain += main;
            totalSub += sub;
        });

        const grandTotal = totalMain + totalSub;

        document.getElementById(
            "totalMain"
        ).textContent = totalMain;

        document.getElementById(
            "totalSub"
        ).textContent = totalSub;

        document.getElementById(
            "grandTotal"
        ).textContent = grandTotal;
    }

    // =====================================
    // AUTOMATIC CALCULATION
    // =====================================

    const inputs = document.querySelectorAll(
        ".stock-card input"
    );

    inputs.forEach(function (input) {

        input.addEventListener(
            "input",
            calculateStock
        );

    });

    // =====================================
    // SAVE STOCK RECORD
    // =====================================

    document.getElementById("saveBtn")
        .addEventListener("click", function () {

            const now = new Date();

            const stockData = {
                id: now.getTime(),
                dateTime: now.toLocaleString("en-MY"),
                stocks: [],
                totalMain: 0,
                totalSub: 0,
                grandTotal: 0
            };

            // COLLECT ALL VARIANT STOCK
            variants.forEach(function (variant) {

                const main = getStock(
                    variant + "Main"
                );

                const sub = getStock(
                    variant + "Sub"
                );

                const total = main + sub;

                stockData.stocks.push({
                    variant: variantNames[variant],
                    mainStore: main,
                    subStore: sub,
                    total: total
                });

                stockData.totalMain += main;
                stockData.totalSub += sub;
            });

            stockData.grandTotal =
                stockData.totalMain +
                stockData.totalSub;

            // SAVE TO LOCAL STORAGE
            try {

                const records = JSON.parse(
                    localStorage.getItem(
                        "shjStockRecords"
                    ) || "[]"
                );

                records.push(stockData);

                localStorage.setItem(
                    "shjStockRecords",
                    JSON.stringify(records)
                );

                alert(
                    "STOCK SAVED SUCCESSFULLY!\n\n" +
                    "Date: " + stockData.dateTime + "\n" +
                    "Main Store: " + stockData.totalMain + "\n" +
                    "Sub Store: " + stockData.totalSub + "\n" +
                    "Grand Total: " + stockData.grandTotal
                );

            } catch (error) {

                console.error(
                    "Stock saving error:",
                    error
                );

                alert(
                    "ERROR SAVING STOCK!\n" +
                    error.message
                );
            }

        });

    // =====================================
    // RESET STOCK INPUT
    // =====================================

    document.getElementById("resetBtn")
        .addEventListener("click", function () {

            const confirmReset = confirm(
                "Are you sure you want to reset all stock?"
            );

            if (confirmReset) {

                inputs.forEach(function (input) {
                    input.value = "";
                });

                calculateStock();

                alert("Stock input has been reset.");
            }

        });

    // =====================================
    // VIEW STOCK HISTORY
    // =====================================

    document.getElementById("historyBtn")
        .addEventListener("click", function () {

            const historyDiv =
                document.getElementById("stockHistory");

            let records;

            try {
                records = JSON.parse(
                    localStorage.getItem("shjStockRecords") || "[]"
                );

                if (!Array.isArray(records)) {
                    throw new Error("Invalid record format");
                }

            } catch (error) {
                historyDiv.textContent =
                    "Unable to load saved records.";
                return;
            }

            historyDiv.innerHTML = "";

            if (records.length === 0) {
                historyDiv.textContent =
                    "No saved stock records found.";
                return;
            }

            // Show newest records first
            records.reverse().forEach(function (record, index) {

                const card = document.createElement("div");
                card.className = "history-card";

                const heading = document.createElement("h3");
                heading.textContent =
                    "Record " + (records.length - index) +
                    " — " + record.dateTime;

                card.appendChild(heading);

                const table = document.createElement("table");

                const headerRow = table.insertRow();

                ["Variant", "Main", "Sub", "Total"]
                    .forEach(function (name) {
                        const th = document.createElement("th");
                        th.textContent = name;
                        headerRow.appendChild(th);
                    });

                (record.stocks || []).forEach(function (stock) {

                    const row = table.insertRow();

                    [
                        stock.variant,
                        stock.mainStore,
                        stock.subStore,
                        stock.total
                    ].forEach(function (value) {
                        const cell = row.insertCell();
                        cell.textContent = value;
                    });

                });

                card.appendChild(table);

                const total = document.createElement("p");
                total.textContent =
                    "GRAND TOTAL: " + record.grandTotal;

                total.style.fontWeight = "bold";
                card.appendChild(total);

                historyDiv.appendChild(card);
            });

        });

    // =====================================
    // SEARCH STOCK HISTORY BY DATE
    // =====================================

    // Get saved stock records
    function getSavedRecords() {
        try {
            const records = JSON.parse(
                localStorage.getItem("shjStockRecords") || "[]"
            );

            return Array.isArray(records) ? records : [];
        } catch (error) {
            console.error("History loading error:", error);
            return [];
        }
    }

    // Display records in the history section
    function displaySearchResults(records) {

        const historyDiv =
            document.getElementById("stockHistory");

        historyDiv.innerHTML = "";

        if (records.length === 0) {
            historyDiv.textContent =
                "No stock records found for this date.";
            return;
        }

        records.slice().reverse().forEach(function (record) {

            const card = document.createElement("div");
            card.className = "history-card";

            const heading = document.createElement("h3");
            heading.textContent =
                "Record — " + record.dateTime;

            card.appendChild(heading);

            const table = document.createElement("table");

            const header = table.insertRow();

            ["Variant", "Main", "Sub", "Total"]
                .forEach(function (title) {
                    const th = document.createElement("th");
                    th.textContent = title;
                    header.appendChild(th);
                });

            (record.stocks || []).forEach(function (stock) {

                const row = table.insertRow();

                [
                    stock.variant,
                    stock.mainStore,
                    stock.subStore,
                    stock.total
                ].forEach(function (value) {
                    const cell = row.insertCell();
                    cell.textContent = value;
                });
            });

            card.appendChild(table);

            const total = document.createElement("p");
            total.textContent =
                "GRAND TOTAL: " + record.grandTotal;

            total.style.fontWeight = "bold";
            card.appendChild(total);

            // EDIT RECORD BUTTON
            const editBtn = document.createElement("button");

            editBtn.type = "button";
            editBtn.textContent = "✏️ EDIT RECORD";
            editBtn.className = "edit-record-btn";

            
editBtn.addEventListener("click", function () {

    // Prevent duplicate edit forms
    const existingForm = card.querySelector(".edit-stock-form");

    if (existingForm) {
        existingForm.remove();
        return;
    }

    const editForm = document.createElement("div");
    editForm.className = "edit-stock-form";

    const title = document.createElement("h3");
    title.textContent = "EDIT STOCK - " + record.dateTime;
    editForm.appendChild(title);

    (record.stocks || []).forEach(function (stock, index) {

        const group = document.createElement("div");
        group.style.marginBottom = "12px";

        const name = document.createElement("strong");
        name.textContent = stock.variant;
        group.appendChild(name);

        ["mainStore", "subStore"].forEach(function (field) {

            const label = document.createElement("label");
            label.textContent =
                field === "mainStore" ? " Main Store: " : " Sub Store: ";

            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.step = "1";
            input.value = stock[field];

            input.dataset.stockIndex = index;
            input.dataset.stockField = field;

            input.style.width = "90px";
            input.style.margin = "5px";

            group.appendChild(label);
            group.appendChild(input);
        });

        editForm.appendChild(group);
    });

    const updateBtn = document.createElement("button");
    updateBtn.type = "button";
    updateBtn.textContent = "UPDATE RECORD";
    updateBtn.className = "update-record-btn";

   
updateBtn.addEventListener("click", function () {

    // Get all saved records
    let savedRecords;

    try {
        savedRecords = JSON.parse(
            localStorage.getItem("shjStockRecords") || "[]"
        );

        if (!Array.isArray(savedRecords)) {
            throw new Error("Invalid stock records");
        }
    } catch (error) {
        alert("Unable to load saved records.");
        return;
    }

    // Find the original record using its ID
    const recordIndex = savedRecords.findIndex(function (item) {
        return item.id === record.id;
    });

    if (recordIndex === -1) {
        alert("Original record not found.");
        return;
    }

    // Copy original stock data
    const updatedStocks = savedRecords[recordIndex].stocks.map(
        function (stock) {
            return { ...stock };
        }
    );

    // Read and validate edited quantities
    const editInputs = editForm.querySelectorAll(
        "input[data-stock-index]"
    );

    for (const input of editInputs) {

        const value = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isSafeInteger(value) ||
            value < 0
        ) {
            alert("Please enter a valid stock quantity.");
            input.focus();
            return;
        }

        const index = Number(input.dataset.stockIndex);
        const field = input.dataset.stockField;

        updatedStocks[index][field] = value;
    }

    // Recalculate totals for each variant
    let totalMain = 0;
    let totalSub = 0;

    updatedStocks.forEach(function (stock) {

        stock.total = stock.mainStore + stock.subStore;

        totalMain += stock.mainStore;
        totalSub += stock.subStore;
    });

    const grandTotal = totalMain + totalSub;

    if (!confirm("Are you sure you want to update this record?")) {
        return;
    }

    // Update existing record, not create a new one
    savedRecords[recordIndex].stocks = updatedStocks;
    savedRecords[recordIndex].totalMain = totalMain;
    savedRecords[recordIndex].totalSub = totalSub;
    savedRecords[recordIndex].grandTotal = grandTotal;

    try {
        localStorage.setItem(
            "shjStockRecords",
            JSON.stringify(savedRecords)
        );

        alert("STOCK RECORD UPDATED SUCCESSFULLY!");

        // Refresh history with updated data
        const selectedDate =
            document.getElementById("searchDate").value;

        if (selectedDate) {
            displaySearchResults(
                savedRecords.filter(function (item) {
                    return getRecordDate(item) === selectedDate;
                })
            );
        } else {
            displaySearchResults(savedRecords);
        }

    } catch (error) {
        alert("Unable to save updated record.");
        console.error(error);
    }

});


    editForm.appendChild(updateBtn);

    // CANCEL EDIT BUTTON
    const cancelBtn = document.createElement("button");

    cancelBtn.type = "button";
    cancelBtn.textContent = "CANCEL EDIT";
    cancelBtn.className = "cancel-edit-btn";

    cancelBtn.style.backgroundColor = "#757575";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.style.padding = "10px 15px";
    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";

    cancelBtn.addEventListener("click", function () {
        editForm.remove();
    });

    editForm.appendChild(cancelBtn);

    card.appendChild(editForm);

});

            card.appendChild(editBtn);

            // DELETE RECORD BUTTON
            const deleteBtn = document.createElement("button");

            deleteBtn.type = "button";
            deleteBtn.textContent = "🗑️ DELETE RECORD";
            deleteBtn.className = "delete-record-btn";

            deleteBtn.style.backgroundColor = "#c62828";
            deleteBtn.style.color = "white";
            deleteBtn.style.border = "none";
            deleteBtn.style.padding = "12px 20px";
            deleteBtn.style.borderRadius = "8px";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.style.cursor = "pointer";

           
deleteBtn.addEventListener("click", function () {

    // Confirm before deleting
    const confirmDelete = confirm(
        "Are you sure you want to delete this stock record?\n\n" +
        "Date: " + record.dateTime + "\n" +
        "Grand Total: " + record.grandTotal + "\n\n" +
        "This action cannot be undone."
    );

    if (!confirmDelete) {
        return;
    }

    try {
        // Load all saved records
        const savedRecords = JSON.parse(
            localStorage.getItem("shjStockRecords") || "[]"
        );

        if (!Array.isArray(savedRecords)) {
            throw new Error("Invalid stock history data.");
        }

        // Find the selected record
        const recordIndex = savedRecords.findIndex(function (item) {
            return item.id === record.id;
        });

        if (recordIndex === -1) {
            alert("Record not found.");
            return;
        }

        // Remove only the selected record
        savedRecords.splice(recordIndex, 1);

        // Save updated history
        localStorage.setItem(
            "shjStockRecords",
            JSON.stringify(savedRecords)
        );

        alert("STOCK RECORD DELETED SUCCESSFULLY!");

        // Refresh history
        const selectedDate =
            document.getElementById("searchDate").value;

        if (selectedDate) {
            displaySearchResults(
                savedRecords.filter(function (item) {
                    return getRecordDate(item) === selectedDate;
                })
            );
        } else {
            displaySearchResults(savedRecords);
        }

    } catch (error) {
        console.error("Delete record error:", error);
        alert("Unable to delete stock record.");
    }

});


            card.appendChild(deleteBtn);

            historyDiv.appendChild(card);
        });
    }

    // Convert saved date to YYYY-MM-DD
    function getRecordDate(record) {

        // Newer records may contain an ISO timestamp
        if (record.savedAt) {
            const date = new Date(record.savedAt);

            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(
                    date.getMonth() + 1
                ).padStart(2, "0");
                const day = String(
                    date.getDate()
                ).padStart(2, "0");

                return `${year}-${month}-${day}`;
            }
        }

        // Existing records use en-MY dateTime:
        // DD/MM/YYYY, HH:MM:SS
        const match = String(record.dateTime || "")
            .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);

        if (!match) return "";

        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        const year = match[3];

        return `${year}-${month}-${day}`;
    }

    // Search button
    document.getElementById("searchBtn")
        .addEventListener("click", function () {

            const selectedDate =
                document.getElementById("searchDate").value;

            if (!selectedDate) {
                alert("Please select a date first.");
                return;
            }

            const records = getSavedRecords();

            const filtered = records.filter(function (record) {
                return getRecordDate(record) === selectedDate;
            });

            displaySearchResults(filtered);
        });

    // Show all records button
    document.getElementById("showAllBtn")
        .addEventListener("click", function () {

            document.getElementById("searchDate").value = "";

            displaySearchResults(getSavedRecords());
        });

    // =====================================
    // INITIAL CALCULATION
    // =====================================

    calculateStock();

});
