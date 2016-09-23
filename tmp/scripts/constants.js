define('constants', function() {
	var Constant = {
		// 证件类型
		curType : [
			{"value" : "001", "text" : "人民币"},
			{"value" : "014", "text"  : "美元"},

		],
		// 页面大小
		pageSize: "10",
		
		//  日历控件参数设置
        datepickerParams:{
            dayNamesMin:["日","一","二","三","四","五","六"],
            monthNamesShort:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
            changeMonth : true,
            changeYear :true,
            dateFormat : "yy-mm-dd",
            firstDay :  1
        }
	};
	return Constant;
});