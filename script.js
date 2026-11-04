
document.addEventListener("DOMContentLoaded", function () {
    // =====================================
    // SUPABASE CONFIGURATION
    // =====================================

   const SUPABASE_URL = "https://gzsgzbvtshacfxwcgina.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ST6rVAjuO96tPDx5AIMhCw_aCuq7Z2U";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client initialized successfully!");

   
    // =====================================
    // PUBLIC CALCULATOR DISPLAY
    // =====================================

    function showPublicCalculator() {

        document.getElementById("loginSection").style.display = "none";

        document.getElementById("calculatorSection").style.display = "block";

        console.log("Public calculator display enabled.");
    }

    showPublicCalculator();


    // =====================================
    // SUPABASE USER LOGOUT
    // =====================================

    document.getElementById("logoutBtn").addEventListener("click", async function () {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            alert("Logout failed: " + error.message);
            return;
        }

        document.getElementById("calculatorSection").style.display = "none";
        document.getElementById("loginSection").style.display = "block";

        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";

        console.log("Supabase Logout SUCCESS!");
    });

    // =====================================
    // SUPABASE USER LOGIN
    // =====================================

    const loginBtn = document.getElementById("loginBtn");
    const loginMessage = document.getElementById("loginMessage");
    const loginSection = document.getElementById("loginSection");
    const calculatorSection = document.getElementById("calculatorSection");

    loginBtn.addEventListener("click", async function () {

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            loginMessage.textContent = "Please enter email and password.";
            return;
        }

        loginBtn.disabled = true;
        loginMessage.textContent = "Logging in...";

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            if (data.user) {
                loginSection.style.display = "none";
                calculatorSection.style.display = "block";

                document.getElementById("loginPassword").value = "";
                loginMessage.textContent = "";

                console.log("Supabase Login SUCCESS!");
            }

        } catch (error) {
            loginMessage.textContent = "Login failed: " + error.message;
            console.error("Login error:", error);
        } finally {
            loginBtn.disabled = false;
        }
    });

// =====================================
// TEST SUPABASE DATABASE CONNECTION
// =====================================

async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from("stock_records")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Supabase Database Error:", error.message);
            return;
        }

        console.log("Supabase Database Connection SUCCESS!");
        console.log("Test Data:", data);

    } catch (error) {
        console.error("Connection Failed:", error);
    }
}

