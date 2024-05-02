document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired - Begin Initialization');
    NotificationManager.requestNotificationPermission();
    setDefaultDateTime();
    initializeDefaultValues();
    setupFormSubmission();
    loadAndDisplayTasks();
    sortAndDisplayTasks();
    


    const toggleButton = document.getElementById('toggleButton');
    const toolbar = document.getElementById('toolbar');
    navigate('homePage');
    const openToolbarButton = document.getElementById('openToolbarButton');

    toggleButton.addEventListener('click', () => {
        toolbar.classList.toggle('open');
        openToolbarButton.classList.toggle('hidden'); // Toggle the hidden class
    });

    openToolbarButton.addEventListener('click', () => {
        toolbar.classList.add('open');
        openToolbarButton.classList.add('hidden'); // Hide the open button
    });
    setupDeleteButtonListeners();
    console.log('Initialization Complete');
});

function setupDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const taskId = this.getAttribute('data-task-id');
            TaskManager.deleteTask(taskId);
            event.stopPropagation(); // Prevents the event from bubbling up to other elements
        });
    });
}



function initializeDefaultValues() {
    const dueDateInput = document.getElementById('taskDueDate');
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Including time component in the value
    dueDateInput.value = `${year}-${month}-${day}T00:00`;
}


function setupFormSubmission() {
    const form = document.getElementById('taskForm');
    if (!form) {
        console.error('Task form not found!');
        return;
    }

    form.onsubmit = function(event) {
        event.preventDefault();
        submitTaskForm();
    };
}

function submitTaskForm() {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('taskDueDate');
    const prioritySelect = document.getElementById('taskPriority');
    const reminderTimeInput = document.getElementById('reminderTime');
    const reminderUnitInput = document.getElementById('reminderUnit');  // Get reminder unit
    const recurrenceInput = document.getElementById('recurrence');  // Get the recurrence selection 

    const taskDescription = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    const reminderTime = parseInt(reminderTimeInput.value, 10);
    const reminderUnit = reminderUnitInput.value;  // Get the unit
    const recurrence = recurrenceInput.value;

    if (!taskDescription) {
        alert('Please enter a task description.');
        return;
    }

    if (isNaN(reminderTime)) {
        alert('Reminder time must be a number.');
        return;
    }

    if (!taskInput || !dueDateInput) {
        console.error('Task input not found!');
        return; // Exit the function if the element isn't found
    }

    const form = document.getElementById('taskForm');
    if (form) {
        form.onsubmit = function(event) {
            event.preventDefault(); // Prevent the default form submission
            submitTaskForm();
        };
    } else {
    console.error('Task form not found!');
    }

    TaskManager.addTask(taskDescription, dueDate, priority, reminderTime, reminderUnit, recurrence);  // Pass the reminder unit
    clearFormInputs(taskInput, dueDateInput, reminderTimeInput, recurrenceInput);
}


function clearFormInputs(taskInput, dueDateInput, reminderTimeInput) {
    taskInput.value = '';
    dueDateInput.value = new Date().toISOString().slice(0, 10) + 'T00:00';  // Resetting due date to today
    reminderTimeInput.value = '10';  // Reset to default reminder time
}


function loadAndDisplayTasks() {
    const tasks = TaskManager.loadTasks();  // Make sure you are assigning it to a constant or let variable
    if (!tasks || tasks.length === 0) {  // Check both for undefined/null and empty array
        console.log('No tasks to display.');
        return;
    }
    const sortedTasks = Utils.sortTasks(tasks);
    sortedTasks.forEach(task => DOMHandler.appendTaskToDOM(task));
    NotificationManager.setupTaskReminders(tasks);
}

function setDefaultDateTime() {
    const dateTimeInput = document.getElementById('taskDueDate');
    if (!dateTimeInput) return;  // Good to check for element existence

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');  // Ensure month is two digits
    const day = today.getDate().toString().padStart(2, '0');  // Ensure day is two digits

    // Set a default time, for example, 00:00 (midnight)
    const formattedDateTime = `${year}-${month}-${day}T00:00`;

    dateTimeInput.value = formattedDateTime;
}

function formatDateForDisplay(dateString) {
    // Assuming dateString is in the format "YYYY-MM-DD"
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;  // Convert to dd/mm/yyyy format for display purposes
}

// Example of a simple navigate function that might be used in an SPA
function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show the requested page
    document.getElementById(pageId).style.display = 'block';
}
