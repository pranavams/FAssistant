var OGTBusinessWords = [
	{type: "Request", 		key:"Jobs", 		value: "Jobs"},
	{type: "Request", 		key:"Jobs", 		value: "Job"},
	{type: "Request", 		key:"Orders", 		value: "Orders"},
	{type: "Request", 		key:"Orders", 		value: "Order"},
	{type: "ModelYear",  	key:"2016", 		value : "2016"},
	{type: "ModelYear",  	key:"2017", 		value : "2017"},
	{type: "BizProcess", 	key:"OG", 			value : "Order"},
	{type: "BizProcess", 	key:"MF", 			value : "forecast"},
	{type: "Model", 		key:"Edge", 		value : "Edge" }, 
	{type: "Model", 		key:"Escape", 		value : "Escape" },
	{type: "Model", 		key:"Expedition", 	value : "Expedition" }, 
	{type: "Model", 		key:"Explorer", 	value : "Explorer" },
	{type: "Model", 		key:"Fiesta", 		value : "Fiesta" }, 
	{type: "Model", 		key:"Focus", 		value : "Focus" }, 
	{type: "Model", 		key:"Fusion", 		value : "Fusion" },
	{type: "Model", 		key:"MKC", 			value : "MKC" }, 
	{type: "Model", 		key:"MKZ", 			value : "MKZ" }, 
	{type: "Model", 		key:"Mustang", 		value : "Mustang" },
	{type: "Model", 		key:"Ecosport", 	value : "Eco Sport" }, 
	{type: "Model", 		key:"Ecosport", 	value : "EcoSport" }, 
	{type: "Model", 		key:"Superduty", 	value : "Superduty" }, 
	{type: "Model", 		key:"Transit", 		value : "Transit" } ,
	{type: "MarketGroup", 	key:"EU", 			value : "Europe" }, 
	{type: "MarketGroup", 	key:"EU", 			value : "United Kingdom" }, 
	{type: "MarketGroup", 	key:"EU", 			value : "Britain" }, 
	{type: "MarketGroup", 	key:"EU", 			value : "London" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "North America" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "USA" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "America" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "Mexico" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "America" }, 
	{type: "MarketGroup", 	key:"NA", 			value : "Canada" } ,
	{type: "Market", 		key:"GBR", 			value : "United Kingdom" }, 
	{type: "Market", 		key:"GBR", 			value : "Britain" }, 
	{type: "Market", 		key:"GBR", 			value : "London" }, 
	{type: "Market", 		key:"USA", 			value : "North America" }, 
	{type: "Market", 		key:"NA", 			value : "USA" }, 
	{type: "Market", 		key:"NA", 			value : "America" }, 
	{type: "Market", 		key:"MEX", 			value : "Mexico" }, 
	{type: "Market", 		key:"CAN", 			value : "Canada" }
];

function flattenList(list){
	return list.reduce(function(flatList,phraseList){
		return flatList.concat(phraseList);
	},[]);
}

function flattenBusinessWords(phrases){
	return flattenList(flattenList(phrases).map(function(sentence){
		return sentence.split(" ");
	}));
}

var defaultVehicleObj={
	Market: "",
	Model: "",
	ModelYear: "",
	Request: "",
	BizProcess: "OG",
	MarketGroup: ""
};

function findBusinessWords(aPhrases, vehicleObj)	{
	console.log("findBusinessWords:: vehicleObj " + vehicleObj);
	if (vehicleObj === undefined || vehicleObj === null) {
		vehicleObj = JSON.parse(JSON.stringify(defaultVehicleObj)); //to assign the value rather than the reference.
		console.log("Vehicle Object post assigning default Obj " + JSON.stringify(vehicleObj));
	}
	var phrases = [];
	
	for(var i = 0; i < aPhrases.length; i ++){
		phrases.push(aPhrases[i].split(" "));
	}
	
	//phrases = flattenBusinessWords(aPhrases);
	
	var uniquePhrases = flattenList(phrases).reduce(function(partialList,item){
		if(partialList.indexOf(item) === -1)
			partialList.push(item);
		return partialList;
	},[]).map(function(word){
		return word.toUpperCase();
	});
	
	var bizList = OGTBusinessWords.filter(function(bizObj){
		return uniquePhrases.indexOf(bizObj.value.toUpperCase()) !== -1;
	});
	bizList.forEach(function(obj){
		vehicleObj[obj.type] = obj.key;
	});
	return vehicleObj;
}

function speak(text, callback) {
	log(text);
	var u = new SpeechSynthesisUtterance();
	u.text = text;
	u.lang = 'en-US';
 
	u.onend = function () {
		if (callback) {
			callback();
		}
	};
 
	u.onerror = function (e) {
		if (callback) {
			callback(e);
		}
	};
 
	speechSynthesis.speak(u);
}
