<img src="https://socialify.git.ci/juniorSarh/React-Job-Application-Tracker/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="React-Job-Application-Tracker" width="640" height="320" />

# Job Application Tracker (React + TypeScript + JSON Server)

MVP web app where job applicants can track the jobs they’ve applied for, and see how many are **Applied**, **Interviewed**, and **Rejected**. This version uses **JSON Server** as a mock API (hosted on Render or locally). Each user can only see **their** jobs.

---

## Features & Requirements

### Interface
- Clean, user-friendly, responsive UI (desktop → mobile).
- Aesthetic color palette and consistent layout/typography.

### Pages (6)
1. **Landing** – explains the app’s purpose and how it works.
2. **Login** – existing users sign in.
3. **Registration** – new users sign up (username/email + password).
4. **Home** – lists your jobs with search/filter/sort (URL-driven).
5. **Job Page** – details view for a single job (address, contacts, duties, requirements, etc.).
6. **404** – catch-all for unknown routes.

### Functionality
- **Add** a job (Company, Role, Status, Date applied, Extra details).
- **Update** a job.
- **Delete** a job.
- **Search** by company or role (query visible in URL).
- **Filter** by status (URL reflects the filter).
- **Sort** by date (asc/desc, reflected in URL).
- **Status Colors:**  
  - Applied = Yellow  
  - Interviewed = Green  
  - Rejected = Red
- **CRUD** via JSON Server.
- **Auth & Authorization:** only the logged-in user sees/edits their own jobs.
- **Protected routes** for app pages (redirect to login if not authenticated).
- **LocalStorage** used for session persistence (stores minimal `auth_user`).
- **URL Queries & Params:** search/filter/sort synced to the URL.

### Concepts Covered
Arrays, Objects, LocalStorage, React components/state/props/hooks, JSON methods, responsive layouts.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite + React Router
- **API:** JSON Server (custom `server.js` that assigns random IDs and supports `/users` + `/jobs`)
- **Styling:** CSS (and optionally a utility framework)
- **Deployment:**  
  - API: Render (Node Web Service)  
  - Frontend: Render Static Site (or local `vite dev`)

---

## Project Structure

```
.
├─ public/
├─ src/
│  ├─ assets/
│  │  ├─ components/
│  │  │  ├─ JobForm.tsx
│  │  │  ├─ JobsList.tsx
│  │  │  └─ NavBar.tsx
│  │  └─ pages/
│  │     ├─ Landing.tsx
│  │     ├─ Login.tsx
│  │     ├─ Signup.tsx
│  │     ├─ Home.tsx
│  │     ├─ JobPage.tsx
│  │     └─ NotFound.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ server.js
├─ db.json
├─ index.html
├─ package.json
└─ README.md
```

---

## Data Model

```ts
// User (in db.json)
type User = {
  id: string;            // random short ID (server generates)
  username: string;      // email
  password: string;      // plain text (demo only; do NOT use in prod)
  name?: string;
  createdAt: string;
};

// Job
type Job = {
  id: string;            // random short ID (server may generate)
  userId: string;        // owner (from logged-in user)
  company: string;
  role: string;
  status: "Applied" | "Interviewed" | "Rejected";
  dateApplied: string;   // yyyy-mm-dd
  details?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

**Ownership rule:** All `/jobs` operations include `userId`. List endpoints are filtered by `?userId=<currentUserId>` so each user only sees their own jobs.

---

## API Endpoints

- **Users**
  - `POST /users` → register (server assigns random `id` and appends to `users`)
  - `GET /users?username=...&password=...` → login (simple mock auth)
- **Jobs** (owned by user)
  - `GET /jobs?userId=:id&_sort=dateApplied&_order=desc&status=Applied|Interviewed|Rejected&q=<search>`
  - `POST /jobs`
  - `PATCH /jobs/:id`
  - `DELETE /jobs/:id`
  - `GET /jobs/:id`

---

## Environment Variables

Frontend expects:

```
VITE_API_URL=https://<your-json-server-on-render>.onrender.com
```

---

## `package.json` (example)

```json
{
  "name": "job-application-tracker",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "api": "node server.js",
    "api:watch": "nodemon server.js"
  },
  "dependencies": {
    "json-server": "^0.17.4",
    "uuid": "^9.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.74",
    "@types/react-dom": "^18.2.23",
    "typescript": "^5.5.4",
    "vite": "^5.4.3"
  }
}
```
---

---

## How to Run (Local)

```bash
# install deps
npm install

# run API (JSON Server)
npm run api   # http://localhost:3000

# run Frontend
npm run dev   # http://localhost:5173

# env config (.env)
VITE_API_URL=http://localhost:3000
```

---

## Deploy on Render

**API**  
- Web Service → Build: `npm install` → Start: `node server.js`

**Frontend**  
- Static Site → Build: `npm run build` → Publish dir: `dist`  
- Env: `VITE_API_URL=https://your-api.onrender.com`
