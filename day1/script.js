const taskInput = document.getElementById('taskInput');
const addTask = document.getElementById('addTask');
const taskList = document.getElementById('taskList');

addTask.addEventListener('click', () => {

    const task = document.createElement('li');
    const deleteButton = document.createElement('button');

    task.textContent = taskInput.value;

    deleteButton.textContent = 'Delete';

    task.appendChild(deleteButton);
    taskList.appendChild(task);

    deleteButton.addEventListener('click', () => {
        task.remove();
    });

    taskInput.value = '';
});