const taskInput = document.getElementById('taskInput');
const addTask = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const clearAll = document.getElementById('clearAll');

addTask.addEventListener('click', () => {

    if(taskInput.value === ''){
        alert("please enter a task");
        return;
    }

    const task = document.createElement('li');
    const taskText = document.createElement('span');
    const buttonContainer = document.createElement('div');

    const deleteButton = document.createElement('button');
    const doneButton = document.createElement('button');

    taskText.textContent = taskInput.value;

    deleteButton.textContent = 'Delete';
    doneButton.textContent = 'Mark as Done';

    buttonContainer.appendChild(doneButton);
    buttonContainer.appendChild(deleteButton);

    task.appendChild(taskText);
    task.appendChild(buttonContainer);

    taskList.appendChild(task);

    clearAll.style.display = 'block';

    deleteButton.addEventListener('click', () => {
        task.remove();
    });

    if(taskList.value === ''){
        clearAll.style.display = 'none';
    }

    doneButton.addEventListener('click', () => {
        taskText.classList.toggle('task-done');

        if (taskText.classList.contains('task-done')) {
            doneButton.textContent = 'Mark as Undone';
        } else {
            doneButton.textContent = 'Mark as Done';
        }
    });        

    taskInput.value = '';
});

clearAll.addEventListener('click', () => {
        taskList.innerHTML = '';
        clearAll.style.display='none'
    });