testSupabaseConnection();

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
    // SAVE STOCK RECORD - SUPABASE
    // =====================================

    document.getElementById("saveBtn")
        .addEventListener("click", async function () {

            const now = new Date();

            const stockData = {
                dateTime: now.toLocaleString("en-MY"),
                stocks: [],
                totalMain: 0,
                totalSub: 0,
                grandTotal: 0
            };

            // COLLECT ALL VARIANT STOCK
            variants.forEach(function (variant) {

                const main = getStock(variant + "Main");
                const sub = getStock(variant + "Sub");
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
                stockData.totalMain + stockData.totalSub;

            // SAVE TO SUPABASE
            try {

                const { error } = await supabaseClient
                    .from("stock_records")
                    .insert([{
                        date_time: stockData.dateTime,
                        stocks: stockData.stocks,
                        total_main: stockData.totalMain,
                        total_sub: stockData.totalSub,
                        grand_total: stockData.grandTotal
                    }]);

                if (error) {
                    throw error;
                }

                alert(
                    "STOCK SAVED TO SUPABASE SUCCESSFULLY!\n\n" +
                    "Date: " + stockData.dateTime + "\n" +
                    "Main Store: " + stockData.totalMain + "\n" +
                    "Sub Store: " + stockData.totalSub + "\n" +
                    "Grand Total: " + stockData.grandTotal
                );

                console.log("Stock saved to Supabase!");

            } catch (error) {

                console.error("Stock saving error:", error);

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

   
    // =====================================
    // STOCK HISTORY - SUPABASE
    // =====================================

    document.getElementById("historyBtn")
        .addEventListener("click", async function () {

            const historyDiv =
                document.getElementById("stockHistory");

            historyDiv.textContent = "Loading stock records...";

            try {

               
                const { data, error } = await supabaseClient
                    .from("stock_records")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    throw error;
                }

                historyDiv.innerHTML = "";

                if (!data || data.length === 0) {
                    historyDiv.textContent =
                        "No saved stock records found.";
                    return;
                }

                data.forEach(function (record, index) {

                    const card = document.createElement("div");
                    card.className = "history-card";

                    const heading = document.createElement("h3");
                    heading.textContent =
                        "Record " + (data.length - index) +
                        " — " + record.date_time;

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
                        "GRAND TOTAL: " + record.grand_total;

                    total.style.fontWeight = "bold";
                    card.appendChild(total);

                    historyDiv.appendChild(card);
                });

                console.log(
                    "Stock history loaded from Supabase:",
                    data.length,
                    "records"
                );

            } catch (error) {

                console.error("Stock history error:", error);

                historyDiv.textContent =
                    "Unable to load records: " + error.message;
            }

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

    // =====================================
    // LOAD STOCK RECORDS FROM SUPABASE
    // =====================================

    async function getSupabaseRecords() {

      
        const { data, error } = await supabaseClient
            .from("stock_records")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        // Convert Supabase column names
        // to existing JavaScript format
        return (data || []).map(function (record) {

            return {
                id: record.id,
                dateTime: record.date_time,
                savedAt: record.created_at,
                stocks: record.stocks || [],
                totalMain: record.total_main,
                totalSub: record.total_sub,
                grandTotal: record.grand_total
            };

        });
    }

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

   

updateBtn.addEventListener("click", async function () {

    const updatedStocks = (record.stocks || []).map(function (stock) {
        return { ...stock };
    });

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

    updateBtn.disabled = true;

    try {
     
        const { data, error } = await supabaseClient
            .from("stock_records")
            .update({
                stocks: updatedStocks,
                total_main: totalMain,
                total_sub: totalSub,
                grand_total: grandTotal
            })
            .eq("id", record.id)
            .select("id");

        if (error) {
            throw error;
        }

        if (!data || data.length !== 1) {
            throw new Error("Record not found or update not permitted.");
        }

        alert("STOCK RECORD UPDATED IN SUPABASE!");

        const records = await getSupabaseRecords();
        const selectedDate =
            document.getElementById("searchDate").value;

        displaySearchResults(
            selectedDate
                ? records.filter(function (item) {
                    return getRecordDate(item) === selectedDate;
                })
                : records
        );

    } catch (error) {
        console.error("Update error:", error);
        alert("UPDATE FAILED: " + error.message);
    } finally {
        updateBtn.disabled = false;
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

           

deleteBtn.addEventListener("click", async function () {

    const confirmDelete = confirm(
        "Are you sure you want to delete this stock record?\n\n" +
        "Date: " + record.dateTime + "\n" +
        "Grand Total: " + record.grandTotal + "\n\n" +
        "This action cannot be undone."
    );

    if (!confirmDelete) {
        return;
    }

    deleteBtn.disabled = true;

    try {

     
        // DELETE RECORD FROM SUPABASE
        const { data, error } = await supabaseClient
            .from("stock_records")
            .delete()
            .eq("id", record.id)
            .select("id");

        if (error) {
            throw error;
        }

        if (!data || data.length !== 1) {
            throw new Error(
                "Record not found or delete not permitted."
            );
        }

        alert("STOCK RECORD DELETED FROM SUPABASE!");

        // REFRESH RECORD LIST
        const records = await getSupabaseRecords();

        const selectedDate =
            document.getElementById("searchDate").value;

        if (selectedDate) {
            displaySearchResults(
                records.filter(function (item) {
                    return getRecordDate(item) === selectedDate;
                })
            );
        } else {
            displaySearchResults(records);
        }

        console.log("Supabase DELETE SUCCESS!");

    } catch (error) {

        console.error("Delete error:", error);

        alert("DELETE FAILED: " + error.message);

    } finally {
        deleteBtn.disabled = false;
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

    
    // =====================================
    // SEARCH STOCK RECORD - SUPABASE
    // =====================================

    document.getElementById("searchBtn")
        .addEventListener("click", async function () {

            const selectedDate =
                document.getElementById("searchDate").value;

            if (!selectedDate) {
                alert("Please select a date first.");
                return;
            }

            const historyDiv =
                document.getElementById("stockHistory");

            historyDiv.textContent = "Searching stock records...";

            try {

                const records = await getSupabaseRecords();

                const filtered = records.filter(function (record) {
                    return getRecordDate(record) === selectedDate;
                });

                displaySearchResults(filtered);

                console.log(
                    "Supabase Search SUCCESS!",
                    filtered.length,
                    "records found"
                );

            } catch (error) {

                console.error("Search error:", error);

                historyDiv.textContent =
                    "Unable to search records: " + error.message;
            }

        });

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

    
    // =====================================
    // SHOW ALL RECORDS - SUPABASE
    // =====================================

    document.getElementById("showAllBtn")
        .addEventListener("click", async function () {

            document.getElementById("searchDate").value = "";

            const historyDiv =
                document.getElementById("stockHistory");

            historyDiv.textContent = "Loading all stock records...";

            try {

                const records = await getSupabaseRecords();

                displaySearchResults(records);

                console.log(
                    "Supabase SHOW ALL SUCCESS!",
                    records.length,
                    "records loaded"
                );

            } catch (error) {

                console.error("Show all error:", error);

                historyDiv.textContent =
                    "Unable to load records: " + error.message;
            }

        });


    // =====================================
    // INITIAL CALCULATION
    // =====================================

    calculateStock();

});
