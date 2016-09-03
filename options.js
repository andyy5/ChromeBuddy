$(document).ready(function() {
	restoreOptions();
    handleSave();
 });

function handleSave(){
	$(document).on('click', '#btn-save', function(){
		saveOptions();
	});
}

function saveOptions(){
	chrome.storage.sync.set({
		outlineColor: $("#outline-color option:selected").text()
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
		outlineColor: $("#outline-color").val($("#outline-color option:first").val())
	}, function(obj){
		$("#outline-color").val(obj.outlineColor);
	})
}