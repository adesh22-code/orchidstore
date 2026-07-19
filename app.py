from flask import Flask, render_template
from models import db, Flower
from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)

# SQLite Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flowers.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize Database
db.init_app(app)

# Create database tables automatically
with app.app_context():
    db.create_all()


@app.route("/")
def home():
    flowers = Flower.query.all()
    return render_template("index.html", flowers=flowers)


if __name__ == "__main__":
    app.run(debug=True)


app.secret_key = "change_this_to_a_random_secret_key"

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():

    if request.method == "POST":

        username = request.form["username"]
        password = request.form["password"]

        if username == "admin" and password == "orchid123":

            session["admin"] = True

            return redirect(url_for("dashboard"))

        return "Invalid Username or Password"

    return render_template("admin/login.html")


@app.route("/admin/dashboard")
def dashboard():

    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    flowers = Flower.query.all()

    return render_template("admin/dashboard.html", flowers=flowers)


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("admin_login"))
