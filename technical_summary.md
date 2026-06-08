# Technical Summary: Gym Progress Tracker (Test-Project-1)

This document provides a technical overview of the web application built in the `Test-Project-1` directory. The application is a Gym Progress Tracker that allows users to register, log in, create workouts, and track personal records.

## Architecture & Technology Stack

- **Backend Framework:** Python with Flask
- **Frontend:** HTML, CSS (Bulma framework), and vanilla JavaScript
- **Database:** SQLite (`gym.db`)
- **ORM (Object-Relational Mapping):** Flask-SQLAlchemy
- **Data Serialization:** Marshmallow (`flask-marshmallow`, `marshmallow-sqlalchemy`)
- **Authentication & Session Management:** Flask-Login and Werkzeug (`werkzeug.security`)
- **Environment Management:** `python-dotenv` for environment variable loading.

## Application Structure

The backend follows a modular, blueprint-based architecture:
- `app.py`: Application factory, database initialization, and blueprint registration.
- `models.py`: Defines the SQLAlchemy database schemas.
- `schemas.py`: Defines the Marshmallow schemas used for JSON serialization and deserialization.
- `routes/api.py`: Contains RESTful API endpoints for managing workouts, exercises, and personal records.
- `routes/auth.py`: Contains API endpoints for user registration, login, and logout.
- `routes/views.py`: Serves the HTML frontend pages.

## Database Models

The relational schema is built with SQLAlchemy and includes four primary entities:

1. **User:** 
   - Fields: `id`, `username`, `password_hash`
   - Handles authentication and has one-to-many relationships with `Workout` and `PersonalRecord`.
2. **Workout:** 
   - Fields: `id`, `name`, `date_created`, `user_id` (Foreign Key)
   - Represents a specific workout routine and cascades deletions to associated `Exercise` records.
3. **Exercise:** 
   - Fields: `id`, `name`, `sets`, `reps`, `weight`, `workout_id` (Foreign Key)
   - Represents an individual exercise within a workout.
4. **PersonalRecord:** 
   - Fields: `id`, `exercise_name`, `max_weight`, `user_id` (Foreign Key)
   - Tracks a user's best performance on a specific exercise.

## API & Communication

The frontend communicates with the backend via a RESTful JSON API using the JavaScript Fetch API. 

**Key API Endpoints:**
- **Authentication:** `POST /api/register`, `POST /api/login`, `GET /logout`
- **Workouts:** `GET /api/workouts`, `POST /api/workouts` (and dynamic routes for specific IDs)
- **Data Serialization:** Database models are automatically converted into JSON structures using Marshmallow schemas (e.g., `WorkoutSchema`, `ExerciseSchema`) before being sent to the frontend.

## Security & Authentication

- **Password Hashing:** Passwords are hashed before storage using `generate_password_hash` and verified with `check_password_hash` via Werkzeug.
- **Session Management:** Built with `flask-login`. Protected endpoints require authentication using the `@login_required` decorator. User state is loaded via `@login_manager.user_loader`.
*(Note: While the `desription.md` mentions Google OAuth 2.0 integration, the current codebase implements native username/password authentication).*
