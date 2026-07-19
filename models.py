from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Flower(db.Model):
    __tablename__ = "flowers"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    category = db.Column(db.String(50), nullable=False)

    subcategory = db.Column(db.String(50), nullable=False)

    description = db.Column(db.Text)

    price = db.Column(db.Integer, nullable=False)

    image = db.Column(db.String(200), nullable=False)
