function distance(x1, y1, x2, y2){
    return (Math.sqrt(sq(x2-x1)+sq(y2-y1)));
}
function OrbitRender() {
    var sun = {
        r: new Vect(200, 200),
        v: new Vect(0,0),
        size: 15,
        moving: false,
        color: "#DDA"
    };
    var planet = {
        r: new Vect(100, 100),
        v: new Vect(0, 0),
        size: 15,
        color: "blue"
    };
    var grav = 5;
    var showOrbit = false;
    var pause = false;
    var pauseStartTime = 0;
    var reqAnimFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;
    var orbitalCalculator = new OrbitalCalculator();
    orbitalCalculator.recalibrate = function(timeInit, rx, ry, vx, vy) {
        orbitalCalculator.timeInit = timeInit || orbitalCalculator.timestamp;
        //sunRelVector = planet.r.vectorSubtract(sun.r, sunRelVector);
        //orbitalCalculator.setInitialConds(planet.r, planet.v, grav); //feed this canvas ball vector minus canvas mouse vector; 
        orbitalCalculator.orbit = orbitalCalculator.setInitialConds(
                rx || planet.r.x() - sun.r.x(),
                ry || planet.r.y() - sun.r.y(),
                vx || planet.v.x(),
                vy || planet.v.y(),
                grav)
    };
    var CanvasController = function() {
        var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");
        canvas = $(canvas);
        var canvasOffset = $(canvas).offset();
        var canvasWidth;
        var canvasHeight;
        var onScroll = function(){
            canvasOffset = $(canvas).offset();
        }
        var resize = function() {
            canvasWidth = canvas.width();
            canvasHeight = canvas.height();
            canvas.prop({
                width: canvasWidth,
                height: canvasHeight
            });
        };
        var sizeParent = $(".canvasSizeParent")
        sizeParent.css({
                width: "1000px",
                height: "600px",
                right:"",
                bottom:""
            })
        $("#variableSize").on("change", function(){
            if($(this).is(":checked")){
                sizeParent.css({
                    width: "",
                    height: "",
                    right:"20px",
                    bottom:"20px"
                })
            }else{
                sizeParent.css({
                    width: "1000px",
                    height: "600px",
                    right:"",
                    bottom:""
                })
            }
            onScroll();
            resize();
        })
        $("#variableSize").trigger("change");
        onScroll();
        resize();
        
        $(window).resize(resize);
        $(".canvasScrollParent").scroll(onScroll);

        var clear = function() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        };
        var eAngle = 2 * Math.PI;
        var drawBody = function(body) {
            context.fillStyle = body.color;
            context.strokeStyle = body.color;
            context.beginPath();
            if(!body.moving){
                context.arc(body.r.x(), canvasHeight - body.r.y(), body.size +1, 0, eAngle);
                context.fill();
            }else{
                context.arc(body.r.x(), canvasHeight - body.r.y(), body.size, 0, eAngle);
                context.fill();
                context.strokeStyle = "#000";
                context.stroke();
//                context.strokeStyle = "#000";
//                context.beginPath();
//                context.arc(body.r.x(), canvasHeight - body.r.y(), body.size*.67, 0, eAngle);
//                context.stroke();
            }
            
            
        };
        var drawArc = function(cx, cy, radius, startAngle, endAngle, ccw, color){
            context.beginPath();
            context.strokeStyle = color
            context.arc(cx, canvasHeight - cy, radius, startAngle, endAngle, ccw);
            context.stroke();
        }
        function OrbitRender() {
            var h, e, a, grav, r, x, y, period, angle, nu, rotate, shift, _initialized;
            function set(orbit, _grav) {
                
                h = orbit.h;
                e = orbit.e;
                a = orbit.a;
                nu = orbit.nu;
                rotate = orbit.rotate
                shift = orbit.shift;
                grav = _grav;
                if(h!==0){
                    _initialized = true;
                }
                var rMinusN = rotate - nu;
                rMinusN = rMinusN * 180 / Math.PI;
                if (rMinusN < 0)
                    rMinusN += 360;
                rMinusN = rMinusN.toPrecision(3);
                $("#stats").html(
                        "<span class='stat'>"+ h.toPrecision(3) +"</span>h (orbital energy)" + 
                        "<br> <span class='stat'>" + e.toPrecision(3) + "</span>e (orbital eccentricity)" +
                        "<br> <span class='stat'>" + a.toPrecision(3) + "</span>a (major radius)" +
                        "<br> <span class='stat'>" + (orbit.period/1000).toPrecision(3) + "</span>T (period)"
                );
            }
            function initialized(){
                return _initialized;
            }
            function get_r(theta) {
                return sq(h) / (grav * (1 + e * Math.cos(theta)));
            }
            var drawOrbit = function() {
                if (!e)
                    return;

                context.strokeStyle = "black";
                var i0 = Math.round(nu * 180 / Math.PI);
                var iF = i0 + 179;
                //for(var i=i0; i<iF; i++){
                if(!pause){
                    for (var i = 0; i < 360; i++) {
                        angle = i * Math.PI / 180;
                        r = get_r(angle);
                        x = r * Math.cos(angle + shift) + sun.r.x();
                        y = canvasHeight - (r * Math.sin(angle + shift) + sun.r.y());
                        if (i == 0) {
                            context.beginPath();
                            context.moveTo(x, y);
                        } else {
                            context.lineTo(x, y);
                        }
                    }
                    context.stroke();
                } else {
                    var startAngle = Math.atan2(planet.r.y()-sun.r.y(), planet.r.x()-sun.r.x()) - shift;
                    var sincePause = Date.now()-pauseStartTime;
                    sincePause = sincePause / 3000;
                    
                    angle = Math.PI * 2 * sincePause;
                    
                    if(h>0){
                        angle += startAngle;
                        for (var i = startAngle; i < angle; i+=.01) {
                            r = get_r(i);
                            x = r * Math.cos(i + shift) + sun.r.x();
                            y = canvasHeight - (r * Math.sin(i + shift) + sun.r.y());
                            if (i == startAngle) {
                                context.beginPath();
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }
                        context.stroke();
                    
                    }else{
                        angle*=-1;
                        angle += startAngle;
                        r = get_r(angle);
                        for (var i = startAngle; i > angle; i-=.01) {
                            r = get_r(i);
                            x = r * Math.cos(i + shift) + sun.r.x();
                            y = canvasHeight - (r * Math.sin(i + shift) + sun.r.y());
                            if (i == startAngle) {
                                context.beginPath();
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }
                        context.stroke();
                    }
                    
                    
                    

                }
                
            }
            return {drawOrbit: drawOrbit, set: set, initialized: initialized};
        }
        var drawLine = function(x1, y1, x2, y2, color) {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.moveTo(x1, canvasHeight - y1);
            context.lineTo(x2, canvasHeight - y2);
            context.stroke();
            context.lineWidth = 1;
        }
        var orbitRender = new OrbitRender();
        var eventCanvasCoords = function(e, vect) {
            if (vect) {
                vect.set(e.pageX - canvasOffset.left, canvasHeight - (e.pageY - canvasOffset.top));
                return vect;
            } else {
                return new Vect(e.pageX - canvasOffset.left, canvasHeight - (e.pageY - canvasOffset.top));
            }
        };
        return {
            clear: clear,
            drawBody: drawBody,
            eventCanvasCoords: eventCanvasCoords,
            canvas: canvas,
            canvasWidth: function() {return canvasWidth},
            canvasHeight: function() {return canvasHeight},
            orbitRender: orbitRender,
            drawLine: drawLine,
            drawArc: drawArc
        };
    };
    var canvasController = new CanvasController();
    var controlsSetup = function() {
        var getGrav = function() {
            if ($("#grav").val()) {
                grav = $("#grav").val();
                orbitalCalculator.recalibrate();
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
            }
        }
        $("#grav").on("input", getGrav);
        getGrav();
        var getShowOrbit = function() {
            showOrbit = $("#showPath").prop("checked");
        }
        getShowOrbit();
        $("#showPath").on("click", getShowOrbit);
        var togglePause = function() {
            pause = !pause;
            if(pause){
                pauseStartTime = Date.now();
            }
        }
        $("#pause").click(togglePause);
        $(window).on("keydown", function(e){
            if(e.which===32){
                togglePause();
            };
        })
    }
    controlsSetup();
    var Task = function(){
        var eventsToComplete = [];
        var eventsThatResetAll;
        var eventListener;
        var frameCheck;
        var nextGoal = 0;
        function writeChecklist(){
            $("#goals").empty();
            for(var i=0; i<eventsToComplete.length; i++){
                $("<div>").addClass("goal").text(eventsToComplete[i].name).appendTo("#goals");
            }
        }
        function goalComplete(){
            $("#goals .goal").eq(nextGoal).addClass("complete");
            nextGoal++;
        }
        function resetGoal(){
            $("#goals .goal").eq(nextGoal-1).removeClass("complete");
            nextGoal--;
        }
        function resetAll(){
            $("#goals .goal").removeClass("complete");
            nextGoal = 0;
        }
        function eventHappened(event){
            if(nextGoal > 0 && eventsToComplete[nextGoal-1].reset(event)){
                resetGoal();
                return;
            }
            if(eventsThatResetAll(event)){
                resetAll();
            }
            if(eventsToComplete[nextGoal].complete("event",event)){
                goalComplete();
                return;
            }
            eventListener(event, eventsToComplete, eventsThatResetAll, nextGoal);
        }
        
        function checkFrame(planet, sun, orbit, eventsToComplete, eventsThatResetAll, nextGoal){
            frameCheck(planet, sun, orbit, eventsToComplete, eventsThatResetAll, nextGoal);
        }
        function setup(eventsToComplete, ecent){
            frameCheck = _frameCheck;
        }
        
        function init(){
            resetAll();
            writeChecklist();
            listenerSetup();
        }
        
    }
    var ScoreKeeper = function(){
        var orbiting = false;
        var orbitStartAngle = 0;
        var orbitStartTime = 0;
        var orbitCurrentAngle = 0;
        var orbitCompleted = false;
        var x, y;
        function refresh(){
            x = planet.r.x() - sun.r.x();
            y = planet.r.y() - sun.r.y();
        }
        function restartOrbit(){
            orbiting = false;
            if(orbitalCalculator.orbit.e < 1){
                refresh();
                orbitStartAngle = Math.PI*2 - Math.atan2(y,x);
                sun.color = "#ED4";
                orbiting = true;
                orbitCompleted = false;
            }
        }
        function frameReady(){
            if(orbiting){
                refresh();
                orbitCurrentAngle = Math.PI*2 - Math.atan2(y,x)
                if(!orbitCompleted){
                    canvasController.drawArc(sun.r.x(), sun.r.y(), sun.size*.9, orbitStartAngle, orbitCurrentAngle, orbitalCalculator.orbit.h > 0, "brown" );
                }
                //orbitCurrentAngle = orbitCurrentAngle < orbitStartAngle ? orbitCurrentAngle : orbitCurrentAngle + Math.PI * 2;
                //if(orbitalCalculator.timestamp - orbitalCalculator.timeInit > orbitalCalculator){}
                    
                if(!orbitCompleted && orbitalCalculator.timestamp - orbitalCalculator.timeInit > orbitalCalculator.orbit.period){
                    orbitCompleted = true;
                    sun.color = "yellow";
                }
            }
        }
        function sunBounce(){
            restartOrbit();
        }
        function recalibrate(){
            restartOrbit();
        }
        return {recalibrate: recalibrate, frameReady: frameReady};
    }
    var scoreKeeper = new ScoreKeeper();
    var SunController = function(sun, canvasController, orbitalCalculator) {
        var mouse = new Vect(100,75)
        function mouseUp() {
            sun.moving = false;
        }
        function mouseDown(e) {
            if(e.originalEvent.targetTouches && e.originalEvent.targetTouches.length===1){
                e =e.originalEvent.targetTouches[0]
            }
            var eventCanvasCoords = canvasController.eventCanvasCoords(e);
            if (Math.sqrt(sq(eventCanvasCoords.x() - mouse.x()) + sq(eventCanvasCoords.y() - mouse.y())) < sun.size) {
                sun.moving = true;
                //sun.moving = !sun.moving;
            }
        }
        var radius;
        function touchmove(e){
            if (e.targetTouches.length === 1 && sun.moving) {
                var touch = e.targetTouches[0];
                var eventCanvasCoords = canvasController.eventCanvasCoords(touch);
                //if (Math.sqrt(sq(eventCanvasCoords.x() - mouse.x()) + sq(eventCanvasCoords.y() - mouse.y())) < sun.size) {
                    e.preventDefault();
                    e.stopPropagation();
                    canvasController.eventCanvasCoords(touch, mouse);
                //}
            }
        }
        function mouseMove(e) {
            if (sun.moving) {
                canvasController.eventCanvasCoords(e, mouse);
            }
        }
        function moveSun(time, prevTime) {
            sun.moved = false;
            if(mouse.x()!==sun.r.x() || mouse.y()!==sun.r.y()){
                sun.moved = true;
                sun.r.set(mouse.x(), mouse.y());
            }
            
        }
        canvasController.canvas
                //.on("touchmove", touchmove)
                .on("mousemove", mouseMove)
                .on("mouseup touchend", mouseUp)
                .mouseleave(mouseUp)
                .on("mousedown touchstart", mouseDown);
        canvasController.canvas[0].addEventListener("touchmove", touchmove);
        return {mouse: mouse, moveSun: moveSun};
    };
    var sunController = new SunController(sun, canvasController, orbitalCalculator);
    var PlanetController = function(planet, sun, canvasController, orbitalCalculator) {
        var wallBounce = function(pos) {
            pos.rx -= planet.size;
            if (pos.rx < 0) {
                pos.rx = 0 - pos.rx;
                pos.vx = 0 - pos.vx;
                pos.bounced = true;
            }
            pos.rx += (planet.size * 2);
            if (pos.rx > canvasController.canvasWidth()) {
                pos.rx = 2 * canvasController.canvasWidth() - pos.rx;
                pos.vx = 0 - pos.vx;
                pos.bounced = true;
            }
            pos.rx -= planet.size;

            pos.ry -= planet.size;
            if (pos.ry < 0) {
                pos.ry = 0 - pos.ry;
                pos.vy = 0 - pos.vy;
                pos.bounced = true;
            }
            pos.ry += (planet.size * 2);
            if (pos.ry > canvasController.canvasHeight()) {
                pos.ry = 2 * canvasController.canvasHeight() - pos.ry;
                pos.vy = 0 - pos.vy;
                pos.bounced = true;
            }
            pos.ry -= planet.size;

        }
        var posCopy = function(pos, pos2) {
            pos.rx = pos2.rx;
            pos.ry = pos2.ry;
            pos.vx = pos2.vx;
            pos.vy = pos2.vy;
        };
        var radius, vTheta, newVtheta, rTheta, v, pos2;
        var wallBounceIter = 0;
        var wallBounced = function(pos){
            var max = 0;
            if(pos.rx < planet.size){
                max = Math.max(max,planet.size - pos.rx);
            } 
            if(pos.ry < planet.size){
                max = Math.max(max, planet.size - pos.ry);
            }
            if(pos.rx > (canvasController.canvasWidth() - planet.size)){
                max = Math.max(max, pos.rx - (canvasController.canvasWidth() - planet.size));
            }
            if(pos.ry > (canvasController.canvasHeight() - planet.size)){
                max = Math.max(max, (canvasController.canvasHeight() - planet.size));
            }
            return max;
        }
        function wallBounceCheck(pos, time, prevTime){
            wallBounceIter = 0;
            if(wallBounced(pos)){
                pos.bounced = true;
                return wallBounce(pos, time, prevTime, prevTime, prevTime, time);
            }
        }
        /*var wallBounce = function(pos, time, prevTime, checkTime, minTime, maxTime){
            wallBounceIter++;
            if(wallBounceIter>100) return;
            pos2 = orbitalCalculator.atTime(checkTime);
            var x = pos2
        }*/
        var sunBounceCheckIter = 0;
        var sunBounceCheck = function(pos, time, prevTime) {
            sunBounceCheckIter = 0;
            radius = Math.sqrt(sq(pos.rx) + sq(pos.ry));
            if (radius < (sun.size + planet.size)) {
                pos.bounced = true;
                return sunBounce(pos, time, prevTime, prevTime, prevTime, time);
            }
        }
        var sunBounce = function(pos, time, prevTime, checkTime, minTime, maxTime) {
            sunBounceCheckIter++;
            if(sunBounceCheckIter>100) return;
            pos2 = orbitalCalculator.atTime(checkTime);
            var x = pos2.rx// - (sun.v.x()*(checkTime-prevTime));
            var y = pos2.ry// - (sun.v.y()*(checkTime-prevTime));
            var radius = Math.sqrt(sq(x) + sq(y));
            if (radius - (sun.size + planet.size) > .1) {
                return sunBounce(pos, time, prevTime, (checkTime + maxTime) / 2, checkTime, maxTime);
            } else if (radius < (sun.size + planet.size)) {
                return sunBounce(pos, time, prevTime, (checkTime + minTime) / 2, minTime, checkTime);
            } else {
                v = Math.sqrt(sq(pos2.vx) + sq(pos2.vy));
                rTheta = Math.atan2(pos2.ry, pos2.rx);
                vTheta = Math.atan2(pos2.vy, pos2.vx);
                newVtheta = 2 * rTheta + Math.PI - vTheta;
                posCopy(pos, pos2);
                pos.vx = v * Math.cos(newVtheta);
                pos.vy = v * Math.sin(newVtheta);
                orbitalCalculator.recalibrate(orbitalCalculator.timeInit + checkTime, pos.rx, pos.ry, pos.vx/*+sun.v.x()/4*/, pos.vy/*+sun.v.y()/4*/);
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
                pos2 = orbitalCalculator.atTime(time - checkTime);
                posCopy(pos, pos2);
            }
        }
        var pos;
        var movePlanet = function(time, prevTime) {
            planet.recalibrate = false;
            pos = orbitalCalculator.atTime(time);  //this spits out canvas ball vector minus canvas mouse vector;
            if (!pos) {
                pos.rx = 100;
                pos.ry = 100;
            }
            pos.bounced = false;
            sunBounceCheck(pos, time, prevTime);

            pos.rx += sun.r.x();
            pos.ry += sun.r.y();

            wallBounce(pos);
            /*
             if(!pos) pos = {};
             pos.rx = planet.r.x() + planet.v.x();
             pos.ry = planet.r.y() + planet.v.y();
             pos.vx = planet.v.x();
             pos.vy = planet.v.y();*/



            planet.r.set(pos.rx, pos.ry);
            planet.v.set(pos.vx, pos.vy);
            planet.e = pos.e;

            planet.recalibrate = pos.bounced;
        };
        var rTheta;
        var adjustForSun = function(){
            if(distance(planet.r.x(), planet.r.y(), sun.r.x(), sun.r.y())<(sun.size+planet.size)){
                rTheta = Math.atan2( planet.r.y()-sun.r.y(), planet.r.x()-sun.r.x());
                planet.r.set(sun.r.x()+(sun.size+planet.size)*Math.cos(rTheta), sun.r.y()+(sun.size+planet.size)*Math.sin(rTheta))
                //canvasController.drawBody(dummy, "#888");
            }
        }
        return {movePlanet: movePlanet, adjustForSun: adjustForSun};
    };
    var planetController = new PlanetController(planet, sun, canvasController, orbitalCalculator);

    var AnimController = function(sun, planet, orbitalCalculator, canvasController, sunController, planetController) {
        var recalibrate;
        var rateRefresh = 1000;
        var frameCounter = 0;
        var frameCounterTimeInit;
        var ellapsed;
        var fps;
        var prevTime;
        function doTime(timestamp) {
            if (!frameCounterTimeInit) {
                frameCounterTimeInit = timestamp;
            }
            frameCounter++;
            ellapsed = timestamp - frameCounterTimeInit;
            if (ellapsed > rateRefresh) {
                fps = (1000 * frameCounter / ellapsed).toPrecision(2);
                $("#fps").text("fps: " + fps);
                frameCounterTimeInit = timestamp;
                frameCounter = 0;
            }
            recalibrate = false;

            orbitalCalculator.timestamp = timestamp;
            if (!orbitalCalculator.timeInit) {
                orbitalCalculator.recalibrate();
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
            }
            if (pause) {
                orbitalCalculator.timeInit = timestamp - prevTime;
            } 
            
            if(!pause) {
                planetController.movePlanet(timestamp - orbitalCalculator.timeInit, prevTime)
                recalibrate = recalibrate || planet.recalibrate;
                
            }
            sunController.moveSun(timestamp - orbitalCalculator.timeInit, prevTime)
            recalibrate = recalibrate || sun.moved;
            canvasController.clear();
            
            planetController.adjustForSun();
            
            if (recalibrate || !canvasController.orbitRender.initialized()) {
                orbitalCalculator.recalibrate();
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
                scoreKeeper.recalibrate();
            }
            /*try {
             $("#alpha").text(
             "; e: " + planet.e +
             "; speed: " + planet.v.length().toPrecision(5) +
             "; x: " + planet.r.x().toPrecision(5) +
             "; y: " + planet.r.y().toPrecision(5) +
             "; sunX: " + sun.r.x().toPrecision(5) +
             "; sunY: " + sun.r.y().toPrecision(5)
             );
             } catch (err) {
             
             }*/

            if (showOrbit) {
                canvasController.orbitRender.drawOrbit();
            }
            canvasController.drawBody(sun);
            canvasController.drawBody(planet);
            if(pause){
                canvasController.drawLine(planet.r.x(), planet.r.y(), planet.r.x()+100*planet.v.x(), planet.r.y()+100*planet.v.y(), "green")
            }
            scoreKeeper.frameReady();
            $("#speed").text(planet.v.length().toPrecision(3))
            $("#energy").text((.5*sq(planet.v.length()) - grav/distance(planet.r.x(),planet.r.y(),sun.r.x(),sun.r.y())).toPrecision(3));
            prevTime = timestamp - orbitalCalculator.timeInit;
            reqAnimFrame(function(timestamp) {
                animController.doTime(timestamp);
            });

        }
        return {doTime: doTime};
    };
    var animController = new AnimController(sun, planet, orbitalCalculator, canvasController, sunController, planetController);
    function start() {
        reqAnimFrame(function(timestamp) {
            animController.doTime(timestamp);
        });
    }
    return {start: start};
}

//when we set initial conditions, we find the intersection of the orbit with the walls (and the sun);
//We then calculate the time of intersection from the position.
//When time (t) exceeds time of intersection (ti), we recalibrate using as initial conditions 
//the conditions at the time of intersection.  We set timeInit to the time of intersection.
//Then calculate the position for the current time.