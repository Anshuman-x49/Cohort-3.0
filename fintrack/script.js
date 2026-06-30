let activeUser = null;
let transactions = [];
let cashFlowChart = null;

const topBarName = document.getElementById('topBarName');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

const displayBalance = document.getElementById('displayBalance');
const displayIncome = document.getElementById('displayIncome');
const displayExpense = document.getElementById('displayExpense');
const displayCount = document.getElementById('displayCount');

const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const transactionTableBody = document.getElementById('transactionTableBody');
const emptyState = document.getElementById('emptyState');

const darkModeToggle = document.getElementById('darkModeToggle');
const resetDataBtn = document.getElementById('resetDataBtn');

const settingsForm = document.getElementById('settingsForm');
const settingName = document.getElementById('settingName');
const settingCurrency = document.getElementById('settingCurrency');

const transactionModal = document.getElementById('transactionModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const transactionForm = document.getElementById('transactionForm');
const modalTitle = document.getElementById('modalTitle');
const txIdInput = document.getElementById('txId');
const txTypeSelect = document.getElementById('txType');
const txDescriptionInput = document.getElementById('txDescription');
const txAmountInput = document.getElementById('txAmount');
const txDateInput = document.getElementById('txDate');
const txCategorySelect = document.getElementById('txCategory');

document.addEventListener('DOMContentLoaded', () => {
    const sessionData = localStorage.getItem('user');
    if (!sessionData) {
        window.location.replace('login.html');
        return;
    }
    activeUser = JSON.parse(sessionData);

    topBarName.textContent = activeUser.username;
    settingName.value = activeUser.username;
    settingCurrency.value = activeUser.currency || '$';

    initTheme();
    loadTransactions();
    initEventListeners();

    const today = new Date().toISOString().split('T')[0];
    txDateInput.value = today;

    renderDashboard();
});

function initTheme() {
    const savedTheme = localStorage.getItem('fintrack_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
    }
}

function toggleTheme(e) {
    const isDark = e.target.checked;
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('fintrack_theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('fintrack_theme', 'light');
    }
    
    if (cashFlowChart) {
        updateChartTheme();
    }
}

function loadTransactions() {
    const storageKey = `fintrack_transactions_${activeUser.username}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
        transactions = JSON.parse(stored);
    } else {
        transactions = [
            {
                id: 'sample-1',
                type: 'income',
                description: 'Salary Payment',
                amount: 3200.00,
                date: getOffsetDate(-6),
                category: 'Salary'
            },
            {
                id: 'sample-2',
                type: 'expense',
                description: 'Supermarket Groceries',
                amount: 142.50,
                date: getOffsetDate(-4),
                category: 'Food & Dining'
            },
            {
                id: 'sample-3',
                type: 'expense',
                description: 'Shopping Mall',
                amount: 185.00,
                date: getOffsetDate(-3),
                category: 'Shopping'
            },
            {
                id: 'sample-4',
                type: 'expense',
                description: 'Wifi Internet bill',
                amount: 80.00,
                date: getOffsetDate(-2),
                category: 'Utilities'
            },
            {
                id: 'sample-5',
                type: 'income',
                description: 'Freelance Design',
                amount: 650.00,
                date: getOffsetDate(-1),
                category: 'Other'
            },
            {
                id: 'sample-6',
                type: 'expense',
                description: 'Netflix subscription',
                amount: 14.99,
                date: getOffsetDate(0),
                category: 'Entertainment'
            }
        ];
        saveTransactions();
    }
}

function saveTransactions() {
    const storageKey = `fintrack_transactions_${activeUser.username}`;
    localStorage.setItem(storageKey, JSON.stringify(transactions));
}

function getOffsetDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

function renderDashboard() {
    const currency = activeUser.currency || '$';
    
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
        const val = parseFloat(tx.amount) || 0;
        if (tx.type === 'income') {
            totalIncome += val;
        } else {
            totalExpense += val;
        }
    });

    const currentBalance = totalIncome - totalExpense;

    displayBalance.textContent = formatCurrency(currentBalance, currency);
    displayIncome.textContent = formatCurrency(totalIncome, currency);
    displayExpense.textContent = formatCurrency(totalExpense, currency);
    displayCount.textContent = transactions.length;

    if (currentBalance >= 0) {
        displayBalance.className = '';
    } else {
        displayBalance.className = 'text-red';
    }

    renderTransactionsTable();
    renderChart();
}

function formatCurrency(value, symbol) {
    const absVal = Math.abs(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return value < 0 ? `-${symbol}${absVal}` : `${symbol}${absVal}`;
}

function renderTransactionsTable() {
    const currency = activeUser.currency || '$';
    const searchQuery = searchInput.value.trim().toLowerCase();
    const typeFilterVal = typeFilter.value;

    const filtered = transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchQuery) ||
                              tx.category.toLowerCase().includes(searchQuery);
        const matchesType = typeFilterVal === 'all' || tx.type === typeFilterVal;
        
        return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactionTableBody.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';

        filtered.forEach(tx => {
            const tr = document.createElement('tr');
            
            const amountVal = parseFloat(tx.amount) || 0;
            const formattedAmount = tx.type === 'income' 
                ? `+${currency}${amountVal.toFixed(2)}` 
                : `-${currency}${amountVal.toFixed(2)}`;
            const amountClass = tx.type === 'income' ? 'text-green font-semibold' : 'text-red font-semibold';

            const dateObj = new Date(tx.date);
            const formattedDate = dateObj.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td class="font-medium" style="color: var(--text-title);">${escapeHtml(tx.description)}</td>
                <td><span class="category-badge">${escapeHtml(tx.category)}</span></td>
                <td class="${amountClass}">${formattedAmount}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="icon-btn edit-btn" onclick="openEditModal('${tx.id}')" title="Edit">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="icon-btn delete-btn" onclick="deleteTransaction('${tx.id}')" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            `;
            transactionTableBody.appendChild(tr);
        });
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

function renderChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    const dailyMap = {};
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTx.forEach(tx => {
        const dateStr = tx.date;
        if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { income: 0, expense: 0 };
        }
        dailyMap[dateStr][tx.type] += parseFloat(tx.amount) || 0;
    });

    const allDates = Object.keys(dailyMap).sort();
    const displayDates = allDates.slice(-7);
    const incomes = displayDates.map(date => dailyMap[date].income);
    const expenses = displayDates.map(date => dailyMap[date].expense);

    const labels = displayDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? '#374151' : '#e2e8f0';
    const textThemeColor = isDark ? '#9ca3af' : '#64748b';

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomes,
                    backgroundColor: 'rgba(34, 197, 94, 0.85)',
                    borderRadius: 4,
                    maxBarThickness: 32
                },
                {
                    label: 'Expense',
                    data: expenses,
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    borderRadius: 4,
                    maxBarThickness: 32
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textThemeColor,
                        font: {
                            family: 'Plus Jakarta Sans',
                            weight: '600',
                            size: 11
                        },
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: isDark ? '#1f2937' : '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#e5e7eb',
                    borderColor: isDark ? '#374151' : '#e2e8f0',
                    borderWidth: 1,
                    titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    callbacks: {
                        label: function(context) {
                            const val = context.raw || 0;
                            return ` ${context.dataset.label}: ${activeUser.currency || '$'}${val.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textThemeColor,
                        font: {
                            family: 'Plus Jakarta Sans',
                            weight: '500'
                        }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textThemeColor,
                        font: {
                            family: 'Plus Jakarta Sans',
                            weight: '500'
                        },
                        callback: function(value) {
                            return (activeUser.currency || '$') + value;
                        }
                    }
                }
            }
        }
    });
}

function updateChartTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? '#374151' : '#e2e8f0';
    const textThemeColor = isDark ? '#9ca3af' : '#64748b';

    cashFlowChart.options.scales.y.grid.color = gridColor;
    cashFlowChart.options.scales.y.ticks.color = textThemeColor;
    cashFlowChart.options.scales.x.ticks.color = textThemeColor;
    cashFlowChart.options.plugins.legend.labels.color = textThemeColor;
    cashFlowChart.options.plugins.tooltip.backgroundColor = isDark ? '#1f2937' : '#0f172a';
    cashFlowChart.options.plugins.tooltip.borderColor = isDark ? '#374151' : '#e2e8f0';
    
    cashFlowChart.update();
}

function switchView(e) {
    e.preventDefault();
    const targetViewId = e.currentTarget.getAttribute('data-target');

    navItems.forEach(item => item.classList.remove('active'));
    e.currentTarget.classList.add('active');

    viewSections.forEach(section => {
        if (section.id === targetViewId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    if (targetViewId === 'dashboard-view') {
        setTimeout(renderChart, 100);
    }
}

function openAddModal() {
    modalTitle.textContent = 'Add Transaction';
    txIdInput.value = '';
    transactionForm.reset();
    
    const today = new Date().toISOString().split('T')[0];
    txDateInput.value = today;

    transactionModal.classList.add('active');
}

function openEditModal(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    modalTitle.textContent = 'Edit Transaction';
    txIdInput.value = tx.id;
    txTypeSelect.value = tx.type;
    txDescriptionInput.value = tx.description;
    txAmountInput.value = tx.amount;
    txDateInput.value = tx.date;
    txCategorySelect.value = tx.category;

    transactionModal.classList.add('active');
}

function closeTransactionModal() {
    transactionModal.classList.remove('active');
}

function handleTransactionFormSubmit(e) {
    e.preventDefault();

    const id = txIdInput.value;
    const type = txTypeSelect.value;
    const description = txDescriptionInput.value.trim();
    const amount = parseFloat(txAmountInput.value);
    const date = txDateInput.value;
    const category = txCategorySelect.value;

    if (!description || isNaN(amount) || amount <= 0 || !date || !category) {
        alert('Please fill out all fields correctly.');
        return;
    }

    if (id) {
        const idx = transactions.findIndex(t => t.id === id);
        if (idx !== -1) {
            transactions[idx] = { id, type, description, amount, date, category };
        }
    } else {
        const newTx = {
            id: 'tx-' + Date.now(),
            type,
            description,
            amount,
            date,
            category
        };
        transactions.push(newTx);
    }

    saveTransactions();
    closeTransactionModal();
    renderDashboard();
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderDashboard();
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data?')) {
        transactions = [];
        saveTransactions();
        renderDashboard();
    }
}

function handleSettingsFormSubmit(e) {
    e.preventDefault();

    const newName = settingName.value.trim();
    const newCurrency = settingCurrency.value;

    if (!newName) {
        alert('Please provide a name.');
        return;
    }

    activeUser.username = newName;
    activeUser.currency = newCurrency;
    localStorage.setItem('user', JSON.stringify(activeUser));

    const registered = localStorage.getItem('registeredUsers');
    if (registered) {
        let users = JSON.parse(registered);
        const uIdx = users.findIndex(u => u.username === activeUser.username);
        if (uIdx !== -1) {
            users[uIdx].currency = newCurrency;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
        }
    }

    topBarName.textContent = newName;

    alert('Profile configurations updated successfully!');
    
    const dashboardNav = document.querySelector('.nav-item[data-target="dashboard-view"]');
    if (dashboardNav) {
        dashboardNav.click();
    }
}

function initEventListeners() {
    logoutBtn.addEventListener('click', logoutUser);

    navItems.forEach(item => {
        item.addEventListener('click', switchView);
    });

    darkModeToggle.addEventListener('change', toggleTheme);
    resetDataBtn.addEventListener('click', resetAllData);

    openAddModalBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeTransactionModal);
    
    const modalOverlay = transactionModal.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeTransactionModal);
    }

    transactionForm.addEventListener('submit', handleTransactionFormSubmit);
    settingsForm.addEventListener('submit', handleSettingsFormSubmit);

    searchInput.addEventListener('input', renderTransactionsTable);
    typeFilter.addEventListener('change', renderTransactionsTable);
}
