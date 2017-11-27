'use strict',

angular.module('RenditionProposalModule').controller('RenditionProposalController',
		['WcHttpEndpointPrototype','MarketService','$state','$scope','WcAlertConsoleService','$translate',
		 		'RenditionProposalService','$timeout','$filter','$q','RenditionModalService','UserService','modelsList','SaveOverridesPrototype',
		 		'ConstraintsPrototype','OverridesPrototype','MarketGroupSelectModalService',
		 function(WcHttpEndpointPrototype,MarketService,$state,$scope,WcAlertConsoleService,$translate,
				 RenditionProposalService,$timeout,$filter,$q,RenditionModalService,UserService,modelsList,SaveOverridesPrototype,
			 		ConstraintsPrototype,OverridesPrototype,MarketGroupSelectModalService) {
			this.modelsList =modelsList;
			this.markets = [];
			this.vehicleLines =[];
			this.modelYears =[];
			this.selectedMarket=undefined;
			this.selectedModel=undefined;
			this.selectedModelYear=undefined;
			this.isDisplayTabs=false;
			this.isCommited= false;
			this.sessionId=undefined;
			this.overrideValue=undefined;
			this.selectedOverrideReason = undefined;
			this.showOkRemoveOverrides=false;
			this.showOkRemoveOptimisation=false;
			this.showOkRemoveTHOverrides=false;
			$scope.currentModelYear = RenditionProposalService.currentModelYear;
			RenditionProposalService.selectedMarket = '';
			RenditionProposalService.selectedModel = '';
			this.submitJobDisabled = true;
			this.saveOverridesDisabled = true;
			$scope.toggle=true;
			//	$scope.isJobRunning=false;
			this.disableRenditionTabs = false;
			this.disableCommitBtn = false;
			this.enableUnlockDownload = false;
			this.showOrdersToGenerate = false;
			this.showSubmitJob= false;
			this.modifiedsalesmixreason =  '';
			this.totalOrdersToGenerate =0;
			this.jobStatus = '';
			this.renditionDataReloaded = false; 
			this.user = '';
			this.productionMonth = '';
			this.mixThreshold = '';
			this.currentStateCols = false;
			this.overridesCols = false;
			this.optimisationCols = false;
			this.proposalCols = false;
			
			this.businessProcess = '';
			this.marketGroup = '';
			
			this.selectedBusinessProcess = MarketGroupSelectModalService.selectedBusiness;
			this.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
			
			this.clearSelectedModelValues=function()
			{
				this.selectedMarket = '';
				this.selectedModel = '';
				this.selectedModelYear = '';
				this.modelYears =[];
				this.models =[];
				this.isFormSubmitted = false;
			};
			UserService.getUserInformation().then(angular.bind(this, function(userObj) {
				this.user = userObj;
			}));

			this.markets = RenditionProposalService.getMarkets(this.modelsList);
			var marketsObj=this.markets;
			if(marketsObj.length == 1) {
				this.selectedMarket = marketsObj[0].key;	
				RenditionProposalService.selectedMarket=this.selectedMarket ;
				RenditionProposalService.getModels(this.modelsList,this.selectedMarket).then(angular.bind(this, function(response){
					this.models=response;
				}));
			}
			
			this.loadModels=function(){
				$scope.$broadcast('display-tabs',false);
				this.selectedBusinessProcess = MarketGroupSelectModalService.selectedBusiness;
				this.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
				return RenditionProposalService.getModels(this.modelsList,this.selectedMarket).then(angular.bind(this, function(response){
					this.models=response;
					this.selectedModel = '';
					this.selectedModelYear = '';
					this.modelYears =[];
					this.isDisplayTabs = false;
					this.isFormSubmitted = false;
					
					$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE");
				}));
			};

			this.loadModelYears=function(){
				this.selectedModelYear = '';
				$scope.$broadcast('display-tabs',false);
				return  RenditionProposalService.getModelYears(this.modelsList,this.selectedMarket,this.selectedModel).then(angular.bind(this, function(response){
					this.modelYears= response;
					var modelYearsObj=this.modelYears;
					var maxModelYear = 0;
					this.isDisplayTabs = false;

					angular.forEach(modelYearsObj,function(modelYearOb, modelYearIndex) {
						if(modelYearOb.modelYear!= 'ALL' && parseFloat(maxModelYear) < parseFloat(modelYearOb.modelYear)) {
							maxModelYear = parseFloat(modelYearOb.modelYear);
						}
					});
					RenditionProposalService.currentModelYear = maxModelYear;
				}))

			};

			this.orderByValue = function (value) {
				return value;
			}; 

			this.reasons=[
			              { "key" : "", "value" : "Select Reason" },
			              { "key" : "Launch of new entity", "value" : "Launch of new entity" },
			              { "key" : "Marketing program planned including on this entity", "value" : "Marketing program planned including on this entity" },
			              { "key" : "CO2 Legislation changes", "value" : "CO2 Legislation changes" },
			              { "key" : "Other legislation changes", "value" : "Other legislation changes" },
			              { "key" : "NSC does not agree with recommended mix", "value" : "NSC does not agree with recommended mix" },
			              { "key" : "NSC does not want to promote this entity", "value" : "NSC does not want to promote this entity" },
			              { "key" : "To Meet NSC allocation", "value" : "To Meet NSC allocation" }
			              ];
			this.displayTable = function() {
				var rendTable = document.getElementById('renditionTable');
				rendTable.hidden=false;
			};

			this.clearTable = function() {
				var rendTable = document.getElementById('renditionTable');
				rendTable.hidden=true;
			}

			this.currentStateTitle = 'Current State';
			this.currentStateUrl = '';
			this.overridesTitle = 'Overrides';
			this.overridesUrl = '';
			this.optimizationTitle = 'Optimization';
			this.optimizationUrl = '';
			this.proposalTitle = 'Proposal';
			this.proposalUrl = '';

			this.tabs = [
			             { title : this.currentStateTitle, 	url : this.currentStateUrl },
			             { title : this.overridesTitle, 	url : this.overridesUrl },
			             { title : this.optimizationTitle, 	url : this.optimizationUrl },
			             { title : this.proposalTitle, 		url : this.proposalUrl } 
			             ];
			this.presentTabSelected = this.tabs[0];
			this.currentTab = this.currentStateUrl;

			this.onClickCurrentTab = function() {
				tab = [{ title : this.currentStateTitle, url : this.currentStateUrl }];
				this.onClickTab(tab);
				$scope.selectedMarket=RenditionProposalService.selectedMarket;
			}
			this.onClickProposalTab = function() {
				tab =   [{ title : this.proposalTitle, url : this.proposalUrl }];
				this.onClickTab(tab[0]);

			}
			this.onClickTab = function(tab) {	
				this.presentTabSelected = tab;
				if(tab.title == this.proposalTitle)
				{
					this.showCommitButton = true; 
					this.showOrdersToGenerate = false;
					this.showSubmitJob= false;
					this.currentStateCols = false;
					this.overridesCols = false;
					this.optimisationCols = false;
					this.proposalCols = true;
				}
				else if(tab.title == this.optimizationTitle)
				{
					this.showOrdersToGenerate = true;
					this.showSubmitJob= true;
					this.showCommitButton = false; 
					this.currentStateCols = false;
					this.overridesCols = false;
					this.optimisationCols = true;
					this.proposalCols = false;
				}
				else if(tab.title == this.overridesTitle)
				{
					this.showOrdersToGenerate = false;
					this.showCommitButton = false; 
					this.showSubmitJob= true;
					this.currentStateCols = false;
					this.overridesCols = true;
					this.optimisationCols = false;
					this.proposalCols = false;
				}
				else
				{
					this.showCommitButton = false; 
					this.showOrdersToGenerate = false;
					this.showSubmitJob= false;
					this.currentStateCols = true;
					this.overridesCols = false;
					this.optimisationCols = false;
					this.proposalCols = false;
				}
				this.currentTab = tab.url;
				this.currentTabTitle = tab.title;
			}

			this.loadContent = function(selectedModelYear){
				RenditionProposalService.modifiedOverdOptmArray=[];
				var commitFlag= 'N';
				this.jobStatus = '';
				this.isDisplayTabs=false;
				$scope.currentModelYear = RenditionProposalService.currentModelYear;
				if(selectedModelYear == null) {
					this.isDisplayTabs=false;
				} else {
					RenditionProposalService.getSessionDetails(selectedModelYear).then(angular.bind(this,function(response){
						var sessionId=response[0];
						if(sessionId == "null" ||  sessionId == null || sessionId == undefined)
						{
							WcAlertConsoleService.addMessage({
								message: $translate.instant('conflictNotification.unableToGetRenditionData'),
								type: 'warning',
								multiple: false
							});
							return false;
						}
						RenditionProposalService.sessionId = sessionId;
						RenditionProposalService.getCommitStatus(sessionId).then(angular.bind(this, function(commitStatusResponse){
							commitFlag=commitStatusResponse.commitFlag;
							this.productionMonth = commitStatusResponse.productionMonth;
							RenditionProposalService.productionMonth = this.productionMonth;
							this.totalOrdersToGenerate = commitStatusResponse.totalAllocations;
							this.mixThreshold =  commitStatusResponse.mixThreshold;
							RenditionProposalService.totalOrdersToGenerate = commitStatusResponse.totalAllocations;
							RenditionProposalService.initialTotalOrdersToGenerate = commitStatusResponse.totalAllocations;
							displayStatus(commitStatusResponse.jobStatus);
							RenditionProposalService.getRenditionProposals(selectedModelYear,sessionId).then(angular.bind(this, function(response){
								this.jobStatus = commitStatusResponse.jobStatus;
								RenditionProposalService.renditionProposals = response.RenditionProposal;
								this.currentTabTitle = this.currentStateTitle;
								this.isDisplayTabs=true;
								this.submitJobDisabled = true;
								this.saveOverridesDisabled = true;
								if(commitFlag== "Y"){
									this.enableUnlockDownload = true;
									this.currentTab = this.tabs[3].url;
									this.isCommited=true;
									this.proposalCols = true;
								}else{
									this.enableUnlockDownload = false;
									this.currentTab = this.tabs[0].url;
									this.isCommited=false;
								}
								if(RenditionProposalService.renditionProposals !=  null && RenditionProposalService.renditionProposals  != undefined){
									$scope.proposals = RenditionProposalService.renditionProposals;
									angular.forEach($scope.proposals, function(arrElement, index) {
										//taking backup for the editable data
										arrElement.recollectweightedsalesmixoverride = arrElement.weightedsalesmixoverride;
										arrElement.recollectweightedsalesmixoverridereason = arrElement.weightedsalesmixoverridereason;
										arrElement.recollectordermixoverride = arrElement.ordermixoverride;
										arrElement.recollectordermixoverridereason = arrElement.ordermixoverridereason;

										arrElement.recollectmodifiedsalesmix = arrElement.modifiedsalesmix;
										arrElement.recollectordermix = arrElement.ordermix;
										arrElement.recollectorderstogenerate = arrElement.orderstogenerate;
										arrElement.recollectnewinventorymix = arrElement.newinventorymix;
										arrElement.recollectoverridessummary = arrElement.overridessummary;
										
										
										arrElement.overridesshowrevert = false;
										arrElement.optimisationshowrevert = false;
										
										if(arrElement.weightedsalesmixoverride != '' || arrElement.weightedsalesmixoverridereason != '')
											{arrElement.overridesshowclear = true;}
										else
											{arrElement.overridesshowclear = false;}
										
										if(arrElement.ordermixoverride != '' ||  arrElement.ordermixoverridereason != '')
											{arrElement.optimisationshowclear = true;}
										else
											{
											arrElement.optimisationshowclear = false;
											}
										
										if(commitStatusResponse.jobStatus != 'COMPLETED'){
											if(arrElement.weightedsalesmixoverride)
											{
												arrElement.modifiedsalesmix = "--.--";
											}
											if(arrElement.ordermixoverride)
											{
												arrElement.newinventorymix = "--.--";
												arrElement.ordermix = "--.--";
												arrElement.orderstogenerate = "--";
											}
										}
									});


								} else {
									$scope.proposals= {};
								}
							}), function(){
								WcAlertConsoleService.addMessage({
									message: $translate.instant('conflictNotification.unableToGetRenditionData'),
									type: 'warning',
									multiple: false
								});
								console.log('Promise failed while retrieving status from middleware');
							});

						}), function(){
							WcAlertConsoleService.addMessage({
								message: $translate.instant('conflictNotification.unableToGetCommitStatus'),
								type: 'warning',
								multiple: false
							});
							console.log('Promise failed while retrieving status from middleware');
						});
					}));
				}
			};
			$scope.$on("display-tabs", angular.bind(this,function(event, data) {
				this.isDisplayTabs = data;
			}));
			$scope.$on("reset-reason-wghtdSalesMix", angular.bind(this,function(event, data) {
				data.overrideValue="";
				data.selectedOverrideReason="";
				var rowkey=data.rowKey;
				delete  $scope.changedOverrides[rowkey];
				$timeout(function() {
					angular.element(event).triggerHandler('click');
				}, 0);
			}));

			$scope.changedOverrides={};
			
			this.onChangeTotalOrdersToGenerate  = function(){
				if(this.totalOrdersToGenerate == '' || this.totalOrdersToGenerate == 0)
					{
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.totalOrdersToGenerateError'),
						type: 'danger',
						multiple: false
					});
					}
				var	newElement = {"TotalOrders": this.totalOrdersToGenerate };
				RenditionProposalService.totalOrdersToGenerate = this.totalOrdersToGenerate;
				$scope.$emit("enable-disable-SubmitJob", $scope);
			}
			this.showRevertClear = function(type,flag,rowKey)
			{
				var arrElement = $filter('filter')($scope.proposals, { ruid: rowKey  }, true)[0];
				if(flag == "WEIGHTED_SALES") {
					if(type == "REVERT")
						{
						return arrElement.overridesshowrevert;
						}
					else if(type == "CLEAR")
						{
						return arrElement.overridesshowclear
						}
				}else if(flag == "ORDER_MIX") {
					if(type == "REVERT")
					{
					return arrElement.optimisationshowrevert;
					}
				else if(type == "CLEAR")
					{
					return arrElement.optimisationshowclear
					}
			}
			}
			this.populatedOverrides = function(flag,overrideValue, selectedOverrideReason,rowKey) {
				var overrideValue = overrideValue;
				var selectedOverrideReason = selectedOverrideReason;
				var rowkey = rowKey;
				var arrElement = $filter('filter')($scope.proposals, { ruid: rowkey  }, true)[0];

		//		if((overrideValue == undefined || overrideValue == '') && (selectedOverrideReason==undefined || selectedOverrideReason =='')) {
				if((overrideValue == '') && (selectedOverrideReason !='')) {
					overrideValue = '';
					if(flag == "WEIGHTED_SALES") {
						selectedOverrideReason =arrElement.recollectweightedsalesmixoverridereason;
					}else if(flag == "ORDER_MIX") {
						selectedOverrideReason = arrElement.recollectordermixoverridereason;
					}
				}
				else if((overrideValue == '') && (selectedOverrideReason =='')) {
					overrideValue = '';
					if(flag == "WEIGHTED_SALES") {
						selectedOverrideReason =this.reasons[0].key;
					}else if(flag == "ORDER_MIX") {
						selectedOverrideReason =this.reasons[0].key;
					}
				}
				else if(overrideValue != undefined && overrideValue != '' &&  (selectedOverrideReason == undefined || selectedOverrideReason == ''))
					{
					if(flag == "WEIGHTED_SALES") {
						selectedOverrideReason =this.reasons[1].key;
					}else if(flag == "ORDER_MIX") {
						selectedOverrideReason = this.reasons[1].key;
					}
					}
				
				if(flag == "WEIGHTED_SALES") {
					if(Number(arrElement.recollectweightedsalesmixoverride) == Number(overrideValue))
					{
						if(arrElement.recollectweightedsalesmixoverride == overrideValue && arrElement.recollectweightedsalesmixoverridereason == selectedOverrideReason)
						{  
							this.resetOverrides(flag,rowKey);
							return;
						}
						else
							return;
					}
					arrElement.modifiedsalesmixEdit = overrideValue;
					arrElement.recollectmodifiedsalesmixEdit = overrideValue;
					arrElement.modifiedsalesmix = "--.--";
					arrElement.weightedsalesmixoverride = overrideValue;
					arrElement.weightedsalesmixoverridereason = selectedOverrideReason;
					arrElement.modifiedsalesmixreason = selectedOverrideReason;
					arrElement.overridessummary = selectedOverrideReason;
					arrElement.overridesshowrevert = true;
					if(arrElement.weightedsalesmixoverride != '' || arrElement.weightedsalesmixoverridereason != '')
					{arrElement.overridesshowclear = true;}
				else
					{arrElement.overridesshowclear = false;}
				} else if(flag == "ORDER_MIX") {
					if(Number(arrElement.recollectordermixoverride) == Number(overrideValue))
						return;
					if(arrElement.recollectordermixoverride == overrideValue && arrElement.recollectordermixoverridereason == selectedOverrideReason)
					{
						this.resetOverrides(flag,rowKey);
						return;
					}
					arrElement.newinventorymixEdit = overrideValue;
					arrElement.recollectnewinventorymixEdit = overrideValue;
					arrElement.ordermixoverride = overrideValue;
					arrElement.newinventorymix = "--.--";
					arrElement.ordermix = "--.--";
					arrElement.orderstogenerate = "--";
					arrElement.ordermixoverridereason = selectedOverrideReason;
					arrElement.modifiedordermixreason = selectedOverrideReason;
					arrElement.recollectmodifiedordermixreason = selectedOverrideReason;
					arrElement.overridessummary = selectedOverrideReason;
					arrElement.optimisationshowrevert = true;
					if(arrElement.ordermixoverride != '' ||  arrElement.ordermixoverridereason != '')
					{arrElement.optimisationshowclear = true;}
					else
					{
						arrElement.optimisationshowclear = false;
					}
				}
				var point = $scope.proposals.indexOf(arrElement);
				$scope.proposals[point] = arrElement;
				var index = RenditionProposalService.modifiedOverdOptmArray.indexOf(arrElement);
				if(index != -1) {
					RenditionProposalService.modifiedOverdOptmArray.splice(index,1);
				}
				if(arrElement.recollectordermixoverride != arrElement.ordermixoverride || arrElement.recollectweightedsalesmixoverride != arrElement.weightedsalesmixoverride)
					{
				RenditionProposalService.modifiedOverdOptmArray.push(arrElement);
					}
				$scope.$emit("enable-disable-SubmitJob", $scope);
			}
			this.isValueChanged = function(flag,rowKey){
				var arrElement = $filter('filter')($scope.proposals, { ruid: rowKey  }, true)[0];
				if(flag == "WEIGHTED_SALES")
				{
					if(arrElement.recollectweightedsalesmixoverride != arrElement.weightedsalesmixoverride)
					{
						return {"background-color": "#b6fcae"};
					}
					else
					{
						return "";
					}
				}
				else if(flag == "ORDER_MIX")
				{
					if(arrElement.recollectordermixoverride != arrElement.ordermixoverride)
					{
						return {"background-color": "#b6fcae"};
					}
					else
					{
						return "";
					}
				}


			}
			this.onClickSaveOverrides = function() {
				var renditionData = $scope.proposals;
				var saveOverridesProto = new SaveOverridesPrototype();
				var overrideSum = 0;
				var orderMixSum = 0;
				
				angular.forEach(renditionData, function(overrides, index){
					if(overrides.weightedsalesmixoverride != undefined ? overrides.weightedsalesmixoverride : '')
					{
						overrideSum = overrideSum  + parseFloat(overrides.weightedsalesmixoverride);
					}
					if(overrides.ordermixoverride != undefined ? overrides.ordermixoverride : '')
					{
						orderMixSum = orderMixSum  + parseFloat(overrides.ordermixoverride);
					}
				});
				if(overrideSum > 100) {
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.weightedsalesoverrideSumError'),
						type: 'warning',
						multiple: false
					});
					return false;
				}
				if(orderMixSum > 100) {
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.ordermixoverrideSumError'),
						type: 'warning',
						multiple: false
					});
					return false;
				}
				if(renditionData.length > 0)
				{
					angular.forEach(renditionData, function(jobArrObj, index) {
						var overridesProto = new OverridesPrototype();
						overridesProto.featureCode = jobArrObj.entityid;
						overridesProto.overrideValue = jobArrObj.weightedsalesmixoverride != undefined ? jobArrObj.weightedsalesmixoverride : '';
						if(overridesProto.overrideValue != '')
							{
							overridesProto.overrideValue = (overridesProto.overrideValue / 100) +'';
						saveOverridesProto.overrides.push(overridesProto);
							}
						var constraintsProto = new ConstraintsPrototype();
						constraintsProto.featureCode = jobArrObj.entityid;
						constraintsProto.constraintValue = jobArrObj.ordermixoverride != undefined ? jobArrObj.ordermixoverride : '';
						if(constraintsProto.constraintValue != '')
							{
							constraintsProto.constraintValue = (constraintsProto.constraintValue / 100) +'';
							saveOverridesProto.constraints.push(constraintsProto);	
							}
						

					});

				}
				
				
				saveOverridesProto.market = RenditionProposalService.selectedMarket;
				saveOverridesProto.model = RenditionProposalService.selectedModel;
				if(RenditionProposalService.selectedModelYear== 'ALL')
					{saveOverridesProto.modelYear = RenditionProposalService.currentModelYear+'';}
				else	
					{saveOverridesProto.modelYear = RenditionProposalService.selectedModelYear;}
				saveOverridesProto.userID = this.user.userId;
				saveOverridesProto.marketGroup = this.selectedMarketGroup;
				saveOverridesProto.businessProcess = this.selectedBusinessProcess;
				saveOverridesProto.productionMonth = this.productionMonth; 
				RenditionProposalService.saveOverridesData(JSON.stringify(saveOverridesProto)).then(angular.bind(this,function(result) {
					this.saveOverridesDisabled = true;
							WcAlertConsoleService.addMessage({
								message: $translate.instant('application.success.saveOverridesSuccess'),
								type: 'success',
								multiple: false
							});
						}),function(){
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.unableToSaveOverrides'),
						type: 'warning',
						multiple: false
					});
					console.log('Promise failed while retrieving status from middleware');
				});
			}
			this.unSaveEdit = function(flag,arrElement) {
				if(flag == "WEIGHTED_SALES") {
					if(arrElement.recollectmodifiedsalesmixEdit == undefined || arrElement.recollectmodifiedsalesmixEdit == '') {
						arrElement.modifiedsalesmixEdit=undefined;
						arrElement.modifiedsalesmixreason=undefined;
					}
					else{
						arrElement.modifiedsalesmixEdit = arrElement.recollectmodifiedsalesmixEdit;
						arrElement.modifiedsalesmixreason=arrElement.recollectmodifiedsalesmixreason;
					}
				} else if(flag == "ORDER_MIX"){
					if(arrElement.recollectnewinventorymixEdit == undefined || arrElement.recollectnewinventorymixEdit =='') {
						arrElement.newinventorymixEdit=undefined;
						arrElement.modifiedordermixreason = undefined;
					}else{
						arrElement.newinventorymixEdit=arrElement.recollectnewinventorymixEdit;
						arrElement.modifiedordermixreason=arrElement.recollectmodifiedordermixreason;
					}
				}
			}

			this.clearOverrides = function(flag,rowKey) {
				this.populatedOverrides(flag,"", "",rowKey);
			}
			this.resetOverrides = function(flag,rowKey) {
				var rowkey = rowKey;
				var arrElement=$filter('filter')($scope.proposals, { ruid: rowkey  }, true)[0];
				
				if(flag == "WEIGHTED_SALES") {
					arrElement.modifiedsalesmixEdit =  arrElement.recollectweightedsalesmixoverride;
					arrElement.recollectmodifiedsalesmixEdit =  arrElement.recollectweightedsalesmixoverride;
					arrElement.modifiedsalesmix=arrElement.recollectmodifiedsalesmix;
					arrElement.weightedsalesmixoverride = arrElement.recollectweightedsalesmixoverride;
					arrElement.weightedsalesmixoverridereason = arrElement.recollectweightedsalesmixoverridereason;
					arrElement.modifiedsalesmixreason=arrElement.recollectweightedsalesmixoverridereason;
					arrElement.recollectmodifiedsalesmixreason=arrElement.recollectweightedsalesmixoverridereason;
					arrElement.overridesshowrevert = false;
					if(arrElement.weightedsalesmixoverride != '' || arrElement.weightedsalesmixoverridereason != '')
					{arrElement.overridesshowclear = true;}
					else
					{arrElement.overridesshowclear = false;}
				} else if(flag == "ORDER_MIX") {
					arrElement.newinventorymixEdit=arrElement.recollectordermixoverride;
					arrElement.recollectnewinventorymixEdit = arrElement.recollectordermixoverride;
					arrElement.modifiedordermixreason=arrElement.recollectordermixoverridereason;
					arrElement.recollectmodifiedordermixreason=arrElement.recollectordermixoverridereason;
					arrElement.newinventorymix =  arrElement.recollectnewinventorymix;
					arrElement.ordermix = arrElement.recollectordermix;
					arrElement.orderstogenerate = arrElement.recollectorderstogenerate;
					arrElement.ordermixoverride  = arrElement.recollectordermixoverride;
					arrElement.ordermixoverridereason = arrElement.recollectordermixoverridereason;
					arrElement.optimisationshowrevert = false;
					if(arrElement.ordermixoverride != '' ||  arrElement.ordermixoverridereason != '')
					{arrElement.optimisationshowclear = true;}
					else
					{
						arrElement.optimisationshowclear = false;
					}
				}
				if(arrElement.ordermixoverridereason != undefined && arrElement.ordermixoverridereason != '')
				{
					arrElement.overridessummary = arrElement.ordermixoverridereason;
				}
				else if(arrElement.weightedsalesmixoverridereason != undefined && arrElement.weightedsalesmixoverridereason != '')
				{
					arrElement.overridessummary = arrElement.weightedsalesmixoverridereason;
				}
				else
				{
					arrElement.overridessummary = arrElement.recollectoverridessummary;
				}
				var index = RenditionProposalService.modifiedOverdOptmArray.indexOf(arrElement);
				if(index != -1){
					if(arrElement.ordermixoverride  == arrElement.recollectordermixoverride &&
							arrElement.ordermixoverridereason == arrElement.recollectordermixoverridereason && 
							arrElement.weightedsalesmixoverride == arrElement.recollectweightedsalesmixoverride && 
							arrElement.weightedsalesmixoverridereason == arrElement.recollectweightedsalesmixoverridereason)
					{
						RenditionProposalService.modifiedOverdOptmArray.splice(index,1);
					}
					else
					{
						RenditionProposalService.modifiedOverdOptmArray.splice(index,1);
						RenditionProposalService.modifiedOverdOptmArray.push(arrElement);
					}
				}
				var point = $scope.proposals.indexOf(arrElement );
				$scope.proposals[point]=arrElement;
				$scope.$emit("enable-disable-SubmitJob", $scope);
			}

		

			this.overrides = {};
			this.displayConfirmDialog = function() {
					RenditionModalService.modalType = "Commit";
					var commitMessage = {
							"sessionId":RenditionProposalService.sessionId, 
							"loggedInUserId":this.user.userId,
							"productionMonth":this.productionMonth};
					RenditionModalService.open("COMMIT").then(angular.bind(this,function(result) {
						RenditionProposalService.commit(commitMessage).then(angular.bind(this,function(result) {
							if(result.exception)
							{
								WcAlertConsoleService.addMessage({
									message: $translate.instant('conflictNotification.unableToCommit'),
									type: 'warning',
									multiple: false
								});
								return false;
							}
							this.enableUnlockDownload = true;
							this.isCommited=true;
							WcAlertConsoleService.addMessage({
								message: $translate.instant('application.success.commitSuccess'),
								type: 'success',
								multiple: false
							});
						}))

				}), function() {
				});
			}

			this.unlockProposal= function(){
			
					RenditionModalService.modalType = "Unlock";
					var unlockMessage = {
							"sessionId":RenditionProposalService.sessionId, 
							"loggedInUserId":this.user.userId,
							"productionMonth":this.productionMonth};
					RenditionModalService.open("UNLOCK").then(angular.bind(this,function(result) {
						RenditionProposalService.unlock(unlockMessage).then(angular.bind(this,function(result) {
							if(result.exception)
							{
								WcAlertConsoleService.addMessage({
									message: $translate.instant('conflictNotification.unableToUnlock'),
									type: 'warning',
									multiple: false
								});
								return false;
							}
							this.enableUnlockDownload = false;
							this.isCommited=false;
							WcAlertConsoleService.addMessage({
								message: $translate.instant('application.success.unlockSuccess'),
								type: 'success',
								multiple: false
							});
							this.onClickProposalTab();
						}));

				}), function() {
				});
			}

			this.displayRenditionModal = function() {
				RenditionProposalService.loggedInUserId = this.user.userId;
				if(RenditionProposalService.modifiedOverdOptmArray.length > 0) {
					var renditionData = $scope.proposals;
					var saveOverridesProto = new SaveOverridesPrototype();
					var overrideSum = 0;
					var orderMixSum = 0;
					angular.forEach(renditionData, function(overrides, index){
						if(overrides.weightedsalesmixoverride != undefined ? overrides.weightedsalesmixoverride : '')
						{
							overrideSum = overrideSum  + parseFloat(overrides.weightedsalesmixoverride);
						}
						if(overrides.ordermixoverride != undefined ? overrides.ordermixoverride : '')
						{
							orderMixSum = orderMixSum  + parseFloat(overrides.ordermixoverride);
						}
					});
					if(overrideSum > 100) {
						WcAlertConsoleService.addMessage({
							message: $translate.instant('conflictNotification.weightedsalesoverrideSumError'),
							type: 'warning',
							multiple: false
						});
						return false;
					}
					if(orderMixSum > 100) {
						WcAlertConsoleService.addMessage({
							message: $translate.instant('conflictNotification.ordermixoverrideSumError'),
							type: 'warning',
							multiple: false
						});
						return false;
					}
				}
					RenditionModalService.open("JOB_SUBMIT").then(angular.bind(this,function(result) {
						result=result.status;
						displayStatus(result);
						RenditionProposalService.modifiedOverdOptmArray = [];
						this.jobStatus = result;
						this.submitJobDisabled = true;
						this.saveOverridesDisabled = true;
						if(this.jobStatus == 'COMPLETED' || this.jobStatus == 'FAILED') {
							RenditionModalService.open("RELOAD_CURRENTSTATE").then(angular.bind(this,function(result) {
								this.loadContent(RenditionProposalService.selectedModelYear);
								RenditionProposalService.renditionDataReloaded = true;
								this.onClickCurrentTab();
							}), function() {
								console.log('Promise failed in Rendition Modal..');
							});
						}
					}), function(error) {
						console.log('Error Thrown');
					});
				
			};

			this.checkStatus = function(){
				if(!(this.jobStatus == 'COMPLETED' || this.jobStatus == 'FAILED'))
				{
					console.log(RenditionProposalService.sessionId);
					RenditionProposalService.checkStatus(RenditionProposalService.sessionId).then(angular.bind(this,function(result){
						displayStatus(result.status);
						this.jobStatus = result.status;
						if(this.jobStatus == 'COMPLETED' || this.jobStatus == 'FAILED')
						{
							RenditionModalService.open("RELOAD_CURRENTSTATE").then(angular.bind(this,function(result) {
								this.loadContent(RenditionProposalService.selectedModelYear);
								RenditionProposalService.renditionDataReloaded = true;
								this.onClickCurrentTab();
								}), function() {
								console.log('Promise failed in Rendition Modal..');
							});
						}
					}), function(){
						console.log('Promise failed while retrieving status from middleware');
					});
				}
				else
				{
					displayStatus(this.jobStatus);
				}
			}

			function displayStatus(result){
				if(result == 'COMPLETED' || result == 'FAILED')
				{
					$scope.toggle=true;
					$scope.isJobRunning = false;
				}
				else{
					$scope.toggle=false;
					$scope.isJobRunning = true;
				}
			}

			this.isActiveTab = function(title) {
				return title == this.currentTabTitle;
			}

			$scope.$on("enable-disable-SubmitJob", angular.bind(this,function(event, data) {
				if(RenditionProposalService.totalOrdersToGenerate == undefined || RenditionProposalService.totalOrdersToGenerate =='' || RenditionProposalService.totalOrdersToGenerate ==0)
					{
					this.saveOverridesDisabled = true;
					this.submitJobDisabled = true;
					}
				else if((RenditionProposalService.modifiedOverdOptmArray.length > 0) || (RenditionProposalService.totalOrdersToGenerate != RenditionProposalService.initialTotalOrdersToGenerate && RenditionProposalService.totalOrdersToGenerate > 0))
					{
					this.saveOverridesDisabled = false;
					this.submitJobDisabled = false;
					}
				else  if((RenditionProposalService.modifiedOverdOptmArray.length == 0) && (RenditionProposalService.totalOrdersToGenerate == RenditionProposalService.initialTotalOrdersToGenerate)) {
					this.saveOverridesDisabled = true;
					this.submitJobDisabled = true;
				}
			}));

			
			this.proposalsJSONForDownload = function() {
				var proposalArray = [];
				angular.forEach($scope.proposals,function(proposal,index){
					var	newElement = {"EntityID": proposal.entityid 
							,"DBPID":proposal.dbpid
							,"Model Year" : proposal.modelyear
							,"Engine" : proposal.engine
							,"Body" : proposal.body
							,"Derivative" : proposal.derivative
							,"SVP" : proposal.svp
							,"Transmission" : proposal.transmission ? proposal.transmission : ''
							,"Modified Sales Mix" : proposal.modifiedsalesmix ? proposal.modifiedsalesmix : ''
							,"Order Mix" : proposal.ordermix ?  proposal.ordermix : ''
							,"Orders to Generate" : proposal.orderstogenerate ?  proposal.orderstogenerate : ''
							,"New Inventory Mix" : proposal.newinventorymix ? proposal.newinventorymix : ''
							,"Overrides Summary" : proposal.overridessummary ? proposal.overridessummary : ''
					};
					proposalArray.push(newElement);
				});
				return proposalArray;
			}

			this.JSONToCSVConvertor = function(ReportTitle, ShowLabel) {
				JSONData = this.proposalsJSONForDownload();
				var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
				var CSV = '';    
				if (ShowLabel) {
					var row = "";
					for (var index in arrData[0]) {
						row += index + ',';
					}
					row = row.slice(0, -1);
					CSV += row + '\r\n';
				}
				for (var i = 0; i < arrData.length; i++) {
					var row = "";
					for (var index in arrData[i]) {
						row += '"' + arrData[i][index] + '",';
					}
					row.slice(0, row.length - 1);
					CSV += row + '\r\n';
				}
				if (CSV == '') {        
					alert("Invalid data");
					return;
				}   
				var fileName = "";
				fileName += ReportTitle.replace(/ /g,"_");   
				var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
				var link = document.createElement("a");    
				link.href = uri;
				link.style = "visibility:hidden";
				link.download = fileName + ".csv";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			
			
		}]);
