
$(function(){
	/*状态开关添加事件*/
	function state(){
		var swt = $('.switch');
		for(var i=0;i<swt.length;i++){
			swt[i].onclick = function(){
				if(this.getAttribute('key') != 'true'){
					$(this).find('.move').css("left","37px");
					$(this).find('.close').css({left:"7px"});
					$(this).find('.close').html('开启');
					$(this).css('background-color','#68B828');
					this.setAttribute('key','true');
				}else{
					$(this).find('.move').css("left","3px");
					$(this).find('.close').css({left:"27px"});
					$(this).find('.close').html('关闭');
					$(this).css('background-color','#ccc');
					this.setAttribute('key','false');
				}
				var obj = {
					id:$(this).parents('table').attr('keyid'),
					status:$(this).attr('key')
				}
				$.post("http://120.78.164.247:8099/manager/user/changeStatus",obj);
			}
		}
	}
	$("#myModal").on("hide.bs.modal",function(){
		/*清空模态框表单数据*/
		$("#myModal input").val("");
	});
	function getData(){
		/*展示数据前的清理页面数据*/
		if($('.liParent').find('li').length > 0){
			$('.liParent').find('li:not(:first)').remove();
		}
		/*获取数据，并展示到页面*/
		$.get("http://120.78.164.247:8099/manager/user/findAllUser",function(data){
			var request = data.data;
			request.forEach(function(item){
				if(item.username){
					var liClone = $('.clone:first').clone(true);
					if(item.userface){
						liClone.find("img").attr("src",item.userface);
					}
					liClone.find('table').attr("keyid",item.id);
					liClone.find('tr:first td:nth-child(2)').html(item.username);
					liClone.find('tr:nth-child(2) td:nth-child(2)').html(item.nickname);
					liClone.find('tr:nth-child(3) td:nth-child(2)').html(item.email);
					var swt1 = liClone.find('.switch');
					swt1.attr("key",item.enabled);
					if(swt1.attr("key") == 'true'){
						$(swt1).find('.move').css("left","37px");
						$(swt1).find('.close').css({left:"7px"});
						$(swt1).find('.close').html('开启');
						$(swt1).css('background-color','#68B828');
					}else{
						$(swt1).find('.move').css("left","3px");
						$(swt1).find('.close').css({left:"27px"});
						$(swt1).find('.close').html('关闭');
						$(swt1).css('background-color','#ccc');
					}
					liClone.appendTo($('.liParent'));
				}
			});
			state();
		});
	}
	getData();
	/*给数据库新增数据*/
	//1.表单验证
	var form = $("div.addUser");
	var arr = [];
	var obj = {};
	//1.1 验证用户名
	form.find('input:first').blur(function(){
		var regExp = /^\S{2,}$/;
		if(regExp.test(form.find('input:first').val())){
			$(this).css('border','1px solid #aaa');
			arr[0] = $(this).val();
		}else{
			$(this).css('border','1px solid red');
			arr[0] = null;
		}
	});
	//1.2 验证密码
	form.find(':password:first').blur(function(){
		var regExp = /^\w{6,14}$/;
		if(regExp.test($(this).val())){
			$(this).css('border','1px solid #aaa');
			arr[1] = $(this).val();
		}else{
			$(this).css('border','1px solid red');
			arr[1] = null;
		}
	});
	//1.3 再次验证密码输入是否与上次一致
	form.find(':password:last').blur(function(){
		if($(this).val()!=form.find(':password:first').val()){
			$(this).css('border','1px solid #aaa');
			arr[2] = null;
		}else{
			var regExp = /^\w{6,14}$/;
			if(regExp.test($(this).val())){
				$(this).css('border','1px solid #aaa');
				arr[2] = $(this).val();
			}else{
				$(this).css('border','1px solid red');
				arr[2] = null;
			}
		}
	});
	//1.4 验证用户真实姓名
	form.find(':text:eq(1)').blur(function(){
		var regExp = /^\S{2,}$/;
		if(regExp.test($(this).val())){
			$(this).css('border','1px solid #aaa');
			arr[3] = $(this).val();
		}else{
			$(this).css('border','1px solid red');
			arr[3] = null;
		}
	});
	//1.5 验证邮箱格式
	form.find('input:eq(4)').blur(function(){
		var regExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		if(regExp.test($(this).val())){
			$(this).css('border','1px solid #aaa');
			arr[4] = $(this).val();
		}else{
			$(this).css('border','1px solid red');
			arr[4] = null;
		}
	});
	//2.选择要上传的文件
	$(".filePic").on("change",function(){
		var forma = new FormData();
		var file = this.files[0];
		forma.append("file",file);
		$.ajax({
		    url: 'http://120.78.164.247:8099/manager/file/upload',
		    type: 'POST',
		    cache: false,
		    data: forma,
		    processData: false,
		    contentType: false,
		    success: function(request){
		    	var url = "http://39.108.81.60:8888/" + request.data.groupname +"/"+ request.data.id;
		    	//3.将用户数据打包成对象
				$('.submit').click(function(){
					var result = arr.every(function(item){
							return item != null;
						});
					if(arr.length == 5 && result){
						obj = {
							username:arr[0],
							nickname:arr[3],
							password:arr[2],
							email:arr[4],
							userface:url
						}
						//4.发送数据给后台
				    	$.post("http://120.78.164.247:8099/manager/user/saveOrUpdateUser",obj,function(result){
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
		    }
		});
	});
	/*删除用户*/
	$('.liParent').on('click','.deleteUser',function(){
		var ids = $(this).parents("li").find("table").attr("keyid");
		var li = $(this).parents("li");
		var obj = {
			id:ids
		}
		$.get("http://120.78.164.247:8099/manager/user/deleteUserById",obj,function(result){
			if(result.status == 200){
				$('.alert').css("display","block");
				li.remove();
				setTimeout(function(){
					$('.alert').css("display","none");
				},300);
			}else{
				alert(result.status+"，删除失败")
			}
		});
	});
	/*更改头像图片*/
	$(".png img").on("click",function(){
		var $img = $(this);
		$(this).parent().find("div input").trigger("click");
		$(this).parent().find("div input").on('change',function(){
			var forma = new FormData();
			var file = this.files[0];
			var obj = {
				id:$(this).parents("li").find("table").attr("keyid"),
				username:$(this).parents("li").find('tr:first td:nth-child(2)').html(),
				nickname:$(this).parents("li").find('tr:nth-child(2) td:nth-child(2)').html(),
				email:$(this).parents("li").find('tr:nth-child(3) td:nth-child(2)').html(),
				userface:null
			}
			forma.append("file",file);
			$.ajax({
			    url: 'http://120.78.164.247:8099/manager/file/upload',
			    type: 'POST',
			    cache: false,
			    data: forma,
			    processData: false,
			    contentType: false,
			    success: function(request){
			    	var url = "http://39.108.81.60:8888/" + request.data.groupname +"/"+ request.data.id;
			    	obj.userface = url;
			    	$.post("http://120.78.164.247:8099/manager/user/saveOrUpdateUser",obj);
			    	$img.attr("src",url);
			    }
			});
		});
	});
});

