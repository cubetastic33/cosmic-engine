/*var camera, scene, renderer;
var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
var element = document.getElementById("demo");
var fov = 70; // Field of View
var lon = 0;
var lat = 0;
var phi = 0;
var theta = 0;
var onMouseDownMouseX = 0;
var onMouseDownMouseY = 0;
var onMouseDownLon = 0;
var onMouseDownLat = 0;
var width = window.innerWidth;
var height = window.innerHeight;
var ratio = width / height;

var texture = new THREE.TextureLoader().load("/images/starmap.jpg");
init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(80, 60, 40);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    element.appendChild(renderer.domElement);

    element.addEventListener('mousedown', onDocumentMouseDown, false);
    element.addEventListener('mousewheel', onDocumentMouseWheel, false);
    element.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResized, false);
    onWindowResized(null);
}

function onWindowResized(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    element.addEventListener('mousemove', onDocumentMouseMove, false);
    element.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
}

function onDocumentMouseUp(event) {
    element.removeEventListener('mousemove', onDocumentMouseMove, false);
    element.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {
    // WebKit
    if (event.wheelDeltaY) {
        fov -= event.wheelDeltaY * 0.05;
        // Opera / Explorer 9
    } else if (event.wheelDelta) {
        fov -= event.wheelDelta * 0.05;
        // Firefox
    } else if (event.detail) {
        fov += event.detail * 1.0;
    }
    if (fov < 45 || fov > 90) {
        fov = (fov < 45) ? 45 : 90;
    }
    camera.fov = fov;
    camera.updateProjectionMatrix();
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}*/


var camera, scene, renderer;
var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
var element = document.getElementById("demo");
var fov = 70; // Field of View
var lon = 0;
var lat = 0;
var phi = 0;
var theta = 0;
var onMouseDownMouseX = 0;
var onMouseDownMouseY = 0;
var onMouseDownLon = 0;
var onMouseDownLat = 0;
var width = window.innerWidth;
var height = window.innerHeight;
var ratio = width / height;

var texture = THREE.ImageUtils.loadTexture("/images/starmap.jpg", new THREE.UVMapping(), function() {
    init();
    animate();
});

function init() {
    camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(500, 60, 40);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
    mesh.scale.x = -1;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    element.appendChild(renderer.domElement);
    element.addEventListener('mousedown', onDocumentMouseDown, false);
    element.addEventListener('mousewheel', onDocumentMouseWheel, false);
    element.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResized, false);
    onWindowResized(null);
}

function onWindowResized(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
    element.addEventListener('mousemove', onDocumentMouseMove, false);
    element.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
    element.removeEventListener('mousemove', onDocumentMouseMove, false);
    element.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {
    // WebKit
    if (event.wheelDeltaY) {
        fov -= event.wheelDeltaY * 0.05;
        // Opera / Explorer 9
    } else if (event.wheelDelta) {
        fov -= event.wheelDelta * 0.05;
        // Firefox
    } else if (event.detail) {
        fov += event.detail * 1.0;
    }
    if (fov < 45 || fov > 90) {
        fov = (fov < 45) ? 45 : 90;
    }
    camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

$("header button").click(function() {
    $("#search-dialog").show();
    $("header").hide();
});

$("#close").click(function() {
    $("header").show();
    $("#search-dialog").hide();
});

$("#buttons button").click(function() {
    $("#buttons").hide();
    $("#results").show();
});

$(".result").click(function() {
    $("#results").hide();
    $("#search").show();
});
