'use script';

describe('ForecastvsMPWController', function() {
	var forecastvsMPWController,
	forecastvsMPWService,
	$q;
	beforeEach(function() {
		module('OgtModule', function($provide) {
			$provide.value('WcTranslateConfiguratorService', {
				loadPartAndRefresh : function() {
				}
			});
			$provide.value('$state', {});
		});
		module('ForecastvsMPWModule');
		inject(function($injector) {
			forecastvsMPWService = $injector.get('ForecastvsMPWService');
			$q = $injector.get('$q');
			var $rootScope = $injector.get('$rootScope');
			var $controller = $injector.get('$controller');
			var scope = $rootScope.$new();
			forecastvsMPWController = $controller('ForecastvsMPWController', {
				$scope : scope
			});
		});

	});

	describe('getModelYears', function() {
		it('should get modelyear field from input object', function() {
			var input = [ {
				"modelYear" : "2017"
			} ];
			var expected = [ "2017" ];
			var modelYears = forecastvsMPWController.getModelYears(input);
			expect(modelYears).toEqual(expected);
		});

		it('should get modelYears from all objects', function() {
			var input = [ {
				"modelYear" : "2017"
			}, {
				"modelYear" : "2018"
			} ];
			var expected = [ "2017", "2018" ];
			var modelYears = forecastvsMPWController.getModelYears(input);
			expect(modelYears).toEqual(expected);
		});

	});

	describe('getModels', function() {
		it('should get Models', function() {
			var input = [ {
				"modelYear" : "2017",
				"models" : [ {
					"key" : "1",
					"name" : "C-MAX"
				}, {
					"key" : "2",
					"name" : "EDGE",
				} ]
			} ];
			var expected = [ "C-MAX", "EDGE" ];
			var models = forecastvsMPWController.getModels(input, "2017");
			expect(models).toEqual(expected);

		});
	});

	describe('filterByModel',function(){
		it('should return the object corresponding to modelyear',function(){
			var input =  [ {
					"key" : "1",
					"name" : "C-MAX",
					"horizonStartMonth" : "201709"
				}, {
					"key" : "2",
					"name" : "EDGE",
				} ];
			var expected = {
				"key" : "1",
				"name" : "C-MAX",
				"horizonStartMonth" : "201709"
			};
			var filterModelObject = forecastvsMPWController.filterByModel(input, "C-MAX");
			expect(filterModelObject).toEqual(expected);
		});
	});
	describe('getStartMonth', function() {
		it('should get the respective start month',function(){
			var input = {
					"key" : "1",
					"name" : "C-MAX",
					"horizonStartMonth":"201709"
				};
			var expected = new Date(2017,8);
			var startMonth = forecastvsMPWController.getStartMonth(input);
			expect(startMonth.getTime()).toEqual(expected.getTime());
		});
	});
	
	describe('getEndMonth', function() {
		it('should get the respective end month',function(){
			var input = {
					"key" : "1",
					"name" : "C-MAX",
					"horizonStartMonth":"201709",
					"horizonEndMonth":"201712"
				};
			var expected = new Date(2017,11);
			var endMonth = forecastvsMPWController.getEndMonth(input);
			expect(endMonth.getTime()).toEqual(expected.getTime());
		});
	});
	
	describe('getForecastvsMPWData',function(){
		beforeEach(function(){
			var deferred = $q.defer();
			spyOn(forecastvsMPWService,'getForecastMPWdata').and.returnValue(deferred.promise);
			spyOn(forecastvsMPWController,'deriveRequestParameters');
		});
		it('should call the service for retrieving MPW json data',function(){
			forecastvsMPWController.getForecastvsMPWData();
			expect(forecastvsMPWService.getForecastMPWdata).toHaveBeenCalled();
		});
	});
	
	describe('deriveRequestParameters',function(){
		it('should return the request object',function(){
			forecastvsMPWController.modelYearObject=[{key: "1", name: "MKZ", horizonStartMonth: "201709", horizonEndMonth: "201808"},
			                                         {key: "2", name: "Edge", horizonStartMonth: "201709", horizonEndMonth: "201808"}];
			forecastvsMPWController.selectedModelYear = "2018";
			forecastvsMPWController.selectedModel = "MKZ";
			forecastvsMPWController.startMonthRange = {
				startDate : new Date(2017,8)	
			};
			forecastvsMPWController.endMonthRange = {
					endDate : new Date(2018,7)
			}
			spyOn(forecastvsMPWController,'getAllFamilyKeys').and.returnValue([]);
			var expected = {
					modelYear : "2018",
					modelKey : "1",
					startMonth : "201709",
					endMonth : "201808",
					families : []
			}
			expect(forecastvsMPWController.deriveRequestParameters()).toEqual(expected);
		});
	});
	
	describe('getMonths',function(){
		it('should get months',function(){
			var input = [{week : "20170701",month: "201707"}];
			var expected = [moment("201707","YYYYMM")];
			expect(forecastvsMPWController.getMonths(input)).toEqual(expected);
		});
		it('should get unique months',function(){
			var input = [{week : "20170701",month: "201707"},{week : "20170702",month: "201707"}];
			var expected = [moment("201707","YYYYMM")];
			expect(forecastvsMPWController.getMonths(input)).toEqual(expected);
		});
	});
	
	describe('prependMPWVolumeToMonths',function(){
		it('should prepend MPWVolume before the start of every quarter',function(){
			var input = [moment("201707","YYYYMM")];
			var expected = ["MPW Volume", moment("201707","YYYYMM")];
			expect(forecastvsMPWController.prependMPWVolumeToMonths(input)).toEqual(expected);
		});
	});
	
	describe('getWeeks',function(){
		it('should convert weeks array to array of moment objects',function(){
			var input = [{week : "20170701",month: "201707"}];
			var expected = [{week : moment("20170701","YYYYMMDD"), month : moment("201707","YYYYMM")}];
			expect(forecastvsMPWController.getWeeks(input)).toEqual(expected);
		});
	});
	
	describe('getNumberOfWeeks',function(){
		it('should return the number of weeks for the given month',function(){
			forecastvsMPWController.weeks = [{week : moment("20170701","YYYYMMDD"), month : moment("201707","YYYYMM")},
			                                 {week : moment("20170702","YYYYMMDD"), month : moment("201707","YYYYMM")}];
			var month = moment("201707","YYYYMM");
			var expected = 2;
			expect(forecastvsMPWController.getNumberOfWeeks(month)).toEqual(expected);
		});
	});
	
	describe('getTypeOfMonthObj',function(){
		it('should return true if the type of month is object',function(){
			var month = moment("201707",'YYYYMM');
			expect(forecastvsMPWController.getTypeOfMonthObj(month)).toBe(true);
		});
		it('should return false if the type of month is string',function(){
			var month = "AAA";
			expect(forecastvsMPWController.getTypeOfMonthObj(month)).toBe(false);
		});
	});
	
	describe('getSelectedFamiliesAndFeatures',function(){
		beforeEach(function(){
			forecastvsMPWController.familiesAndFeatures = [ {
		        "ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"
		      },
		      {
		        "ftrCode": "AAAAB",
		        "famName": "VERSION-MFC",
		        "famCode": "AAA"
		      },];
		});
		it('should return the feature records for the selected families from dropdown',function(){
			forecastvsMPWController.selectedFamilies = ['AA5'];
			var expected = [{
		        "ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"
		      }];
			expect(forecastvsMPWController.getSelectedFamiliesAndFeatures()).toEqual(expected);
		});
		it('should return all the feature records if ALL is selected in dropdown',function(){
			forecastvsMPWController.selectedFamilies = ['ALL'];
			var expected = [{
		        "ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"
		      }, {
			        "ftrCode": "AAAAB",
			        "famName": "VERSION-MFC",
			        "famCode": "AAA"
			      }];
			expect(forecastvsMPWController.getSelectedFamiliesAndFeatures()).toEqual(expected);
		});
	});
	
	describe('getFeaturesRecords',function(){
		it('should return total obj after one family',function(){
			var input = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"}];
			var expected = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5","displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"},{
			    	  type : 'Total',
			    	  famCode : "AA5",
			    	  famName : "LIGHT TRUCK WHEELBASES",
			    	  "displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
			      }];
			expect(forecastvsMPWController.getFeaturesRecords(input)).toEqual(expected);
		});
		it('should return total obj after two features of same family',function(){
			var input = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"},{"ftrCode": "AA5DK",
			        "famName": "LIGHT TRUCK WHEELBASES",
			        "famCode": "AA5"}];
			var expected = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5", "displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"},{"ftrCode": "AA5DK",
			        "famName": "LIGHT TRUCK WHEELBASES",
			        "famCode": "AA5","displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"},{
			    	  type : 'Total',
			    	  famCode : "AA5",
			    	  famName : "LIGHT TRUCK WHEELBASES","displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
			      }];
			expect(forecastvsMPWController.getFeaturesRecords(input)).toEqual(expected);
		});
		it('should return total obj after each family, given that each family has only one feature',function(){
			var input = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"},{
			        "ftrCode": "AAAAB",
			        "famName": "VERSION-MFC",
			        "famCode": "AAA"
			      }];
			var expected = [{"ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5","displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"},{
			    	  type : 'Total',
			    	  famCode : "AA5",
			    	  famName : "LIGHT TRUCK WHEELBASES","displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
			      },{
			        "ftrCode": "AAAAB",
			        "famName": "VERSION-MFC",
			        "famCode": "AAA","displayFamilyName" : "VERSION-MFC - AAA"
			      },{
			    	  type : 'Total',
			    	  famCode : "AAA",
			    	  famName : "VERSION-MFC", "displayFamilyName" : "VERSION-MFC - AAA"
			      }];
			expect(forecastvsMPWController.getFeaturesRecords(input)).toEqual(expected);
		});
		it('should return total obj after every family set of records',function(){
			var input = [{
		        "ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"
		      }, 
		      {
		        "ftrCode": "AA5DK",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5"
		      },{
		        "ftrCode": "AAAAB",
		        "famName": "VERSION-MFC",
		        "famCode": "AAA"
		      }];
			var expected = [{
		        "ftrCode": "AA5DJ",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5",
		        "displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
		      },{
		        "ftrCode": "AA5DK",
		        "famName": "LIGHT TRUCK WHEELBASES",
		        "famCode": "AA5",
		        "displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
		      },{
		    	  type : 'Total',
		    	  famCode : "AA5",
		    	  famName : "LIGHT TRUCK WHEELBASES",
		    	  "displayFamilyName" : "LIGHT TRUCK WHEELBASES - AA5"
		      },{
		        "ftrCode": "AAAAB",
		        "famName": "VERSION-MFC",
		        "famCode": "AAA",
		        "displayFamilyName" : "VERSION-MFC - AAA"
		      },{
		    	  type : 'Total',
		    	  famCode : "AAA",
		    	  famName : "VERSION-MFC",
		    	  "displayFamilyName" : "VERSION-MFC - AAA"
		      }];
			expect(forecastvsMPWController.getFeaturesRecords(input)).toEqual(expected);
		});
	});
	
	describe('getNumberOfFeaturesForFamily',function(){
		it('should return the count of features for the given family',function(){
			forecastvsMPWController.familiesAndFeatures = [{
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    },
				    {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    },
				    {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    }];
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    };
			var expected = 3;
			expect(forecastvsMPWController.getNumberOfFeaturesForFamily(familyObj)).toEqual(expected);
		});
	});
	
	describe('isNextFamily',function(){
		it('should return true if the previous family name is different from current family name',function(){
			forecastvsMPWController.currentFamilyName = [];
			expect(forecastvsMPWController.isNextFamily("TR-")).toBe(true);
		});
		it('should return false if the previous family name is the same as current family name',function(){
			forecastvsMPWController.currentFamilyName = ["TR-"];
			expect(forecastvsMPWController.isNextFamily("TR-")).toBe(false);
		});
	});
	
	describe('getTransformedWeeks',function(){
		it('should prepend MPW volume before each quarter of the weeks array', function(){
			forecastvsMPWController.weeks = [{week:moment("20170901","YYYYMMDD"),month:moment("201709","YYYYMM")}];
			var expected = [{type:"MPW",quarter:"20173"},
			                {week:moment("20170901","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"},
			                {week:moment("20170901","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Mix"}];
			expect(forecastvsMPWController.getTransformedWeeks()).toEqual(expected);
		});
	});
	
	describe('transformVolumes',function(){
		beforeEach(function(){
			forecastvsMPWController.selectedFamiliesAndFeatures = [{
		        "ftrCode": "AAAAB",
		        "famName": "VERSION-MFC",
		        "famCode": "AAA"
		      },{
			        "ftrCode": "AAAAC",
			        "famName": "VERSION-MFC",
			        "famCode": "AAA"
			      },{
		    	  type : 'Total',
		    	  famCode : "AAA",
		    	  famName : "VERSION-MFC"
		      }];
		});
		it('should transform MPW volumes',function(){
			var mpwVolumes = [{
                              "ftrCode": "AAAAB",
                              "month" : "201701",
                              "vol": "100"},{
                                  "ftrCode": "AAAAC",
                                  "month" : "201701",
                                  "vol": "200"}];
			var expected = [{famCode : "AAA",ftrCode:"AAAAB",quarter:"20171",vol:100},
			                {famCode : "AAA",ftrCode:"AAAAC",quarter:"20171",vol:200}];
			expect(forecastvsMPWController.transformMPWVolumes(mpwVolumes)).toEqual(expected);
		});
		it('should transform volumes',function(){
			var volumes = [{
					      "ftrCode": "AAAAB",
					      "week": "20170904",
					      "vol": "100",
					      "mix": "4.55"}];
			var expected = [{
				famCode : "AAA",
				  ftrCode: "AAAAB",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 100,
			      mix: 4.55
			    }];
			expect(forecastvsMPWController.transformVolumes(volumes)).toEqual(expected);
		});
	});
	
	describe('getQuarterWiseVolumes',function(){
		it('should return MPWvolume objects that belong to the given quarter',function(){
			var weekObj = {type:"MPW",quarter:"20171"};
			forecastvsMPWController.mpwVolumes = [{ftrCode:"0",quarter:"20171",vol:100},
			                                      {ftrCode:"0",quarter:"20172",vol:200}];
			var expected = [{ftrCode:"0",quarter:"20171",vol:100}];
			expect(forecastvsMPWController.getQuarterWiseVolumes(weekObj)).toEqual(expected);
		});
	});

	describe('getFeatureWiseMPWVolumes',function(){
		it('should return MPWVolume objects that belong to the given feature',function(){
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0",
				    };
			forecastvsMPWController.mpwVolumes = [{ftrCode:"0",quarter:"20171",vol:100},
			                                      {ftrCode:"0",quarter:"20172",vol:200}];
			var expected = [{ftrCode:"0",quarter:"20171",vol:100},{ftrCode:"0",quarter:"20172",vol:200}];
			expect(forecastvsMPWController.getFeatureWiseMPWVolumes(familyObj)).toEqual(expected);
		});
		it('should return MPWVolume objects from the cache for the given feature',function(){
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0",
				    };
			forecastvsMPWController.featureWiseMPWVolumesCache = {"0" : [{ftrCode:"0",quarter:"20171",vol:100},{ftrCode:"0",quarter:"20172",vol:200}]};
			var expected = [{ftrCode:"0",quarter:"20171",vol:100},{ftrCode:"0",quarter:"20172",vol:200}];
			expect(forecastvsMPWController.getFeatureWiseMPWVolumes(familyObj)).toEqual(expected);
		});
	});
	
	describe('getWeekWiseForecastVolumes',function(){
		it('should return forecastCounts that belong to the given week',function(){
			var weekObj = {week:moment("20170904","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"};
			forecastvsMPWController.volumes = [{
				  ftrCode: "0",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 100,
			      mix: 4.55
			    },{
			      ftrCode: "0",
			      week: moment("20170911","YYYYMMDD"),
			      vol: 200,
			      mix: 8.55
			    }];
			var expected = [{
				  ftrCode: "0",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 100,
			      mix: 4.55
			    }];
			expect(forecastvsMPWController.getWeekWiseForecastVolumes(weekObj)).toEqual(expected);
		});
	});
	describe('getVolumeCountsMix',function(){
		var familyObj;
		beforeEach(function(){
			familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0",
				    };
		})
		it('should return the MPW volume for the given quarter and feature',function(){
			var weekObj = {type:"MPW",quarter:"20171"};
			forecastvsMPWController.mpwVolumes = [{ftrCode:"0",quarter:"20171",vol:100},
			                                      {ftrCode:"0",quarter:"20172",vol:200}];
			var expected = {ftrCode:"0",quarter:"20171",vol:100};
			expect(forecastvsMPWController.getMPWVolume(familyObj,weekObj)).toEqual(expected);
		});
		it('should return the counts and mix for the given week and feature',function(){
			var weekObj = {week:moment("20170904","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"};
			forecastvsMPWController.volumes = [{
									  ftrCode: "0",
								      week: moment("20170904","YYYYMMDD"),
								      vol: 100,
								      mix: 4.55
								    },{
								      ftrCode: "0",
								      week: moment("20170911","YYYYMMDD"),
								      vol: 200,
								      mix: 8.55
								    }];	
			var expected = {
				      ftrCode: "0",
				      week: moment("20170904","YYYYMMDD"),
				      vol: 100,
				      mix: 4.55
				    };
			expect(forecastvsMPWController.getCounts(familyObj,weekObj)).toEqual(expected);
		});
	});
	
	describe('isCountGreaterThanMPWVol',function(){
		beforeEach(function(){
			forecastvsMPWController.volumes = [{
				ftrCode: "0",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 400,
			      mix: 4.55
			    },{
			    	ftrCode: "0",
			      week: moment("20170911","YYYYMMDD"),
			      vol: 100,
			      mix: 8.55
			    }];	
			forecastvsMPWController.mpwVolumes = [{ftrCode:"0",quarter:"20171",vol:100},
                            {ftrCode:"0",quarter:"20173",vol:200}];
		});
		it('should return true if the count is greater than MPW volume',function(){
			var weekObj = {week:moment("20170904","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"};
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    };
			expect(forecastvsMPWController.isCountGreaterThanMPWVol(familyObj,weekObj)).toBe(true);
		});
		it('should return false if the count is lesser than MPW volume',function(){
			var weekObj = {week:moment("20170911","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"};
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    };
			expect(forecastvsMPWController.isCountGreaterThanMPWVol(familyObj,weekObj)).toBe(false);
		});
	});
	
	describe('isMonthLockedIn',function(){
		it('should return true if the month is in locked period',function(){
			forecastvsMPWController.selectedModelObject = {
					"lockedInMonths": ["201709"]
			};
			var input = moment("201709","YYYYMM");
			expect(forecastvsMPWController.isMonthLockedIn(input)).toBe(true);
		});
		it('should return false if the month is in locked period',function(){
			forecastvsMPWController.selectedModelObject = {
					"lockedInMonths": ["201709","201710"]
			};
			var input = moment("201711","YYYYMM");
			expect(forecastvsMPWController.isMonthLockedIn(input)).toBe(false);
		});
	});
	
	describe('getColourOfCell',function(){
		beforeEach(function(){
			forecastvsMPWController.volumes = [{
				  ftrCode: "0",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 400,
			      mix: 4.55
			    },{
			    	ftrCode: "0",
			      week: moment("20170911","YYYYMMDD"),
			      vol: 100,
			      mix: 8.55
			    },{
					  ftrCode: "1",
				      week: moment("20170904","YYYYMMDD"),
				      vol: 0,
				      mix: 0
			    },{
			    	ftrCode: "1",
			      week: moment("20170911","YYYYMMDD"),
			      vol: 0,
			      mix: 0
			    }];	
			forecastvsMPWController.mpwVolumes = [{ftrCode:"0",quarter:"20171",vol:0},
                            {ftrCode:"0",quarter:"20173",vol:0},{ftrCode:"1",quarter:"20171",vol:200},
                            {ftrCode:"1",quarter:"20173",vol:100}];
		});
		it('should return the color of the feature when the mpw vol is zero for all quarters',function(){
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "0"
				    };
			expect(forecastvsMPWController.getColourOfFeature(familyObj)).toEqual('mpwZeroForAllQuarters');
		});
		it('should return the color of the feature when the forecast vol is zero for all quarters',function(){
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "1"
				    };
			expect(forecastvsMPWController.getColourOfFeature(familyObj)).toEqual('forecastZeroForAllQuarters');
		});
	});
	
	describe('getCountsSum',function(){
		it('should return the total feature counts for the given familyObj and weekObj',function(){
			var weekObj = {week:moment("20170904","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Counts"};
			var familyObj = {
				      "famCode": "AAA",
				      "famName": "family1",
				      "ftrCode": "1"
				    };
			forecastvsMPWController.volumes = [{
				famCode : "AAA",
				  ftrCode: "AAAAB",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 100,
			    },{
					famCode : "AAA",
					  ftrCode: "AAAAC",
				      week: moment("20170904","YYYYMMDD"),
				      vol: 200,
				    }];
			expect(forecastvsMPWController.getCountsSum(familyObj,weekObj)).toEqual(300);
		});
		it('should return the total mpw volume for the given familyObj and weekObj',function(){
			var weekObj = {type:"MPW",quarter:"20171"};
			var familyObj = {
				      "famCode": "AAA",
				      "famName": "family1",
				      "ftrCode": "1"
				    };
			forecastvsMPWController.mpwVolumes = [{famCode : "AAA",ftrCode:"AAAAB",quarter:"20171",vol:100},
			          			                {famCode : "AAA",ftrCode:"AAAAC",quarter:"20171",vol:200}];
			expect(forecastvsMPWController.getMPWSum(familyObj,weekObj)).toEqual(300);
		});
	});
	
	describe('calculateMix',function(){
		it('should return the mix for the given feature and week from the counts or volume',function(){
			var weekObj = {week:moment("20170904","YYYYMMDD"),month:moment("201709","YYYYMM"),type:"Mix"};
			var familyObj = {
				      "famCode": "0",
				      "famName": "family1",
				      "ftrCode": "1"
				    };
			forecastvsMPWController.volumes = [{
				famCode: "0",
				  ftrCode: "1",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 100,
			    },{
			    	famCode: "0",
			      ftrCode: "0",
			      week: moment("20170904","YYYYMMDD"),
			      vol: 200,
			    }];	
			expect(forecastvsMPWController.calculateMix(familyObj,weekObj)).toEqual(33.33);
		});
	});
});