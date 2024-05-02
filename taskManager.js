
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
        sortAndDisplayTasks();

        const newEvent = {
            id: task.id,
            title: task.description,
            start: task.dueDate,
            allDay: true
        };
        window.dispatchEvent(new CustomEvent('taskAdded', { detail: { task } }));
    }
    
    

    static deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            // Code to delete the task if confirmed
            TaskManager.tasks = TaskManager.tasks.filter(task => task.id !== taskId);
            TaskManager.saveTasks();
            DOMHandler.refreshTaskListDOM(); // Refresh the DOM
            sortAndDisplayTasks(); // Update the side lists to reflect the deletion
            window.dispatchEvent(new CustomEvent('taskDeleted', { detail: { taskId } }));
            return true; // Indicate the task was deleted.
        } else {
            // If cancelled, indicate the task was not deleted.
            return false;
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

            if (task.completed && task.recurrence && task.recurrence !== "None") {
                task.dueDate = this.calculateNextDueDate(new Date(task.dueDate), task.recurrence).toISOString();
                task.completed = false; // Reset the completion status
                task.notificationSent = false; // Reset the notification sent status
            } else if (task.completed) {
                // Clear the notification for completed tasks
                NotificationManager.clearScheduledNotification(task.id);
                DOMHandler.animateTaskCompletion(task)
            }
            if (!task.completed) {
                NotificationManager.scheduleNotification(task);
                
            }

            this.saveTasks();
            Utils.sortTasks(this.tasks);
            DOMHandler.refreshTaskListDOM();
            sortAndDisplayTasks();
            window.dispatchEvent(new CustomEvent('taskUpdated', { detail: { task } }));
            
            return task.completed; // Return the new completion state
        }
        return false; // In case task is not found
    }

    static calculateNextDueDate(currentDueDate, recurrence) {
        const dueDate = new Date(currentDueDate);
        switch (recurrence) {
            case 'daily':
                dueDate.setDate(dueDate.getDate() + 1);
                break;
            case 'weekly':
                dueDate.setDate(dueDate.getDate() + 7);
                break;
            case 'monthly':
                dueDate.setMonth(dueDate.getMonth() + 1);
                break;
            // Add cases for any other recurrences
        }
        return dueDate;
    }

    static addNextRecurrenceTask(task) {
        const newTask = {...task};
        newTask.id = Date.now(); // Ensure the new task has a unique ID
        newTask.completed = false; // The new task is not completed
        newTask.notificationSent = false; // Reset the notification sent status
    
        // Calculate the next due date based on recurrence
        const dueDate = new Date(task.dueDate);
        switch(task.recurrence) {
            case 'daily':
                dueDate.setDate(dueDate.getDate() + 1);
                break;
            case 'weekly':
                dueDate.setDate(dueDate.getDate() + 7);
                break;
            case 'monthly':
                dueDate.setMonth(dueDate.getMonth() + 1);
                break;
            // Add more cases if there are other types of recurrences
        }
        newTask.dueDate = dueDate.toISOString(); // Update the due date to the next recurrence date
    
        TaskManager.tasks.push(newTask); // Add the new task to the tasks array
        TaskManager.saveTasks();
        NotificationManager.setupTaskReminders([newTask]); 
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

function sortAndDisplayTasks() {
    const tasks = TaskManager.loadTasks();
    const dailyTasks = tasks.filter(task => task.recurrence === 'daily');
    const weeklyTasks = tasks.filter(task => task.recurrence === 'weekly');
    const monthlyTasks = tasks.filter(task => task.recurrence === 'monthly');

    const dailyTasksList = document.getElementById('dailyTasksList');
    const weeklyTasksList = document.getElementById('weeklyTasksList');
    const monthlyTasksList = document.getElementById('monthlyTasksList');

    if (dailyTasksList) {
        displayTasks(dailyTasks, dailyTasksList);
    }

    if (weeklyTasksList) {
        displayTasks(weeklyTasks, weeklyTasksList);
    }

    if (monthlyTasksList) {
        displayTasks(monthlyTasks, monthlyTasksList);
    }
}

function displayTasks(tasks, element) {
    element.innerHTML = ''; // Clear existing tasks
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.textContent = task.description; // Add more task details as needed
        element.appendChild(listItem);
    });
}

// Call this function after tasks are loaded, added, or removed to refresh the lists
sortAndDisplayTasks();



    
