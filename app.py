from flask import Flask, render_template, request, redirect, url_for, session
from models import db, Flower
import os
from uuid import uuid4
from PIL import Image

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/uploads"

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


@app.route("/admin/add-flower", methods=["GET", "POST"])
def add_flower():

    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    if request.method == "POST":

        name = request.form["name"]
        category = request.form["category"]
        subcategory = request.form["subcategory"]
        price = request.form["price"]
        description = request.form["description"]

        image = request.files["image"]

        filename = ""

        if image and image.filename != "":

            ext = image.filename.rsplit(".", 1)[1].lower()

            filename = f"{uuid4().hex}.{ext}"

            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

            img = Image.open(image)

            img.thumbnail((800, 800))

            img.save(filepath, quality=85)

        flower = Flower(
            name=name,
            category=category,
            subcategory=subcategory,
            description=description,
            price=int(price),
            image=filename
        )

        db.session.add(flower)
        db.session.commit()

        return redirect(url_for("dashboard"))

    return render_template("admin/add_flower.html")



@app.route("/admin/edit-flower/<int:flower_id>", methods=["GET", "POST"])
def edit_flower(flower_id):

    if not session.get("admin"):
        return redirect(url_for("admin_login"))

    flower = Flower.query.get_or_404(flower_id)

    if request.method == "POST":

        flower.name = request.form["name"]
        flower.category = request.form["category"]
        flower.subcategory = request.form["subcategory"]
        flower.price = int(request.form["price"])
        flower.description = request.form["description"]

        image = request.files.get("image")

        # New image uploaded
        if image and image.filename != "":

            # Delete old image
            if flower.image:

                old_path = os.path.join(
                    app.config["UPLOAD_FOLDER"],
                    flower.image
                )

                if os.path.exists(old_path):
                    os.remove(old_path)

            # Save new image
            ext = image.filename.rsplit(".", 1)[1].lower()

            filename = f"{uuid4().hex}.{ext}"

            filepath = os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )

            img = Image.open(image)

            img.thumbnail((800, 800))

            img.save(filepath, quality=85)

            flower.image = filename

        db.session.commit()

        return redirect(url_for("dashboard"))

    return render_template(
        "admin/edit_flower.html",
        flower=flower
    )


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
    app.run(host="0.0.0.0", port=5000, debug=True)
