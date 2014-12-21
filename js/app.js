;(function(){
    var itemCategories = JSON.parse(window.localStorage.getItem('itemCategories') || 'false') || ['Western', 'Malay', 'Drinks'];
    var items = JSON.parse(window.localStorage.getItem('items') || 'false') || [{"category": "Western","name": "Beef Burger","price": 2},{"category": "Western","name": "Chicken Burger","price": 2},{"category": "Western","name": "Chicken Chop","price": 10},{"category": "Western","name": "Lamb Chop","price": 15},{"category": "Western","name": "Steak","price": 15},{"category": "Malay","name": "Nasi Lemak","price": 1},{"category": "Malay","name": "Nasi Goreng","price": 4},{"category": "Malay","name": "Nasi Ayam","price": 5},{"category": "Drinks","name": "Teh O","price": 1},{"category": "Drinks","name": "Teh O Ais","price": 1.4},{"category": "Drinks","name": "Teh","price": 1.2},{"category": "Drinks","name": "Teh Ais","price": 1.8},{"category": "Drinks","name": "Nescafe O","price": 1.2},{"category": "Drinks","name": "Nescafe O Ais","price": 1.5},{"category": "Drinks","name": "Nescafe","price": 1.4},{"category": "Drinks","name": "Nescafe Ais","price": 1.8}];
    var transactions = [];
    var currentSale = {};
    var saveItemCategories = function() {
        window.localStorage.setItem('itemCategories', JSON.stringify(itemCategories));
    }
    var saveItems = function() {
        window.localStorage.setItem('items', JSON.stringify(items));
    }
    angular.module('w2w', ['ngRoute'])
        .controller('MainController', function($scope, $route) {})
        .controller('ItemsController', function($scope, $routeParams, $location) {
            $scope.itemCategories     = itemCategories;
            $scope.activeCategory     = $routeParams.activeCategory;
            $scope.items              = items;
            $scope.otherDenominations = '';
            $scope.isActive = function(viewLocation) { 
                return viewLocation === $location.path();
            };
            $scope.selectedItems = function() {
                var selectedItems = [];
                Object.keys(currentSale).forEach(function(itemName){
                    selectedItems.push(items.filter(function(item){
                        return item.name === itemName;
                    }).shift());
                });
                return selectedItems;
            };
            $scope.clickedCount = function(name) {
                if(currentSale[name])
                    return currentSale[name];
                return 0;
            };
            $scope.incrClickCount = function(name) {
                if(currentSale[name])
                    return currentSale[name]++;
                currentSale[name] = 1;
            };
            $scope.decrClickCount = function(name) {
                if(currentSale[name])
                    return currentSale[name]--;
                if(currentSale[name] < 0)
                    return currentSale[name] = 0;
            };
            $scope.denominations = function() {
                var denominations = [];
                var total         = $scope.totalCurrentSale();
                var hundredBase   = Math.floor(total / 100) * 100;
                var baseTotal     = total - hundredBase;
                if(total < 100) {
                    denominations.push(100);
                }
                if(baseTotal < 50) {
                    denominations.push(50 + hundredBase);
                }
                if(baseTotal < 20) {
                    denominations.push(20 + hundredBase);
                }
                if(baseTotal < 10) {
                    denominations.push(10 + hundredBase);
                }
                if(baseTotal < 5) {
                    denominations.push(5 + hundredBase);
                }
                // nearest five
                var nearestTens = Math.ceil(total / 10) * 10;
                if((nearestTens - total) >= 5 && denominations.indexOf(nearestTens - 5) === -1)
                    denominations.push(nearestTens - 5);
                // var nearest one
                if(denominations.indexOf(Math.ceil(total)) === -1)
                    denominations.push(Math.ceil(total));
                if(denominations.indexOf(nearestTens) === -1)
                    denominations.push(nearestTens);
                // exact amount
                if(denominations.indexOf(total) === -1)
                    denominations.push(total);
                return denominations.sort(function(a,b){return b > a ? 1 : -1});
            };
            $scope.setOtherDenominations = function(e) {
                var otherDenominations = parseFloat($scope.otherDenominations.trim());
                if (e.keyCode === 13 && otherDenominations) {
                    $location.path('/Checkout/' + $scope.totalCurrentSale() + '/' + otherDenominations);
                }
            };
        })
        .controller('CheckoutController', function($scope, $routeParams) {
            var transaction = {
                timestamp : Date.now(),
                items     : currentSale,
                total     : $routeParams.total,
                tendered  : $routeParams.denom
            };
            transactions.push(transaction);
            currentSale     = {};
            $scope.tendered = $routeParams.denom;
            $scope.total    = $routeParams.total;
        })
        .controller('ConfigController', function($scope, $routeParams) {
            $scope.newCategory    = '';
            $scope.newItemName    = '';
            $scope.newItemPrice   = '0.00';
            $scope.itemCategories = itemCategories;
            $scope.items          = items;
            $scope.itemsFilter = function(item){
                if($routeParams.category)
                    return item.category === $routeParams.category;
                return true;
            };
            $scope.createCategory = function(e) {
                var value = $scope.newCategory.trim();
                if (e.keyCode === 13 && value) {
                    itemCategories.push(value);
                    saveItemCategories();
                    $scope.newCategory = '';
                }
            };
            $scope.hasNoChild = function(itemCategory) {
                return items.filter(function(item){
                    return item.category === itemCategory;
                }).length === 0;
            };
            $scope.removeCategory = function(itemCategory) {
                var index = itemCategories.indexOf(itemCategory);
                if(index > -1) {
                    itemCategories.splice(index, 1);
                    saveItemCategories();
                }
            };
            $scope.createItem = function(e) {
                var name = $scope.newItemName.trim();
                var price = parseFloat($scope.newItemPrice.trim());
                if (e.keyCode === 13 && name && price && $routeParams.category) {
                    items.push({
                        category: $routeParams.category,
                        name: name,
                        price: price
                    });
                    saveItems();
                    $scope.newItemName = '';
                    $scope.newItemPrice = '0.00';
                }
            };
            $scope.removeItem = function(itemName) {
                var item = items.filter(function(item){
                    return item.name === itemName;
                }).shift();
                if(item) {
                    var index = items.indexOf(item);
                    if(index > -1) {
                        items.splice(index, 1);
                        saveItems();
                    }
                }
            };
            $scope.activeCategory = $routeParams.category || 'All';
        })
        .config(function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/Item/:activeCategory', {
                    templateUrl: 'item.html',
                    controller: 'ItemsController'
                })
                .when('/Checkout/:total/:denom', {
                    templateUrl: 'checkout.html',
                    controller: 'CheckoutController'
                })
                .when('/Config/:category?', {
                    templateUrl: 'config.html',
                    controller: 'ConfigController'
                })
                .otherwise({ redirectTo: '/Item/Western' });
        })
        .run(function($rootScope){
            $rootScope.totalCurrentSale = function() {
                var total = 0;
                for (var itemName in currentSale) {
                    var item = items.filter(function(item){
                        return item.name === itemName;
                    }).shift();
                    if(item)
                        total = total + (currentSale[itemName] * item.price);
                };
                return total;
            };
        });
}).call(this);