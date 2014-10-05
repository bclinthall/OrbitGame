/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function length(v){
    return Math.sqrt(sq(v[0])+sq(v[1]));
}
function sq(x){
    return Math.pow(x,2);
}

function makeFunction(v,r, grav){
    function get_h(v,r){ //calculate angular momentum
        return r[0]*v[1]-r[1]*v[0];
    }
    function get_e(vLength, v, rLength, r, h, grav){   //calculate eccentricity
        //calculate eccentricity
        var e1 = v[1]*h/grav;
        var e2 = r[0]/rLength;
        var e3 = -v[0]*h/grav;
        var e4 = r[1]/rLength;
        return Math.sqrt(sq(e1-e2) + sq(e3-e4));
    }
    function get_a(rLength, r, e){      //calculate major axis
        if(e!==1){
            return Math.sqrt(sq(r[0])+sq(r[1])/(1-sq(e))) * 2;
        }else{
            return sq(r[1])/(4*r[0]);
        }
    }
    function get_a2(rLength, r, e){
        return 2*(rLength-e*r[0])/(1-sq(e));
    }
    function get_omega(e, r, v, vLength, h){
        var rtheta = Math.atan2(r[1],r[0]);
        var vtheta = Math.atan2(v[1],v[0]);
        var vrtheta = vtheta-rtheta;
        var vr = vLength * Math.cos(vrtheta);
        var realAnomaly = Math.asin(vr / h / e)
        return rtheta-realAnomaly;
    }
    function get_T(a, grav){
        return 2* Math.PI * Math.sqrt(Math.pow(a,3)/grav); 
    }
    function get_E(rLength,e,a){
        return Math.acos((a-rLength)/(e*a));
    }
    function get_t_from_E(E, e, T){
        return (T/2*Math.PI)*(E-e*Math.sin(E))
    }
    //calculate vLength and rLength;
    var vLength = length(v);
    var rLength = length(r);
    var h = get_h(v, r);
    var e = get_e(vLength, v, rLength, r, h, grav)
    var a = get_a(rLength, r, e);
    var omega = get_omega(e, r, v, vLength, h);
    var tNow;
    console.log("e: "+e);
    if(e<1){ //ellipse
        var T = get_T(a, grav);     //period
        var E = get_E(rLength,e,a);
        tNow = get_t_from_E(E,e,T);
        tNow = tNow % T;
        console.log("tNow:",tNow, "T:",T, "E:",E, "omega:",omega);
        return new EllipseByTime(E, tNow, e, a, T, omega);
    }
}
function EllipseByTime(E_init, t_init, e, a, T, omega){
    omega = omega || 0;
    //omega *= Math.PI/180;
    if(!T){
        T = 2* Math.PI * Math.sqrt(Math.pow(a,3)/parseFloat($("#grav").val())); 
    }
    var _this = this;
    _this.E_prev = E_init;
    var approx_E = function(E_prev, C){
        return E_prev - ( (C - E_prev + e * Math.sin(E_prev)) / (e*Math.cos(E_prev)-1) )
    }
    var get_E = function(t){
        var C = 2*Math.PI * (t/T);
        var fOfE = 100;
        var E = _this.E_prev;
        var i = 0;
        while(Math.abs(fOfE)>Math.pow(10,-20) && i<1000){
            i++;
            E = approx_E(E, C);
            fOfE = C - E + e*Math.sin(E);
        }
        //console.log("Newton's method result. i:"+i+"; fOfE: "+fOfE);
        _this.E_prev = E;
        return E;
        
    }
    function get_rLength(a,e,E){
        return a * (1-e*Math.cos(E));
    }
    function get_theta(e,E){
        var tanHalfTheta = Math.sqrt((1+e)/(1-e)) * Math.tan(E/2);
        return 2 * Math.atan(tanHalfTheta);
    }
    var rLength, theta, r;
    if(!r){
        r = new Float32Array(3);
    }
    _this.getPos = function(t){
        t += t_init;
        var E = get_E(t);
        rLength = get_rLength(a,e,E);
        theta = get_theta(e,E);
        theta+=omega;
        if(t <= t_init+10){
            console.log("E at t:"+(t-t_init),E);
        }
        r[0] = rLength*Math.cos(theta);
        r[1] = rLength*Math.sin(theta);
        //r[0] += 1000;
        //r[0]*=1;
        //r[1]-=1;
        //r[1]*=10;
        //console.log(/*"rLength:",rLength,"theta: "+(theta%(Math.PI*2)*(180/Math.PI)),*/ "t:",t,"r[0]:",r[0],"r[1]:",r[1]);
        return (r);
    }
    
}
function test(context, r, e, omega){
    context.clearRect(0,0,500,500);
    var rLength = length(r);
    var a = (rLength-e*r[0])/(1-sq(e));
    context.fillStyle = "#F00";
    context.fillRect(r[0]+250, 250-r[1],2,2)
    context.fillRect(250, 250,3,3)
    context.fillStyle = "#000";
    var func = new EllipseByTime(0, 0, e, a, null, omega);
    for(var t=0; t<400; t++){
      var pos = func.getPos(t);
      pos[0] = 250-pos[0];
      pos[1] = 250-pos[1];
      console.log(pos);
      context.fillRect(pos[0], pos[1], 1,1);
    }
    context.fillStyle = "#F00";
    context.fillRect(r[0]+250, 250-r[1],3,3)
    context.fillStyle = "#000";

}