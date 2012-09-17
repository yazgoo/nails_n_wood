var marble;
var marble_delta = 0;
var marble_droped;
var done;
var cases;
var objects;
function image_to_map(image)
{
    var canvas = $('<canvas/>').css( {
        width: image.width + 'px',
        height: image.height + 'px'
    })[0];
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return canvas_to_map(canvas, 1);
}
function create_wood(scene, cases)
{
    var wood_material = new THREE.MeshLambertMaterial( { 
                map: THREE.ImageUtils.loadTexture(
                         'img/fst_787q223ujd_4.jpg') });
    var ok_material = new THREE.MeshLambertMaterial( { 
                map: THREE.ImageUtils.loadTexture(
                         'img/ok.png') });
    var nok_material = new THREE.MeshLambertMaterial( { 
                map: THREE.ImageUtils.loadTexture(
                         'img/nok.png') });
    var wood_back = new Physijs.BoxMesh(
            new THREE.CubeGeometry(100, 200, 10),
            wood_material, 0);
    var wood_left = new Physijs.BoxMesh(
            new THREE.CubeGeometry(5, 200, 25),
            wood_material, 0);
    wood_left.position.x = -52.5;
    wood_left.position.z = 5;
    var wood_right = new Physijs.BoxMesh(
            new THREE.CubeGeometry(5, 200, 25),
            wood_material, 0);
    wood_right.position.x = 52.5;
    wood_right.position.z = 5;
    var wood_bottom = new Physijs.BoxMesh(
            new THREE.CubeGeometry(110, 5, 25),
            wood_material, 0);
    wood_bottom.position.y = -102.5;
    wood_bottom.position.z = 5;
    for(var i in cases) {
        var case_ = new Physijs.BoxMesh(
                new THREE.CubeGeometry(5, 25, 25),
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
        //sign.receiveShadow = true;
        objects.push(sign);
        scene.add(sign);
        //sign.receiveShadow = true;
        objects.push(case_);
        scene.add(case_);
    }
    //wood_back.receiveShadow = true;
    objects.push(wood_back);
    scene.add(wood_back);
    //wood_left.receiveShadow = true;
    objects.push(wood_left);
    scene.add(wood_left);
    //wood_right.receiveShadow = true;
    objects.push(wood_right);
    scene.add(wood_right);
    //wood_bottom.receiveShadow = true;
    objects.push(wood_bottom);
    scene.add(wood_bottom);
}
function marble_setup(scene) {
    done = false;
    marble_droped = false;
    if(marble != undefined) scene.remove(marble);
    marble = new THREE.Mesh(
            new THREE.SphereGeometry(2, 20, 20),
            new THREE.MeshLambertMaterial( { color: 0x0000AA }
                ));
    marble.position.y = 100;
    marble.position.z = +10;
    marble.position.x = Math.random() * 100 - 50;
    scene.add(marble);
    console.log("added marble");
}
function marble_drop()
{
    if(marble_droped) return;
    marble_droped = true;
    var old_x = marble.position.x;
    scene.remove(marble);
    marble = new Physijs.BoxMesh(
            new THREE.SphereGeometry(2, 20, 20),
            new THREE.MeshLambertMaterial( { color: 0x0000AA }
                ));
    marble.castShadow = true;
    var last_object_collided = null;
    marble.addEventListener('collision', function(object) {
        if(object != last_object_collided) {
            console.log("collision");
            new Audio("sound/collision.ogg").play();
            last_object_collided = object;
        }
    });
    marble.rotation.z = 3.14/4;
    marble.position.y = 100;
    marble.position.z = +10;
    marble.position.x = old_x;
    scene.add(marble);
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(
            /[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                vars[key] = value;
            });
    return vars;
}
function createBoard(scene) {
    marble_setup(scene);
    if(getUrlVars()["action"] == "load_from_local_storage")
    {
        setup_map(JSON.parse(localStorage
                    ["map_" + getUrlVars()["title"]]));
    }
    else
    {
        var image = new Image();
        $(image).load(function() {
            setup_map(image_to_map(image));
        });
        image.src = "map/0.png";
    }
}
function setup_map(result)
{
    objects = [];
    var map = result.nails;
    var cases = result.cases;
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
        var nail = new Physijs.BoxMesh(nail_geometry, nail_material, 0);
        nail.rotation.x = -3.14/2;
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
function setup_controls() {
    $("#controls").html(
            '<input type="button"'
            + 'onmousedown="marble_delta = -1 + 0.1;"'
            + 'onmouseup="marble_delta = 0;"'
            + 'value="&lt;"/>'
            + '<input type="button"'
            + 'onclick="marble_drop();"'
            + 'value="drop"/>'
            + '<input type="button"'
            + 'onclick="restart();"'
            + 'value="restart"/>'
            + '<input type="button"'
            + 'onmousedown="marble_delta = 1;"'
            + 'onmouseup="marble_delta = 0;"'
            + 'value="&gt;"/>'
            + '<div id="message"></div>'
            );
}
function nails_n_wood() {
    Physijs.scripts.worker = 'js/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
    scene = new Physijs.Scene();
    var $container = $('#container');
    setup_controls();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    camera = new THREE.PerspectiveCamera(45,
            $container.width() / $container.height(), 0.1, 1000);
    camera.position.z = 300;
    renderer.setSize($container.width(), $container.height());
    $container.append(renderer.domElement);
    createBoard(scene);
    scene.add(camera);
    var pointLight = new THREE.PointLight( 0xFFFFFF );
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
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    scene.add(pointLight);
};
function render()
{
    marble.position.z = 10;
    if(!marble_droped) marble.position.x += marble_delta;
    if(marble.position.y < -96)
    {
        marble.position.y = -96;
        done = true;
        end_game(marble.position.x);
    }
    if(!done) scene.simulate();
    renderer.render(scene, camera);
}
function end_game(x)
{
    var x = x / 100.0;
    for(i in cases)
        if(i == (cases[i].length - 1) || x < cases[i].position)
        {
            var message =
                $("#message").css("visibility", "visible");
            if(cases[i].ok)
                message.html("<br/><br/>You won!<br/>"
                        + "<input type='button' value='next'"
                        + " onclick='next()'/>");
            else message.html("<br/><br/>You failed!");
        }
}
function main()
{
    requestAnimFrame(main);
    controls.update();
    render();
}
function restart()
{
    marble_setup(scene);
    setup_controls();
}
function next()
{
    var message = $("#message").css("visibility", "hidden");
    for(i in objects) scene.remove(objects[i]);
    var image = new Image();
    $(image).load(function() {
        setup_map(image_to_map(image));
    });
    image.src = "map/1.png";
    marble_setup(scene);
}
