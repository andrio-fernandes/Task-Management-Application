const API_URL = "http://localhost:5000/api/auth";
const TASK_API = "http://localhost:5000/api/tasks";

const token = localStorage.getItem("token");


// ======================
// REGISTER
// ======================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            alert(data.message);

            window.location.href = "login.html";

        } catch (error) {

            console.log(error);

            alert("Registration failed");

        }

    });

}


// ======================
// LOGIN
// ======================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        try {

            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log(data);

            if (data.token) {

                localStorage.setItem("token", data.token);

                alert("Login Successful");

                window.location.href = "dashboard.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Login failed");

        }

    });

}


// ======================
// PROTECT DASHBOARD
// ======================

if (
    window.location.pathname.includes("dashboard") &&
    !token
) {
    window.location.href = "login.html";
}


// ======================
// LOGOUT
// ======================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.href = "login.html";

    });

}


// ======================
// LOAD TASKS
// ======================

async function loadTasks() {

    const taskList =
        document.getElementById("taskList");

    if (!taskList) return;

    try {

        const response = await fetch(TASK_API, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const tasks = await response.json();

        console.log(tasks);

        // STATS
        document.getElementById("totalTasks").textContent =
            tasks.length;

        document.getElementById("completedTasks").textContent =
            tasks.filter(task =>
                task.status === "Completed"
            ).length;

        document.getElementById("pendingTasks").textContent =
            tasks.filter(task =>
                task.status === "Pending"
            ).length;


        // CLEAR UI
        taskList.innerHTML = "";


        // DISPLAY TASKS
        tasks.forEach(task => {

            const div = document.createElement("div");

            div.classList.add("task-card");

            if (task.status === "Completed") {
                div.classList.add("completed");
            }

            div.innerHTML = `

                <h3>${task.title}</h3>

                <p>${task.description || ""}</p>

                <p>Status: ${task.status}</p>

                <p>
                    Due:
                    ${
                        task.dueDate
                        ? task.dueDate.split("T")[0]
                        : "No Date"
                    }
                </p>

                <div class="task-buttons">

                    <button
                        onclick="completeTask('${task._id}')">
                        Complete
                    </button>

                    <button
                        onclick='editTask("${task._id}", "${task.title}")'>
                        Edit
                    </button>
                    

                    <button
                        class="delete-btn"
                        onclick="deleteTask('${task._id}')">
                        Delete
                    </button>

                </div>

            `;

            taskList.appendChild(div);

        });

    } catch (error) {

        console.log(error);

    }

}


// ======================
// ADD TASK
// ======================

const taskForm = document.getElementById("taskForm");

if (taskForm) {

    taskForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title =
            document.getElementById("taskTitle").value;

        const description =
            document.getElementById("taskDescription").value;

        const dueDate =
            document.getElementById("taskDate").value;

        await fetch(TASK_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                title,
                description,
                dueDate
            })

        });

        taskForm.reset();

        loadTasks();

    });

}


// ======================
// DELETE TASK
// ======================

async function deleteTask(id) {

    await fetch(`${TASK_API}/${id}`, {

        method: "DELETE",

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    loadTasks();

}


// ======================
// COMPLETE TASK
// ======================

async function completeTask(id) {

    await fetch(`${TASK_API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            status: "Completed"
        })

    });

    loadTasks();

}


// ======================
// EDIT TASK
// ======================

async function editTask(id, oldTitle, oldDescription) {

    const newTitle = prompt(
        "Edit task title",
        oldTitle
    );

    if (!newTitle) return;

    const newDescription = prompt(
        "Edit task description",
        oldDescription || ""
    );

    await fetch(`${TASK_API}/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            title: newTitle,
            description: newDescription
        })

    });

    loadTasks();

}


// ======================
// INITIAL LOAD
// ======================

if (window.location.pathname.includes("dashboard")) {
    loadTasks();
}