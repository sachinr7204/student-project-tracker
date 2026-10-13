
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const message = document.querySelector('#message');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const projectName = nameInput.value.trim();
    const projectStatus = statusInput.value;

    if (projectName === '') {
        message.textContent = 'Please enter a project name.';
        return;
    }

    const project = document.createElement('div');
    project.className = 'project-card';

    const title = document.createElement('h3');
    title.textContent = projectName;

    const status = document.createElement('p');
    status.textContent = 'Status: ' + projectStatus;

    project.appendChild(title);
    project.appendChild(status);
    projectList.appendChild(project);

    message.textContent = 'Project added successfully!';
    form.reset();
});
