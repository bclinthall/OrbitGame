var sinh = Math.sinh || function(x){return (Math.exp(x)-Math.exp(-x))/2;}
var cosh = Math.cosh || function(x){return (Math.exp(x)+Math.exp(-x))/2;}
function Stumpff(){
    var zSqrt = 0;
    function S(z){
        zSqrt = Math.sqrt(Math.abs(z));
        if(z===0){
            return 1/6;
        }else if(z>0){
            return (zSqrt - Math.sin(zSqrt))/Math.pow(zSqrt,3);
        }else{
            return (sinh(zSqrt) - zSqrt) / Math.pow(zSqrt,3);
        }
    }
    function C(z){
        zSqrt = Math.sqrt(Math.abs(z));
        if(z===0){
            return 1/2
        }else if(z>0){
            return (1-Math.cos(zSqrt))/z;
        }else{
            return (cosh(zSqrt)-1)/-z;
        }
    }
    return {S:S, C:C};
}
function length(v){
    return Math.sqrt(sq(v[0])+sq(v[1]));
}
function sq(x){
    return Math.pow(x,2);
}
function Vect(x,y){
    var a = new Float32Array(3);
    
    var _this = this;
    _this.a = a;
    function get_out(out){
        return out ? out.a ? out.a : out : a;
    }
    function getRet(out){
        return out ? out : a;
    }
    _this.length = function(){
        return Math.sqrt(sq(a[0])+sq(a[1]));
    }
    _this.dot = function(b){
        b = b.a ? b.a : b;
        return a[0]*b[0]+a[1]*b[1]; 
    }
    _this.cross = function(b, out){
        var ret = getRet(out);out = get_out(out);
        b = b.a ? b.a : b;
        out[0] = a[1]*b[2] - a[2]*b[1];
        out[1] = a[0]*b[2] - a[2]*b[0];
        out[2] = a[0]*b[1] - a[1]*b[0];
        return ret;
    }
    _this.mult = function(scalar, out){
        var ret = getRet(out);out = get_out(out);
        out[0]=a[0]*scalar;
        out[1]=a[1]*scalar;
        return ret;
    }
    _this.scalarAdd = function(scalar, out){
        var ret = getRet(out);out = get_out(out);
        out[0]=a[0]+scalar;
        out[1]=a[1]+scalar;
        return ret;
    }
    _this.vectorAdd = function(b, out){
        b = b.a ? b.a : b;
        var ret = getRet(out);out = get_out(out);
        out[0] = a[0]+b[0];
        out[1] = a[1]+b[1];
        return ret;
    }
    _this.vectorSubtract = function(b, out){
        b = b.a ? b.a : b;
        var ret = getRet(out);out = get_out(out);
        out[0] = a[0]-b[0];
        out[1] = a[1]-b[1];
        return ret;
    }
    _this.set = function(x,y){
        x=x||0; y=y||0;
        a[0]=x;
        a[1]=y;
        return _this;
    }
    _this.x = function() {return a[0]} 
    _this.y = function() {return a[1]} 
    _this.z = function() {return a[2]}
    _this.set(x,y);
    return _this;
}

