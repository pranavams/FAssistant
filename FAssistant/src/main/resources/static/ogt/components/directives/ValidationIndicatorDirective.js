angular.module("OgtModule").directive("ogValidationIndicator", ["_", "$translate", "$timeout", function(_, $translate, $timeout) {
	return {
		restrict: "A",
		priority: 1,
		require: '^form',
		link: function(scope, elem, attr, ctrl) {
			//wrap in timeout of zero seconds to force a digest. This ensures nested directives finish before the indicator directive runs
			$timeout(function() {
				//fieldset is caps here thanks to the browser defining it that way
				elem[0].form && "FIELDSET" != elem[0].tagName || (elem = $(elem).find("input"));
				// add for other input types
				// var elementTypesToValidate = ['input', 'textarea', 'select', 'form'],
				var ngFormObj, formName = elem[0].form.name;
				//modals use ctrl.form.formName instead of ctrl.formName
				//handle it here
				formName.indexOf(".") > -1 ? (formName = formName.split("."), ngFormObj = scope.$parent[formName[0]][formName[1]]) :
					//break out of isolate scope and then walk the tree for the form obj
					ngFormObj = scope.$parent[formName];
				if (ngFormObj == undefined) {
					ngFormObj = ctrl;
				}
				var elemName = elem[0].name;
				//sometimes the reset element will not carry the name attr (I'm looking at you, ui-select).
				//in this case, instead grab it off of the attr object that was passed in
				elemName || (elemName = attr.name, elemName || "" == attr.wcResponsiveTable && (elemName = "wcResponsiveTable"));
				var elemCtrl;
				//need to select the controller in a different way if we are within a modal
				if (angular.isArray(formName)) {
					//take the controller's name off of the ng-model.
					//todo - if there's a better way to do this, DO IT!!
					var ctrlName = elem[0].attributes["ng-model"].nodeValue.split(".")[0];
					elemCtrl = scope.$parent[ctrlName]
				} else elemCtrl = elem.controller();
				var formGroup = $(elem).closest(".form-group")[0];
				//datatables will not be in a formgroup. add one and refer to it
				formGroup || (formGroup = $('<div class="form-group"></div>').insertBefore("#" + elem.context.attributes.id.value));
				var errType, errorMessage, errorMessageDOM, n, min, max, validatorAttrs, errorMsgId, fieldNameTranslateString = attr.ogValidationIndicator,
				errorTypes = {
						defaultMsg: "Please add error message for {{n}}.",
						email: "Please enter a valid email address.",
						minlength: "Please enter at least {{n}} characters.",
						maxlength: "You have entered more than {{n}} characters.",
						min: "Please enter the number greater than {{n}}.",
						max: "Please enter the number lesser than {{n}}.",
						minMaxRange: "Please enter between {{min}} to {{max}}.",
						required: "Please select {{fieldName}}.",
						tableRequired: "{{fieldName}} is required.",
						date: "Please enter a valid date.",
						pattern: "The pattern entered is incorrect.",
						number: "Please enter a valid number.",
						url: "Please enter a valid URL.",
						inValid: "{{fieldName}} is invalid."
				},
				buildErrorMsg = function(errType) {
					validatorAttrs.length > 0 ? errorMessage = ngFormObj[elemName].$error.hasOwnProperty("required") ? $translate.instant(errorTypes.required, {
						fieldName: fieldNameTranslateString
					}) : $translate.instant(errorTypes.inValid, {
						fieldName: fieldNameTranslateString
					}) : (n = attr[errType], ("min" === errType || "max" === errType) && attr.min && attr.max && (errType = "minMaxRange", min = attr.min, max = attr.max), errorMessage = $translate.instant(errorTypes[errType], {
						n: n,
						fieldName: fieldNameTranslateString,
						min: min,
						max: max
					}))
				},
				elemNameSnakeCase = elemName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
				errorMsgId = elemNameSnakeCase + "-error";
				var buildErrorMsgDOM = function(errType) {
					buildErrorMsg(errType), errorMessageDOM = $('<span id="' + errorMsgId + '"><span class="validation-text">' + errorMessage + "</span></span>")
				},
				watchListener = function() {
					//when the validation error occurs, insert the error messages and mark the container
					if (
							//first, remove potential leftover messages.
							$(formGroup).find("#" + errorMsgId).remove(), !ngFormObj[elemName].$valid && elemCtrl.isFormSubmitted) {
						validatorAttrs = _.filter(_.keys(attr), function(item) {
							return item.indexOf("Validator") > -1
						});
						for (var errorCases = _.pairs(ngFormObj[elemName].$error), i = 0; i < errorCases.length; i++) errType = errorCases[i][0], buildErrorMsgDOM(errType);
						$(formGroup).append(errorMessageDOM)
					}
				};
				scope.$watch(function() {
					return ngFormObj[elemName].$valid
				}, function() {
					watchListener()
				}), scope.$watch(function() {
					return elemCtrl.isFormSubmitted
				}, function() {
					watchListener()
				}), scope.$watch(function() {
					return ngFormObj[elemName].$error
				}, function() {
					watchListener()
				}, !0)
			}, 0)
		}
	}
}])