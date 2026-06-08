from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Workout, Exercise, PersonalRecord
from schemas import WorkoutSchema, ExerciseSchema, PersonalRecordSchema

api = Blueprint('api', __name__)

workout_schema = WorkoutSchema()
workouts_schema = WorkoutSchema(many=True)
exercise_schema = ExerciseSchema()
personal_record_schema = PersonalRecordSchema()
personal_records_schema = PersonalRecordSchema(many=True)

# Workouts API
@api.route('/workouts', methods=['GET'])
@login_required
def get_workouts():
    workouts = Workout.query.filter_by(user_id=current_user.id).order_by(Workout.date_created.desc()).all()
    return jsonify(workouts_schema.dump(workouts))

@api.route('/workouts', methods=['POST'])
@login_required
def create_workout():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"message": "Workout name is required"}), 400
    
    new_workout = Workout(name=name, user_id=current_user.id)
    db.session.add(new_workout)
    db.session.commit()
    
    return jsonify(workout_schema.dump(new_workout)), 201

@api.route('/workouts/<int:workout_id>', methods=['GET'])
@login_required
def get_workout(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
    return jsonify(workout_schema.dump(workout))

@api.route('/workouts/<int:workout_id>', methods=['DELETE'])
@login_required
def delete_workout(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
    db.session.delete(workout)
    db.session.commit()
    return '', 204

# Exercises API
@api.route('/workouts/<int:workout_id>/exercises', methods=['POST'])
@login_required
def add_exercise(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user.id).first_or_404()
    
    data = request.get_json()
    new_exercise = Exercise(
        name=data.get('name'),
        sets=data.get('sets', 1),
        reps=data.get('reps', 1),
        weight=data.get('weight', 0.0),
        workout_id=workout.id
    )
    
    db.session.add(new_exercise)
    db.session.commit()
    
    # Update PR if necessary
    pr = PersonalRecord.query.filter_by(user_id=current_user.id, exercise_name=new_exercise.name).first()
    if not pr:
        pr = PersonalRecord(user_id=current_user.id, exercise_name=new_exercise.name, max_weight=new_exercise.weight)
        db.session.add(pr)
    elif new_exercise.weight > pr.max_weight:
        pr.max_weight = new_exercise.weight
    
    db.session.commit()
    
    return jsonify(exercise_schema.dump(new_exercise)), 201

@api.route('/exercises/<int:exercise_id>', methods=['DELETE'])
@login_required
def delete_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)
    # Check ownership via workout
    workout = Workout.query.get(exercise.workout_id)
    if not workout or workout.user_id != current_user.id:
        return jsonify({"message": "Unauthorized"}), 403
        
    db.session.delete(exercise)
    db.session.commit()
    return '', 204

# Personal Records API
@api.route('/personal-records', methods=['GET'])
@login_required
def get_personal_records():
    prs = PersonalRecord.query.filter_by(user_id=current_user.id).all()
    return jsonify(personal_records_schema.dump(prs))

@api.route('/personal-records/<int:pr_id>', methods=['PUT'])
@login_required
def update_personal_record(pr_id):
    pr = PersonalRecord.query.filter_by(id=pr_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if 'max_weight' in data:
        pr.max_weight = float(data['max_weight'])
        db.session.commit()
        return jsonify(personal_record_schema.dump(pr))
        
    return jsonify({"message": "max_weight is required"}), 400
