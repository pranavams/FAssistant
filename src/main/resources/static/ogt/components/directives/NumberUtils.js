'use strict',

angular.module('OgtModule').filter('percentage', function() {
	return function(input) {
		if (input !== undefined && input !== '') {
			return input + '%';
		}
	}
});

angular.module('OgtModule').filter('parenthesizeNegative', function() {
	return function(input) {
		if (input !== undefined && input !== '') {
			if (typeof input === 'number') {
				return (input < 0) ? "(" + Math.abs(input) + ")" : input;
			}
		}
	}
});

angular.module('OgtModule').directive('stringToNumber', function() {
	return {
		require : 'ngModel',
		link : function(scope, element, attrs, ngModel) {
			ngModel.$parsers.push(function(value) {
				return '' + value;
			});
			ngModel.$formatters.push(function(value) {
				return parseFloat(value);
			});
		}
	};
});

angular.module('OgtModule').directive('digitDecimalValidator', function($timeout) {
	return {
		restrict: 'A',
		scope: {
			digitDecimalValidator: "@"
        },
		link : function(scope, element, attrs) {
			element.on('cut copy paste', function (e) {
				e.preventDefault();
			});
			element.bind('keypress', function(e) {
				if(scope.digitDecimalValidator === '_._') {	/* To check for 0.0 to 0.9 */
					var decimalRegEx = /^[0]?(\.?\d?)$/;
					var digitRegEx = /^[0-1]?$/;
				} else if(scope.digitDecimalValidator === '__.__') { /* To check for 00.00 to 99.99 */
					var decimalRegEx = /^\d{0,2}(\.{0,1}\d{0,2})$/;
					var digitRegEx = /^\d{0,2}$/;
				}
				var previousValue = $(this).val();
				var updatedValue = previousValue.slice(0, e.target.selectionStart) + String.fromCharCode(e.charCode) + previousValue.slice(e.target.selectionEnd); 
				
				if(updatedValue.includes(".")) {
					if (!decimalRegEx.test(updatedValue)) {
						e.preventDefault();
					}
				} else {
					if (!digitRegEx.test(updatedValue)) {
						e.preventDefault();
					}
				}
			});
		}
	};
});

angular.module('OgtModule').directive('numberOnlyValidator', function() {
	return {
		scope: {
			numberOnlyValidator: "@"
        },
		link : function(scope, element, attrs) {
			element.on('cut copy paste', function (e) {
				e.preventDefault();
			});
			element.bind('keypress', function(e) {
				if(scope.numberOnlyValidator === "_____")
				{
					var digitRegEx = /^[0-9]{1,6}$/; 
				}
				var previousValue = $(this).val();
				var updatedValue = previousValue.slice(0, e.target.selectionStart) + String.fromCharCode(e.charCode) + previousValue.slice(e.target.selectionEnd); 

					if (!digitRegEx.test(updatedValue)) {
						e.preventDefault();
					}
			});
			
		}
	};
});

angular.module('OgtModule').directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
            	if(text === undefined || text === null || text === '')
            		return '';
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return 0;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

angular.module('OgtModule').directive('setFocus',function($timeout){
	return {
		link:  function(scope, element, attrs){
			element.bind('click',function(){
				$timeout(function() {
					var divId=(element[0].id);
					if(divId.includes("Overrides"))
						divId= divId.replace("showpenOverrides","textOverrides")
						else if(divId.includes("Optimisation"))
							divId= divId.replace("showpenOptimisation","textOptimisation")
							var  textDiv = document.getElementById(divId);
					textDiv.focus();
				});
			})
		}
	}
});

angular.module('OgtModule').directive('ngEnter', function ($timeout) {
	return {
		link:function (scope, element, attrs, ctrl) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});
					event.preventDefault();
				}
			});
		}
	}
});