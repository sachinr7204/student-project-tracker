
const STORAGE_KEY = 'workshop-projects-v1';

const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

let projects = [];
let editingId = null;
let storageReady = false;

function isValidProjectArray(value) {
    return Array.isArray(value) && value.every(project =>
        project !== null &&
        typeof project === 'object' &&
        !Array.isArray(project) &&
        typeof project.id === 'string' &&
        project.id.length > 0 &&
        typeof project.name === 'string' &&
        typeof project.status === 'string'
    );
}

function loadProjects() {
    try {
        const storedText = localStorage.getItem(STORAGE_KEY);

        if (storedText === null) {
            projects = [];
            storageReady = true;
            return;
        }

        const parsedProjects = JSON.parse(storedText);

        if (!isValidProjectArray(parsedProjects)) {
            message.textContent =
                'Saved project data is invalid. It has not been overwritten.';
            storageReady = false;
            return;
        }

        projects = parsedProjects;
        storageReady = true;
    } catch (error) {
        projects = [];
        storageReady = false;
        message.textContent =
            'Could not read saved projects. Check browser storage settings.';
    }
}

function saveProjects() {
    if (!storageReady) {
        message.textContent =
            'Changes were not saved because stored data could not be loaded safely.';
        return false;
    }

    try {
        const storedText = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, storedText);
        return true;
    } catch (error) {
        message.textContent =
            'Projects changed in this page, but could not be saved to browser storage.';
        return false;
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    saveButton.textContent = 'Add project';
    cancelButton.hidden = true;
}

function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const item = document.createElement('li');
        item.className = 'project-item';

        const info = document.createElement('div');
        info.className = 'project-info';

        const title = document.createElement('p');
        title.className = 'project-name';
        title.textContent = project.name;

        const status = document.createElement('span');
        status.className = 'project-status';
        status.textContent = project.status;

        info.appendChild(title);
        info.appendChild(status);

        const actions = document.createElement('div');
        actions.className = 'project-actions';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', function () {
            const selectedProject = projects.find(
                projectItem => projectItem.id === project.id
            );

            if (!selectedProject) {
                return;
            }

            editingId = selectedProject.id;
            nameInput.value = selectedProject.name;
            statusInput.value = selectedProject.status;

            saveButton.textContent = 'Save changes';
            cancelButton.hidden = false;
            message.textContent = 'Editing project.';
            nameInput.focus();
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', function () {
            const selectedProject = projects.find(
                projectItem => projectItem.id === project.id
            );

            if (!selectedProject) {
                return;
            }

            const confirmed = window.confirm(
                `Delete project "${selectedProject.name}"?`
            );

            if (!confirmed) {
                message.textContent = 'Deletion cancelled.';
                return;
            }

            if (!storageReady) {
                message.textContent =
                    'Cannot delete safely because saved data could not be loaded.';
                return;
            }

            const projectIndex = projects.findIndex(
                projectItem => projectItem.id === selectedProject.id
            );

            if (projectIndex === -1) {
                return;
            }

            const previousProjects = [...projects];
            projects.splice(projectIndex, 1);

            if (!saveProjects()) {
                projects = previousProjects;
                renderProjects();
                return;
            }

            if (editingId === selectedProject.id) {
                resetForm();
                message.textContent = 'Project deleted. Form reset.';
            } else {
                message.textContent = 'Project deleted successfully.';
            }

            renderProjects();
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        item.appendChild(info);
        item.appendChild(actions);
        projectList.appendChild(item);
    });

    if (emptyState) {
        emptyState.hidden = projects.length > 0;

        if (projects.length === 0) {
            emptyState.textContent = 'No projects yet. Add your first idea.';
        }
    }
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!storageReady) {
        message.textContent =
            'Cannot save changes until saved project data can be loaded safely.';
        return;
    }

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === '') {
        message.textContent = 'Please enter a project name.';
        nameInput.focus();
        return;
    }

    if (editingId !== null) {
        const selectedProject = projects.find(
            project => project.id === editingId
        );

        if (!selectedProject) {
            resetForm();
            renderProjects();
            message.textContent = 'Project not found. Please try again.';
            return;
        }

        const previousName = selectedProject.name;
        const previousStatus = selectedProject.status;

        selectedProject.name = name;
        selectedProject.status = status;

        if (!saveProjects()) {
            selectedProject.name = previousName;
            selectedProject.status = previousStatus;
            renderProjects();
            return;
        }

        message.textContent = 'Project updated and saved.';
    } else {
        const newProject = {
            id: crypto.randomUUID(),
            name: name,
            status: status
        };

        projects.push(newProject);

        if (!saveProjects()) {
            projects.pop();
            renderProjects();
            return;
        }

        message.textContent = 'Project added and saved.';
    }

    resetForm();
    renderProjects();
    nameInput.focus();
});

cancelButton.addEventListener('click', function () {
    resetForm();
    message.textContent = 'Edit cancelled. No changes saved.';
    renderProjects();
});

loadProjects();
renderProjects();

if (storageReady) {
    message.textContent = 'Saved projects loaded.';
}
