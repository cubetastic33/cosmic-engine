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

var texture = THREE.ImageUtils.loadTexture("/images/" + $("#demo").attr("data-start"), new THREE.UVMapping(), function() {
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

$(".toggle").click(function() {
    var image = $("#demo").attr("data-start").split(".")[0].split("");
    var index = parseInt($(this).attr("data-toggle"));
    image[index] = (image[index] === "0") + 1 - 1;
    document.cookie = "start=" + image.join("") + ".jpg"
    location.reload();
});

$("#service").click(function() {
    $("#search-dialog").show();
    $("#service").hide();
});

$("#close").click(function() {
    $("#service").show();
    $("#search-dialog").hide();
});

function search_catalogs() {
    var search_term = $("#catalog-search").val();
    $.post("/search_catalogs", { search_term: search_term, service: $("#results").attr("data-service") }).done(function(results) {
        $("#results").html(`<button id="back-to-buttons" class="back">←</button>
            <div id="catalog-search-bar">
                <input id="catalog-search" type="text">
                <button>search</button>
            </div>`);
        $("#catalog-search").val(search_term);

        $("#back-to-buttons").click(() => {
            $("#results").hide();
            $("#buttons").show();
        });

        $("#catalog-search").keyup(e => {
            if (e.keyCode === 13) {
                search_catalogs();
            }
        });

        $("#catalog-search-bar button").click(search_catalogs);

        $("#buttons").hide();
        $("#results").show();
        $("#catalog-search").focus();

        if (!results) {
            $("#results").append("<br><p style=\"text-align: center\">No results</p>");
            return;
        }

        results = JSON.parse(results);
        for (var i = 0; i < results.length; i++) {
            $("#results").append(`<div class="result" data-id="${results[i]["id"]}">
                <h3>${i + 1}. ${results[i]["name"]}</h3>
                <p>
                    <b>ID:</b> ${results[i]["id"]}
                </p>
                <p>
                    <b>Title:</b> ${results[i]["name"]}
                </p>
                <p>
                    <b>Short Name:</b> ${results[i]["short-name"]}
                </p>
                <p>
                    <b>Date:</b> ${results[i]["date"]}
                </p>
                <p>
                    <b>Publisher:</b> ${results[i]["publisher"]}
                </p>
                <p>
                    <b>Description:</b> ${results[i]["desc"].replaceAll("&lt;", "<").replaceAll("&gt;", ">")}
                </p>
            </div>`);
        }

        $(".result").click(function() {
            $("#results").hide();
            $("#search").attr("data-id", $(this).attr("data-id"));
            $("#search").show();
        });
    });
}

$("#buttons button").click(function() {
    $("#results").attr("data-service", $(this).text());
    search_catalogs();
});

$("#name-search").click(() => {
    if (!$("#search-radius").val()) {
        alert("Please enter a search radius");
        return;
    } else if (!$("#name").val()) {
        alert("Please enter a name");
        return;
    }

    $("#name-search").prop("disabled", true);
    $("#coordinates-search").prop("disabled", true);

    $.post("/name_search", {
        service: $("#results").attr("data-service"),
        id: $("#search").attr("data-id"),
        name: $("#name").val(),
        search_radius: $("#search-radius").val(),
    }).done(results => {
        render_catalog(results);
    });
});

$("#coordinates-search").click(() => {
    if (!$("#search-radius").val()) {
        alert("Please enter a search radius");
        return;
    } else if (!$("#right-ascension").val()) {
        alert("Please enter a value for the right ascension");
        return;
    } else if (!$("#declination").val()) {
        alert("Please enter a value for the declination");
        return;
    }

    $("#name-search").prop("disabled", true);
    $("#coordinates-search").prop("disabled", true);

    $.post("/coordinates_search", {
        service: $("#results").attr("data-service"),
        id: $("#search").attr("data-id"),
        ra: $("#right-ascension").val(),
        dec: $("#declination").val(),
        search_radius: $("#search-radius").val(),
    }).done(results => {
        render_catalog(results);
    });
});

function render_catalog(results) {
    results = JSON.parse(results);

    $("#search").hide();

    $("#name-search").prop("disabled", false);
    $("#coordinates-search").prop("disabled", false);

    $("#catalog").html("<button id=\"back-to-search\" class=\"back\">←</button><h3>Search Results</h3>");
    $("#catalog").show();

    $("#back-to-search").click(() => {
        $("#catalog").empty();
        $("#catalog").hide();
        $("#search").show();
    });

    if (!results) {
        $("#catalog").append("<br><p style=\"text-align: center\">Invalid name (not found in Sesame)</p>");
        return;
    }

    console.log(results);
    results[0] = JSON.parse(results[0]);
    $("#catalog").attr("data-results", JSON.stringify(results));
    console.log(results);

    var key = Object.keys(results[3])[0];
    $("#catalog").append(`<a href="${results[2]}">Download raw XML</a><br><br><table><thead><tr><th>Displayed: ${key}</th></thead><tbody></tbody></table>`);

    for (var i = 0; i < results[3][key].length; i++) {
        $("#catalog tbody").append(`<tr><td data-index="${i}">${results[3][key][i]}</td></tr>`);
    }

    $("#catalog td").click(function() {
        $("#catalog-result").show();
        var results = JSON.parse($("#catalog").attr("data-results"));
        console.log("fewfwefwe", results);
        var index = $(this).attr("data-index");
        var keys = Object.keys(results[0]);
        var csv = keys.join(",") + "\n";
        var values = [];
        $("#close-catalog-result").click(() => $("#catalog-result").hide());
        $("#catalog-result").html("<button id=\"close-catalog-result\" class=\"close\">x</button><div></div><ul></ul>");
        for (var i = 0; i < keys.length; i++) {
            $("#catalog-result ul").append(`<li><b>${keys[i]}:</b> ${results[0][keys[i]][index]}</li>`);
            // Populate the CSV file
            values.push(results[0][keys[i]][index]);
        }
        csv += values.join(",");
        $("#catalog-result div").html(`
            <a href="data:text/csv;charset=utf-8,${encodeURI(csv)}" target="_blank" download="catalog_result.csv">
                Download as CSV
            </a>`);
        $("#catalog-result").append(`<img src="${results[0]["URL"][index]}" alt="image">`);
    });
}

$("#back-to-results").click(() => {
    $("#search").hide();
    $("#results").show();
});

setInterval(() => {
    var today = new Date();
    var date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    var time = `${today.getHours().toString().padStart(2, "0")}:${today.getMinutes().toString().padStart(2, "0")}:${today.getSeconds().toString().padStart(2, "0")}`;
    $("#time").html(date + "&nbsp;&nbsp;&nbsp;" + time);
}, 1000);
