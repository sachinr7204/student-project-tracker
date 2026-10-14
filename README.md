# Student Project Tracker

A hands-on web app development workshop project for adding, viewing, editing, and deleting engineering projects. Project records are stored in a local SQLite database.

## Run Locally

### Requirements

- Node.js 22.18 or later, but below version 23, for the workshop's specified baseline
- Git
- Visual Studio Code

### Installation and startup

Open a PowerShell terminal in the project folder and run:

```powershell
npm.cmd ci
npm.cmd start
```

Open the application in your browser:

http://localhost:3000

To stop the server, press `Ctrl + C` in the terminal.

> Use the required Node.js version for the workshop. Check your installed version with `node --version`.

## How It Works

The application follows this request cycle:

Browser HTML/CSS/JavaScript → Fetch and HTTP → Express API → SQLite database → JSON response → Updated browser interface.

### Project files

- `public/index.html` — Page structure and project form.
- `public/style.css` — Styling and responsive layout.
- `public/script.js` — Form handling, API requests, project rendering, and user feedback.
- `server.js` — Starts the Express server.
- `app.js` — API routes, validation, and responses.
- `database.js` — SQLite database operations.
- `data/projects.db` — Local database file created by the application.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/projects` | Retrieve all projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

## Verification

The following checks were performed during the workshop:

- Created projects through the browser interface.
- Edited a project while preserving its ID.
- Cancelled and confirmed deletion.
- Verified project data through the API and SQLite table.
- Confirmed persistence after refreshing the browser and restarting the server.
- Tested stopped-server error handling and recovery.
- Checked input validation, keyboard focus, and a 390px-wide browser view.
- Ran the automated API test with zero failures.

The automated test checks server/API behavior using a temporary database. It does not replace browser testing.

To run the automated test, if `test/crud.test.js` is present, use:

```powershell
npm.cmd test
```

## Workshop Limitations

- This is a local educational application without sign-in or per-user permissions.
- Browsers connecting to the same server share the same project collection.
- The local SQLite database and `node_modules` should not be uploaded to GitHub.
- Cloud hosting requires separate server and database configuration.
