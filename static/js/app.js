document.addEventListener('DOMContentLoaded', () => {
    
    // ----- AUTHENTICATION ----- //
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                
                if (res.ok) {
                    window.location.href = data.redirect;
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.classList.remove('is-hidden');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const errorDiv = document.getElementById('login-error');

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                
                if (res.ok) {
                    window.location.href = data.redirect;
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.classList.remove('is-hidden');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // ----- DASHBOARD ----- //
    const workoutsContainer = document.getElementById('workouts-container');
    const prsContainer = document.getElementById('prs-container');

    if (workoutsContainer && prsContainer) {
        loadDashboardData();
    }

    async function loadDashboardData() {
        try {
            // Load Workouts
            const workoutsRes = await fetch('/api/workouts');
            const workouts = await workoutsRes.json();
            
            workoutsContainer.innerHTML = '';
            if (workouts.length === 0) {
                workoutsContainer.innerHTML = '<div class="notification is-light">You have no workouts yet. Create one to get started!</div>';
            } else {
                workouts.forEach(workout => {
                    const date = new Date(workout.date_created).toLocaleDateString();
                    const card = document.createElement('div');
                    card.className = 'card mb-4';
                    card.innerHTML = `
                        <div class="card-content">
                            <div class="is-flex is-justify-content-space-between is-align-items-center">
                                <div>
                                    <h3 class="title is-5 mb-1">${workout.name}</h3>
                                    <p class="subtitle is-7 has-text-grey">${date} • ${workout.exercises ? workout.exercises.length : 0} exercises</p>
                                </div>
                                <a href="/workout/${workout.id}" class="button is-small is-light is-link">View</a>
                            </div>
                        </div>
                    `;
                    workoutsContainer.appendChild(card);
                });
            }

            // Load PRs
            const prsRes = await fetch('/api/personal-records');
            const prs = await prsRes.json();
            
            prsContainer.innerHTML = '';
            if (prs.length === 0) {
                prsContainer.innerHTML = '<p class="has-text-grey-light is-size-7">No PRs yet. Log some exercises to track them.</p>';
            } else {
                prs.forEach(pr => {
                    const item = document.createElement('div');
                    item.className = 'pr-item';
                    item.innerHTML = `
                        <span class="has-text-weight-bold">${pr.exercise_name}</span>
                        <div class="is-flex is-align-items-center">
                            <span class="tag is-primary is-light is-medium mr-2" id="pr-val-${pr.id}">${pr.max_weight} kg</span>
                            <button class="button is-small is-white pr-edit-btn" data-id="${pr.id}" data-weight="${pr.max_weight}">
                                <i class="fas fa-edit has-text-grey"></i>
                            </button>
                        </div>
                    `;
                    prsContainer.appendChild(item);
                });

                // Attach edit handlers
                document.querySelectorAll('.pr-edit-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.currentTarget.dataset.id;
                        const currentWeight = e.currentTarget.dataset.weight;
                        const newWeight = prompt("Enter new max weight (kg):", currentWeight);
                        if (newWeight && !isNaN(newWeight) && newWeight !== currentWeight) {
                            await updatePR(id, newWeight);
                        }
                    });
                });
            }

        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    }

    async function updatePR(id, weight) {
        try {
            const res = await fetch(`/api/personal-records/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ max_weight: weight })
            });
            if (res.ok) {
                loadDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    }

    // ----- CREATE WORKOUT ----- //
    const createWorkoutForm = document.getElementById('create-workout-form');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exercisesList = document.getElementById('exercises-list');
    const template = document.getElementById('exercise-row-template');

    if (createWorkoutForm && addExerciseBtn) {
        // Add one empty row initially
        addExerciseRow();

        addExerciseBtn.addEventListener('click', addExerciseRow);

        createWorkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('workout-name').value;
            
            // Create the workout
            try {
                const wRes = await fetch('/api/workouts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                
                if (wRes.ok) {
                    const workout = await wRes.json();
                    
                    // Gather exercises and add them
                    const exerciseRows = document.querySelectorAll('.exercise-row');
                    for (const row of exerciseRows) {
                        const exName = row.querySelector('.ex-name').value;
                        const sets = row.querySelector('.ex-sets').value;
                        const reps = row.querySelector('.ex-reps').value;
                        const weight = row.querySelector('.ex-weight').value;
                        
                        if (exName) {
                            await fetch(`/api/workouts/${workout.id}/exercises`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: exName, sets, reps, weight })
                            });
                        }
                    }
                    
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    const errorData = await wRes.json();
                    alert("Error saving workout: " + (errorData.message || "Unknown error"));
                }
            } catch (err) {
                alert("Network error while saving workout.");
                console.error(err);
            }
        });

        function addExerciseRow() {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.remove-exercise-btn').addEventListener('click', (e) => {
                e.target.closest('.exercise-row').remove();
            });
            
            exercisesList.appendChild(clone);
        }
    }

    // ----- WORKOUT DETAIL ----- //
    const workoutHeader = document.getElementById('workout-header');
    
    if (workoutHeader && typeof currentWorkoutId !== 'undefined') {
        loadWorkoutDetail(currentWorkoutId);

        document.getElementById('delete-workout-btn').addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this workout?")) {
                try {
                    const res = await fetch(`/api/workouts/${currentWorkoutId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        window.location.href = '/dashboard';
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });

        const addExForm = document.getElementById('add-exercise-form');
        addExForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-ex-name').value;
            const sets = document.getElementById('new-ex-sets').value;
            const reps = document.getElementById('new-ex-reps').value;
            const weight = document.getElementById('new-ex-weight').value;

            try {
                const res = await fetch(`/api/workouts/${currentWorkoutId}/exercises`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, sets, reps, weight })
                });
                
                if (res.ok) {
                    // Reset form and reload list
                    addExForm.reset();
                    loadWorkoutDetail(currentWorkoutId);
                } else {
                    const errorData = await res.json();
                    alert("Error adding exercise: " + (errorData.message || "Unknown error"));
                }
            } catch (err) {
                alert("Network error while adding exercise.");
                console.error(err);
            }
        });
    }

    async function loadWorkoutDetail(id) {
        try {
            const res = await fetch(`/api/workouts/${id}`);
            if (!res.ok) {
                window.location.href = '/dashboard';
                return;
            }
            const workout = await res.json();
            
            document.getElementById('workout-title').textContent = workout.name;
            document.getElementById('workout-date').textContent = new Date(workout.date_created).toLocaleDateString();

            const exList = document.getElementById('exercises-list');
            exList.innerHTML = '';
            
            if (!workout.exercises || workout.exercises.length === 0) {
                exList.innerHTML = '<p class="has-text-grey-light is-size-7">No exercises in this workout.</p>';
            } else {
                const table = document.createElement('table');
                table.className = 'table is-fullwidth is-striped';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Sets</th>
                            <th>Reps</th>
                            <th>Weight</th>
                            <th class="has-text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workout.exercises.map(ex => `
                            <tr>
                                <td class="has-text-weight-bold">${ex.name}</td>
                                <td>${ex.sets}</td>
                                <td>${ex.reps}</td>
                                <td>${ex.weight} kg</td>
                                <td class="has-text-right">
                                    <button class="button is-small is-danger is-light delete-ex-btn" data-id="${ex.id}">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                exList.appendChild(table);

                document.querySelectorAll('.delete-ex-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const exId = e.currentTarget.dataset.id;
                        if (confirm('Delete this exercise?')) {
                            await deleteExercise(exId, id);
                        }
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteExercise(exId, workoutId) {
        try {
            const res = await fetch(`/api/exercises/${exId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                loadWorkoutDetail(workoutId);
            }
        } catch (err) {
            console.error(err);
        }
    }
});
