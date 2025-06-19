# StudySphere

StudySphere is a productivity and study tracking web application that helps users manage their study sessions, tasks, and collaborate in study groups. It features user authentication, group rankings, and a simple frontend interface.

## Features

- User registration and login
- Track study sessions by subject and duration
- Manage personal tasks (add, complete, list)
- Create and join study groups
- View group members and group study rankings
- Simple web frontend

## Tech Stack

- **Backend:** Python, Flask, Flask-Login, Flask-SQLAlchemy
- **Frontend:** HTML, JavaScript (Fetch API)
- **Database:** SQLite

## Project Structure

```
.
├── backend/
│   ├── app.py
│   ├── extensions.py
│   ├── models.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── groups.py
│   │   ├── study.py
│   │   └── tasks.py
├── frontend/
│   ├── index.html
│   └── js/
│       └── api.js
├── instance/
│   └── study-sphere.db
├── run.py
└── tests/
```

## Getting Started

### Prerequisites

- Python 3.10+
- pip

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AbdellahBouarguan/StudySphere.git
   cd StudySphere
   ```

2. **Create a virtual environment and activate it:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```sh
   pip install flask flask-login flask-sqlalchemy werkzeug
   ```

4. **Run the application:**
   ```sh
   python run.py
   ```

5. **Access the app:**
   Open [http://localhost:5000](http://localhost:5000) in your browser.

## API Endpoints

### Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout

### Study Sessions

- `POST /api/study/add` — Add a study session
- `GET /api/study/today` — Get today's study summary

### Tasks

- `POST /api/tasks/add` — Add a new task
- `GET /api/tasks/list` — List all tasks
- `POST /api/tasks/complete/<task_id>` — Mark a task as complete

### Groups

- `POST /api/groups/create` — Create a group
- `POST /api/groups/join` — Join a group
- `GET /api/groups/members/<group_id>` — List group members
- `GET /api/groups/ranking/<group_id>` — Group study ranking

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

**StudySphere** — Track your study, boost your productivity
