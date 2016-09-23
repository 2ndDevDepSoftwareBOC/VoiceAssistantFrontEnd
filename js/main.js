/* Copyright 2013 Chris Wilson 

   Licensed under the Apache License, Version 2.0 (the "License"); 
   you may not use this file except in compliance with the License. 
   You may obtain a copy of the License at 

       http://www.apache.org/licenses/LICENSE-2.0 

   Unless required by applicable law or agreed to in writing, software 
   distributed under the License is distributed on an "AS IS" BASIS, 
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
   See the License for the specific language governing permissions and 
   limitations under the License. 
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var functionId = null;
var init = 0;
var gBlob;
var gUrl;
/* TODO: 

- offer mono option 
- "Monitor input" switch 
*/

// function saveAudio() { 
//     // audioRecorder.exportWAV( doneEncoding ); 
//     // could get mono instead by saying 
//     audioRecorder.exportMonoWAV( doneEncoding ); 
// } 

function gotBuffers(buffers) {
    /* var canvas = document.getElementById( "wavedisplay" ); 

    drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] ); */

    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download. 
    // audioRecorder.exportWAV( doneEncoding ); 
    audioRecorder.exportMonoWAV(doneEncoding);
}


function postMessage(url, data, callback) {
    var xhr = new XMLHttpRequest();

    var _callback = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // alert(xhr.responseText); 
                var res = xhr.responseText;
                if (res == null || res == "") {
                    alert("please say again~");
                } else {
                    var responseText = xhr.responseText;
                    responseText = "(" + responseText + ")";
                    var data = eval(responseText);
                    callback(data);
                }
            }
            else {
                alert("something wrong");
            }
        }

    };

    xhr.onreadystatechange = _callback;
    xhr.open("POST", url);
    xhr.send(data);
}

function askTransferAmount() {
    postMessage("/voiceAssistant/question", (new FormData()).append("question", "请问您的转出金额是多少？"), function (data) {

        audioPlay(data.audio);
        
        // var transferAmount = data.number;
        // if (transferAmount) {
        //     $("#transferAmount").val(transferAmount);
        // }
        // else {
        //     asktransferAmount();
        // }
    });
}

function askTransferInAcc() {
    postMessage("/voiceAssistant/question", (new FormData()).append("question", "请问您要转入的账户是哪个？"), function () {

        audioPlay(data.audio);
        // var transferInAcc = data.person;
        // if (transferInAcc) {
        //     $("#transferInAcc").val(transferInAcc);
        // }
        // else {
        //     askTransferInAcc();
        // }
        
    });
}
function audioPlay(audio) 
    { 
        var player = $("#audioPlayer");
        
        player = player[0] || player;
        player.src = audio;
        player.play();
        player.onended=function()
        {
            $("#record").click();
            // if (!audioRecorder)
            //     return;
            // e.classList.add("recording");
            // audioRecorder.clear();
            // audioRecorder.record();
        };
    }

function doneEncoding(blob) {
    /* Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" ); 
    recIndex++; */


    url = "/voiceAssistant/answer";
    var form = new FormData();
    form.append("file", blob);
    form.append("functionId", functionId);

    if (functionId == null)
    {
        url = "/voiceAssistant/redirect";
    }
    

    postMessage(url, form, function (data) {
        var url = data.urlName;
        functionId = data.functionId;
        var transferAmount = data.number;
        var transferInAcc = data.person;

        if (url) {
            $("#" + url).click();
        }

        if (transferInAcc) {
            $("#transferInAcc").val(transferInAcc);
        }
        else {
            //askTransferInAcc();
        }
        if (transferAmount) {
            $("#transferAmount").val(transferAmount);
        }
        else {
            askTransferAmount();
        }
    });
}


function toggleRecording(e) {
    if (e.classList.contains("recording")) {
        // stop recording 
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers(gotBuffers);



    } else {
        // start recording 
        if (init == 0) {

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = callback;
            var callback = function (data) {
                audioPlay(data.audio);
                
            };
            url = "/voiceAssistant/question";
            //xhr.open("POST", url);
            var form = new FormData();
            form.append("question", "请问你需要什么帮助？");
            form.append("functionId", functionId);
            //xhr.send(form);
            postMessage(url,form,callback);
            init = 1;
           

        }
        else {
            if (!audioRecorder)
                return;
            e.classList.add("recording");
            audioRecorder.clear();
            audioRecorder.record();
        }

    }
}

function convertToMono(input) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    rafID = null;
}

function updateAnalysers(time) {
    /* if (!analyserContext) { 
        var canvas = document.getElementById("analyser"); 
        canvasWidth = canvas.width; 
        canvasHeight = canvas.height; 
        analyserContext = canvas.getContext('2d'); 
    } */

    /*     // analyzer draw code here 
        { 
            var SPACING = 3; 
            var BAR_WIDTH = 1; 
            var numBars = Math.round(canvasWidth / SPACING); 
            var freqByteData = new Uint8Array(analyserNode.frequencyBinCount); 
    
            analyserNode.getByteFrequencyData(freqByteData); 
    
            analyserContext.clearRect(0, 0, canvasWidth, canvasHeight); 
            analyserContext.fillStyle = '#F6D565'; 
            analyserContext.lineCap = 'round'; 
            var multiplier = analyserNode.frequencyBinCount / numBars; 
    
             // Draw rectangle for each frequency bin. 
            for (var i = 0; i < numBars; ++i) { 
                var magnitude = 0; 
                var offset = Math.floor( i * multiplier ); 
                // gotta sum/average the block, or we miss narrow-bandwidth spikes 
                for (var j = 0; j< multiplier; j++) 
                    magnitude += freqByteData[offset + j]; 
                magnitude = magnitude / multiplier; 
                var magnitude2 = freqByteData[i * multiplier]; 
                analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)"; 
                analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude); 
            } 
        } */

    rafID = window.requestAnimationFrame(updateAnalysers);
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono(realAudioInput);
    }

    audioInput.connect(inputPoint);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream. 
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    //    audioInput = convertToMono( input ); 

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect(analyserNode);

    audioRecorder = new Recorder(inputPoint);

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect(zeroGain);
    zeroGain.connect(audioContext.destination);
    updateAnalysers();
}

function initAudio() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function (e) {
            alert('Error getting audio');
            console.log(e);
        });
}

window.addEventListener('load', initAudio); 