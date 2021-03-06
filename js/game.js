function Game(physics)
{
    var marble;
    var marble_droped;
    var marble_droped_date;
    var hit_count;
    var ThreePhysics = physics;
    var done;
    this.cases;
    this.end_game_callback;
    this.audio_effects = true;
    this.trackball_controls = true;
    this.model = "./model/street.js";
    this.use_model = true;
    this.descriptor;
    var objects;
    var game = this;
    this.translate_marble = function(i)
    {
        if(!marble_droped) marble.position.x += i;
    }
    this.marble_position_set = function(x)
    {
        if(!marble_droped) marble.position.x = x;
    }
    var create_wood = function(scene, cases)
    {
        var wood_material = new THREE.MeshLambertMaterial( { 
            map: THREE.ImageUtils.loadTexture(
                     'img/wood_0.jpg') });
        var ok_material = new THREE.MeshLambertMaterial( { 
            map: THREE.ImageUtils.loadTexture(
                     'img/ok.png'),
                alphaTest: 0.5});
        var nok_material = new THREE.MeshLambertMaterial( { 
            map: THREE.ImageUtils.loadTexture(
                     'img/nok.png'),
                alphaTest: 0.5 });
        var wood_back = new THREE.Mesh(
                new THREE.CubeGeometry(100, 200, 10),
                wood_material);
        var wood_left = new ThreePhysics.BoxMesh(
                new THREE.CubeGeometry(2, 200, 25),
                wood_material, 0);
        wood_left.position.x = -51;
        wood_left.position.z = 5;
        var wood_right = new ThreePhysics.BoxMesh(
                new THREE.CubeGeometry(2, 200, 25),
                wood_material, 0);
        wood_right.position.x = 51;
        wood_right.position.z = 5;
        var wood_bottom = new ThreePhysics.BoxMesh(
                new THREE.CubeGeometry(104, 2, 25),
                wood_material, 0);
        wood_bottom.position.y = -101;
        wood_bottom.position.z = 5;
        // wood_back.receiveShadow = true;
        objects.push(wood_back);
        scene.add(wood_back);
        //add_spot_light(50, 200, 0, wood_back);
        add_point_light(0, 50, 50);
        // wood_left.receiveShadow = true;
        objects.push(wood_left);
        scene.add(wood_left);
        // wood_right.receiveShadow = true;
        objects.push(wood_right);
        scene.add(wood_right);
        // wood_bottom.receiveShadow = true;
        objects.push(wood_bottom);
        scene.add(wood_bottom);
        for(var i in cases) {
            var case_ = new ThreePhysics.BoxMesh(
                    new THREE.CubeGeometry(2, 25, 25),
                    wood_material,
                    0);
            case_.position.x = cases[i].position * 100 - 50;
            case_.position.y = -100 + 25/2;
            case_.position.z = 5;
            if(cases[i].position == undefined)
                cases[i].position = 1;
            var d = (cases[i].position - cases[i].sign_position) * 100;
            if(d < 0) d = -d;
            var sign = new THREE.Mesh(
                    new THREE.PlaneGeometry(d, d),
                    cases[i].ok ? ok_material: nok_material);
            sign.position.x = cases[i].sign_position * 100 - 50;
            sign.position.y = -100 + 25/2;
            sign.position.z = 5.1;
            //sign.rotation.y = 3.14 / 2;
            // sign.receiveShadow = true;
            objects.push(sign);
            scene.add(sign);
            // sign.receiveShadow = true;
            objects.push(case_);
            scene.add(case_);
        }
    }
    var marble_setup = function(scene) {
        if(marble != undefined) scene.remove(marble);
        marble = new THREE.Mesh(
                new THREE.SphereGeometry(1.6, 20, 20),
                new THREE.MeshLambertMaterial( { color: 0x0000AA }
                    ), 0.1);
        marble.position.y = 100;
        marble.position.z = +10;
        marble.position.x = Math.random() * 100 - 50;
        scene.add(marble);
        done = false;
        marble_droped = false;
    }
    this.simulate = function()
    {
        scene.simulate(undefined, 2);
    }
    this.marble_drop = function()
    {
        if(marble_droped) return;
        marble_droped = true;
        marble_droped_date = new Date();
        hit_count = 0;
        var old_x = marble.position.x;
        scene.remove(marble);
        marble = new ThreePhysics.SphereMesh(
                marble.geometry, marble.material);
        marble.castShadow = true;
        var last_object_collided = null;
        var audio_effects = this.audio_effects;
        marble.addEventListener('collision', function(object) {
            if(object != last_object_collided) {
                hit_count++;
                if(audio_effects) {
                    new Audio("sound/collision.ogg").play();
                }
                last_object_collided = object;
            }
        });
        marble.rotation.y = 3.14/4;
        marble.position.y = 100;
        marble.position.z = +10;
        marble.position.x = old_x;
        // we enable CCD as per
        // http://bulletphysics.org/mediawiki-1.5.8/index.php/Anti_tunneling_by_Motion_Clamping
        /*marble.setCcdMotionThreshold(0.1);
        marble.setCcdSweptSphereRadius(0.5);*/
        scene.removeEventListener( 'update',  this.simulate);
        scene.addEventListener( 'update',  this.simulate);
        scene.simulate();
        scene.add(marble);
    }
    this.load_and_setup_map = function(map) {
        marble_setup(scene);
        setup_map(map);
    }
    var setup_map = function(result)
    {
        objects = [];
        var map = result.nails;
        this.cases = result.cases;
        var nail_material = new THREE.MeshPhongMaterial(
                {
                    color: 0x777777,
            ambient: 0x000000,
            specular: 0xffaa00,
            shininess: 15,
            metal: true,
            shading: THREE.SmoothShading }
            );
        var nail_geometry = new THREE.CylinderGeometry(0.2, 0.7, 20);
        var nails = [];
        for(var i in map) {
            var nail = new ThreePhysics.SphereMesh(
                    nail_geometry, nail_material, 0);
            nail.castShadow = true;
            nail.rotation.x = -3.14/2;
            nail.rotation.y = -3.14/4;
            nail.position.x = map[i][0] * 100 - 50;
            nail.position.y = 100 - map[i][1] * 200;
            nail.position.z = 10;
            scene.add(nail);
            objects.push(nail);
        }
        create_wood(scene, cases);
    }
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    var scene;
    var camera;
    var renderer;
    var controls;
    var add_spot_light = function(x, y, z, target)
    {
        var light = new THREE.SpotLight();
        light.position.set(x, y, z);
        light.rotation.z = Math.PI;
        light.shadowCameraVisible = true; 
        light.castShadow = true;
        light.shadowDarkness = 0.5;
        light.intensity = 1;
        scene.add(light);
    }
    var add_point_light = function(x, y, z)
    {
        var pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.x = x;
        pointLight.position.y = y;
        pointLight.position.z = z;
        pointLight.intensity = 2;
        scene.add(pointLight);
    }
    this.setup_trackball_controls = function()
    {
        controls = new THREE.TrackballControls(camera);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );
    }
    this.setup_interface = function(worker_path, ammo_path) {
        ThreePhysics.scripts.worker = (worker_path == undefined ?
                'js/physijs_worker.js' : worker_path);
        ThreePhysics.scripts.ammo = (ammo_path == undefined ?
                'ammo.js' : ammo_path);
        scene = new ThreePhysics.Scene();
        var $container = $('#container');
        renderer = new THREE.WebGLRenderer( { antialias: true,
             } );
        // canvas: $("#c")[0]
        //$(renderer.domElement).css( { borderRadius: "20px" } );
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        camera = new THREE.PerspectiveCamera(45,
                $container.width() / $container.height(), 0.1, 1000);
        camera.position.z = 300;
        renderer.setSize($container.width(), $container.height());
        $container.append(renderer.domElement);
        scene.add(camera);
        if(this.trackball_controls) this.setup_trackball_controls()
        var loader = new THREE.JSONLoader();
        if(this.use_model)
            loader.load(this.model, load_model, "img/");
    };
    function load_model(geometry) {

        /*geometry.materials[0][0].shading = THREE.FlatShading;
        geometry.materials[0][0].morphTargets = true;*/
        var material = new THREE.MeshFaceMaterial();
        mesh = new THREE.Mesh( geometry, material);
        mesh.scale.set(50, 50, 50);
        scene.add( mesh );
    }
    render = function()
    {
        if(marble == undefined) return;
        marble.position.z = 10;
        //marble.rotation.z += 0.001;
        if(!done)
        {
            
            if(marble.position.y < -99)
            {
                marble.position.y = -98;
                done = true;
                console.log("end_game");
                scene.removeEventListener('update',  game.simulate);
                end_game(marble.position);
            }
            if(marble.position.x > 51)
            {
                marble.position.x = 50;
            }
            if(marble.position.x < -51)
            {
                marble.position.x = -50; 
            }
        }
        renderer.render(scene, camera);
    }
    function get_duration()
    {
        new Date().getTime() - marble_droped_date.getTime();
    }
    function end_game(position)
    {
        var x = (position.x + 50) / 100.0;
        for(i in this.cases)
        {
            var _case = this.cases[i];
            if(i == (this.cases.length - 1) ||
                    x < _case.position)
            {
                var additional_message;
                if(game.end_game_callback != undefined)
                    additional_message = game.end_game_callback(
                            position, _case,
                            get_duration(), hit_count);
                if(additional_message == undefined)
                    additional_message = "";
                var message =
                    $("#message").css("visibility", "visible");
                if(_case.ok)
                    message.html(additional_message +
                            "<br/><br/>You won!<br/>"
                            + "<input type='button' value='next'"
                            + " onclick='next()'/>");
                else message.html(additional_message +
                        "<br/><br/>You failed!");
                return;
            }
        }
    }
    var m = function()
    {
        requestAnimFrame(m);
        if(controls != undefined) controls.update();
        render();
    }
    this.main = m;
    this.restart = function()
    {
        marble_setup(scene);
        setup_controls();
    }
    this.clean = function()
    {
        for(i in objects) scene.remove(objects[i]);
    }
    this.next = function()
    {
        var message = $("#message").css("visibility", "hidden");
        this.clean();
        var maps = MapsFactory("http");
        load_and_setup_map(scene, "1");
    }
    this.getMarble = function()
    {
        return marble;
    }
}
