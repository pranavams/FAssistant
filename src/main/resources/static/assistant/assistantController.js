'use strict';

var instanceToCall;

angular.module('assistantModule').controller('assistantController', ['$scope','$rootScope', '$state', '$q', 'AssistantService', function($scope, $rootScope, $state, $q, AssistantService){
	this.version = angular.version;
	var vm=this;
	instanceToCall = $scope;
	
	//AssistantService.getUserInformation();	
	
	var bizWord = null;

	var recognition = null;

	vm.initWebKit = function(){
		recognition = new webkitSpeechRecognition();
		console.log("recog " + recognition);
		recognition.continuous = false;
		recognition.interimResults = true;

		recognition.onstart = function() {
			console.log("On Started " + event);
		}
		
		var final_transcript = [];

		recognition.onresult = function(event) {
			var interim_transcript = '';
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				final_transcript.push(event.results[i][0].transcript);
			}
		}

		recognition.onerror = function(event) {
			console.log("On error " + event);
		}
		
		recognition.onend = function() {
			console.log("Openend " + final_transcript);
			vm.processPhrases(final_transcript);
			final_transcript.length = 0;
		}
	}
	
	vm.startRecording = function (){
		recognition.start();
		document.getElementById("imgMic").src = "assistant/images/mic.gif";		
	}
	
	vm.initAnnyang = function() {
		if (annyang) {
			window.alert("try asking for [show me orders generated for 2017 edge in Europe] [Supported Models Fiesta, Edge, EcoSport, Market Europe, model year 2017]")			
			var commands = {
				'forecast *tag' : function(tag) {},
				'order *tag' : function(tag) {},
				'show *tag' : function(tag) {},
				'fetch *tag' : function(tag) {},
				'get *tag' : function(tag) {},
				'what is *tag' : function(tag) {}
			};
			annyang.addCommands(commands);
			annyang.addCallback('resultMatch', function(userSaid, commandText, phrases) {
				//phrases = [	["show", "Jobs", "for", "2017", "edge", "europe", "Jobs"] ];				
				console.log("From Annyang " + phrases);
				vm.processPhrases(phrases);
			});
			
			annyang.setLanguage("en-US");
			annyang.start();
		} else {
			window.alert("Oops!!! Am blocked from hearing your voice in this device");
		}
	}
	
	
	vm.isEmpty = function(bizWord){
		if(bizWord.Request  == ""){
			speak("What should I search for? Is it Jobs or Orders.  Kindly include that in your request.");
			return true;			
		} else if (bizWord.Model == ""){
			speak("I cannot help, please give me a specific model.");
			return true;
		} else if (bizWord.ModelYear == ""){
			speak("I cannot help, please give me a specific model year.");
			return true;			
		} else if (bizWord.MarketGroup == ""){
			speak("I cannot help, please give me a specific market group.");
			return true;			
		} else if (bizWord.Market == "" && bizWord.Request == "Jobs"){
			speak("I cannot help, please give me a specific market.");
			return true;			
		} else {
			return false;
		}
	}
	
	vm.processPhrases = function(phrases){
		bizWord = findBusinessWords(phrases, bizWord);
		console.log("BizWord " + JSON.stringify(bizWord));
		if(vm.isEmpty(bizWord)){
			return;
		}
		if(bizWord.Request == "Jobs"){
			vm.processForSearchJobs(bizWord);			
		} else if (bizWord.Request == "Orders" ){
			vm.processForRenditionProposals(bizWord);
		}
		bizWord = null;
	}

	vm.processForSearchJobs = function(bizWord){
		var searchJobsParam = {
			businessProcess: bizWord.BizProcess,
			jobStatus:["All"],
			market: bizWord.Market,
			marketGroup: bizWord.MarketGroup, 
			model: bizWord.Model,
			modelYear: bizWord.ModelYear,
			processMonth: moment(new Date()).format("MMM-YYYY"),
			processType: "MRKT"
		};
		var findForText = "Searching " + logConstants[bizWord.Request] + "s managed for " + bizWord.ModelYear + " " + bizWord.Model + " in " + logConstants[bizWord.MarketGroup]; 
		speak(findForText);
		vm.searchJobs(searchJobsParam).then(function(response){
			console.log("InController : searchJobs :: " + response);
			var startedCount = response.jobs.filter(function(job){
				return job.status === "STARTED";
			}).length;
			var completedCount = response.jobs.filter(function(job){
				return job.status === "COMPLETED";
			}).length;
			var submittedCount = response.jobs.filter(function(job){
				return job.status === "SUBMITTED";
			}).length;
			var failedCount = response.jobs.filter(function(job){
				return job.status === "FAILED";
			}).length;

			speak("Total " + response.jobs.length + " jobs, of which " + 
					submittedCount + ((submittedCount <= 1) ? " is" : " are") + " submitted, " + 
					startedCount + ((startedCount <= 1) ? " is" : " are") + " started, " + 
					completedCount + ((completedCount <= 1) ? " is" : " are") + " completed, and " + 
					failedCount + ((failedCount <= 1) ? " is" : " are") + " failed."
			);
		});
	}
	
	vm.processForRenditionProposals = function(bizWord){
		var findForText = logConstants[bizWord.BizProcess] + " for " + bizWord.ModelYear + " " + bizWord.Model + " in " + logConstants[bizWord.MarketGroup]; 
		speak("finding " + findForText);
		vm.invokeRenditionModels(bizWord.BizProcess, bizWord.MarketGroup, [], bizWord.Model, bizWord.ModelYear).then(function(response){
			speak(response + " " + findForText);
		});
	}
	
	vm.flattenAndFilterModels = function(data, model, modelYear){
		return data.map(function(mktObj){
			return mktObj.models.map(function(modelObj){
				return modelObj.modelYears.map(function(myObj){
						return {
							marketKey  : mktObj.key,
							marketName : mktObj.name,
							modelKey   : modelObj.key,
							modelName  : modelObj.name,
							modelYear  : myObj.modelYear,
							sessionId  : myObj.sessionId
						};
				});
			}).reduce(function(flatList,myList){
				return flatList.concat(myList);
			},[]);
		}).reduce(function(flatList,modelsList){
			return flatList.concat(modelsList);
		},[]).filter(function(obj){
			return obj.modelYear !== "ALL" && obj.sessionId !== "null" && obj.modelName.toUpperCase().includes(model.toUpperCase()) && obj.modelYear.includes(modelYear);
		});
	}
	
	vm.invokeRenditionModels = function(businessProcess, marketGroup, markets, model, modelYear){
		var forecastValue = 0;
		var deferred = $q.defer();
		var listOfRenditionModels = AssistantService.getRenditionModels(businessProcess, marketGroup, markets).then(function(result){
			console.log("invokeRenditionModels::Response for getRenditionModels " + JSON.stringify(result) );
			var vehiclesList = vm.flattenAndFilterModels(result.markets, model, modelYear);
			console.log("invokeRenditionModels::Flattened Model List: " + JSON.stringify(vehiclesList));
			vehiclesList.forEach(function(vehicle){
				forecastValue = vm.invokeRendition(vehicle);
				return forecastValue;
			});
			deferred.resolve(forecastValue);
  		});
		return deferred.promise;
	}
	
	vm.invokeRendition = function(vehicle){
		console.log("invokeRendition::" + JSON.stringify(vehicle));
		var deferred = $q.defer();
		var forecast = 0;
		var listOfRenditions = AssistantService.getRendition(vehicle).then(function(result){
			console.log("invokeRendition::Response for Rendition  " + JSON.stringify(result));
			forecast = result.RenditionProposal.reduce(function (sum, iForecast) {
			    return parseInt(sum) + parseInt(iForecast.orderstogenerate);
			}, 0);
			console.log("invokeRendition::Total Forecast " + forecast);
			deferred.resolve(forecast);
  		});		
		return deferred.promise;
	}
	
	vm.searchJobs = function(searchJob){
		console.log("searchJobs::" + JSON.stringify(searchJob));
		var deferred = $q.defer();
		var listOfRenditions = AssistantService.searchJobs(searchJob).then(function(result){
			console.log("searchJob::Response for SearchJobs " + JSON.stringify(result));
			deferred.resolve(result);
  		});		
		return deferred.promise;		
	}
			
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
