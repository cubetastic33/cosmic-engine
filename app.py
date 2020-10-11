import json
from flask import Flask, send_from_directory, render_template, request

import get_data

app = Flask(__name__)


@app.route("/")
def index():
    start = request.cookies.get("start") or "000.jpg"
    grid = ""
    bounds = ""
    figures = ""
    if start[0] == "1":
        grid = " checked"
    if start[1] == "1":
        bounds = " checked"
    if start[2] == "1":
        figures = " checked"
    return render_template("index.html", start=start, grid=grid, bounds=bounds, figures=figures)


@app.route("/search_catalogs", methods=["POST"])
def fetch_catalogs():
    service = {
        "Simple Cone Search": "SCS",
        "Simple Image Access Protocol": "SIAP",
        "Simple Spectral Access": "SSA"
    }[request.form["service"]]
    results = get_data.catalog_search(request.form["search_term"], service, 20) or ""
    return json.dumps(results)


@app.route("/name_search", methods=["POST"])
def name_search():
    service = {
        "Simple Cone Search": "SCS",
        "Simple Image Access Protocol": "SIAP",
        "Simple Spectral Access": "SSA"
    }[request.form["service"]]
    ra, dec = get_data.name_to_coords(request.form["name"])
    if ra is None:
        # If ra is None, dec is also None, and it means the name was invalid
        return json.dumps("")
    results = get_data.service_heasarc(service, request.form["id"], ra, dec, request.form["search_radius"])
    if results is not None:
        results = list(results)
        first_column = {}
        key = results[0].columns[0] if results[1] == {} else results[1][results[0].columns[0]]["desc"]
        first_column[key] = results[0][results[0].columns[0]].to_list()
        results[0] = results[0].to_json()
        results.append(first_column)
    else:
        results = ""
    return json.dumps(results)


@app.route("/coordinates_search", methods=["POST"])
def coordinates_search():
    service = {
        "Simple Cone Search": "SCS",
        "Simple Image Access Protocol": "SIAP",
        "Simple Spectral Access": "SSA"
    }[request.form["service"]]
    results = get_data.service_heasarc(service, request.form["id"], request.form["ra"], request.form["dec"], request.form["search_radius"])
    if results is not None:
        results = list(results)
        first_column = {}
        key = results[0].columns[0] if results[1] == {} else results[1][results[0].columns[0]]["desc"]
        first_column[key] = results[0][results[0].columns[0]].to_list()
        results[0] = results[0].to_json()
        results.append(first_column)
    else:
        results = ""
    return json.dumps(results)


@app.route("/scripts/<path:path>")
def send_script(path):
    return send_from_directory("static/scripts", path)


@app.route("/styles/<path:path>")
def send_styles(path):
    return send_from_directory("static/styles", path)


@app.route("/images/<path:path>")
def send_images(path):
    return send_from_directory("static/images", path)
