var logConstants ={
		OG: "Orders generated",
		MF: "forecast",
		EU: "Europe",
		NA: "North America",
		Jobs: "Job",
};

function log(text){
	document.getElementById("txtLog").innerHTML = document.getElementById("txtLog").innerHTML + "<BR>" + text;
	document.getElementById("imgMic").src = "assistant/images/mic.png";
}

