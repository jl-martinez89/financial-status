// Budget Model
var budgetController = (function(){

	var Expense = function(id, description, day, value){
		this.id = id;
		this.description = description;
		this.day = day;
		this.value = value;
		this.percentage = -1;
	}
	var Income = function(id, description, day, value){
		this.id = id;
		this.description = description;
		this.day = day;
		this.value = value;
	}

	var calcPercentage = function(obj, totalIncome){
		if(obj.value > 0){
			obj.percentage = Math.round((obj.value / totalIncome) * 100);
		} else {
			obj.percentage = -1;
		}
	}

	var getPercentage = function(obj){
		return obj.percentage;
	}

	var data = {
		year: 0,
		month: 0,
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem: function(type, des, day, val){
			var newItem, ID;
			// Create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			// Create new item based on 'inc' or 'exp' type
			if(type === 'exp'){
				newItem = new Expense(ID, des, day, val);
			} else if(type === 'inc'){
				newItem = new Income(ID, des, day, val);
			}
			// Push new item into data structure
			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type, id){
			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function(){
			// Calculate total income and expenses
			calculateTotal('inc');
			calculateTotal('exp');
			// Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// Calculate percentage of income expended
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentages: function(){
			data.allItems.exp.forEach(function(current){
				calcPercentage(current, data.totals.inc);
			});
		},
		getPercentages: function(){
			var allPercentages = data.allItems.exp.map(function(current){
				return getPercentage(current);
			});
			return allPercentages;
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		setDate: function(year, month){
			data.year = year;
			data.month = month;
		},
		getDate: function(){
			return {
				year: data.year,
				month: data.month
			}
		},
		storeData: function(){
			localStorage.setItem( data.year + '-' + data.month, JSON.stringify(data) );
		},
		retrieveData: function(date){
			data = JSON.parse(localStorage.getItem(date));
			return data;
		},
		testing: function(){
			return console.log(data);
		}
	}
})();

// UI View
var UIController = (function(){
	var DOMstrings = {
		inputType: '.input-data__type',
		inputDescription: '.input-data__description',
		inputDay: '.input-data__day',
		inputValue: '.input-data__value',
		inputBtn: '.input-data__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetTitle: '.budget__title',
		budgetLabel: '.budget__title--value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month',
		inputYear: '.records__date--year',
		inputMonth: '.records__date--month',
		load: '.js-load',
		save: '.js-save',
		clear: '.js-clear'
	};

	var formatNumber = function(number, type){
		return (type === 'inc' ? sign = '+' : type === 'exp'? sign = '-' : sign = '') + ' ' + number.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
	}

	var nodeListForEach = function(list, callback){
		for(var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	}

	return {
		getDOMstrings: function(){
			return DOMstrings;
		},
		getDate: function(){
			return {
				year: document.querySelector(DOMstrings.inputYear).value,
				month: document.querySelector(DOMstrings.inputMonth).value
			}
		},
		getInput: function(){
			return {
				type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				day: document.querySelector(DOMstrings.inputDay).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		addListItem: function(obj, type){
			var html, newHtml, element;
			// Create HTML string with placeholder text
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>  <div class="item__day">[ %day% ]</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-trash-outline"></i></button> </div> </div> </div>';
			} else if (type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="item__day">[ %day% ]</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-trash-outline"></i></button> </div> </div> </div>';
			}
			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%day%', obj.day);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		clearFields: function(){
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputDay + ',' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj){
			var type;
			obj.budget <= 0 ? type = '' : type = 'inc';
			if (obj.budget < 0) document.querySelector(DOMstrings.budgetTitle).classList.toggle('red');
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: function(percentages){
			// return a NodeList
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0 && percentages[index] !== Infinity){
					current.textContent = percentages[index]+'%';
				} else {
					current.textContent = '---';
				}
			});
		},
		displayMonth: function(year, month){
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
		},
		changeType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputDay + ',' +
				DOMstrings.inputValue);
			nodeListForEach(fields, function(current){
				current.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		}
	};
})();

// Global APP Controller
var controller = (function(budgetCtrl,UICtrl){

	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMstrings();
		// addItem button
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		// addListener for the event of pressing the enter key.
		document.addEventListener('keypress', function(e){
			if(e.keyCode === 13 || e.which === 13){
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
		document.querySelector(DOM.inputYear).addEventListener('change', ctrlDate);
		document.querySelector(DOM.inputMonth).addEventListener('change', ctrlDate);
		document.querySelector(DOM.load).addEventListener('click', ctrlLoadBudget);
		document.querySelector(DOM.save).addEventListener('click', ctrlSaveBudget);
		document.querySelector(DOM.clear).addEventListener('click', ctrlClearRecords);
	}

	var updateBudget = function(){
		budgetCtrl.calculateBudget(); // 1. Calculate the budget
		var budget = budgetCtrl.getBudget(); // 2. Return the budget
		UICtrl.displayBudget(budget); // 3. Display the budget on the UI
	}

	var updatePercentages = function(){
		budgetCtrl.calculatePercentages(); // 1. Calculate the percentages
		var percentages = budgetCtrl.getPercentages(); // 2. Read percentages from the budget controller
		UICtrl.displayPercentages(percentages); // 3. Update the UI with the new percentages
	}

	var addListAll = function(list, type){
		for(var i = 0; i < list.length; i++){
			UICtrl.addListItem(list[i], type);
		}
	}

	var ctrlDate = function(){
		var now, year, month, date;
		date = UICtrl.getDate();
		if(date.year === "" || date.month === ""){
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			budgetCtrl.setDate(year, month);
			UICtrl.displayMonth(year, month);
		} else {
			budgetCtrl.setDate(date.year, date.month);
			UICtrl.displayMonth(date.year, date.month);
		}
	}

	var ctrlLoadBudget = function(){
		var date, data;
		date = UICtrl.getDate(); // 1. Get the year and month filled
		if (date.year === "" || date.month === "") {
			alert("Year and month are incomplete!"); // 2. If year and month are incomplete alert user.
		} else {
			data = budgetCtrl.retrieveData(date.year + '-' + date.month); // 2. Retrieve data if exists
			if(data) {
				// 3. Update the UI with the retrieved data
				addListAll(data.allItems.exp, 'exp');
				addListAll(data.allItems.inc, 'inc');
				updateBudget(); // 4. Calculate and update budget
				updatePercentages(); // 5. Calculate and update percentages
			} else {
				alert('No data was found!');
			}
		}
	}

	var ctrlSaveBudget = function(){
		budgetCtrl.storeData();
	}

	var ctrlClearRecords = function(){
		window.localStorage.clear();
		location.reload();
		return false;
	}

	var ctrlAddItem = function(){
		var input, newItem;
		input = UICtrl.getInput(); // 1. Get the input data filled
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			newItem = budgetCtrl.addItem(input.type, input.description, input.day, input.value); // 2. Add the item to the budget controller
			UICtrl.addListItem(newItem, input.type); // 3. Add the item to the UIController
			UICtrl.clearFields(); // 4. Clear the fields
			updateBudget(); // 5. Calculate and update budget
			updatePercentages(); // 6. Calculate and update percentages
		}
	}

	var ctrlDeleteItem = function(e){
		var itemID, splitID, type, ID;
		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			budgetCtrl.deleteItem(type, ID); // 1. Delete the item from the data structure
			UICtrl.deleteListItem(itemID); // 2. Delete the item from the UI
			updateBudget(); // 3. Update and show the new budget
			updatePercentages(); // 4. Calculate and update percentages
		}
	};

	return {
		init: function(){
			console.log('Application has started.');
			ctrlDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	}
})(budgetController,UIController);

// APP Initialization
controller.init();
