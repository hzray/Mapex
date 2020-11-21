class Income {
    constructor(id, description, amount, category) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
    }
}

class Expense {
    constructor(id, description, amount, category) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.percentage = -1;
    }
    calPercentage() {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.amount / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
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
        expensePercent: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel:'.budget__title--month',
        inputCategory:'.add__category'
}



var extractInput = function() {
    return {
        type: $(DOMstrings.inputType).val(),
        description: $(DOMstrings.inputDescription).val(),
        amount: parseFloat($(DOMstrings.inputValue).val()),
        category: $(DOMstrings.inputCategory).val()
    }
}

var AddToBuffer = function(type, description, amount, category) {
    var id;
    if (type === 'inc') {
        if (incomeRecords.length === 0) {
            id = 0;
        } else {
            id = incomeRecords[incomeRecords.length-1].id + 1;
        }
        var income = new Income(id, description, amount, category);
        incomeRecords.push(income);
    } else if (type === 'exp') {
        if (expenseRecords.length === 0) {
            id = 0;
        } else {
            id = expenseRecords[expenseRecords.length-1].id + 1;
        }
        var expense = new Expense(id, description, amount, category);
        expenseRecords.push(expense);
    }
}

var AddToListView = function(type) {
    
    var item, html, newhtml, element;
    
    // Create HTML String with placeholder text
    if (type === 'inc') {
        item = incomeRecords[incomeRecords.length-1];
        element = DOMstrings.incomeList;
        html  = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
        <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
        </button></div></div></div>'
    }   
   
    else if (type === 'exp') {
        item = expenseRecords[expenseRecords.length-1];
        element = DOMstrings.expenseList;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
        <div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
        </button></div></div></div>'
    }

    newhtml = html.replace('%id%', item.id);
    newhtml = newhtml.replace('%description%', item.description);
    newhtml = newhtml.replace('%value%', formatNumber(item.amount, type));
    
    // Insert the HTML into the DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
}

var cleanInputField = function() {
    $(DOMstrings.inputDescription).val('');
    $(DOMstrings.inputValue).val('');
}


// The part done by C++
var updateTotals = function() {

    totalIncome = 0;
    totalExpenses = 0;
    for (i in incomeRecords) {
        totalIncome += incomeRecords[i].amount;
    }
    for (i in expenseRecords) {
        totalExpenses += expenseRecords[i].amount;
    }

    $(DOMstrings.incomeTotal).text(formatNumber(totalIncome, 'inc'))
    $(DOMstrings.expenseTotal).text(formatNumber(totalExpenses, 'exp'))
    
}

var updatePercentageView = function() {
    if (totalIncome == 0) {
        document.querySelector(DOMstrings.expensePercent).textContent = '---';
    } else {
        expensePercentage = Math.round((totalExpenses/totalIncome) * 100);
        document.querySelector(DOMstrings.expensePercent).textContent = expensePercentage + '%';
    }
}

var updateBudgetView = function() {
    var netBudget, symbol;
    updateTotals();
    netBudget = totalIncome - totalExpenses;
    type = netBudget > 0 ? 'inc':'exp';
    document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(netBudget, type);
}


var updateExpenseItemPercentage = function() {
    // 1. Calculate percentages
    calculateItemPercentage();
    // 2. Read percentages 
    var percentages = getPercentages();
    // 3. Update the UI with the new percentages
    displayPercentages(percentages)
}



var calculateItemPercentage = function() {
     expenseRecords.forEach(function(exp){
        exp.calPercentage();
     });
}

var getPercentages = function() {
    var allPerc = expenseRecords.map(function(cur) {
        return cur.percentage;
    });
    return allPerc;
}
var displayPercentages = function(percentages) {
    var fields = document.querySelectorAll(DOMstrings.expensePercLabel);
    nodeListForEach(fields, function(current, index){
        if (percentages[index] >= 0) {
            current.textContent = percentages[index] + '%';
        } else {
            current.textContent = '---';
        }
       
    })
}

var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
    }
};



var addItem = function() {
    // 1. Get field data, return if info is incomplete
    var info = extractInput();
    if (!info.description || !info.amount || isNaN(info.amount) || info.amount < 0) {
        alert('incorrect input~');
        return;
    }
    // 2. Add the item to corresponding records buffer 
    AddToBuffer(info.type, info.description, info.amount, info.category);
    // 3. Update UI
    AddToListView(info.type);
    updateBudgetView();
    updatePercentageView();
    updateExpenseItemPercentage();
    // 4. Clear input fields
    cleanInputField();

}


var deleteFromBuffer = function(type, id) {
     var record, ids, index;
     if (type === 'inc') {
         record = incomeRecords;
     } else {
         record = expenseRecords;
     }
     ids = record.map(function(current){
         return current.id;
     })

     index = ids.indexOf(parseInt(id));
     
     if (index !== -1) {
         record.splice(index, 1); 
     }
}

var deleteFromListView = function(selectorID) {
    // we can only remove child
    var el = document.getElementById(selectorID);
    el.parentNode.removeChild(el);
}

var deleteItem = function(event) {
    var itemID, splitID, type, id;
    itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id); 
    if (itemID) {
        // inc-1
        splitID = itemID.split('-');
        type = splitID[0];
        id = splitID[1];

        // 1.delete item from data structure
        deleteFromBuffer(type, id); 
        // 2.delete the item from UI
        deleteFromListView(itemID)
        // 3.update budget.
        updateBudgetView();
        // 4.update percentage
        updatePercentageView();
        // 5.update expense item percentage
        updateExpenseItemPercentage();
    }
}

var formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2); 
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
        int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,int.length);
    }
    dec = numSplit[1];

    type === 'exp' ? sign = '-' : sign = '+';
    return sign + ' ' + int + '.' + dec;
}
    
var displayMonth = function() {
    var months, now, year, month;
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     now = new Date();
    month = now.getMonth();
    year = now.getFullYear();
    document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
}


var changeType = function() {
    var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' + DOMstrings.inputCategory +',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

    nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
    });

    document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    //
    var expOption = '<option value="housing" selected>Housing</option>\
                        <option value="transport">Transportation</option>\
                        <option value="food">Food</option>\
                        <option value="cloth">Clothing</option>\
                        <option value="education">Education</option>\
                        <option value="leisure">Leisure</option>\
                        <option value="loan">Loan</option>\
                        <option value="exp_other">Other</option>'
    
    var incOption  = '<option value="salary" selected>Salary</option>\
                      <option value="saving">Saving</option>\
                      <option value="investment">Investment</option>\
                      <option value="pension">Pesion</option>\
                      <option value="inc_other">Other</option>'
    
    if (document.querySelector(DOMstrings.inputType).value == 'inc') {
        $(DOMstrings.inputCategory).html(incOption);
    } else {
        $(DOMstrings.inputCategory).html(expOption);
    }
                      
}


var setupEventListener = (function() {
	console.log('123');
    // set up add item listner
    document.querySelector(DOMstrings.inputBtn).addEventListener('click', addItem);
    document.addEventListener('keypress', function(event) {
        if (event.code == 'Enter') {
            addItem();
        }
    });
    // set up delete item listner
    document.querySelector(DOMstrings.container).addEventListener('click', deleteItem);

    // change listener
    document.querySelector(DOMstrings.inputType).addEventListener('change', changeType);

    // sep up time
    displayMonth();
})() 




