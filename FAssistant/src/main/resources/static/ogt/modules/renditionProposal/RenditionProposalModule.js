'use strict';

angular.module('RenditionProposalModule', ['WebCoreModule','ModelSettingsModule']);

angular.module('RenditionProposalModule').config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	$stateProvider.state('rendition-proposal', {
		url: '/rendition-proposal',
		templateUrl: 'ogt/modules/renditionProposal/states/renditionProposal/RenditionProposal.html',
		controller: 'RenditionProposalController',
		controllerAs: 'renditionProposalCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 modelsList: ['RenditionProposalService', function(RenditionProposalService) {
					return RenditionProposalService.getMarketInformation();
				}]
		},
		  data: {
			    policies: ['RenditionProposal:execute']
			  }
	});
	$stateProvider.state('rendition-entity-mapping', {
		url: '/rendition-entity-mapping',
		templateUrl: 'ogt/modules/renditionProposal/states/renditionEntityMapping/RenditionEntityMapping.html',
		controller: 'RenditionEntityMappingController',
		controllerAs: 'renditionEntityMappingCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 modelsList: ['RenditionProposalService', function(RenditionProposalService) {
					return RenditionProposalService.getMarketInformation();
				}]
		},
		data: {
			    policies: ['RenditionProposal:execute']
			  }
	});
}]);

