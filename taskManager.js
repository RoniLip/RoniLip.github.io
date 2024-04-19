
class TaskManager {
    static tasks = JSON.parse(localStorage.getItem('tasks')) || [];  // Ensure this is a static property of the class

    static loadTasks() {
        TaskManager.tasks.forEach(task => {
            // Ensure date strings are converted back to Date objects if necessary
            task.dueDate = new Date(task.dueDate);
        });
        return TaskManager.tasks;

    }

    static saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(TaskManager.tasks));
    }

    static addTask(taskDescription, dueDate, priority, reminderTime, reminderUnit, recurrence) {
        const task = {
            description: taskDescription,
            completed: false,
            id: Date.now(),
            dueDate: dueDate,
            priority: priority,
            reminderTime: reminderTime,  // Add this line
            reminderUnit: reminderUnit,
            notificationSent: false, 
            recurrence: recurrence

        };
        TaskManager.tasks.push(task);
        TaskManager.saveTasks(); // This saves the tasks array to localStorage
        // Ensure tasks are sorted right after adding a new task
        TaskManager.tasks = Utils.sortTasks(TaskManager.tasks);
        DOMHandler.refreshTaskListDOM(); // Refresh the entire list to reflect sorted order
        NotificationManager.setupTaskReminders(TaskManager.tasks);
    }
    
    

    static deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            TaskManager.tasks = TaskManager.tasks.filter(task => {
                if (task.id !== taskId) {
                    return true; // Keep the task if the ID does not match
                } else {
                    // This branch is executed when the task ID matches and the task should be deleted
                    return false; // Remove the task if the ID matches
                }
            });
            TaskManager.saveTasks();
            NotificationManager.setupTaskReminders(TaskManager.tasks);
            DOMHandler.refreshTaskListDOM(); // Refresh the DOM
        }
    }
    

    static toggleTaskCompletion(taskId) {
        const task = TaskManager.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.notificationSent = task.completed;  // Set notificationSent to true if task is completed to avoid future notifications
            TaskManager.saveTasks();
            TaskManager.tasks = Utils.sortTasks(TaskManager.tasks); // Re-sort tasks after change
            DOMHandler.refreshTaskListDOM();  // Refresh the list to re-sort and display tasks correctly
            NotificationManager.setupTaskReminders(TaskManager.tasks);  // Re-setup notifications with updated task state
            
            return task.completed; // Return the new completion state
        }
        return false; // In case task is not found
    }
    
}

function markTaskAsCompleted(taskId) {
    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        taskElement.classList.add('completed');
    } else {
        console.error('Task element not found:', taskId);
    }
}


    
