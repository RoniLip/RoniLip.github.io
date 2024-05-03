
class NotificationManager {
    static requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission:", permission);
            });
        }
    }

    static setupTaskReminders(tasks) {
        tasks.forEach(task => {
            if (!task.completed) {
                this.scheduleNotification(task);
            }
        });
    }

    static notificationTimeouts = {};
    
    static scheduleNotification(task) {
        // Check if the task is completed and the notification has already been sent
        if (task.completed && (!task.recurrence || task.recurrence === 'None')) {
            return;
        }

        if (this.notificationTimeouts[task.id]) {
            clearTimeout(this.notificationTimeouts[task.id]);
            delete this.notificationTimeouts[task.id];
        }
    
        const now = new Date().getTime();
        const dueTime = new Date(task.dueDate).getTime();
        let timeUntilDue = dueTime - Date.now();
        let repeatInterval = null;
    
        switch (task.reminderUnit) {
            case 'minutes':
                timeUntilDue -= task.reminderTime * 60000;
                break;
            case 'hours':
                timeUntilDue -= task.reminderTime * 3600000;
                break;
            case 'days':
                timeUntilDue -= task.reminderTime * 86400000;
                break;
        }
    
        if (task.recurrence === 'daily') {
            repeatInterval = 86400000; // 24 hours
        } else if (task.recurrence === 'weekly') {
            repeatInterval = 604800000; // 7 days
        } else if (task.recurrence === 'monthly') {
            repeatInterval = 2629746000; // Approx 1 month
        }
    
        // Check if the notification should be scheduled
        if (timeUntilDue > 0 && !task.completed) {
            // Check if a notification is already scheduled
            if (this.notificationTimeouts[task.id]) {
                clearTimeout(this.notificationTimeouts[task.id]); // Clear it if so
            }
            
            // Schedule a new notification
            const timeoutId = setTimeout(() => {
                new Notification('Reminder', {
                    body: `Your task "${task.description}" is due soon.`,
                    icon: 'https://example.com/icon.png'
                });
                task.notificationSent = true;
                if (task.recurrence) {
                    // If it's a recurring task, reschedule the notification here
                    // Be sure to update the dueDate of the task for the next occurrence
                }
                TaskManager.saveTasks();
            }, timeUntilDue);

            // Save the timeout ID for later reference
            this.notificationTimeouts[task.id] = timeoutId;
        } else if (task.completed) {
            task.notificationSent = true;
            TaskManager.saveTasks();
        }
    }
    
    
    

    static clearScheduledNotification(taskId) {
        if (this.notificationTimeouts[taskId]) {
            clearTimeout(this.notificationTimeouts[taskId]);
            delete this.notificationTimeouts[taskId]; // Remove the reference to the cleared timeout
        }
    }
}
