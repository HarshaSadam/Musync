var aud=document.getElementById("audio");
var video = document.getElementById('video');
let startButton = document.querySelector("#start-rec");
let stopButton = document.querySelector("#stop-rec");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");
let recordingTimeMS = 9000;

function handleFiles(event) {
  var files = event.target.files;
  $("#src").attr("src", URL.createObjectURL(files[0]));
  aud.load();
  
}

document.getElementById("upload").addEventListener("change", handleFiles, false);

function log(msg) {
  logElement.innerHTML += msg + "\n";
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );

  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}

function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}


stopButton.addEventListener("click", function() {
  /*var stream = video.srcObject;
  var tracks = stream.getTracks();
  for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
  }
  aud.pause();
  video.srcObject = null;*/
 
  aud.pause();
  stop(video.srcObject);
}, false);
 
 
startButton.addEventListener("click", function() {
  /*vendorUrl = window.URL || window.webkitURL;
  stream = navigator.mediaDevices.getUserMedia({ video: true});
  if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
              video.srcObject = stream;
              aud.play();
          }).catch(function (error) {
              console.log("Something went wrong!");
          });
  }*/

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    video.srcObject = stream;
    aud.play();
    downloadButton.href = stream;
    video.captureStream = video.captureStream || video.mozCaptureStream;
    return new Promise(resolve => video.onplaying = resolve);
  }).then(() => startRecording(video.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    var videoUrl = URL.createObjectURL(recordedBlob);
    downloadButton.href = videoUrl;
    downloadButton.download = "RecordedVideo.webm";
    downloadButton.click();
    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
  })
  .catch((error) => {
    if (error.name === "NotFoundError") {
      log("Camera or microphone not found. Can't record.");
    } else {
      log(error);
    }
  });
}, false);

   

$(function () {
  start();
});  