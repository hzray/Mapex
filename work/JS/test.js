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
        if (budgetController.getTotalIncome() > 0) {
            this.percentage = Math.round(((this.amount / budgetController.getTotalIncome()) * 100));
        } else {
            this.percentage = -1;
        }
    }
}



var budgetController = (function() {
    var expenseRecords = []; // Array of Expense objects
    var incomeRecords = []; // Array of Income objects
    var totalExpenses = 0;
    var totalIncome = 0;
    var expensePercentage = 0.0;
    var netBudget = 0;

    return {
        addItemToBuffer: function(type, description, amount, category) {
            var id;
            if (type === 'inc') {
                id = incomeRecords.length === 0 ? 0 : incomeRecords[incomeRecords.length-1].id + 1;
                incomeRecords.push(new Income(id, description, amount, category));
            } else if (type === 'exp') {
                id = expenseRecords.length === 0 ? 0 : expenseRecords[expenseRecords.length-1].id + 1;
                expenseRecords.push(new Expense(id, description, amount, category));
            }
        },

        deleteFromBuffer: function(type, id) {
            var record, ids, index;
            record = type==='inc'? incomeRecords:expenseRecords;
            ids = record.map(function(current){
                return current.id;
            })
            index = ids.indexOf(parseInt(id));
            if (index !== -1) {
                record.splice(index, 1); 
            }
       },


         // The part done by C++
         updateTotals: function() {
            totalIncome = 0;
            totalExpenses = 0;
            for (item in incomeRecords) {
                totalIncome += incomeRecords[item].amount;
            }
            for (item in expenseRecords) {
                totalExpenses += expenseRecords[item].amount;
            }
        },

        updateExpensePercentage: function() {
            if (totalIncome == 0) {
                expensePercentage = -1;
            } else {
                expensePercentage = Math.round((totalExpenses/totalIncome) * 100);
            }
        },

        updateItemPercentage: function() {
            expenseRecords.forEach(function(exp){
               exp.calPercentage();
            });
       },

        updateNetBudget: function() {
            netBudget = totalIncome - totalExpenses;
        },

        getNetBudget: function() {
            return netBudget;
        },

        getExpensePercentage: function() {
            return expensePercentage;
        },

        getTotalExpenses: function() {
            return totalExpenses;
        },

        getTotalIncome: function() {
            return totalIncome;
        },

        getPercentages: function() {
            var allPerc = expenseRecords.map(function(cur) {
                return cur.percentage;
            });
            return allPerc;
        },
        getLastItem: function(type) {
            if (type === 'inc') {
                return incomeRecords[incomeRecords.length-1];
            } else {
                return expenseRecords[expenseRecords.length-1];
            }
        }
    }
}())



var ViewController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputAmount: '.add__value',
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
    };

    var displayPercentages = function(percentages) {
        var fields = document.querySelectorAll(DOMstrings.expensePercLabel);
        nodeListForEach(fields, function(current, index){
            if (percentages[index] >= 0) {
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
        })
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    

    return {
        addItemToListView: function(type) {
            var item, html, newhtml, element;
            // Create HTML String with placeholder text
            item = budgetController.getLastItem(type);

            if (type === 'inc') {
                element = DOMstrings.incomeList;
                html  = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
                <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
                </button></div></div></div>'
            }   
           
            else if (type === 'exp') {
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
        },

        deleteFromListView: function(selectorID) {
            // we can only remove child
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        cleanInputField: function() {
            $(DOMstrings.inputDescription).val('');
            $(DOMstrings.inputAmount).val('');
        },

        // The part done by C++
        updateTotalsView: function() {
            var totalIncome, totalExpenses;
            totalIncome = budgetController.getTotalIncome();
            totalExpenses = budgetController.getTotalExpenses();
            $(DOMstrings.incomeTotal).text(formatNumber(totalIncome, 'inc'))
            $(DOMstrings.expenseTotal).text(formatNumber(totalExpenses, 'exp'))
        },

        updatePercentageView: function() {
            var expensePercentage = budgetController.getExpensePercentage();
            if (expensePercentage < 0) {
                $(DOMstrings.expensePercent).text('---')
            } else {
                $(DOMstrings.expensePercent).text(expensePercentage + '%');
            }
        },

        updateBudgetView: function() {

            var netBudget, type;
            netBudget = budgetController.getNetBudget();
            type = netBudget > 0 ? 'inc':'exp';
            $(DOMstrings.budgetValue).text(formatNumber(netBudget, type));
        },

        updateExpenseItemPercentageView: function() {
            // 1. Read percentages 
            var percentages = budgetController.getPercentages();
            // 2. Update the UI with the new percentages
            displayPercentages(percentages)
        },

        changeType: function() {
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
        },
        displayMonth: function() {
            var months, now, year, month;
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            $(DOMstrings.dateLabel).text(months[month] + ' ' + year );
        },
        extractInput: function() {
            return {
                type: $(DOMstrings.inputType).val(),
                description: $(DOMstrings.inputDescription).val(),
                amount: parseFloat($(DOMstrings.inputAmount).val()),
                category: $(DOMstrings.inputCategory).val()
            }
        },
        getDOMStrings: function() {
            return DOMstrings;
        }
    }
    
}())




var addItem = function() {
    // 1. Get field data, return if info is incomplete
    var info = ViewController.extractInput();
    if (!info.description || !info.amount || isNaN(info.amount) || info.amount < 0) {
        alert('incorrect input~');
        return;
    }
    budgetController.addItemToBuffer(info.type, info.description, info.amount, info.category);
    budgetController.updateTotals();
    budgetController.updateNetBudget();
    budgetController.updateExpensePercentage();
    budgetController.updateItemPercentage();
    
    ViewController.addItemToListView(info.type);
    ViewController.updateBudgetView();
    ViewController.updateTotalsView();
    ViewController.updatePercentageView();
    ViewController.updateExpenseItemPercentageView();
    ViewController.cleanInputField();
}



var deleteItem = function(event) {
    var itemID, splitID, type, id;
    itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id); 
    if (itemID) {
        // inc-1
        splitID = itemID.split('-');
        type = splitID[0];
        id = splitID[1];

        
        budgetController.deleteFromBuffer(type, id); 
        budgetController.updateTotals();
        budgetController.updateNetBudget();
        budgetController.updateExpensePercentage();
        budgetController.updateItemPercentage();

        ViewController.deleteFromListView(itemID)
        ViewController.updateBudgetView();
        ViewController.updateTotalsView();
        ViewController.updatePercentageView();
        ViewController.updateExpenseItemPercentageView();
        ViewController.cleanInputField();
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
    



var setupEventListener = (function() {
    // set up add item listner
    $(ViewController.getDOMStrings().inputBtn).click(addItem);

    document.addEventListener('keypress', function(event) {
        if (event.code == 'Enter') {
            addItem();
        }
    });
    // set up delete item listner
    $(ViewController.getDOMStrings().container).click(deleteItem);
   
    // change listener
    $(ViewController.getDOMStrings().inputType).change(ViewController.changeType);
    // sep up time
    ViewController.displayMonth();
})() 




