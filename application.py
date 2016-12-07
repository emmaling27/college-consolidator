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
    
@app.route("/calendar")
# @login_required
def calendar():
    
    return render_template("calendar.html")

@app.route("/map")
@login_required
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

    
    
@app.route("/sign_up", methods=["GET", "POST"])
def sign_up():
    """Register user."""
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
        username = request.form.get("username")
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=username)

        # ensure username is not already taken
        if len(rows) != 0:
            return apology("username already taken")
        
        # ensure passwords match
        if not request.form.get("password") == request.form.get("password_again"):
            return apology("passwords don't match")

        # encrypt password
        hash = pwd_context.encrypt(request.form.get("password"))
        
        # add user to database
        db.execute("INSERT INTO users (username, hash) VALUES(:username, :hash)", username=username, hash=hash)

        # remember which user has logged in
        user_id = db.execute("SELECT id FROM users WHERE username = :username", username=username)
        session["user_id"] = user_id[0]["id"]

        # create table for user's colleges
        db.execute("CREATE TABLE :id ('name' TEXT,'adrate' NUMERIC, 'SAT' INTEGER, 'ACT' INTEGER, 'location' TEXT)", id=str(session["user_id"]))
        # redirect user to home page
        return redirect(url_for("index"))

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("sign_up.html")


@app.route("/update")
def update():
    """Find colleges within view."""

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
    
    # make conditions string to use in SQL query
    q_condition = ''
    
    # get conditions
    public = int(request.args.get("public"))
    private = int(request.args.get("private"))
    twoyr = int(request.args.get("2yr"))
    fouryr = int(request.args.get("4yr"))
    grad = int(request.args.get("grad"))
    # urban = int(request.args.get("urban"))
    # suburban = int(request.args.get("suburban"))
    # rural = int(request.args.get("rural"))
    small = int(request.args.get("small"))
    medium = int(request.args.get("medium"))
    large = int(request.args.get("large"))

    # handle control of school (public vs private)
    if public == 0 or private == 0:
        if public == 1:
            q_condition += 'AND CONTROL=1 '
    
        elif private == 1:
            q_condition += 'AND (CONTROL=2 OR CONTROL=3) '
        
    # handle type of degrees primarily earned
    if twoyr == 0 or fouryr == 0 or grad == 0:
        if twoyr == 1:
            if fouryr == 1:
                q_condition += 'AND (PREDDEG=2 OR PREDDEG=3) '
            elif grad == 1:
                q_condition += 'AND (PREDDEG=2 OR PREDDEG=4) '
            else:
                q_condition += 'AND PREDDEG=2 '
        elif fouryr == 1:
            if grad == 1:
                q_condition += 'AND (PREDDEG=3 OR PREDDEG=4) '
            else:
                q_condition += 'AND PREDDEG=3 '
        elif grad == 1:
            q_condition += 'AND PREDDEG=4 '

    # handle size of school
    if small == 0 or medium == 0 or large == 0:
        if small == 1:
            if medium == 1:
                q_condition += 'AND CCSIZSET BETWEEN 1 AND 14 AND CCSIZSET != 5 '
            elif large == 1:
                q_condition += 'AND (CCSIZSET <= 2 OR (CCSIZSET >= 5 AND CCSIZSET <=12) OR (CCSIZSET BETWEEN 15 AND 17)) '
            else:
                q_condition += 'AND ((CCSIZSET BETWEEN 6 AND 11) OR CCSIZSET=1 OR CCSIZSET=2) '
        elif medium == 1:
            if large == 1:
                q_condition += 'AND ((CCSIZSET BETWEEN 3 AND 5) OR (CCSIZSET BETWEEN 12 AND 17)) '
            else:
                q_condition += 'AND (CCSIZSET=3 OR CCSIZSET=4 OR CCSIZSET BETWEEN 12 AND 14) '
        elif large == 1:
            q_condition += 'AND (CCSIZSET=5 OR CCSIZSET BETWEEN 15 AND 17) '
    
    
    # find colleges within view
    # rows = db.execute("""SELECT INSTNM, INSTURL, LATITUDE, LONGITUDE FROM college_data
    #         WHERE :sw_lat <= LATITUDE AND LATITUDE <= :ne_lat AND (:sw_lng <= LONGITUDE
    #         AND LONGITUDE <= :ne_lng) :condition ORDER BY ADM_RATE ASC LIMIT 50""",
    #         sw_lat=sw_lat, ne_lat=ne_lat, sw_lng=sw_lng, ne_lng=ne_lng, condition=condition)
    rows = db.execute("""SELECT INSTNM, INSTURL, LATITUDE, LONGITUDE FROM college_data
            WHERE {} <= LATITUDE AND LATITUDE <= {} AND ({} <= LONGITUDE
            AND LONGITUDE <= {}) {} ORDER BY ADM_RATE ASC LIMIT 50""".format(sw_lat, ne_lat, sw_lng, ne_lng, q_condition))
    
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
    

@app.route("/addcolleges")
def addcolleges():
    """Add college to table of saved colleges."""
    
    # get college name
    INSTNM = request.args.get("INSTNM")
    
    # add college details to user's table
    db.execute("INSERT INTO :user_id ('name', 'location', 'adrate', 'SAT', 'ACT') SELECT INSTNM, CITY, ADM_RATE, SAT_AVG, ACTCMMID FROM college_data WHERE INSTNM=:INSTNM", user_id=str(session["user_id"]), INSTNM=INSTNM)
    
    return render_template("mycolleges.html")
    
@app.route("/mycolleges")
def mycolleges():
    colleges = db.execute("SELECT * FROM :user_id", user_id=str(session["user_id"]))
    return render_template("mycolleges.html", colleges=colleges)
