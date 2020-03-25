// We will have 3 Modules
// 1. BudgetController
// 2. UIController
// 3. Data Controller

const INCOME_TYPE = 'inc';
const EXPENSE_TYPE = 'exp';

function Transaction(id, amount, description) {
  this.id = id;
  this.amount = amount;
  this.description = description;
}

// Inheritance .. :)
function IncomeTransaction(id, amount, description) {
  Transaction.call(this, id, amount, description);
  // You can add any specific properties here
  this.type = INCOME_TYPE;
}

function ExpenseTransaction(id, amount, description) { 
  Transaction.call(this, id, amount, description);
  this.type = EXPENSE_TYPE;
}

// Add specific methods
// Remember, you can add inside "ExpenseTransaction" too but that will be expensive for each Object creation
ExpenseTransaction.prototype.calculatePercentage = (total, totalExpenseAmount) => {
  return (totalExpenseAmount / total).toFixed(2) * 100;
}

const budgetDataController = (() => {
  const transactions = [];

  function addToIncome(transaction) {
    transactions.push(transaction);
    return transaction;
  }

  function addToExpenses(transaction) {
    transactions.push(transaction);
    return transaction;
  }

  function allTransactions() {
    return transactions;
  }

  return {
    incomeTransaction: function(transaction) {
      return addToIncome(transaction);
    },
    expenseTransaction: function (transaction) {
      return addToExpenses(transaction);
    },
    transactions: function() {
      return allTransactions();
    }
  };

})();

const budgetService = (dataCtrl => {

  function addToIncomeEvent(transaction) {
    return dataCtrl.incomeTransaction(transaction);
  }

  function addToExpensesEvent(transaction) {
    return dataCtrl.expenseTransaction(transaction);
  }

  function getAllTransactions() {
    return dataCtrl.transactions();
  }

  function filterTransactions(type) {
    return getAllTransactions().filter(trans => trans.type === type);
  }

  function calculateAmountByType(type) {
    let amountByType = 0;
    (filterTransactions(type) || []).forEach(trans => amountByType += trans.amount);
    return amountByType;
  }

  return {
    addTransaction: function(type, amount, description) {
      const id = getAllTransactions().length + 1;
      if (type === INCOME_TYPE) {
        return addToIncomeEvent(new IncomeTransaction(id, amount, description));
      } else {
        return addToExpensesEvent(new ExpenseTransaction(id, amount, description));
      }
    },
    getIncomeAmount: function() {
      return calculateAmountByType(INCOME_TYPE);
    },
    getExpenseAmount: function() {
      return calculateAmountByType(EXPENSE_TYPE);
    },
    transactions: function() {
      return getAllTransactions();
    },
    transactionsByType: function(type) {
      return filterTransactions(type);
    }
  };

})(budgetDataController);


var uiDomService = (() => {

  function elementByClassName(className) {
    return document.querySelector(`.${className}`);
  }

  function elementValueByClassName(className) {
    return document.querySelector(`.${className}`).value;
  }

  function setValueByClassName(className, value) {
    document.querySelector(`.${className}`).innerHTML = value;
  }

  function updateIncomeAndExpensesAmounts(totalIncomeAmount, totalExpenseAmount) {
    setValueByClassName('budget__value', `+ ${totalIncomeAmount - totalExpenseAmount}`);
    setValueByClassName('budget__income--value', `+ ${totalIncomeAmount}`);
    setValueByClassName('budget__expenses--value', `- ${totalExpenseAmount}`);
    setValueByClassName('budget__expenses--percentage', `${(totalExpenseAmount / totalIncomeAmount).toFixed(2) * 100}%`);
  }

  function appendToIncomeTransaction(transaction) {
    const newTransDiv = document.createElement('div'); // You can't directly add string to DOM element .. so create an element and append "HTML" string to DOM
    const renderedTransaction = `<div class="item clearfix" id="income-${transaction.id}">
      <div class="item__description">${transaction.description}</div>
      <div class="right clearfix">
        <div class="item__value">+ ${transaction.amount}</div>
        <div class="item__delete">
          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div>
      </div>
    </div>`;
    newTransDiv.innerHTML = renderedTransaction;
    elementByClassName('income__list').appendChild(newTransDiv);
  }

  function appendToExpenseTransaction(transaction, percentage) {
    const newTransDiv = document.createElement('div');
    const renderedTransaction = `
      <div class="item clearfix" id="expense-${transaction.id}">
          <div class="item__description">${transaction.description}</div>
          <div class="right clearfix">
              <div class="item__value">- ${transaction.amount}</div>
              <div class="item__percentage">${percentage}%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>
    `;
    newTransDiv.innerHTML = renderedTransaction;
    elementByClassName('expenses__list').appendChild(newTransDiv);
  }

  function updateTransactions(transaction, incomesTotal, expensesTotal) {
    if (transaction && transaction.type === INCOME_TYPE) {
      appendToIncomeTransaction(transaction);
    } else {
      appendToExpenseTransaction(transaction, transaction.calculatePercentage(incomesTotal, expensesTotal));
    }
  }

  function clearInputFields() {
    elementByClassName('add__value').value = '';
    elementByClassName('add__description').value = '';
  }

  return {
    getElementByClassName: function (className) { return elementByClassName(className); },
    getValueUsingClassName: className => { return elementValueByClassName(className); },
    setValueForElement: (className, value) => setValueByClassName(className, value),
    updateIncomeExpenses: (incomeAmt, expenseAmt) => updateIncomeAndExpensesAmounts(incomeAmt, expenseAmt),
    updateTransactions: (transaction, incomesTotal, expensesTotal) => updateTransactions(transaction, incomesTotal, expensesTotal),
    clearInputFields: () => clearInputFields()
  }
})();

const mainController = ((budgetSrv, uiDomSrv) => {
  const VALID_OPTIONS = [ INCOME_TYPE, EXPENSE_TYPE ];

  function submitUserData() {
    const selectOption = uiDomSrv.getValueUsingClassName('add__type');
    const amount = parseInt(uiDomSrv.getValueUsingClassName('add__value'), 10);
    const description = uiDomSrv.getValueUsingClassName('add__description');

    if (VALID_OPTIONS.includes(selectOption)) {
      updateAllObservers(selectOption, amount, description);
      uiDomSrv.clearInputFields();
      uiDomSrv.getElementByClassName('add__description').focus();
    } else {
      console.error('Wrong Choice');
    }
  }

  function updateAllObservers(type, amount, description) {
    const newTrans = budgetSrv.addTransaction(type, amount, description);
    uiDomSrv.updateIncomeExpenses(budgetSrv.getIncomeAmount(), budgetSrv.getExpenseAmount());
    uiDomSrv.updateTransactions(newTrans, budgetSrv.getIncomeAmount(), budgetSrv.getExpenseAmount());
  }

  uiDomSrv.setValueForElement('budget__title--month', `March ${new Date().getFullYear()}`);
  uiDomSrv.getElementByClassName('add__btn').addEventListener('click', () => submitUserData());
  uiDomSrv.getElementByClassName('add__value').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      submitUserData();
    }
  });

})(budgetService, uiDomService);
