'use strict';

angular.module("WebCoreModule").directive("ogtProtectedResource", function() {
    return {
    	priority: -500,
        restrict: "A",
        require: ["ogtProtectedResource","?^wcDataTable"],
        controller: ["WcAuthorizationService", "$element", "$attrs","$scope", function(WcAuthorizationService, $element, $attrs, $scope) {
    	   var _ctrl = this;
    	   	$scope.$on('isAuthorized', function(event,authString) {
    	   		_ctrl.checkAuthorization(authString);
    	   	});
            this.checkAuthorization = function(authString) {
                var criteria = null;
                var policies = $attrs.ogtProtectedResource;
                var isFormControlToRemove = false; 
                var isFormControlToDisable = false;
                if(authString != undefined){
                	policies = policies + authString;
                } 
               
                if (policies) {
                	if(policies.slice(-1) === "_") {	//Check for last character if it is "_"
                		return false;	//Escaping service call on page load - When no market is available..
                	}	
                	if(policies.indexOf("@") > 0){
                		var secondString = policies.substr(policies.indexOf("@")+1,policies.length);
                		policies = policies.substr(0, policies.indexOf("@"));
                		if(secondString == 'remove')
                			isFormControlToRemove = true;
                		else if(secondString == 'disable')
                			isFormControlToDisable = true;
                	}
                	policies.indexOf("|") > -1 && (
                            criteria = policies.slice(policies.indexOf("|") + 1, policies.length).toString().trim()),
                        criteria && (policies = policies.slice(0, policies.indexOf("|"))),
                        policies = policies.split(",");
                    for (var i = 0; i < policies.length; i++) 
                    	policies[i] = policies[i].trim()
                } else policies = [];
                var isAuth = WcAuthorizationService.isAuthorized(policies, criteria);
                isAuth.then(function(authorized) {
                	if(authorized === !1) {
                		if(isFormControlToRemove)
                			$element.remove();
                		else if(isFormControlToDisable)
            			{
                			$element.attr("disabled", true);
            			}
                		else 	
                    		$element.hide();
                		
                		
                	} else {
                		if(isFormControlToDisable)
                		{
                			$element.removeAttr("disabled");
                		}
                		else
                			$element.show();
                	} 
                })
            }
        }],
        compile: function() {
            return {
                post: function() {
                    var controllers = arguments[3],
                        protectedResourceCtrl = controllers[0],
                        datatableCtrl = controllers[1];
                    datatableCtrl && (datatableCtrl.checkAuthorization = protectedResourceCtrl.checkAuthorization()), protectedResourceCtrl.checkAuthorization()
                }
            }
        }
    }
});

