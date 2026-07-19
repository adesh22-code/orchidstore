from flask import Flask, render_template, request, redirect, url_for, session
from models import db, Flower

app = Flask(__name__)

# Secret Key
app.secret_key = "change_this_to_a_random_secret_key"

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///flowers.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize Database
db.init_app(app)

# Create Tables
with app.app_context():
    db.create_all()


# ===========================
# Home Page
# ===========================
@app.route("/")
def home():
    flowers = Flower.query.all()
    return render_template("index.html", flowers=flowers)


# ===========================
# Admin Login
# ===========================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        if username == "admin" and password == "orchid123":
            session["admin"] = True
            return redirect(url_for("dashboard"))

        return "Invalid Username or Password"

    return render_template("admin/login.html")


# ===========================
# Dashboard
# ===========================
@app.route("/admin/dashboard")
def dashboard():

    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    flowers = Flower.query.all()

    return render_template("admin/dashboard.html", flowers=flowers)


@app.route("/admin/add-flower")
def add_flower():

    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    return render_template("admin/add_flower.html")


# ===========================
# Logout
# ===========================
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("admin_login"))


# ===========================
# Run Application
# ===========================
if __name__ == "__main__":
    app.run(debug=True)
