'use strict'

var blockedUrls = [];
var reminders = [];

$(document).ready(function() {
	restoreOptions();
    handleSave();
 });

function handleSave(){
	$(document).on('click', '#btn-save', function(){
		saveOptions();
		updateBlockedUrlDropdown(blockedUrls);
		updateReminderDropDown(reminders);
		$("#add-url").val(""); // blank add url textbox
		$("#add-reminder").val("");
		$("#setInterval-reminder").val("");
		console.log("blkd urls final: " + blockedUrls);
		console.log("reminders final: " + reminders);
	});
}

// returns final array of blocked urls
function handleBlockUrls(){
	addUrl();
	removeUrl();
	return blockedUrls;
}

// adding multiple urls separated by commas
function addUrl(){
	var val = $("#add-url").val();
	var onlyW = new RegExp("^[w\s]+$");
	if ($.trim(val) != ""){ // check for whitespace only input
		val = val.replace(/\s/g, ""); // remove all whitespaces
		var val_array = val.split(",");
		for (var i = 0; i < val_array.length; i++){
			// process the item
			var item = val_array[i];
			if (item.trim() != ""){
				// var onlyW: to avoid issues with items of only w
				if (item.substr(0,3) == "www" & !onlyW.test(item.toLowerCase())){
					item = item.replace("www", "*://*")
				} else {
					item = "*://*." + item;
				}
				item = item + "/*";
				blockedUrls.push(item); // add to end of array
			}
		}
		// remove duplicates in global array
		$.unique(blockedUrls);
	}
}

// options allows removing one url at a time
// default remove: empty string
function removeUrl(){
 	var val = $("#remove-url option:selected").text();
 	if (val != ""){ 
 		// match format displayed in dropdown to items in blockedUrls
 		val = "*://*." + val + "/*"; 
 		for (var i = 0; i < blockedUrls.length; i++){
 			if (blockedUrls[i] == val){ 
 				blockedUrls.splice(i, 1); // remove at index i
 				break; // assume no duplicates
 			}
 		}
 	}
 	//blockedUrls.splice(0, 1);
}

// update dropdownlist(<select>) of blocked urls on load and on save
function updateBlockedUrlDropdown(input){
	// on load: update the global array with stored array
	// have blockedUrls reference a copy of input, so changing temp_array will not change blockedUrls
	// http://stackoverflow.com/questions/28200260/splice-temporary-array-will-modify-the-main-array
	blockedUrls = input.slice();
	// process array to be display-friendly
	var temp_array = input;
	$.each(temp_array, function(key,value){
		if (value.includes("*://*.")){
			value = value.replace("*://*.", "");
		}
		if (value.includes("/*")){
			value = value.replace("/*", "");
		}
		temp_array[key] = value;
	});
	// remove all options except for first option (default)
	$("#remove-url").children("option:not(:first)").remove();
	// add options from array
	$.each(temp_array, function(key, value) {
    	$("#remove-url")
    		.append($("<option></option>")
        	.attr("value", key)
        	.text(value));
	});
}

// returns final array of reminders
function handleReminders(){
	addReminder();
	removeReminder();
	return reminders;
}

function addReminder(){
	var val_msg = $("#add-reminder").val();
	// input cannot have pipe delimitor
	if (val_msg.includes("|")){
		val_msg = val_msg.replace(/\|/g,"/"); // replace all pipes
	}
	var val_interval = $("#setInterval-reminder").val();
	if (isInt(val_interval) & val_msg.trim != ""){
		val_interval = parseInt(val_interval, 10);
		if (val_interval > 0){
			val_interval = Math.round(val_interval);
			var item = val_msg + "|" + val_interval;
			reminders.push(item);
		}
	}
	$.unique(reminders);
}

function removeReminder(){
	var val = $("#remove-reminder option:selected").text();
	if (val != ""){
		for (var i = 0; i < reminders.length; i++){
 			if (reminders[i] == val){ 
 				reminders.splice(i, 1);
 				break;
 			}
 		}
	}
}

function updateReminderDropDown(input){
	reminders = input;
	$("#remove-reminder").children("option:not(:first)").remove();
	$.each(reminders, function(key, value) {
    	$("#remove-reminder")
    		.append($("<option></option>")
        	.attr("value", key)
        	.text(value));
	});
}

function saveOptions(){
	chrome.storage.sync.set({
		outlineColor: $("#outline-color option:selected").text(),
		blockedUrlArray: handleBlockUrls(),
		reminderArray: handleReminders()
	}, function() {
		$("#save-status").html("Save successful");
        setTimeout(function() {
         	$("#save-status").html("");
        }, 1000);
	})
}

function restoreOptions(){
	chrome.storage.sync.get({
		// set default vals
		outlineColor: $("#outline-color").val($("#outline-color option:first").val()),
		blockedUrlArray: [],
		reminderArray: []
	}, function(obj){
		$("#outline-color").val(obj.outlineColor);
		updateBlockedUrlDropdown(obj.blockedUrlArray);
		updateReminderDropDown(obj.reminderArray);
	})
}

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}