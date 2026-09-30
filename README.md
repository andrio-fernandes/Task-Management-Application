# Task Management Application

A full-stack Task Management Application built using HTML, CSS, JavaScript, Node.js, Express.js, MongoDB, and JWT Authentication.

Users can:

* Register & Login securely
* Create, edit and delete tasks with a modal editor
* Mark tasks as completed (or revert them)
* Search, filter and sort tasks
* Undo a delete from the toast notification
* Track task statistics and view completion charts
* Manage their profile (name + password)

---

## 🚀 Live Demo

### Frontend
https://task-management-application-livid-nu.vercel.app

### Backend API
https://task-management-application-backend-bnvj.onrender.com

## 🔗 Repository Links

### Frontend Repository
https://github.com/andrio-fernandes/Task-Management-Application

### Backend Repository
https://github.com/andrio-fernandes/Task-Management-Application-Backend


---

# 📌 Features

## 🔐 Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Dashboard & Profile pages
* Session-expired handling (auto logout on 401)

## ✅ Task Management

* Add Tasks
* View Tasks
* Edit Tasks via an accessible modal (title, description, status, due date)
* Delete Tasks with confirmation + **Undo** toast
* Mark Tasks as Completed / Revert to Pending
* Overdue badge for tasks past their due date
* Pagination with a **Load more** button

## 🔎 Search, Filter & Sort

* Live search across title and description (debounced, server-side)
* Filter by status (All / Pending / Completed)
* Sort by newest, oldest, due date or title

## 👤 Profile

* View and update your name
* Change password (verified against your current password)

## 📊 Dashboard

* Total / Completed / Pending counters (server-wide)
* Completion ring chart (conic-gradient)
* Last 7 days activity bar chart
* Skeleton loading placeholders while fetching

## 🎨 UI / UX

* Neumorphism (soft UI) design with inset/raised shadows
* Loading screen + toast notifications (no browser alerts)
* Accessible modal: focus trap, Esc/overlay close, scroll lock
* XSS-safe rendering of task content
* Mobile Responsive Design

---

# 🛠️ Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas

## Authentication

* JWT (JSON Web Token)

## Deployment

* GitHub Pages (Frontend)
* Render (Backend)

---

# 📂 Project Structure

```text
task-management-app/

├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```
# 📸 Screenshots

---
## Home Page
<img width="1200" height="562" alt="image" src="https://github.com/user-attachments/assets/2dbd8de0-1b7a-46cb-8ab3-aafb36b37de0" />

---
## Login Page
<img width="658" height="472" alt="image" src="https://github.com/user-attachments/assets/571ae48b-f4ce-41fb-8056-3707250663f5" />

---
## Dashboard
<img width="927" height="621" alt="image" src="https://github.com/user-attachments/assets/99bc3a04-16cb-4d67-8f25-ec4f50a4f3f5" />


# 📚 Learning Outcomes

Through this project, I learned:

* REST API development
* JWT Authentication
* MongoDB integration
* CRUD operations
* Pagination & search API design
* Frontend & Backend connection
* Deployment of full-stack applications
* Responsive UI design
* Neumorphic UI styling
* Web accessibility (focus management, ARIA dialogs)
* Preventing XSS and IDOR vulnerabilities

---

# 👨‍💻 Author

Andrio Fernandes

GitHub: https://github.com/andrio-fernandes

