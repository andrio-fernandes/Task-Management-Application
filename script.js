const API_URL = "https://task-management-application-backend-bnvj.onrender.com/api/auth";
const TASK_API = "https://task-management-application-backend-bnvj.onrender.com/api/tasks";

const token = localStorage.getItem("token");

let tasksCache = [];

let currentPage = 1;
let totalPages = 1;
let searchQuery = "";
let serverStats = null;


// ======================
// LOADER + TOAST
// ======================

function showLoader() {

    let overlay = document.getElementById("loaderOverlay");

    if (!overlay) {

        overlay = document.createElement("div");
        overlay.id = "loaderOverlay";
        overlay.className = "loader-overlay";
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p>Please wait...</p>
        `;

        document.body.appendChild(overlay);

    }

    requestAnimationFrame(() => overlay.classList.add("active"));

}

function hideLoader() {

    const overlay = document.getElementById("loaderOverlay");

    if (overlay) overlay.classList.remove("active");

}

let toastTimer;

function showToast(message, type = "success", action = null) {

    const old = document.getElementById("toast");

    if (old) old.remove();

    clearTimeout(toastTimer);

    const toast = document.createElement("div");

    toast.id = "toast";
    toast.className = `toast ${type}`;

    const text = document.createElement("span");

    text.textContent = message;

    toast.appendChild(text);

    if (action) {

        const btn = document.createElement("button");

        btn.type = "button";
        btn.className = "toast-action";
        btn.textContent = action.label;

        btn.addEventListener("click", () => {

            clearTimeout(toastTimer);
            toast.remove();

            action.onClick();

        });

        toast.appendChild(btn);

    }

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => toast.remove(), 300);

    }, action ? 5000 : 3500);

}

const pendingToast = sessionStorage.getItem("authToast");

if (pendingToast) {

    sessionStorage.removeItem("authToast");

    showToast(pendingToast, "success");

}

function escapeHtml(value) {

    return String(value ?? "").replace(/[&<>"']/g, ch => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    }[ch]));

}

async function authFetch(url, options = {}) {

    const response = await fetch(url, options);

    if (response.status === 401) {

        localStorage.removeItem("token");
        hideLoader();

        showToast("Session expired. Please log in again.", "error");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;

    }

    return response;

}


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

        const submitBtn =
            registerForm.querySelector("button");

        submitBtn.disabled = true;
        showLoader();

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

            const data = await response.json().catch(() => ({}));

            if (response.ok) {

                sessionStorage.setItem(
                    "authToast",
                    data.message || "Registration successful"
                );

                window.location.href = "login.html";

                return;

            }

            hideLoader();

            showToast(
                data.message || "Registration failed",
                "error"
            );

        } catch (error) {

            console.log(error);

            hideLoader();

            showToast(
                "Registration failed. Please try again.",
                "error"
            );

        }

        submitBtn.disabled = false;

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

        const submitBtn =
            loginForm.querySelector("button");

        submitBtn.disabled = true;
        showLoader();

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

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.token) {

                hideLoader();

                showToast(
                    data.message || "Invalid credentials",
                    "error"
                );

                submitBtn.disabled = false;

                return;

            }

            localStorage.setItem("token", data.token);

            if (data.user && data.user.name) {
                localStorage.setItem("userName", data.user.name);
            }

            sessionStorage.setItem(
                "authToast",
                data.message || "Login successful"
            );

            window.location.href = "dashboard.html";

        } catch (error) {

            console.log(error);

            hideLoader();

            showToast(
                "Login failed. Please try again.",
                "error"
            );

            submitBtn.disabled = false;

        }

    });

}


// ======================
// PROTECT DASHBOARD
// ======================

if (
    (window.location.pathname.includes("dashboard") ||
        window.location.pathname.includes("profile")) &&
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

const userNameEl = document.getElementById("userName");

if (userNameEl) {
    userNameEl.textContent = localStorage.getItem("userName") || "";
}


// ======================
// RENDER TASKS
// ======================

function updateStats() {

    const stats = serverStats || {
        total: tasksCache.length,
        completed: tasksCache.filter(task =>
            task.status === "Completed"
        ).length,
        pending: tasksCache.filter(task =>
            task.status === "Pending"
        ).length
    };

    document.getElementById("totalTasks").textContent =
        stats.total;

    document.getElementById("completedTasks").textContent =
        stats.completed;

    document.getElementById("pendingTasks").textContent =
        stats.pending;

}

function renderCharts() {

    const ring = document.getElementById("completionRing");

    if (!ring) return;

    const stats = serverStats || {
        total: tasksCache.length,
        completed: tasksCache.filter(task =>
            task.status === "Completed"
        ).length
    };

    const pct = stats.total
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    ring.style.setProperty("--pct", pct);

    document.getElementById("ringPercent").textContent = `${pct}%`;

    const barsEl = document.getElementById("activityBars");

    if (!barsEl) return;

    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const d = new Date();

        d.setDate(d.getDate() - i);

        days.push(d);

    }

    const keyOf = d =>
        `${d.getFullYear()}-` +
        `${String(d.getMonth() + 1).padStart(2, "0")}-` +
        `${String(d.getDate()).padStart(2, "0")}`;

    const counts = days.map(d => {

        const key = keyOf(d);

        return tasksCache.filter(task =>
            task.status === "Completed" &&
            task.updatedAt &&
            keyOf(new Date(task.updatedAt)) === key
        ).length;

    });

    const max = Math.max(...counts, 1);

    barsEl.innerHTML = days.map((d, i) => {

        const count = counts[i];

        const height = count
            ? Math.max(12, Math.round((count / max) * 70))
            : 4;

        return `
            <div class="bar-col">
                <span class="bar-count">${count || ""}</span>
                <div class="bar${count ? "" : " zero"}"
                     style="height: ${height}%"></div>
                <span class="bar-day">${dayLabels[d.getDay()]}</span>
            </div>
        `;

    }).join("");

}

function updateLoadMore() {

    const btn = document.getElementById("loadMoreBtn");

    if (!btn) return;

    btn.hidden = !(currentPage < totalPages);

}

function isOverdue(task) {

    if (task.status === "Completed" || !task.dueDate) return false;

    const today = new Date();

    const todayStr =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;

    return task.dueDate.split("T")[0] < todayStr;

}

function getVisibleTasks() {

    const searchEl = document.getElementById("taskSearch");
    const filterEl = document.getElementById("taskFilter");
    const sortEl = document.getElementById("taskSort");

    const query = (searchEl ? searchEl.value : "").trim().toLowerCase();
    const status = filterEl ? filterEl.value : "all";
    const sort = sortEl ? sortEl.value : "newest";

    let list = tasksCache.filter(task => {

        const haystack =
            `${task.title || ""} ${task.description || ""}`.toLowerCase();

        const matchesQuery = !query || haystack.includes(query);

        const matchesStatus =
            status === "all" || task.status === status;

        return matchesQuery && matchesStatus;

    });

    list = list.slice();

    if (sort === "oldest") {
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "due") {
        list.sort((a, b) =>
            (a.dueDate || "9999-12-31").localeCompare(
                b.dueDate || "9999-12-31"
            )
        );
    } else if (sort === "title") {
        list.sort((a, b) =>
            (a.title || "").localeCompare(b.title || "")
        );
    } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;

}

function renderSkeleton() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    const card = `
        <div class="skeleton-card" aria-hidden="true">
            <div class="skeleton-line w40"></div>
            <div class="skeleton-line w80"></div>
            <div class="skeleton-line w60"></div>
        </div>
    `;

    taskList.innerHTML = card.repeat(3);

}

function renderTasks() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    updateStats();

    renderCharts();

    updateLoadMore();

    const visible = getVisibleTasks();

    taskList.innerHTML = "";

    if (!visible.length) {

        const isEmpty = tasksCache.length === 0;

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>${isEmpty ? "No tasks yet" : "No matching tasks"}</h3>
                <p>${
                    isEmpty
                    ? "Add your first task using the form above."
                    : "Try a different search or filter."
                }</p>
            </div>
        `;

        return;

    }

    visible.forEach(task => {

        const div = document.createElement("div");

        div.classList.add("task-card");

        const isCompleted = task.status === "Completed";
        const overdue = isOverdue(task);

        if (isCompleted) {
            div.classList.add("completed");
        }

        if (overdue) {
            div.classList.add("overdue");
        }

        div.innerHTML = `

            <h3>${escapeHtml(task.title)}</h3>

            <p>${escapeHtml(task.description || "")}</p>

            <p>
                Status: ${escapeHtml(task.status)}
                ${overdue ? '<span class="badge overdue-badge">Overdue</span>' : ""}
            </p>

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
                    onclick="setStatus('${task._id}', '${
                        isCompleted ? "Pending" : "Completed"
                    }')">
                    ${isCompleted ? "Revert" : "Complete"}
                </button>

                <button
                    onclick="editTask('${task._id}')">
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

}


// ======================
// TASK TOOLBAR
// ======================

const taskSearchEl = document.getElementById("taskSearch");

if (taskSearchEl) {

    let searchTimer;

    taskSearchEl.addEventListener("input", () => {

        renderTasks();

        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {

            searchQuery = taskSearchEl.value.trim();

            loadTasks();

        }, 300);

    });

}

["taskFilter", "taskSort"].forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    el.addEventListener("input", renderTasks);
    el.addEventListener("change", renderTasks);

});

const loadMoreBtn = document.getElementById("loadMoreBtn");

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreTasks);
}


// ======================
// LOAD TASKS
// ======================

async function fetchPage(page) {

    const params = new URLSearchParams({
        page: String(page),
        limit: "10"
    });

    if (searchQuery) {
        params.set("search", searchQuery);
    }

    const response = await authFetch(`${TASK_API}?${params.toString()}`, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    });

    if (!response.ok) {
        throw new Error("Failed to load tasks");
    }

    const data = await response.json();

    // Legacy backend: plain array response
    if (Array.isArray(data)) {
        return {
            tasks: data,
            total: data.length,
            page: 1,
            totalPages: 1,
            stats: null
        };
    }

    if (!data || !Array.isArray(data.tasks)) {
        throw new Error("Unexpected response");
    }

    return data;

}

async function loadTasks() {

    const taskList =
        document.getElementById("taskList");

    if (!taskList) return;

    renderSkeleton();

    try {

        const data = await fetchPage(1);

        tasksCache = data.tasks;
        currentPage = data.page || 1;
        totalPages = data.totalPages || 1;
        serverStats = data.stats || null;

        renderTasks();

    } catch (error) {

        console.log(error);

        taskList.innerHTML = "";

        if (error.status !== 401) {
            showToast(
                "Couldn't load tasks. Please try again.",
                "error"
            );
        }

    } finally {

        hideLoader();

    }

}

async function loadMoreTasks() {

    if (currentPage >= totalPages) return;

    const btn = document.getElementById("loadMoreBtn");

    if (btn) btn.disabled = true;

    try {

        const data = await fetchPage(currentPage + 1);

        tasksCache = tasksCache.concat(data.tasks);
        currentPage = data.page || currentPage + 1;
        serverStats = data.stats || serverStats;

        renderTasks();

    } catch (error) {

        console.log(error);

        if (error.status !== 401) {
            showToast(
                "Couldn't load more tasks. Please try again.",
                "error"
            );
        }

    } finally {

        if (btn) btn.disabled = false;

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

        const submitBtn = taskForm.querySelector("button");

        submitBtn.disabled = true;
        showLoader();

        try {

            const response = await authFetch(TASK_API, {

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

            if (!response.ok) {
                throw new Error("Failed to add task");
            }

            taskForm.reset();

            showToast("Task added", "success");

            await loadTasks();

        } catch (error) {

            console.log(error);

            hideLoader();

            if (error.status !== 401) {
                showToast("Couldn't add task. Please try again.", "error");
            }

        }

        submitBtn.disabled = false;

    });

}


// ======================
// DELETE TASK
// ======================

async function deleteTask(id) {

    if (!confirm("Delete this task?")) return;

    const task = tasksCache.find(t => t._id === id);

    if (!task) return;

    showLoader();

    try {

        const response = await authFetch(`${TASK_API}/${id}`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        tasksCache = tasksCache.filter(t => t._id !== id);

        renderTasks();

        hideLoader();

        showToast("Task deleted", "success", {
            label: "Undo",
            onClick: () => undoDelete(task)
        });

    } catch (error) {

        console.log(error);

        hideLoader();

        if (error.status !== 401) {
            showToast("Couldn't delete task. Please try again.", "error");
        }

    }

}

async function undoDelete(task) {

    showLoader();

    try {

        const response = await authFetch(TASK_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate
            })

        });

        if (!response.ok) {
            throw new Error("Failed to restore task");
        }

        showToast("Task restored", "success");

        await loadTasks();

    } catch (error) {

        console.log(error);

        hideLoader();

        if (error.status !== 401) {
            showToast("Couldn't restore task. Please try again.", "error");
        }

    }

}


// ======================
// SET TASK STATUS
// ======================

async function setStatus(id, status) {

    showLoader();

    try {

        const response = await authFetch(`${TASK_API}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                status
            })

        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        showToast(
            status === "Completed"
                ? "Task marked as completed"
                : "Task moved back to pending",
            "success"
        );

        await loadTasks();

    } catch (error) {

        console.log(error);

        hideLoader();

        if (error.status !== 401) {
            showToast("Couldn't update task. Please try again.", "error");
        }

    }

}


