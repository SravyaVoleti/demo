//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var record_index = 0;
var group_id = 0;
var btns = document.querySelectorAll('button[id^=recordButton_]')

/*btns.forEach(btn => {

   btn.addEventListener('click', event => {
	   record_index = event.target.getAttribute('data-index');
           console.log(record_index);
           setTimeout(function(){
        	   startRecording()},
  			 4000);
  });
});
*/

function startRecording(index, user_id) {
	record_index = index;
	group_id = user_id;
	console.log(record_index);
	console.log(index);
	console.log("recordButton clicked");
    var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		audioContext = new AudioContext();
		gumStream = stream;
		
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()
		
		setTimeout(function(){
			 stopRecording()},
			 1000);
		console.log("Recording started");		

	}).catch(function(err) {
    	//recordButton.disabled = false;
	});
}


function stopRecording() {
	console.log("stopButton clicked");
	rec.stop();
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();
	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
        console.log(rec);
}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
    console.log(record_index);
	document.getElementById("audio_" + record_index).setAttribute("src",url);
	
	var next_index = parseInt(record_index)+1;
	//document.getElementById("recordButton_" + record_index).disabled = true;
	document.getElementById("uploadButton_" + record_index).disabled = false;
	
	if(document.getElementById("recordButton_" + next_index) != undefined){
		document.getElementById("recordButton_" + next_index).disabled = false;
	}
	else if(record_index != "13" && record_index != "14"){
		document.getElementById("addmoreButton").disabled = false;
	}
	var upload = document.getElementById("uploadButton_" + record_index);	
	upload.addEventListener("click", function(event){
                  console.log(url);
		  current_record = this.getAttribute("data-index");
		  document.getElementById("recordButton_" + current_record).disabled = true;
		  document.getElementById("uploadButton_" + current_record).disabled = true;
		  var xhr=new XMLHttpRequest();
		  xhr.responseType = 'json';	 
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          //console.log("Server returned: ",e.target.responseText);
		    	  var jsonResponse = xhr.response;
		    	  if(current_record === "13" || current_record === "14"){	 
		    		  if (jsonResponse["status"] == true){
		    			  document.getElementById("continue").href = jsonResponse["next_url"];
		    			  document.getElementById("continue").style.display = "block";
		    			  document.getElementById("response_text").innerHTML = jsonResponse["responseText"];
		    			  
		    		  }
		    		  else if (jsonResponse["error_status"] === true){
		    			  console.log("Something went wrong");
		    			  document.getElementById("response_text").innerHTML = jsonResponse["error"];
		    		  }	    		  
		          }
		    	  console.log(jsonResponse);
		          
		     }
		  }
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  fd.append("blob_url", url);
		  fd.append("filename",filename);
		  fd.append("record_index", current_record);
		  console.log(fd.get("audio_data"));
		  xhr.open("POST","/audio_recorder/upload/" + group_id,true);
		  xhr.send(fd);
	});

	/*upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();	 
		  xhr.responseType = 'json';	 
		  xhr.onload=function(e) {
	      if(this.readyState === 4) {
	          //console.log("Server returned: ",e.target.responseText);
	    	  var jsonResponse = xhr.response;
	    	  if(record_index === "13" || record_index === "14"){	    		 
	    		  if (jsonResponse["status"] === true){
	    			  console.log("U can continue");
	    			  document.getElementById("continue").href = jsonResponse["next_url"];
	    			  document.getElementById("continue").style.display = "block";
	    			  document.getElementById("response_text").innerHTML = jsonResponse["responseText"];
	    			  
	    		  }
	    		  else if (jsonResponse["error_status"] === true){
	    			  console.log("Something went wrong");
	    			  document.getElementById("response_text").innerHTML = jsonResponse["error"];
	    		  }	    		  
	          }
	    	  console.log(jsonResponse);
	          
	      }
	  }
	});*/
	  /*
	  var fd=new FormData();
	  fd.append("audio_data",blob, filename);
	  fd.append("blob_url", url);
	  fd.append("filename",filename);
	  fd.append("record_index", record_index);
	  console.log(fd.get("audio_data"));
	  xhr.open("POST","/audio_recorder/upload/" + group_id,true);
	  xhr.send(fd);*/
	
}