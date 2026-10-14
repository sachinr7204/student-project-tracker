
const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const message = document.getElementById("message");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");

let editingId = null;
let projects = [];
let loading = false;
let mutating = false;
let loadedSuccessfully = false;

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#192d49";
}

function updateControls() {
    const busy = loading || mutating;

    nameInput.disabled = busy;
    statusInput.disabled = busy;
    saveButton.disabled = busy;
    cancelButton.disabled = busy || editingId === null;

    projectList.querySelectorAll("button").forEach((button) => {
        button.disabled = busy;
    });

    saveButton.textContent = mutating
        ? (editingId === null ? "Adding..." : "Saving...")
        : (editingId === null ? "Add project" : "Save changes");
}

async function apiRequest(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });
    } catch {
        throw new Error(
            "Network error. Check that the server is running and try again."
        );
    }

    const responseText = await response.text();
    let data = {};

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = {};
        }
    }

    if (!response.ok) {
        const apiMessage =
            typeof data.error === "string" ? data.error :
            typeof data.message === "string" ? data.message :
            `Request failed with HTTP ${response.status}.`;

        throw new Error(apiMessage);
    }

    return data;
}

function renderProjects() {
    projectList.replaceChildren();

    emptyState.hidden = !loadedSuccessfully || projects.length > 0;

    projects.forEach((project) => {
        const item = document.createElement("li");
        item.className = "project-item";

        const info = document.createElement("div");
        info.className = "project-info";

        const projectName = document.createElement("p");
        projectName.className = "project-name";
        projectName.textContent = project.name;

        const status = document.createElement("span");
        status.className = "project-status";
        status.textContent = project.status;

        info.append(projectName, status);

        const actions = document.createElement("div");
        actions.className = "project-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "secondary";
        editButton.addEventListener("click", () => startEdit(project));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteProject(project));

        actions.append(editButton, deleteButton);
        item.append(info, actions);
        projectList.appendChild(item);
    });

    updateControls();
}

async function loadProjects() {
    if (loading) return false;

    loading = true;
    updateControls();

    if (!loadedSuccessfully) {
        emptyState.hidden = true;
        showMessage("Loading projects...");
    } else {
        showMessage("Refreshing projects...");
    }

    try {
        const data = await apiRequest("/api/projects");

        if (!Array.isArray(data)) {
            throw new Error("The server returned an invalid project list.");
        }

        projects = data;
        loadedSuccessfully = true;
        renderProjects();

        if (projects.length === 0) {
            showMessage("No projects yet. Add your first idea.");
        } else {
            showMessage("Projects loaded successfully.");
        }

        return true;
    } catch (error) {
        showMessage("Could not load projects: " + error.message, true);
        return false;
    } finally {
        loading = false;
        updateControls();
    }
}

function startEdit(project) {
    if (loading || mutating) return;

    editingId = project.id;
    nameInput.value = project.name;
    statusInput.value = project.status;

    formTitle.textContent = "Edit project";
    cancelButton.hidden = false;

    updateControls();
    nameInput.focus();
    showMessage("Editing: " + project.name);
}

function resetForm() {
    editingId = null;
    form.reset();

    formTitle.textContent = "Add a project";
    cancelButton.hidden = true;

    updateControls();
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (loading || mutating) return;

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (!name || name.length > 80) {
        showMessage("Enter a project name of 1–80 characters.", true);
        nameInput.focus();
        return;
    }

    const isEditing = editingId !== null;
    const url = isEditing
        ? `/api/projects/${editingId}`
        : "/api/projects";

    mutating = true;
    updateControls();
    showMessage(isEditing ? "Saving changes..." : "Adding project...");

    try {
        await apiRequest(url, {
            method: isEditing ? "PUT" : "POST",
            body: JSON.stringify({ name, status })
        });

        // The mutation succeeded, so the form can now be reset.
        resetForm();

        // Always reload the current collection from the API.
        const refreshed = await loadProjects();

        if (refreshed) {
            showMessage(
                isEditing
                    ? "Project updated successfully."
                    : "Project added successfully."
            );
        } else {
            showMessage(
                "The change was saved, but the project list could not refresh. Try reloading.",
                true
            );
        }
    } catch (error) {
        // Keep the user's input and current edit mode on mutation failure.
        showMessage(error.message, true);
    } finally {
        mutating = false;
        updateControls();
    }
});

cancelButton.addEventListener("click", () => {
    if (loading || mutating) return;

    resetForm();
    showMessage("Edit cancelled.");
});

async function deleteProject(project) {
    if (loading || mutating) return;

    const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    mutating = true;
    updateControls();
    showMessage("Deleting project...");

    try {
        await apiRequest(`/api/projects/${project.id}`, {
            method: "DELETE"
        });

        if (editingId === project.id) {
            resetForm();
        }

        const refreshed = await loadProjects();

        if (refreshed) {
            showMessage("Project deleted successfully.");
        } else {
            showMessage(
                "The project was deleted, but the list could not refresh. Try reloading.",
                true
            );
        }
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        mutating = false;
        updateControls();
    }
}

// Load the API collection when the page opens.
emptyState.hidden = true;
updateControls();
loadProjects();
