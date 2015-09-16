function onlineEndpointPost() {
  var environmentURL = $('#environment')[0].value;
  var barcode = $('#barcode')[0].value;
  var guid = $('#guid')[0].value;
  var barcodeURLParam = 'barcode=' + barcode;

  $.ajax({
    url: environmentURL + '/displays/online.json?' + barcodeURLParam,
    contentType: 'text/plain',
    type: 'POST',
    xhrFields: { withCredentials: false },
    success: function (response) {
      if (response.guid) {
        $('#guid').val(response.guid);
      }
      $('#firstSubmit').css({'display': 'none'});
      $('#environment').prop('disabled', true);
      $('#barcode').prop('disabled', true);
      $('#guid').prop('disabled', true);
      $('#device-data').html(JSON.stringify(response, null, '\t'));

      var pubnub = PUBNUB({
        subscribe_key: response.pubnub_subscribe_key
      });

      pubnub.unsubscribe({
         channel : guid,
      });
      pubnubListener(pubnub, response);
    },
    error: function(error) {
      console.log('Error: ' + error);
    }  
  });
}

function pubnubListener(pubnub, response) {
  pubnub.subscribe({
    channel: $('#guid')[0].value,
    message: function(m){pubnubMessageHandler(JSON.parse(m), response)},
    error: function (error) {
      console.log(JSON.stringify(error));
    }
  });
}

function pubnubMessageHandler(messageObject, response) {
  acknowledgePubnubMessage(messageObject);
  if (messageObject.message === 'update') {
    manifestGet();
  } else if ( messageObject.message === 'enrolled') {
    onlineEndpointPost();
  }
  else{
    $('#device-data').append('<p> UNKOWN MESSAGE:' + messageObject.message);
  }
}

function manifestGet() {
  $.ajax({
    url: $('#environment')[0].value + '/displays/manifest.json?guid=' + $('#guid')[0].value,
    contentType: 'text/plain',
    type: 'GET',
    xhrFields: { withCredentials: false },
    success: digestManifest,
    error: function(error) {
      console.log('Error: ' + error);
    }
  });
}

function digestManifest(response) {
  $('#manifest').html(JSON.stringify(response, null, '\t'));
  if (response.d.contentType === 'video'){
    $('#content').html('<video width="320" height="240" controls><source src="' + response.d.url + '" type="video/mp4"></video>')
  } else if (response.d.contentType === 'html5') {
    $('#content').html('<iframe src="' + response.d.url + '"></iframe>');
  } else if (response.d.contentType === 'signs') {
    $('#content').html('');
    for ( var i = 0; i < response.d.signBatch.signs.length; i++) {
      $('#content').append('<img id="theImg" src="' + response.d.signBatch.signs[i].filePath + '" />');
    }
  } else {
    console.log('Unknown contentType.');
  }
}

function acknowledgePubnubMessage(message) {
  $.ajax({
    url: $('#environment')[0].value + '/displays/' + message.display_id + '/pub_nub_messages/' + message.id + '/acknowledge',
    contentType: 'text/plain',
    type: 'PUT',
    data: JSON.stringify(message),
    xhrFields: { withCredentials: false },
    success: function (response){},
    error: function(error) {
      console.log('Error: ' + error);
    }
  });
}

//From: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript?page=1&tab=votes#tab-top
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Just use some DOM
function submitQueryValues(){
  var submit = true;
  if(getParameterByName("environment")){
    document.getElementById("environment").value = getParameterByName("environment");
  }
  else{
    submit = false;
  }
  if(getParameterByName("barcode")){
    document.getElementById("barcode").value = getParameterByName("barcode");
  }
  else{
    submit = false;
  }
  if(getParameterByName("guid")){
    document.getElementById("guid").value = getParameterByName("guid");
  }
  else{
    submit = false;
  }
  if(submit){
    onlineEndpointPost();
  }
}
