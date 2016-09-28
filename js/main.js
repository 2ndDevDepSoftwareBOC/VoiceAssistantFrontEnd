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
var curStatus = 'init';

var controls = {
    "100100": ["innerbankTransfer", "interbankTransfer"],
    "100101": "innerbankTransfer",
    "100102": "interbankTransfer",
    "100103": "crossborderTransfer",
    "101100": "checkBalance",
    "101101": "transactionDetail",
    "102100": "queryBill",
    "102101": "paybackBill"
};
var controlText = {
    innerbankTransfer: "行内转账",
    interbankTransfer: "跨行转账",
    "100100": "请问收款人是中行客户还是非中行客户?"
};
var parameters = {
    "100101": ["transferInAcc", "transferAmount"],
    "100102": ["transferInAcc", "transferAmount"],
};
var parametersText = {
    transferInAcc: "请问收款人是谁？",
    transferAmount: "请问您要转出的金额是多少？"
};
var curParameter = {};


function gotBuffers(buffers) {
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

function ask(str) {
    var formdata = new FormData();
    formdata.append("question", str)

    postMessage("/voiceAssistant/question", formdata, function (data) {
        audioPlay(data.audio);
    });
}
function audioPlay(audio) {
    var player = $("#audioPlayer");

    player = player[0] || player;
    player.src = audio;
    player.play();
    player.onended = function () {
        if ($("#record")[0].classList.contains("recording")) {
            $("#record")[0].classList.remove("recording");
        }

    };
    player.oncanplay = function () {
        $("#record")[0].classList.add("recording");
    }

}
function redirect(blob) {
    url = "/voiceAssistant/redirect";
    var form = new FormData();
    form.append("file", blob);
    //form.append("functionId", functionId); 
    curParameter = {};
    postMessage(url, form, function (data) {
        //var url = data.urlName;
        if (data.error == "true") {
            ask("对不起我没有听清，请再说一遍");
            return;
        }
        var transferAmount = data.number;
        var transferInAcc = data.person;
        functionId = data.functionId;
		if (typeof controls[functionId] != "object")
		{
			$("#" + controls[functionId]).click();
            var param = getStillNullParameter(functionId);
            if (param) {
                ask(parametersText[param]);
                curStatus = param;
            }
            else
            {
                curStatus = "init";
                functionId = null;
            }
			return;
		}
        if (functionId == "100100")
        {
            if(transferAmount != null)
            {
                curParameter["transferAmount"] = transferAmount;
            }
            if (transferInAcc == null) {
                var text = controlText[functionId];
                ask(text);
                curStatus = "confirmService";
            }
            else {

                if (transferInAcc.indexOf("李") >=0 ) {
                    functionId = "100101";
                }
                else {
                    functionId = "100102";
                }
                curParameter.transferInAcc = transferInAcc;
                if (transferAmount != null) {
                    curParameter.transferAmount = transferAmount;
                }
                $("#" + controls[functionId]).click();
			    $("#transferAmount").val(transferAmount);
			    $("#transferInAcc").val(transferInAcc);
                var param = getStillNullParameter(functionId);
                if (param) {
                    ask(parametersText[param]);
                    curStatus = param;
                }
                else
                {
                    ask("您确定要给"+curParameter["transferInAcc"]+"转账"+curParameter["transferAmount"]+"元吗？，请说确定或取消。");
                    curStatus="confirm"
                }
            }
            return;
        }
        
        
    });
}

function answer(blob, str) {
    url = "/voiceAssistant/answer";
    var form = new FormData();
    form.append("file", blob);
    form.append("functionId", functionId);
    postMessage(url, form, function (data) {

        if (data.error == "true") {
            ask("对不起我没有听清，请再说一遍");
            return;
        }

        if (str == "confirmService") {
            if (data.answer.indexOf("中行") >= 0 || data.answer.indexOf("其他") >= 0) {
                if (data.answer.indexOf("中行") >= 0) {
                    functionId = "100101";
                }
                else {
                    functionId = "100102";
                }
                $("#" + controls[functionId]).click();

                var param = getStillNullParameter(functionId);
                if (param) {
                    ask(parametersText[param]);
                    curStatus = param;
                }
            }
        }
        else {

            if (str == "transferAmount") {
                var reg = new RegExp("^[0-9]*$");
                if (reg.test(data.answer)) {
                    //alert(data.answer);
					$("#transferAmount").val(data.answer);
                    curParameter[str] = data.answer
                }
                else
                {
                    ask("对不起，我没有听清，请再说一遍");
                }
            }
            else if (str == "transferInAcc") {
                //alert(data.answer);
				$("#transferInAcc").val(data.answer);
                curParameter[str] = data.answer;
            }
			if(str == "confirm" )
			{
				if(data.answer.indexOf("确") >=0)
				{
					ask("您办理的业务已经完成，请您查询动账通知或者余额。");
                    alert("您办理的业务已经完成，请您查询动账通知或者余额。");
                    

				}
				else
				{
					ask("已取消");
				}
                curStatus = "init";
                functionId = null;
				return;
			}
            var param = getStillNullParameter(functionId);
            if (param) {
                    ask(parametersText[param]);
                    curStatus = param;
                }
				else
				{
					ask("您确定要给"+curParameter["transferInAcc"]+"转账"+curParameter["transferAmount"]+"元吗？，请说确定或取消。");
					curStatus="confirm";
				}
        }


    });
}

function getStillNullParameter(founctionId) {
    for (var i in parameters[founctionId]) {
        if (!curParameter[parameters[functionId][i]]) {
            return parameters[functionId][i]
        }
    }
    return null;
}

function doneEncoding(blob) {
    if (functionId == null) {
        redirect(blob);
    }
    else {
        answer(blob, curStatus)
    }

}


function toggleRecording(e) {
    if (e.classList.contains("recording")) {
        // stop recording 
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.getBuffers(gotBuffers);



    } else {
        // start recording 
        if (curStatus == "init") {

            ask("请问您需要什么帮助？");
            curStatus = "";

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