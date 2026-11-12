"use strict";

(() => {
    const STORAGE_KEY = "ponto-claro-transactions-v1";
    const THEME_STORAGE_KEY = "ponto-claro-theme";
    const form = document.querySelector("#transactionForm");
    const descriptionInput = document.querySelector("#description");
    const amountInput = document.querySelector("#amount");
    const typeInput = document.querySelector("#type");
    const monthFilter = document.querySelector("#monthFilter");
    const transactionList = document.querySelector("#transactionList");
    const emptyStatement = document.querySelector("#emptyStatement");
    const formMessage = document.querySelector("#formMessage");
    const statementPeriod = document.querySelector("#statementPeriod");
    const balanceCard = document.querySelector("#balanceCard");
    const balanceTotal = document.querySelector("#balanceTotal");
    const balanceCaption = document.querySelector("#balanceCaption");
    const incomeTotal = document.querySelector("#incomeTotal");
    const expenseTotal = document.querySelector("#expenseTotal");
    const balanceAlert = document.querySelector("#balanceAlert");
    const themeToggle = document.querySelector("#themeToggle");
    const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle-icon") : null;
    const submitButton = form.querySelector('button[type="submit"]');
    const currencyFormatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    const dateFormatter = new Intl.DateTimeFormat("pt-BR");

    let transactions = [];
    let storageReady = true;

    function currentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    function currentDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }

    function isTransaction(value) {
        if (value === null || typeof value !== "object") {
            return false;
        }

        const dateParts = typeof value.date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.date) : null;
        if (!dateParts) {
            return false;
        }

        const [, year, month, day] = dateParts;
        const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

        return typeof value.id === "string"
            && typeof value.description === "string"
            && value.description.trim().length > 0
            && Number.isSafeInteger(value.amountInCents)
            && value.amountInCents > 0
            && (value.type === "income" || value.type === "expense")
            && parsedDate.getUTCFullYear() === Number(year)
            && parsedDate.getUTCMonth() === Number(month) - 1
            && parsedDate.getUTCDate() === Number(day);
    }

    function reportStorageError(message) {
        storageReady = false;
        formMessage.textContent = message;
        formMessage.classList.add("is-error");
        formMessage.setAttribute("role", "alert");
        submitButton.disabled = true;
    }

    function loadTransactions() {
        let storedValue;
        try {
            storedValue = window.localStorage.getItem(STORAGE_KEY);
        } catch {
            reportStorageError("Não foi possível acessar o armazenamento deste navegador. Seus registros não foram carregados.");
            return;
        }

        if (storedValue === null) {
            transactions = [];
            return;
        }

        let parsedValue;
        try {
            parsedValue = JSON.parse(storedValue);
        } catch {
            reportStorageError("Os registros salvos não puderam ser lidos. Os dados existentes foram preservados.");
            return;
        }

        if (!Array.isArray(parsedValue) || !parsedValue.every(isTransaction)) {
            reportStorageError("Os registros salvos têm um formato inválido. Os dados existentes foram preservados.");
            return;
        }

        transactions = parsedValue;
    }

    function saveTransactions(nextTransactions) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTransactions));
        } catch {
            reportStorageError("Não foi possível salvar. Verifique o espaço disponível no navegador e tente novamente.");
            return false;
        }

        transactions = nextTransactions;
        return true;
    }

    function selectedTransactions() {
        const month = monthFilter.value;
        return transactions.filter((transaction) => transaction.date.slice(0, 7) === month);
    }

    function setFormMessage(message, isError = false) {
        formMessage.textContent = message;
        formMessage.classList.toggle("is-error", isError);
        formMessage.setAttribute("role", isError ? "alert" : "status");
    }

    function renderSummary(monthTransactions) {
        let incomeInCents = 0;
        let expenseInCents = 0;

        for (const transaction of monthTransactions) {
            if (transaction.type === "income") {
                incomeInCents += transaction.amountInCents;
            } else {
                expenseInCents += transaction.amountInCents;
            }
        }

        const balanceInCents = incomeInCents - expenseInCents;
        const balanceIsNegative = balanceInCents < 0;

        incomeTotal.textContent = currencyFormatter.format(incomeInCents / 100);
        expenseTotal.textContent = currencyFormatter.format(expenseInCents / 100);
        balanceTotal.textContent = currencyFormatter.format(balanceInCents / 100);
        balanceCaption.textContent = "Entradas menos saídas do mês selecionado.";
        balanceCard.classList.toggle("is-negative", balanceIsNegative);
        balanceAlert.hidden = !balanceIsNegative;

        if (balanceIsNegative) {
            balanceAlert.textContent = `As saídas superam as entradas em ${currencyFormatter.format(Math.abs(balanceInCents) / 100)} neste mês.`;
        } else {
            balanceAlert.textContent = "";
        }
    }

    function renderTransactions(monthTransactions) {
        transactionList.replaceChildren();
        emptyStatement.hidden = monthTransactions.length > 0;

        const rows = monthTransactions
            .slice()
            .sort((first, second) => second.date.localeCompare(first.date) || second.id.localeCompare(first.id));

        for (const transaction of rows) {
            const row = document.createElement("tr");
            const descriptionCell = document.createElement("th");
            const dateCell = document.createElement("td");
            const typeCell = document.createElement("td");
            const amountCell = document.createElement("td");
            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            descriptionCell.scope = "row";
            descriptionCell.className = "transaction-description";
            descriptionCell.textContent = transaction.description;

            dateCell.className = "transaction-date";
            dateCell.textContent = dateFormatter.format(new Date(`${transaction.date}T00:00:00`));

            typeCell.className = "transaction-type";
            typeCell.textContent = transaction.type === "income" ? "Entrada" : "Saída";

            amountCell.className = `transaction-amount ${transaction.type === "income" ? "is-income" : "is-expense"}`;
            amountCell.textContent = `${transaction.type === "income" ? "+" : "−"} ${currencyFormatter.format(transaction.amountInCents / 100)}`;

            deleteButton.className = "delete-button";
            deleteButton.type = "button";
            deleteButton.dataset.transactionId = transaction.id;
            deleteButton.textContent = "Excluir";
            deleteButton.setAttribute("aria-label", `Excluir ${transaction.description}`);

            actionCell.append(deleteButton);
            row.append(descriptionCell, dateCell, typeCell, amountCell, actionCell);
            transactionList.append(row);
        }
    }

    function applyTheme(theme) {
        const nextTheme = theme === "dark" ? "dark" : "light";
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        document.documentElement.dataset.theme = nextTheme;

        if (themeMeta) {
            themeMeta.setAttribute("content", nextTheme === "dark" ? "#0c1620" : "#082b45");
        }

        if (themeToggle) {
            const isDarkMode = nextTheme === "dark";
            themeToggle.setAttribute("aria-label", isDarkMode ? "Alternar para tema claro" : "Alternar para tema escuro");
            themeToggle.setAttribute("aria-pressed", String(isDarkMode));
            if (themeIcon) {
                themeIcon.textContent = isDarkMode ? "☀" : "☾";
            }
        }

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
            // A preferência visual continua funcional sem persistência.
        }
    }

    function initializeTheme() {
        let preferredTheme = "light";

        try {
            const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (storedTheme === "dark" || storedTheme === "light") {
                preferredTheme = storedTheme;
            }
        } catch {
            preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        if (!themeToggle) {
            document.documentElement.dataset.theme = preferredTheme;
            return;
        }

        applyTheme(preferredTheme);
    }

    function render() {
        const monthTransactions = selectedTransactions();
        statementPeriod.textContent = new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric"
        }).format(new Date(`${monthFilter.value}-01T00:00:00`));
        renderSummary(monthTransactions);
        renderTransactions(monthTransactions);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const activeTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(activeTheme);
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!storageReady) {
            return;
        }

        if (!form.reportValidity()) {
            return;
        }

        const description = descriptionInput.value.trim();
        const amount = Number(amountInput.value);
        const amountInCents = Math.round(amount * 100);

        if (!description || !Number.isFinite(amount) || !Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
            setFormMessage("Informe uma descrição e um valor válido maior que zero.", true);
            return;
        }

        const transaction = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            description,
            amountInCents,
            type: typeInput.value,
            date: currentDate()
        };
        const nextTransactions = [...transactions, transaction];

        if (!saveTransactions(nextTransactions)) {
            return;
        }

        form.reset();
        monthFilter.value = transaction.date.slice(0, 7);
        render();
        setFormMessage("Movimentação adicionada ao extrato.");
        descriptionInput.focus();
    });

    monthFilter.addEventListener("change", render);

    transactionList.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const deleteButton = target.closest("button[data-transaction-id]");
        if (!(deleteButton instanceof HTMLButtonElement) || !storageReady) {
            return;
        }

        const transactionId = deleteButton.dataset.transactionId;
        const transaction = transactions.find((item) => item.id === transactionId);
        if (!transaction) {
            return;
        }

        const confirmed = window.confirm(`Deseja excluir "${transaction.description}" do extrato?`);
        if (!confirmed) {
            return;
        }

        const monthRows = Array.from(transactionList.querySelectorAll("button[data-transaction-id]"));
        const deletedIndex = monthRows.indexOf(deleteButton);
        const nextTransactions = transactions.filter((item) => item.id !== transactionId);
        if (!saveTransactions(nextTransactions)) {
            return;
        }

        render();
        const remainingButtons = transactionList.querySelectorAll("button[data-transaction-id]");
        const focusTarget = remainingButtons[Math.min(deletedIndex, remainingButtons.length - 1)];
        (focusTarget ?? descriptionInput).focus();
        setFormMessage("Movimentação excluída.");
    });

    monthFilter.value = currentMonth();
    initializeTheme();
    loadTransactions();
    render();
})();