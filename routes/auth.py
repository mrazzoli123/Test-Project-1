from flask import Blueprint, request, jsonify, redirect, url_for
from flask_login import login_user, logout_user, login_required
from models import db, User

auth = Blueprint('auth', __name__)

@auth.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid username or password"}), 401

    login_user(user)
    return jsonify({"message": "Logged in successfully", "redirect": url_for('views.dashboard')})

@auth.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)
    return jsonify({"message": "Registered successfully", "redirect": url_for('views.dashboard')}), 201

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('views.login'))
