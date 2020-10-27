/* Function Constructors */
function Income(id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
}

function Expense(id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
}


/* Shared Variables */
var expenseRecords = []; // Array of Expense objects
var incomeRecords = []; // Array of Income objects
var totalExpenses = 0;
var totalIncome = 0;
var expensePercentage = 0.0;

var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeTotal: '.budget__income--value',
        expenseTotal: '.budget__expenses--value',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetValue: '.budget__value',
        expensePercent: '.budget__expenses--percentage'
}





var extractInput = function() {
    return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        amount: parseFloat(document.querySelector(DOMstrings.inputValue).value),
    }
}

var updateBuffer = function(type, description, amount) {
    var id;
    if (type === 'inc') {
        if (incomeRecords.length === 0) {
            id = 0;
        } else {
            id = incomeRecords[incomeRecords.length-1].id + 1;
        }
        var income = new Income(id, description, amount);
        incomeRecords.push(income);
    } else if (type === 'exp') {
        if (expenseRecords.length === 0) {
            id = 0;
        } else {
            id = expenseRecords[expenseRecords.length-1].id + 1;
        }
        var expense = new Expense(expenseRecords.length, description, amount);
        expenseRecords.push(expense);
    }
}

var updateList = function(type) {
    
    var item, html, newhtml, element;
    
    // Create HTML String with placeholder text
    if (type === 'inc') {
        item = incomeRecords[incomeRecords.length-1];
        console.log(item);
        element = DOMstrings.incomeList;
        html  = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
        <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
        </button></div></div></div>'
    }
   
    else if (type === 'exp') {
        item = expenseRecords[expenseRecords.length-1];
        element = DOMstrings.expenseList;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
        <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
        </button></div></div></div>'
    }

    newhtml = html.replace('%id%', item.id);
    newhtml = newhtml.replace('%description%', item.description);
    newhtml = newhtml.replace('%value%', item.amount);
    
    // Insert the HTML into the DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
}

var cleanInputField = function() {
    document.querySelector(DOMstrings.inputDescription).value = '';
    document.querySelector(DOMstrings.inputValue).value = '';
}


// The part done by C++
var updateTotals = function(type, amount) {
    if (type === 'inc') {
        totalIncome += amount;
        document.querySelector(DOMstrings.incomeTotal).textContent = '+' + totalIncome;
    } else if (type === 'exp') {
        totalExpenses += amount;
        document.querySelector(DOMstrings.expenseTotal).textContent = '-' + totalExpenses;
    }
}

var updatePercentage = function() {
    if (totalIncome == 0) {
        document.querySelector(DOMstrings.expensePercent).textContent = '---';
    } else {
        expensePercentage = Math.round((totalExpenses/totalIncome) * 100);
        document.querySelector(DOMstrings.expensePercent).textContent = expensePercentage + '%';
    }
   
    
}


var updateBudget = function(type, amount) {
    var netBudget, symbol;
    updateTotals(type, amount);
    netBudget = totalIncome - totalExpenses;
    symbol = netBudget >= 0 ? '+' : '-';
    document.querySelector(DOMstrings.budgetValue).textContent = symbol + Math.abs(netBudget);
    updatePercentage();
}

var addItem = function() {
    // 1. Get field data, return if info is incomplete
    var info = extractInput();
    if (!info.description || !info.amount || isNaN(info.amount) || info.amount < 0) {
        alert('incorrect input~');
        return;
    }
    // 2. Add the item to corresponding records buffer 
    updateBuffer(info.type, info.description, info.amount);
    // 3. Update UI
    updateList(info.type);
    updateBudget(info.type, info.amount);
    // 4. Clear input fields
    cleanInputField();
}

var setupEventListener = (function() {
    // set up add item listner
    document.querySelector(DOMstrings.inputBtn).addEventListener('click', addItem);
    document.addEventListener('keypress', function(event) {
        if (event.code == 'Enter') {
            addItem();
        }
    });
})()







