App description:
Build me a web application designed to create workouts and track progress in the gym. 
Users should be able to:
- Login and register
- Create different workouts
- Add exercises to the workout plan
- Track personal records in selected exercises.

Workout creation flow: 
1. User can create a workout 
2. User can add exercises to the workout
3. User can track progress in the workout

On the main page users see their created workouts and a status for their maxes that they can edit, when they hit a new max.

When the user clicks on the create workout button, the user is redirected to a page where they can create a workout.

When a user selects a workout from the list of workouts, the user sees the exercises in that workout and is able to edit it if the user wants.

Develope the application using python flask for the backend and html/css/js for the frontend. 
Use SQLAlchemy to design a relational database schema for the app.

Use bulma for styling the application.

Secure Authentication: * Integrated Google OAuth 2.0 for industry-standard secure user login, utilizing Flask-Login for session management.

Established an Admin Authorization layer based on unique Google IDs to protect sensitive operations like creating or deleting community tasks.

Automated Data Serialization: Leveraged Marshmallow and flask-marshmallow to automatically convert complex database models into JSON format for seamless frontend integration.

Comprehensive REST API Endpoints: Built full CRUD functionality (Create, Read, Update, Delete) for task management.

Dynamic Data Fetching: Utilizes the JavaScript Fetch API with async/await patterns

Start by builing the core of the application. Make it simple, nothing fancy and make the code look readable and organized.