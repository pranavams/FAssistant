'use strict';

angular.module('OgtModule').controller('OgtController', ['Constants','ApplicationPolicyService','UserService','MarketGroupSelectModalService','$scope','$rootScope','WcAuthorizationService', '$state', function(Constants,ApplicationPolicyService,UserService,MarketGroupSelectModalService,$scope,$rootScope,WcAuthorizationService, $state){
	this.version = angular.version;
	this.webCoreVersion = Constants.version;
	this.headerTemplateURL = 'ogt/ogtHeader.html';
	this.selectedMarketGroup ='';
	this.selectedBusiness = '';
	this.markets;
	this.business;
	var vm=this;
	
	UserService.getUserInformation();
	
	ApplicationPolicyService.getUserInformation().then(angular.bind(this, function(userInfo) {
		this.userInformation = userInfo;
	}));
	
	if(MarketGroupSelectModalService.opened == 'N'){
		MarketGroupSelectModalService.open().then(angular.bind(this,function(result) {
			MarketGroupSelectModalService.opened = 'Y';
		this.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		this.selectedBusiness = MarketGroupSelectModalService.selectedBusiness;
		this.markets = MarketGroupSelectModalService.markets;
		this.business = MarketGroupSelectModalService.business;
		}), function() {
		});
	}	
	
	this.resolve = function() {
		MarketGroupSelectModalService.selectedMarketGroup = this.selectedMarketGroup;
		MarketGroupSelectModalService.selectedBusiness = this.selectedBusiness;
		MarketGroupSelectModalService.business =this.business;
		MarketGroupSelectModalService.markets = this.markets;
		$state.go('ogt-ui-home');
	};
	
	this.loadMarketGroup = function() {
		this.selectedMarketGroup ='';
		$.each(this.business,function(index,obj){
			if(obj.key == vm.selectedBusiness){
				vm.markets = obj.marketGroup;
			}
		});
	};

	this.initiateStateTransition = angular.bind(this, function(toState, toParams, doReload) {
		if(!doReload) {
			doReload = false;
		}
		$state.go(toState, toParams, {
			reload: doReload,
			notify: false,
			location: toState.url!=""
		}).then(angular.bind(this, function(state) {
			// Force reload of header template to ensure protected-resources are re-checked
			this.headerTemplateURL += '#reload';
			$rootScope.$broadcast('$stateChangeSuccess', state, null);
		}));
	});

	
	$scope.$on('$stateChangeStart', angular.bind(this, function() {
		var event = arguments[0];
		var toState = arguments[1];
		var toParams = arguments[2];
		var fromState = arguments[3];
		var isAuth = WcAuthorizationService.isStateAuthorized(toState);
		//event.preventDefault();
		
		isAuth.then(angular.bind(this, function(authorized) {
			if(authorized === false) {
				if(toState.name != fromState.name) {	
				// if toState and fromState are the same, we are in a protected area on toggle of user role
					// therefore redirect to default page and let app handle state
					this.initiateStateTransition('ogt-ui-home', toParams);
				}
			} else {
				//update to pass state name to ensure we only refresh the child state
				this.initiateStateTransition(toState, toParams, toState);
			}
		}));

	}));

	$scope.$on('$stateChangeError', function() {
		var error = arguments[5];
		console.log('ERROR ($stateChangeError): ', error);
	});

}]);