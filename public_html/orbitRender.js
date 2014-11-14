function OrbitRender() {
    var sun = {
        r: new Vect(200, 200),
        v: new Vect(0,0),
        size: 20
    };
    var planet = {
        r: new Vect(100, 100),
        v: new Vect(0, 0),
        size: 20
    };
    var grav = 5;
    var showOrbit = false;
    var pause = true;
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
        var resize = function() {
            canvasWidth = $(window).width();
            canvasHeight = $(window).height();
            canvas.prop({
                width: canvasWidth,
                height: canvasHeight
            });
        };
        resize();
        $(window).resize(resize);


        var clear = function() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        };
        var eAngle = 2 * Math.PI;
        var drawBody = function(body, color) {
            context.fillStyle = color;
            context.beginPath();
            context.arc(body.r.x(), canvasHeight - body.r.y(), body.size, 0, eAngle);
            context.fill();
        };
        function OrbitRender() {
            var h, e, a, grav, r, x, y, angle, nu, rotate, shift;
            function set(orbit, _grav) {
                h = orbit.h;
                e = orbit.e;
                a = orbit.a;
                nu = orbit.nu;
                rotate = orbit.rotate
                shift = orbit.shift;
                grav = _grav;
                var rMinusN = rotate - nu;
                rMinusN = rMinusN * 180 / Math.PI;
                if (rMinusN < 0)
                    rMinusN += 360;
                rMinusN = rMinusN.toPrecision(3);
                $("#alpha").text(
                        "nu:" + (nu * 180 / Math.PI).toPrecision(3) +
                        "; rotate-nu: " + rMinusN);
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
                /*
                 context.strokeStyle = "red";
                 shift = rotate+nu;
                 for(var i=0; i<360; i++){
                 
                 angle = i * Math.PI/180;
                 r = get_r(angle);
                 x = r * Math.cos(angle+shift) + sun.r.x();
                 y = canvasHeight  - (r * Math.sin(angle+shift) + sun.r.y());
                 if(i==0){
                 context.beginPath();
                 context.moveTo(x,y);
                 }else{
                 context.lineTo(x,y);
                 }
                 }
                 context.stroke();*/
            }
            return {drawOrbit: drawOrbit, set: set};
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
        var eventCanvasCoords = function(e, radius) {
            if (radius) {
                radius.x = e.pageX - canvasOffset.left;
                radius.y = canvasHeight - (e.pageY - canvasOffset.top);
                return radius;
            } else {
                return {
                    x: e.pageX - canvasOffset.left,
                    y: canvasHeight - (e.pageY - canvasOffset.top)
                };
            }
        };
        return {
            clear: clear,
            drawBody: drawBody,
            eventCanvasCoords: eventCanvasCoords,
            canvas: canvas,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            orbitRender: orbitRender,
            drawLine: drawLine,
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
        }
        $("#pause").click(togglePause);
        $(window).on("keydown", function(e){
            if(e.which===32){
                togglePause();
            };
        })
    }
    controlsSetup();

    var SunController = function(sun, canvasController, orbitalCalculator) {
        var mouse = {
            x: 200,
            y: 200,
            size: 20,
            moving: false,
            moved: false,
            time: 0,
            prevTime: 0,
        };
        function mouseUp() {
            mouse.moving = false;
            sun.v.set(0,0);
        }
        function mouseDown(e) {
            var eventCanvasCoords = canvasController.eventCanvasCoords(e);
            if (Math.sqrt(sq(eventCanvasCoords.x - mouse.x) + sq(eventCanvasCoords.y - mouse.y)) < mouse.size) {
                mouse.moving = true;
                console.log("mouse moving = true");
                mouse.prevTime = Date.now();
            }
        }
        var radius;
        
        function mouseMove(e) {
            if (mouse.moving) {
                mouse.moved = true;
                mouse.time = Date.now();
                canvasController.eventCanvasCoords(e, mouse);
                sun.v.set((mouse.x - sun.r.x())/(mouse.time-mouse.prevTime), (mouse.y - sun.r.y())/(mouse.time-mouse.prevTime))
//                sunMoveTimes.push(Date.now());
//                if(sunMoveTimes.length>10) {
//                    sunMoveTimes.shift();
//                    console.log(sunMoveTimes[9]-sunMoveTimes[0]);
//                }
                console.log("sunspeed: "+sun.v.length().toPrecision(3), "sample in ms: " + (mouse.time-mouse.prevTime));
                mouse.prevTime = mouse.time;
            }
        }
        var sunMoved;
        function moveSun() {
            sunMoved = mouse.moved;
            sun.r.set(mouse.x, mouse.y);
            mouse.moved = false;
            return sunMoved;
        }
        canvasController.canvas
                .on("mousemove", mouseMove)
                .on("mouseup touchend", mouseUp)
                .mouseleave(mouseUp)
                .on("mousedown touchend", mouseDown);
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
            if (pos.rx > canvasController.canvasWidth) {
                pos.rx = 2 * canvasController.canvasWidth - pos.rx;
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
            if (pos.ry > canvasController.canvasHeight) {
                pos.ry = 2 * canvasController.canvasHeight - pos.ry;
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
        var getBounceTime = function(pos, early, late) {

        }
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
            var x = pos2.rx - (sun.v.x()*(checkTime-prevTime));
            var y = pos2.ry + (sun.v.y()*(checkTime-prevTime));
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
                orbitalCalculator.recalibrate(orbitalCalculator.timeInit + checkTime, pos.rx, pos.ry, pos.vx+sun.v.x(), pos.vy+sun.v.y());
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
                pos2 = orbitalCalculator.atTime(time - checkTime);
                posCopy(pos, pos2);
                console.log("sunBounceCheckIter:" + sunBounceCheckIter);
            }
        }
        var pos;
        var movePlanet = function(time, prevTime) {
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

            return pos.bounced;
        };
        return {movePlanet: movePlanet};
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
                $("#speed").text("fps: " + fps);
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
            } else {
                recalibrate = planetController.movePlanet(timestamp - orbitalCalculator.timeInit, prevTime);
            }
            recalibrate = recalibrate || sunController.moveSun();
            if (recalibrate) {
                orbitalCalculator.recalibrate();
                canvasController.orbitRender.set(orbitalCalculator.orbit, grav);
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

            canvasController.clear();
            if (showOrbit) {
                canvasController.orbitRender.drawOrbit();
            }
            canvasController.drawBody(sun, "#8ED6FF");
            canvasController.drawBody(planet, "blue");
            if(pause){
                canvasController.drawLine(planet.r.x(), planet.r.y(), planet.r.x()+100*planet.v.x(), planet.r.y()+100*planet.v.y(), "green")
            }

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