import json
from flask import Flask, render_template, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("templates", "index.html")

@app.route("/fetch_catalogs", methods=["POST"])
def fetch_catalogs():
    return json.dumps([{"catalog_id": "foo", "title": "bar"}])


@app.route("/scripts/<path:path>")
def send_script(path):
    return send_from_directory("static/scripts", path)


@app.route("/styles/<path:path>")
def send_styles(path):
    return send_from_directory("static/styles", path)


@app.route("/images/<path:path>")
def send_images(path):
    return send_from_directory("static/images", path)
