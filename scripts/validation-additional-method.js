define("additionalFunc", ["require", "jquery", "validate",], function(require, $, validate) {
	var AdditionalFunc = {};
	AdditionalFunc.init = function() {
		//员工管理 	员工工号
		jQuery.validator.addMethod("checkEmpNum", function (value, element) {
			return this.optional(element) || /^\d{7}$/i.test(value);
		}, "必须是7位数字");
		//员工管理 	员工姓名
		jQuery.validator.addMethod("checkEmpName", function (value, element) {
			return this.optional(element) || /^[\u4e00-\u9fa5·.﹒]{1,15}$/i.test(value);
		}, "必须为1-15个汉字或“·”、“.”、“﹒”字符");
		//员工管理 	密码
		jQuery.validator.addMethod("checkPassword", function (value, element) {
			return this.optional(element) || /^[\S]{6,18}$/.test(value);
		}, "须大于6位小于18位，非空白字符");
		//员工管理 	手机
		jQuery.validator.addMethod("checkMobile", function (value, element) {
			return this.optional(element) || /^1\d{10}$/.test(value);
		}, "必须是1开头的11位数字");
		//员工管理	select选择
		jQuery.validator.addMethod("checkSelect", function (value, element) {	
			return $(element).find("option:selected").val() != "xz";
		}, "请选择");
		//员工管理	tree未选择
		jQuery.validator.addMethod("checkTree", function (value, element) {	
			return $(element).children("div").jqxTree("getCheckedItems").length != 0;
		}, "请分配角色权限");
	}
	return AdditionalFunc;
});