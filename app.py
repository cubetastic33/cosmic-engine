import json
from flask import Flask, send_from_directory, request

import get_data

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("templates", "index.html")


@app.route("/search_catalogs", methods=["POST"])
def fetch_catalogs():
    service = {
        "Simple Cone Search": "SCS",
        "Simple Image Access Protocol": "SIAP",
        "Simple Spectral Access": "SSA"
    }[request.form["service"]]
    return get_data.catalog_search(request.form["search_term"], service)


@app.route("/scripts/<path:path>")
def send_script(path):
    return send_from_directory("static/scripts", path)


@app.route("/styles/<path:path>")
def send_styles(path):
    return send_from_directory("static/styles", path)


@app.route("/images/<path:path>")
def send_images(path):
    return send_from_directory("static/images", path)
