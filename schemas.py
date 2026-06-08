from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from models import User, Workout, Exercise, PersonalRecord

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ('password_hash',)

class ExerciseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Exercise
        include_fk = True

class WorkoutSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Workout
        include_fk = True
    
    exercises = fields.Nested(ExerciseSchema, many=True)

class PersonalRecordSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PersonalRecord
        include_fk = True
