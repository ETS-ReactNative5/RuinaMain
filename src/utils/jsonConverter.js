import {Component} from 'react';
import XLSX from 'xlsx';
import * as htmlStrings from '../utils/html_for_pdf_pages/htmlStrings'
import {testAnswers} from '../data/testAnswers';
import {questions} from '../data/questions';

export class JSONconverter extends Component {
	constructor(props) {
		super(props);
	}
	handleConverter(format, data) {
		console.log('handleconverter starting');
		let file;
		switch (format) {
			case 'json':
				return file = JSON.stringify(data);
			case 'xlsx':
				return file = this.JSONtoXLS(data);
			case 'html': case 'pdf':
				return file = this.JSONtoHTML(data);
			case 'pdftest':
				return this.JSONtoHTML(testAnswers);
			case 'xlsxtest':
				return this.JSONtoXLS(testAnswers);
			default:
				console.log("Error+"+format)
		}
	}

	JSONtoXLS(jsondata) {
		console.log('jsontoxls');
		function getQuestion(questionId) {
			console.log('questionId:', questionId);

			var questionName = ''
		    questions.data.forEach(questionGroup => {
		        if (questionGroup.questions) {
		            questionGroup.questions.forEach(question => {
		                if (question.humanReadableId === questionId) {
		                    questionName =  question.question
		                }
		            });
		        }
		    })
			return questionName
		};

		function populateCrashSheet(data) {
			// initial row
			var ws = XLSX.utils.json_to_sheet([{ A: "question", B: "answer"}],
				{header: ["A", "B"], skipHeader: true});
			// gather crash questions and answers
			var rows = [];
			if (!("response" in data["road"][0])) {
				return ws;
			}
			for (var key in data["road"][0]["response"]) {
				console.log('key in crash response:', key)
				var question = getQuestion(key);
				var answer = data["road"][0]["response"][key];
				if (answer instanceof Array) {
					answer = answer.join(", ");
				}
				rows.push({A: question, B: answer});
			}
			// write data starting at A2
			XLSX.utils.sheet_add_json(ws, rows, {skipHeader: true, origin: "A2"});
			return ws;
		};

		function populateVehicleSheet(data) {
			// initial row
			var ws = XLSX.utils.json_to_sheet([{ A: "vehicle number", B: "question", C: "answer"}],
				{header: ["A", "B", "C"], skipHeader: true});
			// gather vehicle questions and answers
			var rows = [];
			var vehicleNumDict = {}; // key is id and value is number
			// iterate through each vehicle
			for (var i = 0; i < data["vehicle"].length; i++) {
				var vehicleData = data["vehicle"][i];
				vehicleNumDict[vehicleData["id"]] = i+1;
				if ("response" in vehicleData) {
					for (var key in vehicleData["response"]) {
						console.log('key in vehicle sheet:', key)
						var question = getQuestion(key);
						var answer = vehicleData["response"][key];
						if (answer instanceof Array) {
							answer = answer.join(", ");
						}
						rows.push({A: i+1, B: question, C: answer});
					}
				}
			}
			// write data starting at A2
			XLSX.utils.sheet_add_json(ws, rows, {skipHeader: true, origin: "A2"});
			return [ws, vehicleNumDict];
		}

		function populateDriverSheet(data, vehicleNumDict){
			// initial row
			var ws = XLSX.utils.json_to_sheet([{ A: "vehicle number", B: "question", C: "answer"}],
				{header: ["A", "B", "C"], skipHeader: true});
			// gather driver questions and answers
			var rows = [];
			// iterate through each driver
			for (var i = 0; i < data["driver"].length; i++) {
				var driverData = data["driver"][i];
				var vehicleNum = vehicleNumDict[driverData["vehicle"]];
				if ("response" in driverData) {
					for (var key in driverData["response"]) {
						console.log('key in driver sheet:', key)
						var question = getQuestion(key);
						var answer = driverData["response"][key];
						if (answer instanceof Array) {
							answer = answer.join(", ");
						}
						rows.push({A: vehicleNum, B: question, C: answer});
					}
				}
			}
			// write data starting at A2
			XLSX.utils.sheet_add_json(ws, rows, {skipHeader: true, origin: "A2"});
			return ws;
		}

		function populatePassengerSheet(data, vehicleNumDict){
			// initial row
			var ws = XLSX.utils.json_to_sheet([{ A: "vehicle number", B: "passenger number", C: "question", D: "answer"}],
				{header: ["A", "B", "C", "D"], skipHeader: true});
			// gather passenger questions and answers
			var rows = [];
			var passengerNumDict = {};
			// iterate through each passenger
			for (var i = 0; i < data["passenger"].length; i++) {
				var passengerData = data["passenger"][i];
				var vehicleNum = vehicleNumDict[passengerData["vehicle"]];
				if (passengerData["vehicle"] in passengerNumDict) {
					var passengerNum = passengerNumDict[passengerData["vehicle"]].length + 1;
					passengerNumDict[passengerData["vehicle"]].push(passengerData["id"]);
				} else {
					var passengerNum = 1;
					passengerNumDict[passengerData["vehicle"]] = [passengerData["id"]];
				}
				if ("response" in passengerData) {
					for (var key in passengerData["response"]) {
						console.log('key in passenger sheet:', key)
						var question = getQuestion(key);
						var answer = passengerData["response"][key];
						if (answer instanceof Array) {
							answer = answer.join(", ");
						}
						rows.push({A: vehicleNum, B:passengerNum, C: question, D: answer});
					}
				}
			}
			// write data starting at A2
			XLSX.utils.sheet_add_json(ws, rows, {skipHeader: true, origin: "A2"});
			return ws;
		}

		function populateNonmotoristSheet(data) {
			// initial row
			var ws = XLSX.utils.json_to_sheet([{ A: "nonmotorist number", B: "question", C: "answer"}],
				{header: ["A", "B", "C"], skipHeader: true});
			// gather vehicle questions and answers
			var rows = [];
			// iterate through each vehicle
			for (var i = 0; i < data["nonmotorist"].length; i++) {
				var nonmotoristData = data["nonmotorist"][i];
				if ("response" in nonmotoristData) {
					for (var key in nonmotoristData["response"]) {
						console.log('key in nonmotorist sheet:', key)
						var question = getQuestion(key);
						var answer = nonmotoristData["response"][key];
						if (answer instanceof Array) {
							answer = answer.join(", ");
						}
						rows.push({A: i+1, B: question, C: answer});
					}
				}
			}
			// write data starting at A2
			XLSX.utils.sheet_add_json(ws, rows, {skipHeader: true, origin: "A2"});
			return ws;
		}
		// build new workbook
		const wb = XLSX.utils.book_new();
		// create the crash sheet
		const crashWS = populateCrashSheet(jsondata);
		XLSX.utils.book_append_sheet(wb, crashWS, "road");
		// create the vehicle sheet
		const [vehicleWS, vehicleNumDict] = populateVehicleSheet(jsondata);
		XLSX.utils.book_append_sheet(wb, vehicleWS, "vehicle");
		// create the driver sheet
		const driverWS = populateDriverSheet(jsondata, vehicleNumDict);
		XLSX.utils.book_append_sheet(wb, driverWS, "driver");
		// create the passenger sheet
		const passengerWS = populatePassengerSheet(jsondata, vehicleNumDict);
		XLSX.utils.book_append_sheet(wb, passengerWS, "passenger");
		// create the nonmotorist sheet
		const nonmotoristWS = populateNonmotoristSheet(jsondata);
		XLSX.utils.book_append_sheet(wb, nonmotoristWS, "nonmotorist");
		// output workbook so it can be written to a file
		const output = str => str;
		const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });
		return output(wbout);
	}

	JSONtoHTML(jsondata) {
		function getAnswer(answerSubsetData, id) {
			if (("response" in answerSubsetData) && (id in answerSubsetData["response"])) {
				if (answerSubsetData["response"][id] instanceof Array) {
					return answerSubsetData["response"][id].join(", ")
				}
				return answerSubsetData["response"][id];
			}
			return "<br>";
		};

		function getNumSections(data) {
		  return {
		    "driver": data["driver"].length,
		    "vehicle": data["vehicle"].length,
		    "passenger": data["passenger"].length,
		    "nonmotorist": data["nonmotorist"].length
		  };
		};

		function getVehicleSectionDict(data) {
			var vehicleSectionDict = {};
			// add in drivers
			var drivers = {};
			for (var i = 0; i < data["driver"].length; i++) {
				drivers[data["driver"][i]["vehicle"]] = data["driver"][i];
			}
			vehicleSectionDict["drivers"] = drivers;
			// add in passengers
			var passengers = {};
			for (var i = 0; i < data["passenger"].length; i++) {
				var key = data["passenger"][i]["vehicle"];
				if (key in passengers) {
					passengers[key].push(data["passenger"][i]);
				} else {
					passengers[key] = [data["passenger"][i]];
				}
			}
			vehicleSectionDict["passengers"] = passengers;
			return vehicleSectionDict;
		};

		function processQuestionIds(str, answers, fillInMethod) {
			var lines = str.split("\n");
			var filledString = "";
			for (var i = 0; i < lines.length; i++){
			  var line = lines[i];
			  // check if line contains "id=" if so then get the id
				// there could be multiple ids in one line so process all of them
				var pos = line.indexOf("id=", 0);
				while (pos != -1) {
					// extract the id
					var endPos = line.indexOf('>', pos)-1;
					var id = line.slice(pos+4, endPos);
					var ans = getAnswer(answers, id);
					// put ans into line and replace
					if (fillInMethod == "datasection") {
						line = line.slice(0, endPos+2) + ans + line.slice(endPos+2);
					} else {
						line = line.replace("###", ans);
					}
					pos = line.indexOf("id=", pos+1);
				}
				filledString += line + "\n";
			}
			console.log('filled string:', filledString);
			return filledString;
		};

		function fillCoverPageHeader(str, answers, numSectionsDict) {
			str = str.replace("# Motor Vehicles", numSectionsDict["vehicle"]+" Motor Vehicles");
			str = str.replace("# Non-motorists", numSectionsDict["nonmotorist"]+" Non-motorists");
			// fill in other ids
			return processQuestionIds(str, answers, "header");
		};

		function fillVehiclePageHeader(str, answers, vehicleNum) {
			str = str.replace("Motor Vehicle ###", "Motor Vehicle "+vehicleNum);
			// fill in other ids
			return processQuestionIds(str, answers, "header");
		};

		function fillDriverPageHeader(str, answers, vehicleNum) {
			str = str.replace("Driver of Motor Vehicle ###", "Driver of Motor Vehicle "+vehicleNum);
			// fill in other ids
			return processQuestionIds(str, answers, "header");
		};

		function fillPassengerPageHeader(str, answers, occupantNum, vehicleNum, hasDriver) {
			str = str.replace("Occupant ### of Motor Vehicle ###", "Occupant "+occupantNum+" of Motor Vehicle "+vehicleNum);
			if (hasDriver) {
				str = str.replace("Type: ###", "Type: "+"Passenger");
			} else {
				str = str.replace("Type: ###", "Type: "+"Occupant of MV Not in Transport");
			}
			// fill in other ids
			return processQuestionIds(str, answers, "header");
		};

		function fillNonMotoristPageHeader(str, answers, nonmotoristNum) {
			str = str.replace("Non-Motorist ###", "Non-Motorist "+nonmotoristNum);
			// fill in other ids
			return processQuestionIds(str, answers, "header");
		}

		var htmlString = htmlStrings.headerString;
		const numSectionsDict = getNumSections(jsondata);
		// fill in cover page header
		htmlString += fillCoverPageHeader(htmlStrings.coverPageHeaderString, jsondata["road"][0], numSectionsDict);
		// fill in cover page data sections
		console.log('processing data for crash data section');
		htmlString += processQuestionIds(htmlStrings.crashDataSectionString, jsondata["road"][0], "datasection");
		// if applicable, add in construction table
		var displayConstruction = false;
		if (getAnswer(jsondata["road"][0], "road-workZoneRelated") == "Yes") {
			displayConstruction = true;
			console.log('processing data for construction data section');
			htmlString += processQuestionIds(htmlStrings.constructionDataSectionString, jsondata["road"][0], "datasection");
		}
		// // fill in vehicle section pages if applicable
		// vehicleSectionDict = getVehicleSectionDict(jsondata);
		// for (var i = 0; i < numSectionsDict["vehicle"]; i++) {
		// 	// fill out vehicle page
		// 	var vehicleAnswers = jsondata["vehicle"][i];
		// 	if (displayConstruction) {
		// 		console.log('processing data for vehicle page header');
		// 		htmlString += fillVehiclePageHeader(htmlStrings.vehicleHeaderString, vehicleAnswers, i+1, -1);
		// 		displayConstruction = false;
		// 	} else {
		// 		console.log('processing data for vehicle page header');
		// 		htmlString += fillVehiclePageHeader(htmlStrings.vehicleHeaderString, vehicleAnswers, i+1);
		// 	}
		// 	console.log('processing data for vehicle data section string 1');
		// 	htmlString += processQuestionIds(htmlStrings.vehicleDataSectionString1, vehicleAnswers, "datasection");
		// 	// fill out lvhm vehicle sections if applicable
		// 	if (getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") != "Not Applicable") {
		// 		console.log('processing data for first trailer data section');
		// 		htmlString += processQuestionIds(htmlStrings.firstTrailerDataSectionString, vehicleAnswers, "datasection");
		// 	}
		// 	if ((getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") == "2") || (getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") == "3")) {
		// 		console.log('processing data for second trailer data section');
		// 		htmlString += processQuestionIds(htmlStrings.secondTrailerDataSectionString, vehicleAnswers, "datasection");
		// 	}
		// 	if (getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") == "3") {
		// 		console.log('processing data for third trailer data section');
		// 		htmlString += processQuestionIds(htmlStrings.thirdTrailerDataSectionString, vehicleAnswers, "datasection");
		// 	}
		// 	if ((getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") != "Not Applicable") || (getAnswer(vehicleAnswers, "vehicle-size") != "Light (10,000 lbs. or less GVWR/GCWR)") || (getAnswer(vehicleAnswers, "vehicle-hazardousMaterials") == "Yes")) {
		// 		console.log('processing data for lvhm vehicle data section')
		// 		htmlString += processQuestionIds(htmlStrings.lvhmVehicleDataSectionString, vehicleAnswers, "datasection");
		// 	}
		// 	if (getAnswer(vehicleAnswers, "vehicle-hazardousMaterials") == "Yes") {
		// 		console.log('processing data for hazardous data section');
		// 		htmlString += processQuestionIds(htmlStrings.hazardousDataSectionString, vehicleAnswers, "datasection");
		// 	}
		// 	console.log('processing data for vehicle data section 2');
		// 	htmlString += processQuestionIds(htmlStrings.vehicleDataSectionString2, vehicleAnswers, "datasection");
		// 	// fill out driver page if applicable
		// 	var hasDriver;
		// 	(vehicleAnswers["id"] in vehicleSectionDict["drivers"]) ? hasDriver = true : hasDriver = false;
		// 	if (hasDriver) {
		// 		var driverAnswers = vehicleSectionDict["drivers"][vehicleAnswers["id"]];
		// 		console.log('processing driver header')
		// 		htmlString += fillDriverPageHeader(htmlStrings.driverHeaderString, driverAnswers, i+1);
		// 		console.log('processing driver data section 1');
		// 		htmlString += processQuestionIds(htmlStrings.driverDataSectionString1, driverAnswers, "datasection");
		// 		if ((getAnswer(vehicleAnswers, "vehicle-numTrailingUnits") != "Not Applicable") || (getAnswer(vehicleAnswers, "vehicle-size") != "Light (10,000 lbs. or less GVWR/GCWR)") || (getAnswer(vehicleAnswers, "vehicle-hazardousMaterials") == "Yes")) {
		// 			// display lvhm driver section
		// 			console.log('processing driver lvhm data')
		// 			htmlString += processQuestionIds(htmlStrings.lvhmDriverDataSectionString, driverAnswers, "datasection");
		// 		}
		// 		if (getAnswer(driverAnswers, "driver-injuryStatus") != "No Apparent Injury") {
		// 			// display injury driver section
		// 			console.log('processing driver injury data')
		// 			htmlString += processQuestionIds(htmlStrings.injuryDriverDataSectionString, driverAnswers, "datasection");
		// 		}
		// 		console.log('processing driver data section 2')
		// 		htmlString += processQuestionIds(htmlStrings.driverDataSectionString2, driverAnswers, "datasection");
		// 	}
		// 	// fill out passenger pages if applicable
		// 	if (vehicleAnswers["id"] in vehicleSectionDict["passengers"]) {
		// 		var passengers = vehicleSectionDict["passengers"][vehicleAnswers["id"]];
		// 		for (var j = 0; j < passengers.length; j++) {
		// 			var passengerAnswers = passengers[j];
		// 			console.log('processing passenger page header')
		// 			htmlString += fillPassengerPageHeader(htmlStrings.passengerHeaderString, passengerAnswers, j+1, i+1, hasDriver);
		// 			console.log('processing passenger data section')
		// 			htmlString += processQuestionIds(htmlStrings.passengerDataSectionString, passengerAnswers, "datasection");
		// 			if (getAnswer(passengerAnswers, "passenger-injuryStatus") != "No Apparent Injury") {
		// 				console.log('processing passenger injury data section')
		// 				htmlString += processQuestionIds(htmlStrings.injuryPassengerDataSectionString, passengerAnswers, "datasection");
		// 			}
		// 		}
		// 	}
		// }
		// // fill out non motorist pages if applicable
		// for (var i = 0; i < numSectionsDict["nonmotorist"]; i++) {
		// 	var nonmotoristAnswers = jsondata["nonmotorist"][i];
		// 	console.log('processing nomotorist page header')
		// 	htmlString += fillNonMotoristPageHeader(htmlStrings.nonmotoristHeaderString, nonmotoristAnswers, i+1);
		// 	console.log('processing nonmotorist data section')
		// 	htmlString += processQuestionIds(htmlStrings.nonmotoristDataSectionString, nonmotoristAnswers, "datasection");
		// 	if (getAnswer(nonmotoristAnswers, "nonmotorist-injuryStatus") != "No Apparent Injury") {
		// 		console.log('processing nomotorist injury data section')
		// 		htmlString += processQuestionIds(htmlStrings.injuryNonmotoristDataSectionString, nonmotoristAnswers, "datasection");
		// 	}
		// }
		// concatenate strings to form complete HTML
		htmlString += htmlStrings.tailString;
		return htmlString;
	}

}
export default JSONconverter;