// ======================
// EDIT TASK (MODAL)
// ======================

const editModal = document.getElementById("editModal");
const editTaskForm = document.getElementById("editTaskForm");

let lastFocusedElement = null;

function openEditModal(task) {

    document.getElementById("editTitle").value = task.title || "";
    document.getElementById("editDescription").value = task.description || "";
    document.getElementById("editStatus").value = task.status || "Pending";
    document.getElementById("editDate").value =
        task.dueDate ? task.dueDate.split("T")[0] : "";

    editTaskForm.dataset.taskId = task._id;

    lastFocusedElement = document.activeElement;

    editModal.classList.add("active");

    document.body.classList.add("modal-open");

    document.getElementById("editTitle").focus();

}

function closeEditModal() {

    editModal.classList.remove("active");

    document.body.classList.remove("modal-open");

    delete editTaskForm.dataset.taskId;

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }

}

function editTask(id) {

    const task = tasksCache.find(t => t._id === id);

    if (!task) return;

    openEditModal(task);

}

if (editTaskForm) {

    document.getElementById("modalClose")
        .addEventListener("click", closeEditModal);

    document.getElementById("modalCancel")
        .addEventListener("click", closeEditModal);

    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditModal();
    });

    document.addEventListener("keydown", (e) => {

        if (!editModal.classList.contains("active")) return;

        if (e.key === "Escape") {
            closeEditModal();
            return;
        }

        if (e.key === "Tab") {

            const focusables = Array.from(
                editModal.querySelectorAll(
                    'button, input, select, textarea, a[href]'
                )
            ).filter(el => !el.disabled);

            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }

        }

    });

    editTaskForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const id = editTaskForm.dataset.taskId;

        if (!id) return;

        const saveBtn = editTaskForm.querySelector(
            'button[type="submit"]'
        );

        saveBtn.disabled = true;
        showLoader();

        try {

            const response = await authFetch(`${TASK_API}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: document.getElementById("editTitle").value,
                    description: document.getElementById("editDescription").value,
                    status: document.getElementById("editStatus").value,
                    dueDate: document.getElementById("editDate").value
                })

            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            closeEditModal();

            showToast("Task updated", "success");

            await loadTasks();

        } catch (error) {

            console.log(error);

            hideLoader();

            if (error.status !== 401) {
                showToast("Couldn't save changes. Please try again.", "error");
            }

        }

        saveBtn.disabled = false;

    });

}


// ======================
// PROFILE
// ======================

const profileForm = document.getElementById("profileForm");

if (profileForm) {

    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");

    nameInput.value = localStorage.getItem("userName") || "";

    (async () => {

        try {

            const response = await authFetch(`${API_URL}/profile`, {

                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (response.ok) {

                const user = await response.json();

                nameInput.value = user.name || "";
                emailInput.value = user.email || "";

                if (user.name) {
                    localStorage.setItem("userName", user.name);
                }

            }

        } catch (error) {

            console.log(error);

        }

    })();

    profileForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = nameInput.value.trim();

        const currentPassword =
            document.getElementById("currentPassword").value;

        const newPassword =
            document.getElementById("newPassword").value;

        const body = { name };

        if (newPassword) {
            body.currentPassword = currentPassword;
            body.newPassword = newPassword;
        }

        const submitBtn = profileForm.querySelector("button");

        submitBtn.disabled = true;
        showLoader();

        try {

            const response = await authFetch(`${API_URL}/profile`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(body)

            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {

                hideLoader();

                showToast(
                    data.message || "Couldn't update profile",
                    "error"
                );

                submitBtn.disabled = false;

                return;

            }

            localStorage.setItem("userName", data.user.name);

            nameInput.value = data.user.name;

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";

            hideLoader();

            showToast(data.message || "Profile updated", "success");

        } catch (error) {

            console.log(error);

            hideLoader();

            if (error.status !== 401) {
                showToast(
                    "Couldn't update profile. Please try again.",
                    "error"
                );
            }

        }

        submitBtn.disabled = false;

    });

}


// ======================
// INITIAL LOAD
// ======================

if (window.location.pathname.includes("dashboard")) {
    loadTasks();
}