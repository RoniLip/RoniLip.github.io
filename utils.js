// In utils.js
class Utils {
    static priorityToNumber(priority) {
        switch (priority) {
            case 'High': return 1;
            case 'Medium': return 2;
            case 'Low': return 3;
            default: return 4;  // Treats tasks with undefined or invalid priority as lowest priority.
        }
    }

    static sortTasks(tasks) {
        // Separate tasks into completed and incomplete arrays
        let incompleteTasks = [];
        let completedTasks = [];

        for (let task of tasks) {
            if (task.completed) {
                completedTasks.push(task);  // Add to completed tasks array
            } else {
                incompleteTasks.push(task);  // Add to incomplete tasks array
            }
        }

        // Sort incomplete tasks by priority and due date
        incompleteTasks.sort((a, b) => {
            const priorityDifference = Utils.priorityToNumber(a.priority) - Utils.priorityToNumber(b.priority);
            if (priorityDifference !== 0) return priorityDifference;

            const dueDateA = new Date(a.dueDate);
            const dueDateB = new Date(b.dueDate);
            return dueDateA - dueDateB;  // Sort by the earliest due date first
        });

        // Manually concatenate the incompleteTasks with completedTasks
        let sortedTasks = incompleteTasks.concat(completedTasks);  // Concatenate the two arrays

        return sortedTasks;
    }
}
