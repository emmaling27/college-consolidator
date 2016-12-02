from cs50 import SQL
import os
import re
from flask import Flask, flash, redirect, render_template, request, session, url_for, jsonify
from flask_session import Session
from passlib.apps import custom_app_context as pwd_context
from tempfile import gettempdir
from flask_jsglue import JSGlue


from helpers import *

# configure application
app = Flask(__name__)
JSGlue(app)

# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response


# configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = gettempdir()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# configure CS50 Library to use SQLite database
db = SQL("sqlite:///pressurecooker.db")

@app.route("/")
# @login_required
def index():

    return render_template("index.html")

@app.route("/get_started")
# @login_required
def get_started():
    
    return render_template("about.html")

@app.route("/map")
def map():
    if not os.environ.get("API_KEY"):
        raise RuntimeError("API_KEY not set")
    return render_template("map.html", key=os.environ.get("API_KEY"))
    
@app.route("/search")
def search():
    """Search for places that match query."""

    # get search parameter
    q = request.args.get("q") + "%"
    
    # get locations from places table
    locations = db.execute("SELECT * FROM places WHERE postal_code LIKE :q OR place_name LIKE :q OR admin_name1 LIKE :q OR admin_code1 LIKE :q OR country_code LIKE :q", q=q)
    
    # return json with locations to suggest
    return jsonify(locations)

@app.route("/update")
def update():
    """Find up to 10 places within view."""

    # ensure parameters are present
    if not request.args.get("sw"):
        raise RuntimeError("missing sw")
    if not request.args.get("ne"):
        raise RuntimeError("missing ne")

    # ensure parameters are in lat,lng format
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("sw")):
        raise RuntimeError("invalid sw")
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("ne")):
        raise RuntimeError("invalid ne")

    # explode southwest corner into two variables
    (sw_lat, sw_lng) = [float(s) for s in request.args.get("sw").split(",")]

    # explode northeast corner into two variables
    (ne_lat, ne_lng) = [float(s) for s in request.args.get("ne").split(",")]

    # find 10 cities within view, pseudorandomly chosen if more within view
    if (sw_lng <= ne_lng):

        # doesn't cross the antimeridian
        rows = db.execute("""SELECT INSTNM, INSTURL, LATITUDE, LONGITUDE FROM college_data
            WHERE :sw_lat <= LATITUDE AND LATITUDE <= :ne_lat AND (:sw_lng <= LONGITUDE AND LONGITUDE <= :ne_lng) ORDER BY RANDOM() LIMIT 50""",
            sw_lat=sw_lat, ne_lat=ne_lat, sw_lng=sw_lng, ne_lng=ne_lng)
            # GROUP BY country_code, place_name, admin_code1
            # ORDER BY RANDOM()
            # LIMIT 10
    else:

        # crosses the antimeridian
        rows = db.execute("""SELECT INSTNM, INSTURL, LATITUDE, LONGITUDE FROM college_data
            WHERE :sw_lat <= LATITUDE AND LATITUDE <= :ne_lat AND (:sw_lng <= LONGITUDE OR LONGITUDE <= :ne_lng) ORDER BY RANDOM() LIMIT 50""",
            sw_lat=sw_lat, ne_lat=ne_lat, sw_lng=sw_lng, ne_lng=ne_lng)
            # GROUP BY country_code, place_name, admin_code1
            # ORDER BY RANDOM()
            # LIMIT 10

    # output places as JSON
    return jsonify(rows)




@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in."""

    # forget any user_id
    session.clear()

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username")

        # ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password")

        # query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=request.form.get("username"))

        # ensure username exists and password is correct
        if len(rows) != 1 or not pwd_context.verify(request.form.get("password"), rows[0]["hash"]):
            return apology("invalid username and/or password")

        # remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # redirect user to home page
        return redirect(url_for("index"))

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

@app.route("/logout")
def logout():
    """Log user out."""

    # forget any user_id
    session.clear()

    # redirect user to login form
    return redirect(url_for("login"))