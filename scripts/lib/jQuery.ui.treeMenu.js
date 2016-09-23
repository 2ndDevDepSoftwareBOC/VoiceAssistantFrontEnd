/***************************************************************************
*	
*	菜单控件，
*	@author 李见伟
*	pramas:
*/

;(function($,undefined){
	var win;
	function getRootMenu(target){
		var roots=getRootMenus(target);
		return roots[0];
	}
	function getRootMenus(target){
		var roots = [];
		$(target).children('li').each(function(){
			var menus = $(this).children('div.tree_node');
			roots.push(getMenus(target, menus[0]));
		});
		return roots;
	}
	
	function getMenus(target,el){
		return $($(el),target);
	}
	function getChildren(target, el){
		var menus = [];
		if (el){
			menus=getMenus(target,$(el));
		} else {
			var roots = getRootMenus(target);
			for(var i=0; i<roots.length; i++){
				menus.push(roots[i]);
			}
		}
		return menus;
	}
	function getLength(target){
		return $("li",target).length;
	}
	function getRootLength(target,el){
		return $(target).children("li").length;
	}
	function getChildrenLength(target,el){
		var ul=$($(el),target).next("ul");
		return ul.children("li").length;
	}
	function getOptions(target){
		return $.data(target,"treeMenu").options;
	}
	function isLeaf(m){
		if(m.hasClass("tree_node")){
			return true;
		}
		return false;
	}
	function isOpen(m){
		return m.siblings("ul").is(":visible");
	}
	function expandMenu(target, el){
		var menu=getMenus(target, el);
		menu.addClass("expand");
		menu.siblings("ul").slideDown(300);
		menu.parent().siblings().each(function(){
			var m=$(this).children("div.tree_node");
			collapseMenu(target,m);
		});
		
	}
	function collapseMenu(target, el){
		var menu=getMenus(target, el);
		menu.siblings("ul").slideUp(300);
		menu.removeClass("expand");
	}
	
	function toggleMenu(target,el){
		var opts=getOptions(target);
		var menu=getMenus(target,el);
		if(isOpen(menu)){
			collapseMenu(target,menu);
			opts.expandNode=null;
		}else{
			expandMenu(target,menu);
			opts.expandNode=el;
		}
		$.fn.treeMenu.defaults.onToggleMenu(target, el);
	}
	
	function bindTreeMenuEvents(target){
		var opts =getOptions(target);
		$(target).unbind().bind('mouseover', function(e){
			e.stopPropagation();
		}).bind('mouseout', function(e){
			e.stopPropagation();
		}).bind('click', function(e){
			var tt = $(e.target);
			var node = tt.closest('div.tree_node');
			var leafNode=tt.closest("div.tree_leaf");
			if(node.length){
				if(opts.eidtable){
					if(tt.is("span.deleteIcon")){
						/*删除主菜单*/
						$.Confirm({html:"您真的确认删除吗?",buttons:{
		   					"确定": function(){
								var cli=tt.closest('li');
								var menuId=cli.attr("id");
								var params={"oper":"delete","menuId":menuId};
								//var opts=getOptions(target);
								var json = {
									method : opts.method,
									params : params
								};
								$.post(opts.url, {
									json : JSON.stringify(json)
								}, function(data) {
									if(!data._isException_){
										if(cli){
											cli.remove();
										}
										$.FloatingHint({id:"FloatHint",type:"success",holdTime: 1000,text:"删除成功！ "});
										//reload(target);
										//$.fn.treeMenu.defaults.onRemoveOk.call(target,data);
									}else{
										$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"删除失败！ "});
									}
								}, "json");
		   					},
		   					"取消": function () {
		   						return;
		   					}
						}});
						return;
					}else if(tt.is("span.addIcon")){
						/*显示添加子菜单窗口*/
						var childrenLength=getChildrenLength(target,node);
						if(childrenLength<5){
							var json={};
							var li=tt.closest("li");
							var pid=li.attr("id");
							json.parentId=pid;
							showEditWin(target,json);
						}else{
							$.FloatingHint({id:"FloatHint",type:"information",holdTime: 1000,text:"最多能添加五个子菜单 ！"});
						}
						return;
					}else if(tt.is("span.modifyIcon")){
						var menuName=$("span.titleText",node);
						//var params={oper:"save"};
						var json={};
						var id=tt.closest("li").attr("id");
						if(id){
							json.id=id;
						}
						json.menuName=menuName.text();
						showEditWin(target,json);
						return;
					}else if(tt.is("span.movedownIcon")){
						var parentli = node.parent();
						var nextparentli = parentli.nextAll("li").eq(0);
						var menuId1 = parentli.attr("id");
						var menuId2 = nextparentli.attr("id");
						if(nextparentli.length == 0){
							$.FloatingHint({id:"FloatHint",type:"information",holdTime: 1000,text:"已经到菜单底部！"});
						}else {
							var params={"oper":"updatemenuorder",
										"menuId1":menuId1,
										"menuId2":menuId2};
							var json = {
										method : opts.method,
										params : params};
							$.post(opts.url, {
								json : JSON.stringify(json)
								}, function(data) {
								if(!data._isException_){
								
									$(parentli).insertAfter(nextparentli);
								//$.FloatingHint({id:"FloatHint",type:"success",holdTime: 1000,text:"删除成功！ "});
								//reload(target);
								//$.fn.treeMenu.defaults.onRemoveOk.call(target,data);
								}else{
									$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"菜单顺序修改失败！ "});
								}
								}, "json");
							}
						return;
					}else if(tt.is("span.moveupIcon")){
						var parentli = node.parent();
						var prevparentli = parentli.prevAll().eq(0);
						var menuId1 = parentli.attr("id");
						var menuId2 = prevparentli.attr("id");
						if(prevparentli.length == 0){
							$.FloatingHint({id:"FloatHint",type:"information",holdTime: 1000,text:"已经到菜单顶部！"});
						}else {
							var params={"oper":"updatemenuorder",
									"menuId1":menuId1,
									"menuId2":menuId2};
							var json = {
									method : opts.method,
									params : params};
							$.post(opts.url, {
								json : JSON.stringify(json)
								}, function(data) {
									if(!data._isException_){
							
										$(parentli).insertBefore(prevparentli);
									}else{
										$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"菜单顺序修改失败！ "});
									}
								}, "json");
							
							}
						return;
					}
				}
				toggleMenu(target, node[0]);
				return;
			}else if(leafNode.length){
				node=tt.closest("div.tree_leaf");
				if(!node.length){
					return;
				}
				if(opts.eidtable){
					if(tt.is("span.deleteIcon")){
						/*删除子菜单*/
						$.Confirm({html:"您真的确认删除吗?",buttons:{
		   					"确定": function(){
								var cli=tt.closest('li');
								var menuId=cli.attr("id");
								var params={"oper":"delete","menuId":menuId};
								//var opts=getOptions(target);
								var json = {
									method : opts.method,
									params : params
								};
								$.post(opts.url, {
									json : JSON.stringify(json)
								}, function(data) {
									if(!data._isException_){
										if(cli){
											cli.remove();
										}
										$.FloatingHint({id:"FloatHint",type:"success",holdTime: 1000,text:"删除成功！ "});
									}else{
										$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"删除失败！ "});
									}
								}, "json");
		   					},
		   					"取消": function () {
		   						return;
		   					}
						}});	
						return;
					}
					if(tt.is("span.modifyIcon")){
						/*修改子菜单*/
						var ul=tt.closest("ul");
						var parentId=ul.closest("li").attr("id");
						var menuName=$("span.titleText",node);
						var json={};
						var id=tt.closest("li").attr("id");
						if(id){
							json.id=id;
						}
						json.parentId=parentId;
						json.menuName=menuName.text();
						showEditWin(target,json);
						return;
					}else if(tt.is("span.movedownIcon")){
						var parentli = node.parent();
						var nextparentli = parentli.nextAll("li").eq(0);
						var menuId1 = parentli.attr("id");
						var menuId2 = nextparentli.attr("id");
						if(nextparentli.length == 0){
							$.FloatingHint({id:"FloatHint",type:"information",holdTime: 1000,text:"已经到菜单底部！"});
						}else {
							var params={"oper":"updatemenuorder",
									"menuId1":menuId1,
									"menuId2":menuId2};
						var json = {
									method : opts.method,
									params : params};
						$.post(opts.url, {
							json : JSON.stringify(json)
							}, function(data) {
							if(!data._isException_){
								$(parentli).insertAfter(nextparentli);
							}else{
								$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"菜单顺序修改失败！ "});
							}
							}, "json");
						
							
						}
						return;
					}else if(tt.is("span.moveupIcon")){
						var parentli = node.parent();
						var prevparentli = parentli.prevAll().eq(0);
						var menuId1 = parentli.attr("id");
						var menuId2 = prevparentli.attr("id");
						if(prevparentli.length == 0){
							$.FloatingHint({id:"FloatHint",type:"information",holdTime: 1000,text:"已经到菜单顶部！"});
						}else {
							var params={"oper":"updatemenuorder",
									"menuId1":menuId1,
									"menuId2":menuId2};
							var json = {
									method : opts.method,
									params : params};
							$.post(opts.url, {
								json : JSON.stringify(json)
								}, function(data) {
									if(!data._isException_){
										$(parentli).insertBefore(prevparentli);
									}else{
										$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"菜单顺序修改失败！ "});
									}
								}, "json");
						}
						return;
					}
					e.preventDefault();
				}
				$.fn.treeMenu.defaults.onLeafSelected(target,leafNode);
				node.addClass("current");
				$("div.tree_leaf",target).not(node).removeClass("current");
				return;
			}else if(tt.is(".cancelEditBtn")){
				hideEditChildWin(target);
			}else if(tt.is(".saveMenuBtn")){
				var menuEditWin=$(".editMenuFormPanel",target);
				var parentId=$("input.parentId",menuEditWin).val();
				var menuId=$("input.menuId",menuEditWin).val();
				var menuName=$("input.menuName",menuEditWin).val().trim();
				if(!menuName){
					alert("不能为空");
					return;
				}
//				window.alert=function(data){
//					$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:data});
//				}
				if(parentId){
					if(!/^([a-zA-Z0-9]|[\u4e00-\u9fa5]){1,10}$/.test(menuName)){
//						alert("二级菜单必须为1-10位数字，字母，中文");
						$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"二级菜单必须为1-10位数字，字母，中文"});
						return;
					}
				}else{
					if(!/^([a-zA-Z0-9]|[\u4e00-\u9fa5]){1,5}$/.test(menuName)){
//						alert("一级菜单必须为1-5位数字，字母，中文");
						$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"一级菜单必须为1-5位数字，字母，中文"});
						return;
					}
				}
				var params={};
				params={oper:"save"};
				if(menuId){
					params.menuId=menuId;
					params.oper="update";
				}
				if(parentId){
					params.parentId=parentId;
				}
				params.menuName=menuName;
				hideEditChildWin(target);
				save(target,params,
						function(data){
					if(!data._isException_){
						if(menuId){
							var li=$("li#"+menuId,target);
							var cnode=li.children("div").first();
							if(cnode){
								$("span.titleText",cnode).text(menuName);
							}
						}else if(parentId){
							var id=data.result.id;
							if(!id){return;}
							var json={};
							json.id=id;
							json.parentId=parentId;
							json.menuName=menuName;
							insertChildNode(target,json);
						}else{
							var id=data.result.id;
							if(!id){return;}
							var json={};
							json.id=id;
							json.menuName=menuName;
							insertNode(target,json);
						}
						$.FloatingHint({id:"FloatHint",type:"success",holdTime: 1000,text:"保存成功！ "});
					}else{
						$.FloatingHint({id:"FloatHint",type:"error",holdTime: 1000,text:"保存失败！ "+data.message});
					}
					
				});
			}
			return false;
			e.stopPropagation();
		});
	}
	function init(target,options){
		$(target).addClass("tree_menus");
	}
	function initTree(target,json){
		if(!json){return;}
		$(target).html("");
		var fd=treeDataFormat(json,"id","parentId");
		var opts=getOptions(target);
		initTreeNodes(target,fd,opts);
		if(opts.eidtable){
			var menuformPanel=$('<div class="editMenuFormPanel none"><div class="p20"><input type="hidden" value="" name="parentId" class="parentId" /><input type="hidden" value="" name="menuId" class="menuId" /><div><lable for="menuNameText">菜单名称：</lable><input type="text" size="30" value=""  name="menuName" class="menuName" id="menuNameText"><span class="btn submit ml10 saveMenuBtn">保存</span><span class="btn ml10 cancelEditBtn">取消</span></div><div class="pt10"></div></div></div>');
			menuformPanel.appendTo(target);
		}
		if(opts.expandNode){
			toggleMenu(target, opts.expandNode);
		}
	}
	function initTreeNodes(target,data,options){
		if(!data){return;}
		for(var i=0;i<data.length;i++){
			var json=data[i];
			var root=$('<li><div class="tree_node"></div></li>');
			if(json.id){
				root.attr("id",json.id);
			}
			var node=root.children("div").first();
			root.appendTo(target);
			
			if(json.children){
				node.addClass("tree_node").removeClass("tree_leaf");
				if(options.removeable){
					$('<span class="moveupIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="movedownIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="deleteIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="modifyIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="addIcon fr mt10 mr10"></span>').appendTo(node);
				}
				$('<span class="titleText"></span').appendTo(node).text(json.menuName);
				var ul=$("ul",root);
				if(!ul.length){
					ul=$('<ul style="display:none;"></ul>');
					ul.appendTo(root);
				}
				initTreeNodes(ul,json.children,options);
			}else{
				node.addClass("tree_leaf").removeClass("tree_node");
				if(options.removeable){
					$('<span class="moveupIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="movedownIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="deleteIcon fr mt10 mr10"></span>').appendTo(node);
					$('<span class="modifyIcon fr mt10 mr10"></span>').appendTo(node);
				}
				var a=$('<a href="javascript:void(0);"></a>').appendTo(node);
				$('<span class="titleText"></span').appendTo(a).text(json.menuName);
				if(options.linkUrl){
					if(json.url){a.attr("href",json.url);};
				}
			}
		}
	}
	function showEditWin(target,json){
		var opts=getOptions(target);
		var menuEditWin=$(".editMenuFormPanel",target);
		var parentId=$("input.parentId",menuEditWin);
		var id=$("input.menuId",menuEditWin);
		var childMenuName=$("input.menuNameInput",menuEditWin);
		if(json){
			if(json.parentId){
				$("input.parentId",menuEditWin).val(json.parentId);
			}else{
				$("input.parentId",menuEditWin).val("");
			}
			if(json.id){
				$("input.menuId",menuEditWin).val(json.id);
			}else{
				$("input.menuId",menuEditWin).val("");
			}
			if(json.menuName){
				$("input.menuName",menuEditWin).val(json.menuName);
			}else{
				$("input.menuName",menuEditWin).val("");
			}
		}else{
			$("input.parentId",menuEditWin).val("");
			$("input.menuId",menuEditWin).val("");
			$("input.menuName",menuEditWin).val("");
		}
		win= menuEditWin.MyWindow({width:500,height:135,title:"添加菜单",mask:true});
	}
	function hideEditChildWin(target){
		if(!win){
			win=null;
		}else{
			win.close();
		}
	}
	function insertNode(target,json){
		if(!json){return;}
		var opts=getOptions(target);
		
		var root=$('<li><div class="tree_node"></div></li>');
		if(json.id){
			root.attr("id",json.id);
		}
		var node=root.children("div").first();
		root.appendTo(target);
		if(opts.removeable){
			$('<span class="moveupIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="movedownIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="deleteIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="modifyIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="addIcon fr mt10 mr10"></span>').appendTo(node);
		}
		$('<span class="titleText"></span').appendTo(node).text(json.menuName);
		var ul=$("ul",root);
		if(!ul.length){
			ul=$('<ul style="display:none;"></ul>');
			ul.appendTo(root);
		}
	}
	function insertChildNode(target,json){
		var opts=getOptions(target);
		if(!json.parentId && !json.id && json.menuName){return;}
		var pli=$("li#"+json.parentId,target);
		var pNode=pli.children("div").first();
		var ul=pNode.next("ul");
		if(!ul.length){
			ul=$('<ul></ul>');
			ul.appendTo(pNode.parent());
		}
		var root=$('<li><div class="tree_leaf"></div></li>');
		root.appendTo(ul);
		var node=root.children("div").first();
		if(opts.removeable){
			$('<span class="moveupIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="movedownIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="deleteIcon fr mt10 mr10"></span>').appendTo(node);
			$('<span class="modifyIcon fr mt10 mr10"></span>').appendTo(node);
		}
		var a=$('<a href="javascript:void(0);"></a>').appendTo(node);
		$('<span class="titleText"></span').appendTo(a);
		root.attr("id",json.id);
		$("span.titleText",node).text(json.menuName);
	}
	
	function remove(target,params){
		if(!params|| ! params.menuId){return;}
		var opts=getOptions(target);
		var json = {
			method : opts.method,
			params : params
		};
		$.post(opts.url, {
			json : JSON.stringify(json)
		}, function(data) {
			if(!data._isException_){
				reload(target);
				$.fn.treeMenu.defaults.onRemoveOk.call(target,data);
			}
		}, "json");
	}
	function save(target,params,fn){
		if(!params ||!params.menuName){return;}
		var opts=getOptions(target);
		var json = {
			method : opts.method,
			params :params
		};
		$.post(opts.url, {
			json : JSON.stringify(json)
		}, function(data) {
			if(!data._isException_){
				if(fn){
					fn(data);
				}
				$.fn.treeMenu.defaults.onSaveOk.call(target,data);
			}else{
				fn(data);
			}
		}, "json");
	}
	function reload(target,params){
		return loadRemoteData(target,params);
	}
	function loadRemoteData(target,params){
		var opts=getOptions(target);
		if(!params){
			params=opts.params;
		}
		var json = {
			method : opts.method,
			params : params
		};
		$.post(opts.url,{
			json : JSON.stringify(json)
		},function(json){
			if(!json._isException_){
				var result=json.result;
				if(result && result.rows){
					initTree(target,result.rows);
				}
			}
		}, "json");
		
	}
	function loadChildrenNodes(target,pid){
		if(!pid){return;}
		var opts=getOptions(target);
		var params={"oper":"query"};
		params.menuId=pid;
		var json = {
			method : opts.method,
			params : params
		};
		$.post(opts.url,{
			json : JSON.stringify(json)
		},function(data){
			if(!data._isException_){
				var result=data.result;
				if(result && result.rows){
					initTree(target,result.rows);
				}
			}
		}, "json");
		
	}
	function treeDataFormat(json,key,parentKey){
		var format=[];
		for(var i=0;i<json.length;i++){
			var obj=json[i];
			if(!obj[parentKey] || obj[parentKey]<1){
				obj.children=[];
				for(var j=0;j<json.length;j++){
					var c=json[j];
					if(i!=j && c[parentKey]==obj[key]){
						obj.children.push(c);
					}
				}
				format.push(obj);
			}
		}
		return format;
	}
	$.extend($.fn,{
		treeMenu:function(options,params){
			if (typeof options == 'string'){
			
				return $.fn.treeMenu.methods[options](this,params);
			}
			var options=$.extend({},$.fn.treeMenu.defaults,options);
			return this.each(function(){
				var state = $.data(this, 'treeMenu');
				var opts;
				if (state) {
					opts = $.extend($.fn.treeMenu.defaults,state.options, options);
					$.data(this, 'treeMenu',{options:opts});
				} else {
					opts=$.extend({},$.fn.treeMenu.defaults,options);
					$.data(this, 'treeMenu',{options:opts});
				}
				init(this,opts);
				bindTreeMenuEvents(this);
				if(opts.url && opts.method && opts.params){
					loadRemoteData(this);
				}
				
			});
		}
	});
	$.fn.treeMenu.defaults={
		url:"",
		method:"",
		expandNode:"",
		params:{},
		addable:true,
		eidtable:false,
		removeable:true,
		linkUrl:false,
		showError:false,
		onPreSave:function(target,params){},
		onSaveOk:function(target,params){},
		onPreRemove:function(target,params){},
		onRemoveOk:function(target,params){},
		onModifyOk:function(target,params){},
		onLoadOk:function(target,params){},
		onExpandMenu:function(target,params){},
		onCollapseMenu:function(target,params){},
		onLeafSelected:function(target,params){},
		onToggleMenu:function(target,params){}
	};
	$.fn.treeMenu.collapseAllNode=function(target,nodeEl){};
	$.fn.treeMenu.expandAllNode=function(target,nodeEl){};
	$.fn.treeMenu.getRoot=function (){
		var roots = getRootNodes(target);
		for(var i=0; i<roots.length; i++){
			nodes.push(roots[i]);
			getNodes($(roots[i].target));
		}
	};
	$.fn.treeMenu.methods={
		reload:function(jq,params){
			return reload(jq[0],params);
		},
		addMenu:function(jq,params){
			return showEditWin(jq[0],params);
		},
		save:function(jq,params){
			return save(jq[0],params);
		},
		collapseAll: function(jq, nodeEl){
			return jq.each(function(){
				collapseAllNode(this, nodeEl);
			});
		},
		expandAll: function(jq, nodeEl){
			return jq.each(function(){
				expandAllNode(this, nodeEl);
			});
		},
		getRootLength:function(jq,params){
			return getRootLength(jq[0],params);
		}
	};
	
})(jQuery);