var canvas; 
            var context; 
            var canvasHeigth;
            var canvasWidth;
            var orbitalCalc = new OrbitalCalculator();
            var mouse = {rx:200,ry:200, size: 20};
            var ball = {rx:100,ry:100, vx:0, vy:0, size: 20};
            var time = 0;
            var timeInit = 0;
            var eAngle = 2 * Math.PI;
            var mouseMoved = false;
            var reqAnimFrame = 
                window.requestAnimationFrame       || 
                window.mozRequestAnimationFrame    ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame     ||
                window.oRequestAnimationFrame;
            function getVal(id){
                return parseFloat($("#"+id).val());
            }/*
            function onStart(){
                context.clearRect(0,0,canvasWidth,canvasHeight);
                context.fillRect(249, 249, 3,3);
                var v = new Float32Array([getVal("vx"), getVal("vy"), 0]);
                var r = new Float32Array([getVal("rx"), getVal("ry"), 0]);
                context.fillStyle = "#F00";
                context.fillRect(r[0]+250, 250-r[1],3,3);
                context.fillStyle = "#000";
                //try vx=1; vy=1; rx=0; ry=70; grav = 100;
                //gets weird at -1,-1,0,70,70
                var grav = getVal("grav");
                orbitalCalc.setInitialConds(r[0], r[1], v[0], v[1], grav);
                var pos;
                for(var t=0; t<300; t++){
                    pos = orbitalCalc.atTime(t);
                    
                    pos.rx = pos.rx+250;
                    pos.ry = 250-pos.ry;
                    console.log(pos);
                    context.fillRect(pos.rx, pos.ry, 1,1);
                }
            }*/
            var canvasOffset;
            var resetTime = false;
            function recalibrate(timestamp){
                timeInit = timestamp;
                orbitalCalc.setInitialConds(ball.rx - mouse.rx, ball.ry - mouse.ry, ball.vx, ball.vy, getVal("grav")) //feed this canvas ball vector minus canvas mouse vector; 
            }
            function refreshMouse(timestamp){
                //if(!sunBounce(false)){
                    mouse.rx = mouseMoved.x;
                    mouse.ry = mouseMoved.y;
                    mouseMoved = false;
                    recalibrate(timestamp);
                //}
            }
            function mouseMove(e){
                if(mouseMoving){

                    mouseMoved = {x:e.pageX - canvasOffset.left, y: canvasHeight - (e.pageY - canvasOffset.top)};
                //drawPath();
                //context.fillRect(mouse.rx, mouse.ry, 1,1);
                }
            }
            /*
            function mouseMove(e, mouseMoved, sun, ball, radius){
                if(mouseMoving){
                    mouseMoved[0] = 1;
                    mouseMoved[1] = e.pageX - canvasOffset.left;
                    mouseMoved[2] = canvasHeight - (e.pageY - canvasOffset.top);
                    getRadius(sun, ball, radius);
                    startOrbit(radius);
                }
                //console.log("ball:",ball[1],ball[2], "sun:",sun[1],sun[2], "radius:",radius);
            }*/
            var mouseMoving = false;
            function mouseUp(){
                mouseMoving = false;
            }
            function mouseDown(e){
                var x = e.pageX - canvasOffset.left;
                var y = canvasHeight - (e.pageY - canvasOffset.top);
                if( Math.sqrt( sq(x-mouse.rx)) + sq(y-mouse.ry) < mouse.size){
                    mouseMoving = true;
                }
            }
            
            
            var pos = {};
            function get_mag(ball, rOrV){
                return Math.sqrt( Math.pow(ball[rOrV+"x"],2) + Math.pow(ball[rOrV+"y"],2) )
            }
            function get_theta(ball, rOrV){
                return Math.atan2(ball[rOrV+"x"], ball[rOrV+"y"]);
            }
            function get_rtheta(ball){
                return get_theta(ball, "r");
            }
            function get_vtheta(ball){
                return get_theta(ball, "v");
            }
            function sunBounce(bounce){
                ball.rmag = Math.sqrt(Math.pow(ball.rx-mouse.rx,2) + Math.pow(ball.ry-mouse.ry,2));
                if(ball.rmag < ball.size + mouse.size){
                    bounce = true;
                    ball.vmag = get_mag(ball, "v");
                    ball.rtheta = get_rtheta(ball);
                    ball.rdelta = ball.size + mouse.size - ball.rmag;
                    ball.rx+= ball.rdelta * Math.cos(ball.rtheta) * (ball.rx-mouse.rx)/Math.abs(ball.rx-mouse.rx);
                    ball.ry+= ball.rdelta * Math.sin(ball.rtheta) * (ball.ry-mouse.ry)/Math.abs(ball.ry-mouse.ry);;
                    mouse.rtheta = get_rtheta(ball);
                    ball.vtheta = get_vtheta(ball);
                    ball.vtheta = 3*ball.vtheta + Math.PI - ball.rtheta;
                    ball.vx = ball.vmag * Math.cos(ball.vtheta);
                    ball.vy = ball.vmag * Math.sin(ball.vtheta);
                    
                }
                return bounce;
            }
            function bounce(){
                var bounce = false;
                if(ball.rx<=ball.size){
                    ball.rx = ball.size;
                    ball.vx = -ball.vx;
                    bounce=true;
                }
                if(ball.rx>=canvasWidth-ball.size){
                    ball.rx = canvasWidth - ball.size;
                    ball.vx = -ball.vx;
                    bounce=true;
                }
                if(canvasHeight - ball.ry <= ball.size){
                    ball.ry = canvasHeight-ball.size;
                    ball.vy = -ball.vy;
                    bounce=true;
                }
                if(canvasHeight - ball.ry >= canvasHeight - ball.size){
                    ball.ry = ball.size;
                    ball.vy = -ball.vy;
                    bounce=true;
                }
                return bounce;
            }
            function drawPos(time, size){
                pos = orbitalCalc.atTime(time);  //this spits out canvas ball vector minus canvas mouse vector;
                if(!pos){
                    pos.rx = 100;
                    pos.ry = 100;
                }
                context.beginPath();
                context.arc(pos.rx + mouse.rx, canvasHeight - (pos.ry + mouse.ry), size, 0, eAngle);
                context.stroke();
                
            }
            function drawSun(){
                context.beginPath();
                context.arc(mouse.rx, canvasHeight - mouse.ry, mouse.size, 0, eAngle);
                context.stroke();
                
            }
            function drawBall(time, size){
                pos = orbitalCalc.atTime(time);  //this spits out canvas ball vector minus canvas mouse vector;
                if(pos){
                    ball.rx = pos.rx + mouse.rx;
                    ball.ry = pos.ry + mouse.ry;
                    ball.vx = pos.vx;
                    ball.vy = pos.vy;
                }else{
                    ball.rx = 100;
                    ball.ry = 100;
                    ball.vx = 0;
                    ball.vy = 0;
                    recalibrate(time+timeInit);
                }
                var bounced = bounce();
                if(bounced){
                    recalibrate(time + timeInit);
                }
                var sunBounced = false //sunBounce(false);
                if(sunBounced){
                    context.fillRect(0,0,canvasWidth, canvasHeight);
                    ball.rx = 100;
                    ball.ry = 100;
                    ball.vx = 0;
                    ball.vy = 0;
                    recalibrate(time+timeInit);
                }
                context.fillStyle = '#8ED6FF';
                context.beginPath();
                context.arc(ball.rx, canvasHeight - ball.ry, size, 0, eAngle);
                context.fill();
                drawSun();
                //$("#speed").text(Math.round(Math.sqrt(Math.pow(ball.vx,2)+Math.pow(ball.vy,2))*100) + " e: "+pos.e)
                try{
                    $("#speed").text("; e: "+ pos.e + "; speed: " +  Math.sqrt(sq(ball.vx) + sq(ball.vy)).toPrecision(5) + "; x: " + ball.rx.toPrecision(5) + "; y: "+ball.ry.toPrecision(5));
                }catch(err){

                }
                return sunBounced;
            }
            function drawPath(startTime){
                endTime = startTime + 100;
                for(var i = 0; i<10; i++){
                    drawPos(startTime + i*250, 1);
                }
            }
            var pos = {};
            function drawFrame(timestamp){
                var sunBounced;
                if(mouse.rx){
                    context.clearRect(0,0,canvasWidth,canvasHeight);
                    time = (timestamp - timeInit);
                    sunBounced = drawBall(time, ball.size);
                    if(OrbitalCalculator.drawPath) drawPath(time);
                }
                if(mouseMoved){
                    refreshMouse(timestamp)
                }
                reqAnimFrame(drawFrame);
            }
            function resize(){
                canvasWidth = $(window).width();
                canvasHeight = $(window).height();
                canvas.prop({
                    width: canvasWidth,
                    height: canvasHeight
                });
            }
            $(window).resize(resize);
            function setShowPath(){
                OrbitalCalculator.drawPath = $("#showPath").prop("checked");
            }
            $(function(){
                $("#showPath").change(setShowPath);
                setShowPath();
                canvas = document.getElementById("myCanvas");
                context = canvas.getContext("2d");
                canvas = $(canvas);
                canvasOffset = $(canvas).offset();
                resize();
                $(window).resize(resize);
                $(canvas).on("mousemove", mouseMove).on("mouseup touchend", mouseUp).mouseleave(mouseUp).on("mousedown touchend", function(e){
                    mouseDown(e);
                });
                reqAnimFrame(drawFrame);
                
            })