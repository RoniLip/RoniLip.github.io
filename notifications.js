
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
    
    static scheduleNotification(task) {
        // Check if the task is completed and the notification has already been sent
        if (task.completed && task.notificationSent) {
            return; // Do not schedule a notification for completed tasks that have already been notified
        }
    
        const now = new Date().getTime();
        const dueTime = new Date(task.dueDate).getTime();
        let timeUntilDue = dueTime - now;
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
            setTimeout(() => {
                new Notification('Reminder', {
                    body: `Your task "${task.description}" is due soon.`,
                    icon: 'https://example.com/icon.png'
                });
                task.notificationSent = true;
                if (repeatInterval) {
                    task.dueDate = new Date(task.dueDate.getTime() + repeatInterval); // Update due date for recurring tasks
                }
                TaskManager.saveTasks();
            }, timeUntilDue);
        } else if (task.completed) {
            // If the task is completed, set the notificationSent flag to true
            task.notificationSent = true;
            TaskManager.saveTasks();
        }
    }
    
    
    

    static clearScheduledNotifications() {
        // Implement this if needed using a strategy to store and clear timeouts
    }
}
