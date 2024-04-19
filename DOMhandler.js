class DOMHandler {
    static appendTaskToDOM(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('change', () => {
            TaskManager.toggleTaskCompletion(task.id);
            DOMHandler.updateTaskDOM(task);

            if (task.completed) {
                markTaskAsCompleted(task.id); // Call markTaskAsCompleted if task is completed
            }
        });

        const span = document.createElement('span');
        span.textContent = task.description;
        span.className = 'task-text';
        if (task.completed) {
            span.classList.add('completed');
        }

        const dueDateSpan = document.createElement('span');
        dueDateSpan.textContent = ` Due: ${DOMHandler.formatDateForDisplay(task.dueDate)}`;
        dueDateSpan.className = 'due-date';

        const prioritySpan = document.createElement('span');
        prioritySpan.textContent = ` Priority: ${task.priority ? task.priority : ''}`;
        prioritySpan.className = `priority-${task.priority ? task.priority.toLowerCase() : 'none'}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
            TaskManager.deleteTask(task.id);
            DOMHandler.removeTaskFromDOM(li);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(dueDateSpan);
        li.appendChild(prioritySpan);
        li.appendChild(deleteBtn);

        document.getElementById('taskList').appendChild(li);
    }

    static formatDateForDisplay(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    static removeTaskFromDOM(element) {
        if (element) {
            element.remove();
        }
    }

    static updateTaskDOM(task) {
        const taskElement = document.querySelector(`li[data-id="${task.id}"]`);
        if (taskElement) {
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.checked = task.completed;
            const span = taskElement.querySelector('.task-text');
            if (task.completed) {
                span.classList.add('completed');
            } else {
                span.classList.remove('completed');
            }
        } else {
            console.error('Task element not found:', task.id);
        }
    }
    

    static refreshTaskListDOM() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear the task list.
        setDefaultDateTime(); // Set the default date and time.
        const sortedTasks = Utils.sortTasks(TaskManager.loadTasks()); // Ensure tasks are loaded and sorted
        sortedTasks.forEach(task => DOMHandler.appendTaskToDOM(task));
    }
}
