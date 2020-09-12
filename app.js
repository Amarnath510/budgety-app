// We will have various Modules

const INCOME_TYPE = 'inc';
const EXPENSE_TYPE = 'exp';
let transactionCounter = 0;

function Transaction(id, amount, description) {
  this.id = id;
  this.amount = amount;
  this.description = description;
}

// Inheritance .. :)
function IncomeTransaction(id, amount, description) {
  Transaction.call(this, id, amount, description); // This classical inheritance. But if there are any methods in "Transaction" then that won't be inherited.
                                                   // Hence we need to use Object.create along with "call".
                                                   // Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  // You can add any specific properties here
  this.type = INCOME_TYPE;
}
IncomeTransaction.prototype = Object.create(Transaction.prototype); // We also need to set constructor of IncomeTransaction to itself 
                                                                    // else Object.create will make Transaction as default constructor
IncomeTransaction.prototype.constructor = IncomeTransaction;

function ExpenseTransaction(id, amount, description) { 
  Transaction.call(this, id, amount, description);
  this.type = EXPENSE_TYPE;
}
ExpenseTransaction.prototype = Object.create(Transaction.prototype);
ExpenseTransaction.prototype.constructor = ExpenseTransaction;

// Add specific methods
// Remember, you can add inside "ExpenseTransaction" too but that will be expensive for each Object creation
ExpenseTransaction.prototype.calculatePercentage = (total, totalExpenseAmount) => {
  if (total === 0) {
    return '-';
  } else {
    return (totalExpenseAmount / total).toFixed(2) * 100;
  }
}

const budgetDataController = (() => {
  const transactions = [];

  // private methods
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

  function deleteTransaction(id) {
    const indexToBeDeleted = transactions.findIndex(trans => trans.id === id);
    transactions.splice(indexToBeDeleted, 1);
  }

  return {
    // public methods
    incomeTransaction: function(transaction) {
      return addToIncome(transaction);
    },
    expenseTransaction: function (transaction) {
      return addToExpenses(transaction);
    },
    transactions: function() {
      return allTransactions();
    },
    deleteTransaction: (id) => {
      return deleteTransaction(id);
    }
  };

})();

const budgetService = (dataCtrl => {

  // private methods
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

  function deleteTransaction(id) {
    return dataCtrl.deleteTransaction(id);
  }

  return {
    // public methods
    addTransaction: function(type, amount, description) {
      const id = ++transactionCounter;
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
    },
    deleteTransaction: (id) => {
      return deleteTransaction(id);
    }
  };

})(budgetDataController);


var uiDomService = (() => {
  // private methods
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
    const totalAvailableBudget = totalIncomeAmount - totalExpenseAmount;
    setValueByClassName('budget__value', `+ ${ totalAvailableBudget > 0 ? totalAvailableBudget : 0 }`);
    setValueByClassName('budget__income--value', `+ ${totalIncomeAmount}`);
    setValueByClassName('budget__expenses--value', `- ${totalExpenseAmount}`);
    const percentage = totalIncomeAmount !== 0 ? ((totalExpenseAmount / totalIncomeAmount).toFixed(2) * 100) : '-';
    setValueByClassName('budget__expenses--percentage', `${percentage}%`);
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

  function deleteTransaction(transEleId) {
    if (transEleId) {
      const ancestorEle = document.querySelector(`#${transEleId}`).parentNode.parentNode;
      ancestorEle.removeChild(document.querySelector(`#${transEleId}`).parentNode);
    }
  }

  return {
    // public methods
    getElementByClassName: function (className) { return elementByClassName(className); },
    getValueUsingClassName: className => { return elementValueByClassName(className); },
    setValueForElement: (className, value) => setValueByClassName(className, value),
    updateIncomeAndExpenses: (incomeAmt, expenseAmt) => updateIncomeAndExpensesAmounts(incomeAmt, expenseAmt),
    updateTransactions: (transaction, incomesTotal, expensesTotal) => updateTransactions(transaction, incomesTotal, expensesTotal),
    deleteTransactionFromDom: (transEleId) => deleteTransaction(transEleId),
    clearInputFields: () => clearInputFields()
  }
})();

const mainController = ((budgetSrv, uiDomSrv) => {
  const VALID_OPTIONS = [ INCOME_TYPE, EXPENSE_TYPE ];

  // private methods
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

  function deleteTransaction(event) {
    const transEleId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (transEleId) {
      uiDomSrv.deleteTransactionFromDom(transEleId);
      budgetSrv.deleteTransaction(parseInt(transEleId.split('-')[1]), 10);
      uiDomSrv.updateIncomeAndExpenses(budgetSrv.getIncomeAmount(), budgetSrv.getExpenseAmount());
    }
  }

  function updateAllObservers(type, amount, description) {
    const newTrans = budgetSrv.addTransaction(type, amount, description);
    uiDomSrv.updateIncomeAndExpenses(budgetSrv.getIncomeAmount(), budgetSrv.getExpenseAmount());
    uiDomSrv.updateTransactions(newTrans, budgetSrv.getIncomeAmount(), budgetSrv.getExpenseAmount());
  }

  function init() {
    uiDomSrv.setValueForElement('budget__title--month', `March ${new Date().getFullYear()}`);
    uiDomSrv.getElementByClassName('add__btn').addEventListener('click', () => submitUserData());
    uiDomSrv.getElementByClassName('add__value').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitUserData();
      }
    });
    uiDomSrv.getElementByClassName('container').addEventListener('click', (event) => deleteTransaction(event));
  }

  return {
    // public methods
    init: () => init()
  }

})(budgetService, uiDomService);

// Start from here
mainController.init();
