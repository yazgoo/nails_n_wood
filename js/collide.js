window.Collide = (function() {
    var Eventable
    var getObjectId
    var Collide = {}
	getObjectId = (function() {
		var _id = 0;
		return function() {
			return _id++;
		};
	})();
	Eventable = function() {
		this._eventListeners = {};
	};
	Eventable.prototype.addEventListener = function( event_name, callback ) {
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) {
			this._eventListeners[event_name] = [];
		}
		this._eventListeners[event_name].push( callback );
	};
	Eventable.prototype.removeEventListener = function( event_name, callback ) {
		var index;
		
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) return false;
		
		if ( (index = this._eventListeners[event_name].indexOf( callback )) >= 0 ) {
			this._eventListeners[event_name].splice( index, 1 );
			return true;
		}
		
		return false;
	};
	Eventable.prototype.dispatchEvent = function( event_name ) {
		var i,
			parameters = Array.prototype.splice.call( arguments, 1 );
		
		if ( this._eventListeners.hasOwnProperty( event_name ) ) {
			for ( i = 0; i < this._eventListeners[event_name].length; i++ ) {
				this._eventListeners[event_name][i].apply( this, parameters );
			}
		}
	};
	Eventable.make = function( obj ) {
		obj.prototype.addEventListener = Eventable.prototype.addEventListener;
		obj.prototype.removeEventListener = Eventable.prototype.removeEventListener;
		obj.prototype.dispatchEvent = Eventable.prototype.dispatchEvent;
	};
    Collide.main;
	Collide.scripts = {};
    Collide.meshes = [];
    Collide.Mesh = function ( geometry, material, mass ) {
        var index;
        if ( !geometry ) return;
		Eventable.call(this);
        THREE.Mesh.call( this, geometry, material );
        if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
        }
        function set_min_delta_position(d)
        {
            Collide.delta_position
                = Math.min(Collide.delta_position, d/5);
        }
        if(mass != 0)
        {
            Collide.simulating = false;
            Collide.main = this;
            set_min_delta_position(
                    Collide.main.geometry.boundingSphere.radius);
        }
        else Collide.meshes.push(this);
        var self = this;
        function norm(v)
        {
            return Math.sqrt(Math.pow(v.x, 2)
                    + Math.pow(v.y, 2));
        }
        function dot(a, b)
        {
            return a.x * b.x + a.y * b.y;
        }
        function normalize(v)
        {
            var n = norm(v);
            v.x = v.x / n;
            v.y = v.y / n;
            return v;
        }
        function rotate(v, theta)
        {
            return {x: v.x * Math.cos(theta)
                - v.y * Math.sin(theta),
                    y: v.x * Math.sin(theta)
                        + v.y * Math.cos(theta)}
        }
        function scale(v, s)
        {
            v.x *= s;
            v.y *= s;
            return v;
        }
        function d(a, b)
        {
            return Math.sqrt(Math.pow(b - a, 2));
        }
        if(geometry instanceof THREE.CubeGeometry) {
            var hw = (geometry.boundingBox.max.x
                - geometry.boundingBox.min.x) / 2;
            set_min_delta_position(hw);
            var hh = (geometry.boundingBox.max.y
                - geometry.boundingBox.min.y) / 2;
            set_min_delta_position(hh);
            self.intersectsCircle = function(x, y, radius)
            {
                var right = this.position.x + hw + radius / 2;
                var left = (this.position.x - hw - radius / 2);
                var top = (this.position.y + hh + radius / 2);
                var bottom = (this.position.y - hh - radius / 2);
                if (x < right && x > left
                        && y < top && y > bottom)
                {
                    var d1 = Math.min(d(x, right), d(x, left));
                    var d2 = Math.min(d(y, top), d(y, bottom));
                    if(d1 < d2) self.dir = [-1, 1];
                    else self.dir = [1, -1];
                    return true;
                }
                else return false;
            }
            self.reflect_speed = function(vx, vy)
            {
                return scale({x: self.dir[0] * vx,
                    y: self.dir[1] * vy}, Collide.rebound_factor);
            }
        }
        else if(geometry instanceof THREE.CylinderGeometry)
        {
            var width = (geometry.boundingBox.max.x -
                geometry.boundingBox.min.x) / 2;
            set_min_delta_position(width);
            self.intersectsCircle = function(x, y, radius)
            {
                var distance = Math.sqrt(
                        Math.pow(this.position.x - x, 2)
                            + Math.pow(this.position.y - y, 2));
                return (distance < (radius + width));
            }
            self.reflect_speed = function(vx, vy)
            {
                // first we calculate the vector direction between 
                // the cylinder and the sphere
                var pos = Collide.main.position;
                var mirror = normalize({x: pos.x - this.position.x,
                        y: pos.y - this.position.y});
                var n_v = normalize({x: -vx, y: -vy});
                var n = norm({x: -vx, y: -vy});
                // we force the speed to a minimum
                if(n < 5) n = 6;
                // then we calculate the angle between the two
                // vectors
                //var theta = Math.acos(dot(mirror, n_v));
                var theta = Math.atan2(mirror.y, mirror.x)
                    - Math.atan2(n_v.y, n_v.x)
                // finaly, we rotate v by 2 * theta
                return scale(rotate(n_v, theta), 
                        Collide.rebound_factor * n);
            }
        }
        this.containsMain = function(x, y)
        {
            return self.intersectsCircle(x, y,
                Collide.main.geometry.boundingSphere.radius);
        }
        this._collide = { type: null,
            id: getObjectId(), mass: mass || 0,
            linearVelocity: new THREE.Vector2
        };
    };
    Collide.Mesh.prototype = new THREE.Mesh;
    Collide.Mesh.prototype.constructor = Collide.Mesh;
	Eventable.make(Collide.Mesh);
    Collide.BoxMesh = function(geometry, material, mass) {
        Collide.Mesh.call(this, geometry, material, mass);
    }
	Collide.BoxMesh.prototype = new Collide.Mesh;
	Collide.BoxMesh.prototype.constructor = Collide.BoxMesh;
    Collide.SphereMesh = function(geometry, material, mass) {
        Collide.Mesh.call(this, geometry, material, mass);
    }
	Collide.SphereMesh.prototype = new Collide.Mesh;
	Collide.SphereMesh.prototype.constructor = Collide.SphereMesh;
    Collide.Scene = function(params) {
		var self = this;
		Eventable.call(this);
        THREE.Scene.call(this);
		this.worker = new Worker(Collide.scripts.worker ||
            'collide_worker.js' );
    }
	Collide.Scene.prototype = new THREE.Scene;
	Collide.Scene.prototype.constructor = Collide.Scene;
	Eventable.make(Collide.Scene);
	Collide.Scene.prototype.simulate = function() {
        var simulate_time = new Date().getTime();
        if(!Collide.simulating)
        {
            var self = this;
            Collide.interval = setInterval(function() {
                self.dispatchEvent('update') }, 50);
            Collide.simulating = true;
            Collide.start_time = simulate_time;
            Collide.rebound_factor = 0.4;
            Collide.v = {x: 0, y: 0};
            Collide.position = {x: Collide.main.position.x,
                y: Collide.main.position.y};
        }
        else Collide.moveMain(simulate_time);
        Collide.last_simulate_time = simulate_time;
    }
    Collide.moveMain = function(simulate_time) {
        var g = -9.81;
        var t = (Collide.last_simulate_time -
                Collide.start_time) / 1000;
        var i = 0;
        while(t < ((simulate_time - Collide.start_time) / 1000))
        {
            x  = Collide.v.x * t + 
                Collide.position.x;
            y  = Collide.v.y * t + 
                Collide.position.y + g * t * t / 2;
            var collided_mesh = Collide.collides(x, y);
            if(collided_mesh != null)
            {
                Collide.start_time = simulate_time;
                Collide.v = collided_mesh.reflect_speed(
                        Collide.v.x, g * t + Collide.v.y);
                Collide.position = {x: Collide.main.position.x, 
                    y: Collide.main.position.y }
                collided_mesh.dispatchEvent('collision',
                        Collide.main, null, null);
                Collide.main.dispatchEvent('collision',
                        collided_mesh, null, null);
                break;
            }
            else
            {
                Collide.main.position.x = x;
                Collide.main.position.y = y;
                t += Collide.delta_position / Math.sqrt(
                        Math.pow(Collide.v.x, 2)
                        + Math.pow(g * t + Collide.v.y, 2))
            }
        }
    }
    Collide.collides = function(x, y) {
        for(var i in Collide.meshes)
            if(Collide.meshes[i].containsMain(x, y))
                return Collide.meshes[i];
        return null;
    }
	Collide.Scene.prototype.add = function(object) {
		THREE.Mesh.prototype.add.call(this, object);
    }
	Collide.Scene.prototype.remove = function(object) {
		THREE.Mesh.prototype.remove.call(this, object);
    }
    return Collide;
})();
