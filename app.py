from flask import Flask, render_template
from models import db, Flower

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
