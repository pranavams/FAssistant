'use strict';

angular.module('EntityMappingModule', ['WebCoreModule']);
angular.module('EntityMappingModule').config(['$stateProvider', function($stateProvider){
	
	$stateProvider.state('entity-mapping-list', {
		url: '/entity-mapping-list',
		templateUrl: 'ogt/modules/entityMappingList/states/entityMappingList/entityMappingList.html',
		controller: 'EntityMappingListController',
		controllerAs: 'entityMappingListCtrl',
		parent: 'ogt-ui-app',
		  data: {
			    policies: ['EntityEntityMapping:execute']
			  }

	});
	
	$stateProvider.state('add-edit-entity-mapping', {
		url: '/add-edit-entity-mapping',
		templateUrl: 'ogt/modules/entityMappingList/states/entityMappingList/addEditEntityMappingList.html',
		controller: 'EntityMappingAddEditController',
		controllerAs: 'entityMappingAddEditCtrl',
		parent: 'ogt-ui-app',
		  data: {
			    policies: ['EntityEntityMapping:execute']
			  }

	});
	
}]);

