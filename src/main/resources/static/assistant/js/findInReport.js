/**
 * 
 */
var modelYearArr = [ [ "2016", "2016" ], [ "2017", "2017" ] ];
var vehicleLineArr = [ [ "18005", "Edge" ], [ "25003", "Escape" ],
		[ "25001", "Expedition" ], [ "10004", "Explorer" ],
		[ "9004", "Fiesta" ], [ "15003", "Focus" ], [ "26004", "Fusion" ],
		[ "17003", "MKC" ], [ "27003", "MKZ" ], [ "5004", "Mustang" ],
		[ "8003", "Superduty" ], [ "4004", "Transit" ] ];
var marketArr = [ [ "C", "Canada" ], [ "U", "USA" ], [ "B", "Mexico"] ];
var reportTypeArr = [ [ "FtrMR", "Weekly Feature Allocation" ],
		[ "OrdMR", "Weekly Order Selection" ],
		[ "FtrMRWhsl", "Wholesale Feature Allocation" ],
		[ "FMRFD", "Unconstrained Wholesale" ],
		[ "FAR", "Order Recommendation vs Scheduling Report" ],
		[ "OTR", "Order Recommendation Trend" ] ];
var weekArr = [ "201608", "201608" ];

var gReportType = "", gModelYear = "", gMarket = "", gVehicleLine = "";

function identifyPhrases(phrase, phrases, modelArr) {
	if (phrase == "") {
		return parsePhrases(phrases, modelArr);
	} else {
		return phrase;
	}
}

function getDescription(arr, code){
	for(index = 0; index < arr.length; index++){
		if(arr[index][0] == code)
			return arr[index][1];
	}
	return "";
}

function findInPhrases(phrases) {
	gReportType = identifyPhrases(gReportType, phrases, reportTypeArr);
	gModelYear = identifyPhrases(gModelYear, phrases, modelYearArr);
	gMarket = identifyPhrases(gMarket, phrases, marketArr);
	gVehicleLine = identifyPhrases(gVehicleLine, phrases, vehicleLineArr);

	console.log("Report [FtrMR] " + gReportType);
	console.log("Model[2016] " + gModelYear);
	console.log("Market[C] " + gMarket);
	console.log("vehicleLine[15003] " + gVehicleLine);

	var message = "I'm still short of ";
	var speakMessage = "Retrieving report for ";

	if (gReportType == "") {
		message += "Report type, ";
	}else{
		speakMessage += getDescription(reportTypeArr, gReportType) + " ";
	}

	if (gModelYear == "") {
		message += "Model Year, ";
	}else{
		speakMessage += getDescription(modelYearArr, gModelYear) + " ";
	}

	if (gMarket == "") {
		message += "Market, ";
	}else{
		speakMessage += getDescription(marketArr, gMarket) + " " ;
	}

	if (gVehicleLine == "") {
		message += "VehicleLine, ";
	}else{
		speakMessage += getDescription(vehicleLineArr, gVehicleLine) + " ";
	}

	message += ".  Can you help me?";
	var df = new Date().toLocaleString();
	
	if (message == "I'm still short of .  Can you help me?") {
		console.log("Success");
		console.log("Speak Message " + speakMessage);
		document.forms[0].txtLog.value = df + " - " + speakMessage + "\n" + document.forms[0].txtLog.value ;
		var utterance = new SpeechSynthesisUtterance(speakMessage);
		window.speechSynthesis.speak(utterance);
		submitForm(gVehicleLine, gModelYear, gMarket, gReportType);
	} else {
		console.log("Failure");
		console.log("Speak Message : " + speakMessage);
		document.forms[0].txtLog.value = df + " - " + speakMessage + "\n" + document.forms[0].txtLog.value ;;
		var utterance = new SpeechSynthesisUtterance(speakMessage);
		window.speechSynthesis.speak(utterance);
		
		console.log("Message : " + message);
		document.forms[0].txtLog.value = df + " - " + message + "\n" + document.forms[0].txtLog.value ;
		var utterance = new SpeechSynthesisUtterance(message);
		window.speechSynthesis.speak(utterance);
	}
}

function submitForm(vehicleLine, modelYear, market, reportType) {
	document.forms[0].requestName.value = "GENERATE_REPORT";
	document.forms[0].allocationWeek.value = "201619";
	document.forms[0].vehicleLineKey.value = vehicleLine;
	document.forms[0].modelYear.value = modelYear;
	document.forms[0].marketCode.value = market;
	document.forms[0].reportType.value = reportType;
	document.forms[0].target = "_new";
	resetValues();
	document.forms[0].submit();
}

function resetValues() {
	gReportType = "";
	gModelYear = "";
	gMarket = "";
	gVehicleLine = "";
	//document.forms[0].reset();
}
