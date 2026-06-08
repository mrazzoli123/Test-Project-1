from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('views.dashboard'))
    return redirect(url_for('views.login'))

@views.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect(url_for('views.dashboard'))
    return render_template('login.html')

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@views.route('/create-workout')
@login_required
def create_workout():
    return render_template('create_workout.html', user=current_user)

@views.route('/workout/<int:workout_id>')
@login_required
def workout_detail(workout_id):
    return render_template('workout_detail.html', user=current_user, workout_id=workout_id)
