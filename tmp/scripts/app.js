define("jquery", ["lib/jquery-1.12.0.min"], function () {
	return $;
});

require.config({
	baseUrl: "scripts",
	shim: {
		treeMenu:["jquery"],
		validate:["jquery"]
	},
	paths: {
		ejs: "lib/ejs",
		domReady: "lib/domReady",
		share:"share",
		treeMenu:"lib/jQuery.ui.treeMenu",
		admin:"routes/admin",
		constants:"constants",

    jqueryUI:"lib/jquery-ui-1.11.4",
    appStartup:"routes/appStartup",

    
    beijing: "routes/beijing",
    beijingsub:"routes/beijingsub",
    beijingday:"routes/beijingday",
	}
});
require(["jquery", "ejs", "domReady", "share"], function($, EJS, domReady, Share) {
	var Common = Share.Common; 
	Share.getURLparams(Common);

	
	domReady(function () {
		showAdmin()

    });
	

	
	function showAdmin() {
		require(["admin"], function(Admin) {
			var admin = new Admin();
			admin.init();
		});
	}
});