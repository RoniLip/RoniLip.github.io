class DOMHandler {
    static appendTaskToDOM(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('change', (event) => {
            const taskId = task.id;
            TaskManager.toggleTaskCompletion(taskId);
            DOMHandler.updateTaskDOM(task);

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
            const isConfirmed = TaskManager.deleteTask(task.id); // Modify to capture the confirmation result.
            if (isConfirmed) {
                DOMHandler.removeTaskFromDOM(li); // Only remove from DOM if confirmed.
            }
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
            checkbox.checked = task.completed; // Ensure the checkbox reflects the task's completion status
            const textSpan = taskElement.querySelector('.task-text');
            if (task.completed) {
                textSpan.classList.add('completed');
            } else {
                textSpan.classList.remove('completed');
            }
        }
    }
    
    

    static refreshTaskListDOM() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
    
        const sortedTasks = Utils.sortTasks(TaskManager.loadTasks());
    
        sortedTasks.forEach(task => {
            DOMHandler.appendTaskToDOM(task);
        });
    }
      
    static animateTaskCompletion(task) {
        const taskElement = document.querySelector(`li[data-id="${task.id}"]`);
        const completedTasksContainer = document.getElementById('completedTasksContainer');
    
        if (taskElement) {
            // Apply the completed styling immediately
            taskElement.classList.add('completed');
    
            // Fade the task out
            taskElement.classList.add('task-fade-in');
    
            // Wait for the fade-out animation to finish before moving the task
            taskElement.addEventListener('animationend', () => {
                // Move the task to the completed container
                completedTasksContainer.appendChild(taskElement);
    
                // Remove the fade-in class once the task is in place
                taskElement.classList.remove('task-fade-in');
            }, { once: true });
        }
    }
    
    
    
    
    
    
    
    

    
    
    
    
    static moveTaskToEnd(taskElement) {
        // First, animate the task item out of view
        taskElement.classList.add('task-completed');
    
        // After the animation, remove the class and move the task to the end of the list
        taskElement.addEventListener('transitionend', () => {
          taskElement.classList.remove('task-completed'); // Remove the class to reset styles if needed
    
          // Now, actually move the element to the end of the list
          taskElement.parentElement.appendChild(taskElement);
    
          // Optionally, you can re-apply styles or classes to the task now that it's moved
          taskElement.style.opacity = '1'; // Reset opacity after the move
        }, { once: true }); // The { once: true } option auto-removes the listener after firing
      }
    
}

    // Helper function to calculate the distance to the bottom of the list
    function calculateDistanceToBottom(element) {
        const listBottom = element.closest('ul').getBoundingClientRect().bottom;
        const elementBottom = element.getBoundingClientRect().bottom;
        return listBottom - elementBottom;
    }