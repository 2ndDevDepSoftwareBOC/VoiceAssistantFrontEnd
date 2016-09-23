define("share",["jquery"], function($) {
	var Share ={};
	Share.Common = {};
	Share.Common.params = {};
	Share.Common.empInfo = {};
	
	Share.url = "/COMP/_bfwajax.do";
	/** 
	 * Ajax调用
	 * 参数形如：
	 * params = {
	 *      method: 'queryExamByOpenId',
	 *      params: {empNo: '1'}
	 * }
	 **/
	Share.api = (function(){
		var _fajax = function(type,purl,params,dataType,callback,errorcallback){
			var p = {};
			var uid = (new Date).valueOf() + "_" + Math.ceil(Math.random() * 0x7fffffff);
			for(var k in params){
				if(k != 'method'){
					p[k] = params[k];
				}
			}
			var params1 = {
					"json": JSON.stringify({
						"method":params.method || "default",
						"params" : p
					})
			}

			$.ajax({
				url: Share.Common.params.demo ? ('./data/' + params.method + '.json') : (purl ? purl : Share.url),
						type:type,
						dataType:dataType,
						data:params1,
						success:function(data){
							if (data._isException_ == true) {
								Share.showAlert(data.message, "确定");
							}else {
								callback(data);
							}
						},
						error:function(XMLHttpRequest,textStatus,errorThrown){
							if(errorcallback) 
								errorcallback(textStatus, errorThrown);
						}
			});
		}
		return {
			ajax:_fajax
		}
	})();
	/**
	 * 获取URL参数
	 */
	Share.getURLparams = function(Common) {
		var appPath = decodeURIComponent(window.location.href);
		if (appPath.indexOf("?") > -1) {
			var paramsArray = appPath.substr(appPath.indexOf("?") + 1).split(/#/);
			var entranceParams = paramsArray[0].split(/&/);
			for (var i = 0; i < entranceParams.length; i++) {
				var entranceParam = entranceParams[i].split(/\=/);
				switch (entranceParam[0]) {
				case "demo":
					Common.params.demo = entranceParam[1];
					break;
				default:
					break;
				}
			}
		}
	};
	/**
	 * 分页按钮可用性控制
	 */
	Share.page = function() {
		// 下页
		if (parseInt($('#current_page').text()) <parseInt($('#total_page').text())) {
	        $('#page_down').attr('disabled', false);
	    } else {
	        $('#page_down').attr('disabled', true);
	    }
		// 上页
	    if (parseInt($('#current_page').text()) == 1
	        || parseInt($('#current_page').text()) == 0
	        || parseInt($('#current_page').text()) > parseInt($('#total_page').text())) {
	        $('#page_up').attr('disabled', true);
	    } else {
	        $('#page_up').attr('disabled', false);
	    }
	    // 跳转到x页
	    $('#page_input').on('focus', function () {
	        $('#page_to').attr('disabled', false);
	        $(this).blur(function () {
	            if ($(this).val() == '') {
	                $('#page_to').attr('disabled', true);
	            } else {
	                $('#page_to').attr('disabled', false);
	            }
	        });
	    });
	};
	/**
	 * 依据翻页控制返回响应的页码
	 * @param that 响应元素
	 * @returns {number} 页码
	 */
	Share.getPageIndex = function(that) {
	    that.attr('disabled', true);
	    var index = 0;
	    if (that.is('#page_up')) {
	        index = parseInt($('#current_page').text()) - 1;
	    } else if (that.is('#page_down')) {
	        index = parseInt($('#current_page').text()) + 1;
	    } else if (that.is('#page_to')) {
	        if (!/^\d+$/.test($('#page_input').val())) {
	            Share.showAlert('请填写正确的页码数！',"确定");
	            $('#page_input').val('');
	            that.attr('disabled', true);
	            return 0;
	        }
	        if (parseInt($('#page_input').val()) < 1 || parseInt($('#page_input').val()) > parseInt($('#total_page').text())) {
	        	Share.showAlert('请填写正确的页码数！',"确定");
	            $('#page_input').val('');
	            that.attr('disabled', true);
	            return 0;
	        }
	        index = parseInt($('#page_input').val());
	    }
	    $('#page_input').val('');
	    return index;
	};
	/**
	 * 警告式弹窗
	 * @param content 弹窗内容
	 * @param btnContent 确定按钮上的文字
	 */
	Share.showAlert = function(content, btnContent) {
		$('<div class="alertOuter"></div>').appendTo('body');
		$('<div class="alertcon">'
				+"<h2>提示</h2>"
				+"<p>"+content+"</p>"
				+'<span id="alert_sure">'+btnContent+'</span>'
				+'</div>').appendTo('body');
		$('.alertOuter').css('height',(document.body.scrollHeight)+'px');
		$('#alert_sure').click(function() {
			$('.alertcon').remove();
			$('.alertOuter').remove();
		})
	};
	/**
	 * 确认式弹窗
	 * @param content 弹窗内容
	 * @param funcSure 确定按钮后的操作函数
	 * @param data 操作函数的参数
	 */
	Share.showConfirm = function(content, funcSure, data) {
		$('<div class="alertOuter"></div>').appendTo('body');
		$('<div class="alertcon">'
				+"<h2>提示</h2>"
				+"<p>"+content+"</p>"
				+'<span id="alert_sure">确定</span>'
				+'</div>').appendTo('body');
		$('.alertOuter').css('height',(document.body.scrollHeight)+'px');
		$('#alert_sure').click(function() {
			$('.alertcon').remove();
			$('.alertOuter').remove();
		})
	}
	/**
	 * 按指定格式格式化时间对象
	 */
	Share.date = function (dateObj , dateFormat){
		var m = dateObj.getMonth() + 1,
		d = dateObj.getDate(),
		minute = dateObj.getMinutes(),
		h = dateObj.getHours(),
		s = dateObj.getSeconds(),
		dateFormat = dateFormat || "%y/%M/%d";
		var year = dateObj.getFullYear();
		var month = m < 10 ? "0" + m : "" + m;
		var day = d < 10 ? "0" + d : "" + d;
		var hours = h < 10 ? "0" + h : "" + h;
		var minutes = minute < 10 ? "0" + minute : "" + minute;
		var seconds = s < 10 ? "0" + s : "" + s;
		return dateFormat.replace("%y" , year).replace("%M" , month)
		.replace("%d" , day).replace("%H" , hours)
		.replace("%m" , minutes).replace("%s" , seconds);
	};

	Share.base64 ={
			keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			encode: function (input) {
				input = escape(input);
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;

				do {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);

					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;

					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}

					output = output +this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";
				} while (i < input.length);

				return output;
			},
			decode: function (input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;

				// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
				var base64test = /[^A-Za-z0-9\+\/\=]/g;
				if (base64test.exec(input)) {
					alert("There were invalid base64 characters in the input text.\n" +
							"Valid base64 characters are A-Z, a-z, 0-9, '+', '/', and '='\n" +
					"Expect errors in decoding.");
				}
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				do {
					enc1 = this.keyStr.indexOf(input.charAt(i++));
					enc2 = this.keyStr.indexOf(input.charAt(i++));
					enc3 = this.keyStr.indexOf(input.charAt(i++));
					enc4 = this.keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;
					output = output + String.fromCharCode(chr1);
					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
					}
					chr1 = chr2 = chr3 = "";
					enc1 = enc2 = enc3 = enc4 = "";
				} while (i < input.length);
				return unescape(output);
			}
	};
	return Share;
});
