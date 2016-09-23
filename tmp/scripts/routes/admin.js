define("admin", ["require", "jquery", "ejs", "share","treeMenu", "domReady"], function(require, $, EJS, Share, treeMenu, domReady) {
	// public variables
	var Common = Share.Common;
	var url = Share.url;

	var Admin = function (){
		this.ejsPath = "./views/admin.ejs";
	};
	Admin.prototype = {
			init: function() {
				var _t = this;
				var ejs = new EJS({
					url : _t.ejsPath
				}).render();
				$("#mainbody").html(ejs);

				domReady(function () {
					_t.initTree();
				});
			},
			/**
			 * 初始化功能树形列表
			 */
			initTree: function() {
				var ejs = new EJS({
					url : "./views/treeMenu.ejs"
				}).render();
				$(".tree_main").html(ejs);
				$("#mainMenus").treeMenu();
				$(".tree_leaf").on("click", onTreeLeaf);
				$("#logout").on("click", onLogout);
			}
	};

	/** 
	 * 退出登录响应函数
	 */
	function onLogout() {
		require(["login"], function(Login) {
			var login = new Login();
			login.init();
		});
	}
	/** 
	 * 点击叶子节点的响应
	 */
	function onTreeLeaf() {
		var moduleName = this.id;
		//var ejsPaths =
		//  {interbankTransfer: "./views/interbankTransfer.ejs",
		//  checkBalance:"./views/checkBalance.ejs",
		//  queryBill:"./views/queryBill.ejs",
		//  innerbankTransfer:"./views/innerbankTransfer.ejs",
		//  crossborderTransfer:"./views/crossborderTransfer.ejs",
		//  innerbankTransfer:"./views/innerbankTransfer.ejs",
		//  crossborderTransfer:"./views/crossborderTransfer.ejs"
		// };

		var ejsPath = "./views/"+moduleName+".ejs";



		var ejs = new EJS({ url : ejsPath}).render();
		$(".right").html(ejs);  



/*

		if(moduleName) {
			require([moduleName], function(Module) {
				new Module().init();
			});
		}else {
			$(".right").html("");
		}
		*/
		
	}
	return Admin;
});






