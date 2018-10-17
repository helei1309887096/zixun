
$(function(){
	//清理页面数据
	if($('.tbody').find('tr').length >= 0){
		$('.tbody').find('tr').remove();
	}
	//初始化数据
	var obj ={};
	var num = 9;
	var	size = 1;
	obj = {
		page:num,
		pageSize:size
	}
	$(".page").html(num);
	//手动输入页码获取数据
	$(".getPage button").click(function(){
		num = $(".getPage input:first").val();
		size = $(".getPage input:last").val();
		obj.page = num;
		obj.pageSize = size;
		$(".page").html(num);
		getData();
	});
	//翻页功能
	function nextPrv(){
		$.get("http://120.78.164.247:8099/manager/article/findArticle",obj,function(data){
			var number,
				count;
			function pev(){
				number = Math.floor(count/size);
				if(num > 1 && num <= number){
					num--;
					$(".page").html(num);
					$(".getPage input:first").val(num);
					$(".getPage input:last").val(size);
					obj.page = num;
					getData();
				}
			}
			function next(){
				number = Math.floor(count/size);
				if(num >= 1 && num < number){
					num++;
					$(".page").html(num);
					$(".getPage input:first").val(num);
					$(".getPage input:last").val(size);
					obj.page = num;
					getData();
				}
			}	
			if(data.data){
				count = data.data.total;
				$(".pev").on("click",pev);
				$(".next").on("click",next);
			}
		});
	}
	nextPrv();
	//从数据库获取数据，并展示到页面
	function getData(){
		$.get("http://120.78.164.247:8099/manager/article/findArticle",obj,function(data){
			if($(".tbody tr").length >= 0){
					$(".tbody tr").remove();
				}
			if(data.data){
				var request = data.data.list;
				request.forEach(function(item){
					var trClone = $('.clone:first').clone(true);
					trClone.find('td:first').html("<input type='checkbox' value='"+item.id+"'>");
					trClone.find('td:nth-child(2)').html(item.title);
					if(item.category){
						trClone.find('td:nth-child(3)').html(item.category.name);
					}else{
						trClone.find('td:nth-child(3)').html('无');
					}
					if(item.music){
						trClone.find('td:nth-child(4)').html(item.music);
					}else{
						trClone.find('td:nth-child(4)').html('无');
					}
					if(item.author){
						trClone.find('td:nth-child(5)').html(item.author);
					}else{
						trClone.find('td:nth-child(5)').html('无');
					}
					if(item.publishtime){
						trClone.find('td:nth-child(6)').html(item.publishtime);
					}else{
						trClone.find('td:nth-child(6)').html('无');
					}
					trClone.find('td:nth-child(7)').html(item.readtimes);
					trClone.find('td:last').html("<span class='xiugai' data-toggle='modal' data-target='#xiugai'>修改</span><span class='shanchu'>删除</span>");
					
					$('.tbody').append(trClone);
				});
			}
		});
	}
	getData();
	//模态框隐藏触发
	$("#myModal").on("hide.bs.modal",function(){
		/*清空新增数据的模态框表单数据*/
		$("#myModal :input").val("");
	});
	//新增文章栏目
	$(".addNewData").click(function(){
		//1.0 清空表单中的内容
		if($(".addData select option").length >= 1){
			$(".addData select option:not(:first)").remove();
		}
		//1.1 将栏目管理的信息放入到select下拉列表中
		$.get("http://120.78.164.247:8099/manager/category/findAllCategory",function(data){
			var request = data.data;
			request.forEach(function(item){
				$(".addData select").append("<option value='"+item.id+"'>"+item.name+"</option>")
			});
		});
		//2.表单验证,传入数据
		var add = $(".addData");
		$('.submit').click(function(){
			if(add.find(":text:first").val()&&add.find("select").html()){
				//将表单中的值写到对象中
				var obj = {
					title:add.find(":text:first").val(),
					liststyle:add.find("input:checked").val(),
					categoryId:add.find("select").val(),
					music:add.find(":text:eq(1)").val(),
					content:add.find("textarea").val()
				}
				$.post("http://120.78.164.247:8099/manager/article/saveOrUpdateArticle",obj,function(result){
					if(result.status == 200){
						$('.alert').css("display","block");
						getData();
						setTimeout(function(){
							$('.alert').css("display","none");
						},500);
					}else{
						alert(result.status+"，添加失败")
					}
				});
			}
		});
		
	});
	//单个删除栏目信息
	$('.tbody').on("click",'span.shanchu',function(){
		var checkedId = $(this).parents("tr").find('td:first input');
		if(checkedId.length == 1){
			$.get("http://120.78.164.247:8099/manager/article/deleteArticleById","id="+checkedId.val(),function(result){
				if(result.status == 200){
					$('.alert').css("display","block");
					getData();
					setTimeout(function(){
						$('.alert').css("display","none");
					},500);
				}else{
					alert(result.status+"，删除失败")
				}
			});
		}
	});
	//批量删除信息
	$('.deleteAll').click(function(){
		var allCheckId = $('.tbody').find(':checked');
		var request = [];
		Array.prototype.slice.call(allCheckId,0).forEach(function(item,index){
			request.push(item.value);
		});	
		var obj = {
			ids:request.toString()
		}
		$.post("http://120.78.164.247:8099/manager/article/batchDeleteArticle",obj,function(result){
				if(result.status == 200){
					$('.alert').css("display","block");
					getData();
					setTimeout(function(){
						$('.alert').css("display","none");
					},500);
				}else{
					alert(result.status+"，删除失败")
				}
			});
	});
	//修改栏目信息
	function replaceColumn(){
		//1 获取表格中数据,添加到表单中
		var replace = $(".replaceData");
		replace.find(":text:first").val($(this).parents('tr').find("td:nth-child(2)").html());
		replace.find(":text:eq(1)").val($(this).parents('tr').find("td:nth-child(4)").html());
		replace.find("input:last").val($(this).parents('tr').find("td:nth-child(7)").html());
		//2 获取当条资讯的id值
		var inforId = $(this).parents("tr").find("td:first input").val();
		//3.获取修改后的弹出框数据
		$(".submit1").click(function(){
			//将表单中的值写到对象中
			var obj = {
				id:inforId,
				title:$(".replaceData :text:first").val(),
				music:$(".replaceData :text:eq(1)").val(),
				readtimes:$(".replaceData input:last").val(),
				liststyle:$(".replaceData input:checked").val()
			}
			$.post("http://120.78.164.247:8099/manager/article/saveOrUpdateArticle",obj,function(result){
				if(result.status == 200){
					$('.alert').css("display","block");
					$("#xiugai").hide();
					setTimeout(function(){
						location.reload();
					},500);
				}else{
					alert(result.status+"，修改失败")
				}
			});
		});
	}
	$('.tbody').on("click",'span.xiugai',replaceColumn);
	
})