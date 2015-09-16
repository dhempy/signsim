//From: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript?page=1&tab=votes#tab-top
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Just use some DOM
// document.getElementByID().value = getParameterByName();
function submitQueryValues(){
  if(getParameterByName("name")){
    document.getElementById("name").value = getParameterByName("name")
  }
}