function OrbitalCalculator(){
    var R0 = new Vect();
    var V0 = new Vect();
    var E = new Vect();
    var stumpff = new Stumpff();
    var r0, v0, vr0, alpha, chiPrev, grav, gravSqrt, e, h, nu, rotate, shift;
    var Cross = new Vect();
    var clockwise;
    function get_e(R, V, grav){
        var r = R.length();
        h = R.x() * V.y() - R.y()*V.x();
        E.set( (V.y()*h/grav) - (R.x()/r), (-1*V.x()*h/grav) - (R.y()/r) );
        nu = Math.acos(E.dot(R) / (E.length()*R.length()));
        R.cross(V, Cross);
        clockwise = Cross.z()<0;
        //$("#alpha").text("z of R cross V: " + Cross.z())
        
        if(R.dot(V)<0){
            nu = Math.PI * 2 - nu;
        }
        rotate = Math.atan2(R.y(),R.x());
        if(clockwise){
            shift = rotate+nu;
        }else{
            shift = rotate-nu;
        }
        //nu = rotate - nu;
        return E.length();
    }
    var orbit = {
        h: null,
        e: null,
    }
    function setInitialConds(rx, ry, vx, vy, myGrav){
        grav = myGrav;
        gravSqrt = Math.sqrt(grav);
        R0.set(rx,ry);
        V0.set(vx,vy);
        r0 = R0.length();
        v0 = V0.length();
        e = get_e(R0,V0, grav);
        vr0 = R0.dot(V0); 
        vr0/=r0;
        alpha = (2/r0) - sq(v0)/grav;
        //$("#alpha").text(Math.round(2/alpha) + " e: "+e);
        chiPrev = findChi(0);
        orbit.h = h;
        orbit.e = e;
        orbit.a = 2/alpha;
        orbit.nu = nu;
        orbit.rotate = rotate;
        orbit.shift = shift;
        return orbit;
    }
    
    var z, S_res, C_res, goober, univ, univPrime;
    function approximateChi(dt){
        z = alpha * sq(chiPrev);
        S_res = stumpff.S(z);
        C_res = stumpff.C(z);
        goober = r0 * vr0 * chiPrev / gravSqrt;
        univ = goober * chiPrev * C_res + (1 - alpha*r0) * Math.pow(chiPrev,3)*S_res + r0*chiPrev - gravSqrt * dt;
        univPrime = goober * (1 - alpha*sq(chiPrev)*S_res) + (1 - alpha * r0)*sq(chiPrev)*C_res + r0;
        return univ/univPrime;
    };
    var ratio;
    var iterationCounter = 0;
    var callCounter = 0;
    function findChi(dt){
        if(callCounter ===100){
            //console.log("avg iterations:", iterationCounter/100)
            iterationCounter = 0;
            callCounter = 0;
        }
        callCounter++;
        chiPrev = OrbitalCalculator.drawPath ? gravSqrt * Math.abs(alpha) * dt : chiPrev || gravSqrt * Math.abs(alpha) * dt;
        ratio = 1;
        for (var i = 0; i<10000; i++){
            ratio = approximateChi(dt);
            if(Math.abs(ratio) > Math.pow(10,-8)){
                chiPrev-=ratio; 
            }else{
                iterationCounter+=i;
                //console.log("finding chi took " + i + " iterations");
                return chiPrev;
            }
        }
        console.log("chi not found after 10000 iterations");
        return false;
    }
    
    var chi, chiSq, chiCube, f, g, fPrime, gPrime, r;
    var R = new Vect();
    var V = new Vect();
    var fR0 = new Vect();
    var gV0 = new Vect();
    function atTime(dt){
        chi = findChi(dt);
        if(!chi){
            return false;
        }
        chiSq = sq(chi);
        chiCube = Math.pow(chi,3);
        
        C_res = stumpff.C(alpha*sq(chi));
        S_res = stumpff.S(alpha*sq(chi));
        f = 1 - chiSq * C_res / r0;
        g = dt - chiCube * S_res / gravSqrt;
        
        fR0 = R0.mult(f,fR0);
        gV0 = V0.mult(g,gV0);
        R = fR0.vectorAdd(gV0, R);
        r = R.length();
        
        fPrime = (gravSqrt/r/r0)*(alpha*chiCube*S_res - chi);
        gPrime = 1 - chiSq * C_res / r;
        
        fR0 = R0.mult(fPrime,fR0);
        gV0 = V0.mult(gPrime,gV0);
        V = fR0.vectorAdd(gV0, V);
        return {rx:R.x(), ry:R.y(), vx: V.x(), vy: V.y()} 
    }
    function findChiTest(){
        r0 = 10000;
        v0 = 10;
        vr0 = 3.0752;
        alpha = -5.0878e-5;
        grav = 398600;
        gravSqrt = Math.sqrt(grav);
        findChi(60*60);
    }
    return {setInitialConds: setInitialConds, atTime: atTime, findChiTest:findChiTest};
    
}