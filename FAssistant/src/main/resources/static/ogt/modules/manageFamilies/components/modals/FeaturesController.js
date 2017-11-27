'use strict';

angular.module('ManageFamiliesModule').controller('FeaturesController',['$uibModalInstance','ManageFamiliesService', function($uibModalInstance,ManageFamiliesService) {

	this.features = ManageFamiliesService.features;
	this.familyName = ManageFamiliesService.familyName;
	this.businessProcess=ManageFamiliesService.businessProcess;
	this.message=ManageFamiliesService.message;
	this.featuresToUpdate=[];
	
	this.resolve = function(userAction) {
		$uibModalInstance.close(userAction);
	};
	
	this.onKeyPress = function($event){
		if(event.which === 13) {
			$("#modal-submit").click();
		}
	};
	
	this.reject = function() {
		$uibModalInstance.dismiss();
	};
	
	/* List Data table configuration starts here  */
	this.columns = [ {
		'mData': 'key',
		'aTargets': [0],
		sDefaultContent: '',
		sClass:"text-center"
	},{
		'mData': 'name',
		'aTargets': [1],
		sDefaultContent: '',
		sClass:"text-center"
	},{
		'mData': 'processFlag',
		'aTargets': [1],
		sDefaultContent: '',
		sClass:"text-center"
	}
	];
	
	this.columnDefs = [ {
		'bSortable' : true,
		'aTargets' : [ 0 ]
	}, {
		'bSortable' : true,
		'aTargets' : [ 1 ]
	},
	{
		'bSortable' : true,
		'aTargets' : [ 2 ]
	}
	];
	
	this.overrideOptions = {
			'bPaginate': true,
			'sPaginationType': 'bootstrap_full_numbers',
			'sAlign': 'center',
			'bLengthChange': true,
			'bFilter': true,
			'bDestroy': true,
			'aaSorting': [
				[0, 'asc']
			],
			'sDom': '<"row paginator paginator-top"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>>',
			'aLengthMenu': [
				[10, 25, 50, 100, -1],
				[10, 25, 50, 100, 'All']
			],
			'oLanguage': {
				'sLengthMenu': 'Features Per Page: _MENU_',
				'sInfo': 'Showing Features: _START_ - _END_ of _TOTAL_',
				'sEmptyTable': 'No Features Available.'
			},
			'stateSave': true
		};
	
	this.responsiveColumnDefs = {
			initial: {
				columns: [],
				paging: true,
				pagination: 'bootstrap_full_numbers',
				showPagingText: false,
				dom: '<"row paginator paginator-top"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>>'
			},
			breakpoints: [300, 400, 600, 800],
			columns: [
				[0,1,2]
			],
			paging: [false, false, true, true],
			pagination: ['', '', 'bootstrap_two_button', 'bootstrap_normal'],
			showPagingText: [true, true, true, false],
			dom: [
				't',
				't',
				'<"row paginator paginator-top"<"col-xs-6"l><"col-xs-6 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-6"l><"col-xs-6 text-right"p>>',
				'<"row paginator paginator-top"<"col-xs-6"l><"col-xs-6 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-6"l><"col-xs-6 text-right"p>>'
			]
		};

	/* List Data table configuration ends here */
	
}]);