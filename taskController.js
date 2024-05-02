class TaskController {
    static initialize() {
        DOMHandler.setupFormSubmission(this.handleSubmit);
        this.loadAndDisplayTasks();
    }

    static handleSubmit(taskData) {
        TaskService.addTask(taskData.description, taskData.dueDate, taskData.priority, taskData.reminderTime, taskData.reminderUnit);
        TaskService.sortTasks();
        this.loadAndDisplayTasks();
        NotificationManager.setupTaskReminders(TaskService.loadTasks());
    }

    static loadAndDisplayTasks() {
        const tasks = TaskService.loadTasks();
        DOMHandler.displayTasks(tasks);
        NotificationManager.setupTaskReminders(tasks);
    }

    static toggleCompletion(taskId) {
        TaskService.toggleTaskCompletion(taskId);
        TaskService.sortTasks();
        this.loadAndDisplayTasks();
        NotificationManager.setupTaskReminders(TaskService.loadTasks());
    }

    static deleteTask(taskId) {
        TaskService.deleteTask(taskId);
        this.loadAndDisplayTasks();
        NotificationManager.setupTaskReminders(TaskService.loadTasks());
    }
}
