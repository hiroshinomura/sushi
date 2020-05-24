/*
The MIT License (MIT)

Copyright (c) 2014-2016 Ichiro Maruta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

$(function(){
	var loadedcss = '';
	$('#time1').val('00:30');
	$('#time2').val('01:00');
	$('#time3').val('01:50');

	$('#info').html("Startと同時に脈拍測定");
	const ss = document.getElementById("slot");
	ss.style.display ="none";
	slotclicked=0;
	//$('#slot').style.display ="none";

	function getHashParams() {
    var hashParams = {};
    var e,
      a = /\+/g, // Regex for replacing addition symbol with a space
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function(s) {
        return decodeURIComponent(s.replace(a, " "));
      },
      q = window.location.hash.substring(1);

    while (e = r.exec(q))
      hashParams[d(e[1])] = d(e[2]);
    return hashParams;
  }

  function parseHashParams(){
    params = getHashParams();
    if(params.t1 !== undefined) $('#time1').val(params.t1);
		if(params.t2 !== undefined) $('#time2').val(params.t2);
		if(params.t3 !== undefined) $('#time3').val(params.t3);
		//if(params.t4 !== undefined) $('#time4').val(params.t4);
		if(params.m !== undefined) $('#info').html(params.m);
		if(loadedcss !== ''){
			location.reload();
		}
		if(params.th !== undefined && /^[a-zA-Z0-9\-]+$/.test(params.th)){
			loadedcss=params.th;
		}else{
			loadedcss='default';
		}
		$('head').append('<link rel="stylesheet" type="text/css" href="theme/'+loadedcss+'.css">');
  }

	function updateHash() {
    var hashstr = '#t1=' + $('#time1').val()
		+ '&t2=' + $('#time2').val()
		+ '&t3=' + $('#time3').val()
		+ '&m=' + encodeURIComponent($('#info').html());
		if(loadedcss !== 'default'){
			hashstr = hashstr + '&th=' + encodeURIComponent(loadedcss);
		}
		$('#seturl').attr("href",hashstr);
		try{
	    history.replaceState(undefined, undefined, hashstr);
		}catch(e){
		}
  };

	$(window).on('hashchange', function() {
    parseHashParams();
		updateHash();
  });

	parseHashParams();
	updateHash();

	$('#time1,#time2,#time3,#time4,#info').change(function(){
		updateHash();
	});

	var infoline = $('#info').html();
	$('#info').blur(function() {
	    if (infoline!=$(this).html()){
	        infoline = $(this).html();
					updateHash();
	    }
	});

	var audio_chime1,audio_chime2,audio_chime3;
	audio_chime1 = new Audio("./wav/inari.wav");
	audio_chime2 = new Audio("./wav/tekka.wav");
	audio_chime3 = new Audio("./wav/kappa.wav");
	audio_chime4 = new Audio("./wav/sushi1.wav");
	audio_chime5 = new Audio("./wav/sushi2.wav");
	audio_chime6 = new Audio("./wav/dessert.wav");
	audio_chime7 = new Audio("./wav/ocha.wav");
	audio_chime8 = new Audio("./wav/juice.wav");
	audio_chime9 = new Audio("./wav/check.wav");
	audio_chime10 = new Audio("./wav/arrive.wav");
	audio_chime11 = new Audio("./wav/receive.wav");
	audio_chime12 = new Audio("./wav/bye.wav");
	money = 0;
	function changeStateClass(s) {
		$('body').removeClass(function(index, className) {
			return (className.match(/\bstate-\S+/g) || []).join(' ');
		});
		$('body').addClass('state-'+s);
	};

	function changePhaseClass(s) {
		$('body').removeClass(function(index, className) {
			return (className.match(/\bphase-\S+/g) || []).join(' ');
		});
		$('body').addClass('phase-'+s);
	};

	$('.nav #standby').click(function (event){
		event.preventDefault();
		$('.nav li').removeClass('active');
		$('.nav li#standby').addClass('active');
		$('#state').html('STANDBY');
		changeStateClass('standby');
		changePhaseClass('0');
		time_inner=(new Date('2011/1/1 00:00:00'));
		show_time();
	});
	changeStateClass('standby');
	changePhaseClass('0');
	var start_time=new Date();
	var last_time;
	$('.nav #start').click(function (event){
		event.preventDefault();
		if($('.nav li#start').hasClass('active')){
			return;
		}
		$('.nav li').removeClass('active');
		$('.nav li#start').addClass('active');
		$('#state').html('');
		changeStateClass('start');
		start_time = new Date((new Date()).getTime() - (time_inner-(new Date('2011/1/1 00:00:00'))));
		last_time = null;
		audio_chime1.load();
		audio_chime2.load();
		audio_chime3.load();
		$('#info').html("脈拍測定スタート");

	});

	$('.nav #pause').click(function (event){
		event.preventDefault();
		if($('.nav li#standby').hasClass('active')){
			return;
		}

		$('.nav li').removeClass('active');
		$('.nav li#pause').addClass('active');
		update_time();
		$('#state').html('PAUSED');
		changeStateClass('paused');
	});

	function resize_display() {
		var height=$('body').height();
		var width=$('body').width();
		var theight=Math.min(height*3/5,width*1.95/5);
		$('#time').css('top',(height-theight)/2*1.1);
		$('#time').css('font-size',theight+'px');
		$('#time').css('line-height',theight+'px');
		var sheight=theight/6;
		$('#state').css('top',height/2-theight/2-sheight/2);
		$('#state').css('font-size',sheight+'px');
		$('#state').css('line-height',sheight+'px');
		var iheight=sheight;
		$('#info').css('top',height/2+theight/2);
		$('#info').css('font-size',iheight+'px');
		$('#info').css('line-height',iheight+'px');
	}
	$(window).bind("resize", resize_display);

	$('#soundcheck').click(function (event){
		event.preventDefault();
		audio_chime1.load();
		audio_chime1.currentTime = 0;
		audio_chime1.play();
	});
	$('#inari').click(function (event){
		event.preventDefault();
		audio_chime1.load();
		audio_chime1.currentTime = 0;
		audio_chime1.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#tekka').click(function (event){
		event.preventDefault();
		audio_chime2.load();
		audio_chime2.currentTime = 0;
		audio_chime2.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#kappa').click(function (event){
		event.preventDefault();
		audio_chime3.load();
		audio_chime3.currentTime = 0;
		audio_chime3.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#sushi1').click(function (event){
		event.preventDefault();
		audio_chime4.load();
		audio_chime4.currentTime = 0;
		audio_chime4.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#sushi2').click(function (event){
		event.preventDefault();
		audio_chime5.load();
		audio_chime5.currentTime = 0;
		audio_chime5.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#dessert').click(function (event){
		event.preventDefault();
		audio_chime6.load();
		audio_chime6.currentTime = 0;
		audio_chime6.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#ocha').click(function (event){
		event.preventDefault();
		audio_chime7.load();
		audio_chime7.currentTime = 0;
		audio_chime7.play();
	});
	$('#juice').click(function (event){
		event.preventDefault();
		audio_chime8.load();
		audio_chime8.currentTime = 0;
		audio_chime8.play();
		money=money+100;
		$('#money').html(money+"円");
	});
	$('#check').click(function (event){
		event.preventDefault();
		audio_chime9.load();
		audio_chime9.currentTime = 0;
		audio_chime9.play();
		var message_str = money+"円のお金を入れた";
		$('#pay').html(message_str);
	});
	$('#arrive').click(function (event){
		event.preventDefault();
		audio_chime10.load();
		audio_chime10.currentTime = 0;
		audio_chime10.play();
		$('#time2').html("うけとった");
	});
	$('#time2').click(function (event){
		event.preventDefault();
		audio_chime11.load();
		audio_chime11.currentTime = 0;
		audio_chime11.play();
		$('#time2').html("");
		if(money%300==0){
			const ss = document.getElementById("slot");
			ss.style.display ="block";
			current_time = new Date().getTime();
			//current_time= new Date();
			
		}
	});
	$('#pay').click(function (event){
		event.preventDefault();
		audio_chime12.load();
		audio_chime12.currentTime = 0;
		audio_chime12.play();
		$('#pay').html("");
		money=0;
		$('#money').html(money+"円");
	});
	$('#slot').click(function (event){
		event.preventDefault();
		const ss = document.getElementById("slot");
		//ss.style.display ="none";
		slotclicked=slotclicked+1;
		if (slotclicked>1){
			ss.style.display ="none";
			slotclicked=0;
		}
		
	});

	function show_time(){
		var time_str= ('00' +  time_inner.getMinutes()   ).slice(-2) + ':'
					+ ('00' +  time_inner.getSeconds() ).slice(-2);
		$('#time').html(time_str);
	}

	var time_inner = new Date('2011/1/1 00:00:00');
	function update_time(){
		var cur_time= new Date();
		var e=new Date((new Date('2011/1/1 00:00:00')).getTime()+(cur_time-start_time));
		time_inner=e;
		show_time();
	}
  $('[data-toggle="tooltip"]').tooltip();
	$.timer(100,function(timer){
			resize_display();
			if($('.nav li#start').hasClass('active')){
				update_time();

				var cur_time= new Date();
				if(last_time != null){
					$('#time4').val('00:10');
					var time1 = new Date(start_time.getTime()+((new Date('2011/1/1 00:'+$('#time1').val()))-(new Date('2011/1/1 00:00:00'))));
					var time2 = new Date(start_time.getTime()+((new Date('2011/1/1 00:'+$('#time2').val()))-(new Date('2011/1/1 00:00:00'))));
					var time3 = new Date(start_time.getTime()+((new Date('2011/1/1 00:'+$('#time3').val()))-(new Date('2011/1/1 00:00:00'))));
					var time4 = new Date(start_time.getTime()+((new Date('2011/1/1 00:02:50'))-(new Date('2011/1/1 00:00:00'))));
					var time5 = new Date(start_time.getTime()+((new Date('2011/1/1 00:03:40'))-(new Date('2011/1/1 00:00:00'))));
					var time6 = new Date(start_time.getTime()+((new Date('2011/1/1 00:04:40'))-(new Date('2011/1/1 00:00:00'))));
					var time7 = new Date(start_time.getTime()+((new Date('2011/1/1 00:05:30'))-(new Date('2011/1/1 00:00:00'))));
					var time8 = new Date(start_time.getTime()+((new Date('2011/1/1 00:10:00'))-(new Date('2011/1/1 00:00:00'))));

					if((last_time < time1 && time1 <= cur_time) || (last_time==time1 && cur_time==time1)){
						changePhaseClass('2');
						audio_chime2.currentTime = 0;
						audio_chime2.play();
						$('#state').html('1:00から暗算1回目スタート');
						$('#info').html('測定終了！');
						
					}

					if((last_time < time2 && time2 <= cur_time) || (last_time==time2 && cur_time==time2)){
						changePhaseClass('1');
						audio_chime1.currentTime = 0;
						audio_chime1.play();
						$('#state').html('');
						$('#info').html('暗算スタート！');
					}

					if((last_time < time3 && time3 <= cur_time) || (last_time==time3 && cur_time==time3)){
						changePhaseClass('2');
						audio_chime2.currentTime = 0;
						audio_chime2.play();
						$('#state').html('');
						//start_time = new Date();
						$('#state').html('2:50から暗算2回目スタート');
						$('#info').html('暗算終了！');
					}
					if((last_time < time4 && time4 <= cur_time) || (last_time==time4 && cur_time==time4)){
						changePhaseClass('1');
						audio_chime1.currentTime = 0;
						audio_chime1.play();
						$('#state').html('');
						//start_time = new Date();
						$('#state').html('');
						$('#info').html('暗算スタート！');
					}
					if((last_time < time5 && time5 <= cur_time) || (last_time==time5 && cur_time==time5)){
						changePhaseClass('2');
						audio_chime2.currentTime = 0;
						audio_chime2.play();
						$('#state').html('');
						//start_time = new Date();
						$('#state').html('4:40から暗算3回目スタート');
						$('#info').html('暗算終了！');
					}
					if((last_time < time6 && time6 <= cur_time) || (last_time==time6 && cur_time==time6)){
						changePhaseClass('1');
						audio_chime1.currentTime = 0;
						audio_chime1.play();
						$('#state').html('');
						//start_time = new Date();
						$('#state').html('');
						$('#info').html('暗算スタート！');
					}
					if((last_time < time7 && time7 <= cur_time) || (last_time==time7 && cur_time==time7)){
						changePhaseClass('2');
						audio_chime2.currentTime = 0;
						audio_chime2.play();
						$('#state').html('');
						//start_time = new Date();
						$('#state').html('10:00から脈拍測定');
						$('#info').html('暗算終了！');
					}
					if((last_time < time8 && time8 <= cur_time) || (last_time==time8 && cur_time==time8)){
						changePhaseClass('1');
						audio_chime1.currentTime = 0;
						audio_chime1.play();
						$('#state').html('');
						start_time = new Date();
						$('#state').html('');
						$('#info').html('脈拍測定スタート！');
					}

				}
				last_time=cur_time;
			}
	})
});
