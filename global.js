var lastKey = 0;
var curLevel = 'ALL';
var intervalID = 0;

$(document).ready(function() {
  $("#dialog").dialog({ title: "Message", autoOpen : false, modal : true, show : "blind", hide : "blind", width: 800, height: 500 });
  $("#level").change(levelChange);
  $("#tail").change(tailChange);
  
  loadLevel("ALL");

  intervalID = setInterval("tail()", 500);
});


function tail() {
  console.log("http://one-ginzu.plosjournals.org:5984/log/_design/loglevels/_view/" + curLevel + "?descending=true&endkey=\"" + (lastKey + 1) + "\"");
  $.jsonp({
      url: "http://one-ginzu.plosjournals.org:5984/log/_design/loglevels/_view/" + curLevel + "?descending=true&endkey=\"" + (lastKey + 1) + "\"",
      context: document.body,
      timeout: 10000,
      callbackParameter: "callback",
      success: processResponse,
      error: dataError
    });
}

function tailChange(event) {
  if(event.target.checked) {
    intervalID = setInterval("tail()", 500);
  } else {
    clearInterval(intervalID);
  }
}

function levelChange(event) {
  jQuery("#logEntries").empty();

  curLevel = event.target.options[event.target.selectedIndex].value;

  loadLevel(curLevel);
}

function loadLevel(level) {
  $.jsonp({
      url: "http://one-ginzu.plosjournals.org:5984/log/_design/loglevels/_view/" + level + "?descending=true&limit=20",
      context: document.body,
      timeout: 10000,
      callbackParameter: "callback",
      success: processResponse,
      error: dataError
    });
}


function processResponse(response) {
  for(var a = response.rows.length - 1; a >= 0; a--) {
    lastKey = response.rows[a].id;

    appendEntry(response.rows[a].value);
  } 
}

function dataError(xOptions, textStatus) { 
  console.log('Error: ' + textStatus);
}

function appendEntry(response) {
  var row = $("<tr></tr>").addClass(response.level);

  row.append($("<td nowrap></td>").text($.format.date(response.timestamp, 'MMM dd, yyyy hh:mm:ss')));
  row.append($("<td nowrap></td>").text(response.hostName));
  row.append($("<td nowrap></td>").text(response.applicationName));
  row.append($("<td></td>").text(response.level));
  row.append($("<td></td>").text(response.message));
  
  row.click(function() { displayDialog(response) });

  jQuery("#logEntries").append(row);
  //var rowpos = $('#logEntries tr:last').position();

  //$('#body').scrollTop(rowpos.bottom);
  var obj = $('#logEntries tr:last');
  obj[0].scrollIntoView(true);
}


function displayDialog(response) {
  $("#dialog").attr('title',new Date(response.timestamp));
  var text = "<b>" + response.message + "</b><br/><br/>";

  text = text + "<b>Logger:</b> " + response.logger + "<br/>";
  text = text + "<b>Class:</b> " + response.locationInformation.className + "<br/>";
  text = text + "<b>Filename:</b> " + response.locationInformation.fileName + "<br/>";
  text = text + "<b>Method:</b> " + response.locationInformation.methodName + "<br/>";
  text = text + "<b>Line:</b> " + response.locationInformation.lineNumber + "<br/>";

  if(response.stack != null) {
    text = text + "Exception: " + response.exception + "<br/>";
    text = text + "Stack Trace: <br/>";
    for(var a = 0; a < response.stack.length; a++) {
      text = text + response.stack[a] + "<br/>";
    }
  }

  $("#dialog").html(text);
  $("#dialog").dialog("open");
}



