document.addEventListener('DOMContentLoaded', () => {
// --- SELECTING HTML ELEMENTS ---
            const transactionForm = document.getElementById('transaction-form');
            const transactionTypeInput = document.getElementById('type');
            const transactionDescriptionInput = document.getElementById('description');
            const transactionAmountInput = document.getElementById('amount');
            const transactionList = document.getElementById('transaction-list');
            const totalIncomeDisplay = document.getElementById('total-income');
            const totalExpensesDisplay = document.getElementById('total-expenses');
            const balanceDisplay = document.getElementById('balance');
            const filterTypeSelect = document.getElementById('filter-type');

            // --- GLOBAL STATE ---
            let transactions = loadTransactionsFromCookies();

            // --- EVENT LISTENERS ---
            transactionForm.addEventListener('submit', handleAddTransaction);
            transactionList.addEventListener('click', handleDeleteTransaction);
            filterTypeSelect.addEventListener('change', renderTransactions);

            // --- INITIAL RENDER ---
            renderTransactions();
            updateSummary();

            // --- FUNCTIONS ---

            /**
             * Handles the addition of a new transaction.
             * @param {Event} event - The submit event of the form.
             */
            function handleAddTransaction(event) {
                event.preventDefault();

                const type = transactionTypeInput.value;
                const description = transactionDescriptionInput.value.trim();
                const amount = parseFloat(transactionAmountInput.value);

                if (description === '' || isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid description and amount.');
                    return;
                }

                const newTransaction = {
                    id: generateId(),
                    type,
                    description,
                    amount,
                };

                transactions.push(newTransaction);
                saveTransactionsToCookies();
                renderTransactions();
                updateSummary();

                transactionDescriptionInput.value = '';
                transactionAmountInput.value = '';
                transactionTypeInput.value = 'income'; // Reset to default
            }

            /**
             * Handles the deletion of a transaction.
             * @param {Event} event - The click event on the transaction list.
             */
            function handleDeleteTransaction(event) {
                if (event.target.classList.contains('delete-btn')) {
                    const transactionId = parseInt(event.target.dataset.id);
                    transactions = transactions.filter(t => t.id !== transactionId);
                    saveTransactionsToCookies();
                    renderTransactions();
                    updateSummary();
                }
            }

            /**
             * Renders the transaction list based on the current filter.
             */
            function renderTransactions() {
                transactionList.innerHTML = '';
                const filterValue = filterTypeSelect.value;

                const filteredTransactions = transactions.filter(transaction => {
                    if (filterValue === 'all') return true;
                    return transaction.type === filterValue;
                });

                if (filteredTransactions.length === 0) {
                    transactionList.innerHTML = '<li class="text-gray-500 text-center py-2">No transactions yet.</li>';
                    return;
                }

                filteredTransactions.forEach(transaction => {
                    const listItem = document.createElement('li');
                    listItem.className = `transaction-item ${transaction.type}-item`;
                    listItem.innerHTML = `
                        <div class="description-amount">
                            <span class="description">${transaction.description}</span>
                            <span class="${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold">
                                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                            </span>
                         </div>
                        <button class="delete-btn" data-id="${transaction.id}">X</button>
                    `;
                    transactionList.appendChild(listItem);
                });
            }

            /**
             * Updates the summary (total income, expenses, and balance).
             */
            function updateSummary() {
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((acc, t) => acc + t.amount, 0);
                const expenses = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, t) => acc + t.amount, 0);
                const balance = income - expenses;

                totalIncomeDisplay.textContent = `$${income.toFixed(2)}`;
                totalExpensesDisplay.textContent = `$${expenses.toFixed(2)}`;
                balanceDisplay.textContent = `$${balance.toFixed(2)}`;

                if (balance < 0) {
                    balanceDisplay.classList.remove('text-blue-500', 'text-green-500');
                    balanceDisplay.classList.add('text-red-500');
                } else if (balance > 0) {
                    balanceDisplay.classList.remove('text-blue-500', 'text-red-500');
                    balanceDisplay.classList.add('text-green-500');
                } else {
                    balanceDisplay.classList.remove('text-red-500', 'text-green-500');
                    balanceDisplay.classList.add('text-blue-500');
                }
            }

            /**
             * Generates a unique ID for a transaction.
             * @returns {number} A unique ID.
             */
            function generateId() {
                return Date.now();
            }

            /**
             * Saves transactions to cookies.
             */
            function saveTransactionsToCookies() {
                const transactionsJson = JSON.stringify(transactions);
                let expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                document.cookie = `transactions=${transactionsJson};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;
                console.log("Transactions saved to cookies.");
            }

            /**
             * Loads transactions from cookies.
             * @returns {Array} The array of transactions from the cookie, or an empty array if no cookie is found or parsing fails.
             */
            function loadTransactionsFromCookies() {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    cookie = cookie.trim();
                    if (cookie.startsWith('transactions=')) {
                        const transactionsJson = cookie.substring('transactions='.length);
                        try {
                            const parsedTransactions = JSON.parse(transactionsJson);
                            console.log("Transactions loaded from cookies:", parsedTransactions);
                            return parsedTransactions;
                        } catch (error) {
                            console.error("Error parsing transactions from cookies:", error);
                            return [];
                        }
                    }
                }
                console.log("No transactions found in cookies.");
                return [];
            }
            });