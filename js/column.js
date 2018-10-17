
$(function(){
	var url = "http://120.78.164.247:8099/manager/category/findAllCategory";
	/*重载页面数据*/
	function getData(url,obj){
		//清理页面数据
		if($('.tbody').find('tr').length >= 0){
			$('.tbody').find('tr').remove();
		}
		//获取数据，并展示到页面
		$.get(url,obj,function(data){
			var request = data.data;
			request.forEach(function(item){
				if(item.name){
					var trClone = $('.clone:first').clone(true);
					trClone.find('td:first').html("<input type='checkbox' value='"+item.id+"'>");
					trClone.find('td:nth-child(2)').html(item.name);
					if(item.parent){
						for(var i in item.parent){
							trClone.find('td:nth-child(3)').html(item.parent.name);
						}
					}else{
						trClone.find('td:nth-child(3)').html('无');
					}
					trClone.find('td:nth-child(4)').html(item.comment);
					trClone.find('td:nth-child(5)').html("<span class='xiugai' data-toggle='modal' data-target='#xiugai'>修改</span><span class='shanchu'>删除</span>");
					
				}
				$('.tbody').append(trClone);
			});
			$("select").append("<option></option>")
		});
	}
	getData(url);

	//模态框隐藏触发
	$("#myModal").on("hide.bs.modal",function(){
		/*清空模态框表单数据*/
		$("#myModal :input").val("");
	});

	/*发送/添加数据*/
	//1.表单验证
	function sureForm(selection){
		//1.0 清空select数据数据
		if($("div.addData").find('select option').length > 1){
			$("div.addData").find('select option:not(:first)').remove();
		}
		//1.1 将栏目管理的信息放入到select下拉列表中
		$.get("http://120.78.164.247:8099/manager/category/findAllCategory",function(data){
			var request = data.data;
			request.forEach(function(item){
				$(".addData select").append("<option value='"+item.id+"'>"+item.name+"</option>")
			});
		});
		var form = $(selection);
		var arr = [];
		form.find(':text:first').blur(function(){
			var regExp = /^\S{2,}$/;
			if(regExp.test($(this).val())){
				$(this).css('border','1px solid #aaa');
				arr[0] = $(this).val();
			}else{
				$(this).css('border','1px solid red');
				arr[0] = null;
			}
		});
		form.find('select').change(function(){
			arr[1] = form.find("select option:selected").val();
		});
		form.find(':text:last').blur(function(){
			var regExp = /^\S+$/;
			if(regExp.test($(this).val())){
				$(this).css('border','1px solid #aaa');
				arr[2] = $(this).val();
			}else{
				$(this).css('border','1px solid red');
				arr[2] = null;
			}
		});
		return arr;
	}
	var arr = sureForm("div.addData");
	//2.将用户数据打包成对象
	$('.submit').click(function(){
		if(arr[0]&&arr[2]){
			var obj = {
				name:arr[0],
				parentId:arr[1],
				comment:arr[2]
			}
		}
		//3.发送数据给后台
		$.post("http://120.78.164.247:8099/manager/category/saveOrUpdateCategory",obj,function(result){
			if(result.status == 200){
				$('.alert').css("display","block");
				getData(url);
				setTimeout(function(){
					$('.alert').css("display","none");
				},500);
			}else{
				alert(result.status+"，删除失败")
			}
		});
	});

	/*单行删除操作*/
	$('.tbody').on("click",'span.shanchu',function(){
		var checkedId = $(this).parents("tr").find('td:first input');
		var $tr = $(this).parents("tr");
		$.get("http://120.78.164.247:8099/manager/category/deleteCategoryById","id="+checkedId.val(),function(result){
			if(result.status == 200){
				$('.alert').css("display","block");
				$tr.remove();
				setTimeout(function(){
					$('.alert').css("display","none");
				},500);
			}else{
				alert(result.status+"，删除失败")
			}
		});
	});
	/*修改操作*/
	$('.tbody').on("click",'span.xiugai',function(){
		//1.清空select中的数据
		if($("div.replaceData").find('select option').length > 1){
			$("div.replaceData").find('select option:not(:first)').remove();
		}
		//2. 将栏目管理的信息放入到select下拉列表中
		$.get("http://120.78.164.247:8099/manager/category/findAllCategory",function(data){
			var request = data.data;
			request.forEach(function(item){
				$("div.replaceData select").append("<option value='"+item.id+"'>"+item.name+"</option>");
			});
			$("div.replaceData select").append("<option></option>");
		});
		//3. 获取表中数据
		var replace = $(".replaceData");
		replace.find("input:first").val($(this).parents('tr').find("td:nth-child(2)").html());
		var parentLan = $(this).parents('tr').find("td:nth-child(3)").html();
		if(parentLan != "无"){
			replace.find("select option:first").val($(this).parents('tr').find("td:nth-child(1) input").val());
			replace.find("select option:first").html(parentLan);
		}
		replace.find("input:last").val($(this).parents('tr').find("td:nth-child(4)").html());
		//4. 获取修改后的弹出框数据
		var arr1 = sureForm("div.replaceData");
		if(!arr1[0]){
			arr1[0] = $(this).parents('tr').find("td:nth-child(2)").html();
		}
		if(!arr1[1]){
			arr1[1] = null;
		}
		if(!arr1[2]){
			arr1[2] = $(this).parents('tr').find("td:nth-child(4)").html();
		}
		arr1[3] = $(this).parents('tr').find("td:nth-child(1) input").val();
		$('.submit1').click(function(){
			var obj = {
				name:arr1[0],
				parentId:arr1[1],
				comment:arr1[2],
				id:arr1[3],
			}
			$.post("http://120.78.164.247:8099/manager/category/saveOrUpdateCategory",obj,function(result){
				if(result.status == 200){
					$('.alert').css("display","block");
					setTimeout(function(){
						location.reload();
					},800);
				}else{
					alert(result.status+"，删除失败")
				}
			});
		})
	});

	/*批量删除操作*/
	$('.deleteAll').click(function(){
		var allCheckId = $('.tbody').find(':checked');
		var request = '';
		Array.prototype.slice.call(allCheckId,0).forEach(function(item,index){
			request = request + "ids=" + item.value + "&";
		});
		$.post("http://120.78.164.247:8099/manager/category/batchDeleteCategory",request,function(result){
				if(result.status == 200){
					$('.alert').css("display","block");
					allCheckId.parents("tr").remove();
					setTimeout(function(){
						$('.alert').css("display","none");
					},500);
				}else{
					alert(result.status+"，删除失败");
				}
			});
	});

	/*查询操作：通过栏目名称查询*/
	function findSome(){
		var search = new RegExp($(".search").val(),"i");
		var tr = $(".tbody tr");
		tr.each(function(index,item){
			if(!search.test($(item).find("td:nth-child(2)").html())){
				this.remove();
			}
		});
	}
	//1. 绑定失去焦点事件
	$(".search").on('blur',findSome);
	//2. 绑定键盘事件(enter键)
	$(".search").on('keydown',function(event){
		if(event.keyCode == 13){
			findSome();
		}
	});
	//3.绑定点击事件
	$("#find").on("find",findSome);

	/*全查操作*/
	$(".findAllData").click(function(){
		$(".search").val("");
		getData(url);
	})
})