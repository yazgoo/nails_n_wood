window.Collide = (function() {
    console.log("kikoo");
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
	Collide.scripts = {};
    Collide.Mesh = function ( geometry, material, mass ) {
        var index;
        if ( !geometry ) return;
		Eventable.call(this);
        THREE.Mesh.call( this, geometry, material );
        if ( !geometry.boundingBox ) {
            geometry.computeBoundingBox();
        }
        this._physijs = { type: null,
            id: getObjectId(), mass: mass || 0, touches: [],
linearVelocity: new THREE.Vector3, angularVelocity: new THREE.Vector3
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
        console.log("simulating");
    }
	Collide.Scene.prototype.add = function(object) {
		THREE.Mesh.prototype.add.call(this, object);
    }
	Collide.Scene.prototype.remove = function(object) {
		THREE.Mesh.prototype.remove.call(this, object);
    }
    return Collide;
})();
