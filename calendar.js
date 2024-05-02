var calendar;
let currentEvent;

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            eventClick: function(info) {
                editEvent(info.event); // Open the edit modal with the event info
            }
        });

        calendar.render();

        initializeCalendarEvents();

        // Attach event listeners
        var eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', handleEventSubmission);
        }

        var openModalButton = document.getElementById('openModalButton');
        if (openModalButton) {
            openModalButton.addEventListener('click', function() {
                openModal(); // Clear and open the modal for a new event
            });
        }
    }
});


function initializeCalendarEvents() {
    if (calendar) {
        // Clear non-task events from the calendar
        calendar.getEvents().forEach(event => {
            if (!event.id.startsWith('task-')) {
                event.remove();
            }
        });

        const storedEvents = loadEventsFromLocal();
        const taskEvents = loadTasksAsEvents();

        // Add stored events to the calendar
        storedEvents.forEach(event => {
            calendar.addEvent(event);
        });

        // Add task events to the calendar
        taskEvents.forEach(event => {
            calendar.addEvent(event);
        });
    }
}



function attachEventListener(elementId, eventType, eventHandler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, eventHandler);
    } else {
        console.error(`Failed to attach event listener. Element with ID '${elementId}' not found.`);
    }
}

function handleEventSubmission(e) {
    e.preventDefault(); // Prevent default form submission

    // Get the modal element and check its visibility
    var eventModal = document.getElementById('eventModal');
    if (eventModal.style.display === 'none') {
        eventModal.style.display = 'block'; // Show the modal if it's not already visible
        alert("Please fill out the event details."); // Optionally alert the user to fill out the details
        return false; // Stop the form submission
    }

    // If the modal is visible, proceed with collecting form data and managing event creation or update
    addOrUpdateEvent();
}

function addOrUpdateEvent() {
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventEndDate = document.getElementById('eventEndDate').value;
    const startTime = document.getElementById('eventTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const allDay = document.getElementById('allDayEvent').checked;

    let startDateTime = eventDate;
    let endDateTime = eventEndDate;

    if (allDay) {
        endDateTime = new Date(new Date(eventEndDate).getTime() + 86400000).toISOString().slice(0, 10);
    } else {
        startDateTime += 'T' + (startTime || '00:00:00');
        endDateTime += 'T' + (endTime || '23:59:59');
    }

    if (!allDay && new Date(endDateTime) <= new Date(startDateTime)) {
        alert('End time/date must be after start time/date.');
        return;
    }

    let event = {
        id: currentEvent ? currentEvent.id : null,  // Use existing ID if editing, or null for new
        title: eventName,
        start: startDateTime,
        end: endDateTime,
        allDay: allDay
    };

    if (currentEvent) {
        // If editing an existing event, remove the old event and add the updated event
        currentEvent.remove();
        calendar.addEvent(event);
    } else {
        // If creating a new event, add it to the calendar
        calendar.addEvent(event);
    }

    saveEventsToLocal(); // Save or update events in local storage
    closeModal(); // Close the modal window
}




function editEvent(event) {
    document.getElementById('editEventModal').style.display = 'block';

    var startDate = new Date(event.start);
    var endDate = event.end ? new Date(event.end) : new Date(startDate);

    // Adjust the date for timezone offset
    var localStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
    var localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

    if (event.allDay) {
        localEndDate = new Date(localEndDate.getTime() - 86400000);
    }

    document.getElementById('editEventName').value = event.title;
    document.getElementById('editEventStartDate').value = localStartDate.toISOString().slice(0, 10);
    document.getElementById('editEventEndDate').value = localEndDate.toISOString().slice(0, 10);
    document.getElementById('editAllDayEvent').checked = event.allDay;

    toggleEditAllDay(); // Adjust visibility of time inputs based on all day status

    if (!event.allDay) {
        const startTime = startDate.toTimeString().substring(0, 5);
        const endTime = endDate.toTimeString().substring(0, 5);
        document.getElementById('editEventStartTime').value = startTime;
        document.getElementById('editEventEndTime').value = endTime;
    } else {
        document.getElementById('editEventStartTime').value = '';
        document.getElementById('editEventEndTime').value = '';
    }

    // Show the delete button when editing an existing event
    document.getElementById('deleteEventButton').style.display = 'inline-block';

    currentEvent = event;
}


function toggleEditAllDay() {
    const isAllDay = document.getElementById('editAllDayEvent').checked;
    const timeInputs = [document.getElementById('editEventStartTime'), document.getElementById('editEventEndTime')];

    timeInputs.forEach(input => {
        input.disabled = isAllDay;
        if (isAllDay) {
            input.value = ''; // Clear the time inputs when all day is checked
        }
    });
}



function fillEditForm(event) {
    document.getElementById('editEventName').value = event.title;
    document.getElementById('editEventDate').value = new Date(event.start).toISOString().slice(0, 10);
    document.getElementById('allDayEvent').checked = event.allDay;
    toggleAllDay();  // Adjust visibility and required fields based on all day status
    if (!event.allDay) {
        document.getElementById('editEventStartTime').value = new Date(event.start).toISOString().slice(11, 16);
        document.getElementById('editEventEndTime').value = event.end ? new Date(event.end).toISOString().slice(11, 16) : '';
    }

    // Show the delete button when editing an existing event
    document.getElementById('deleteEventButton').style.display = 'inline-block';
}

function saveEventsToLocal() {
    const events = calendar.getEvents()
        .filter(event => !event.extendedProps.isTask) // Filter out task events
        .map(event => ({
            id: event.id,
            title: event.title,
            start: event.start.toISOString(),
            end: event.end ? (event.allDay ? new Date(event.end.getTime() - 86400000).toISOString() : event.end.toISOString()) : null,
            allDay: event.allDay
        }));
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    console.log('Events updated in local storage.');
}

function loadEventsFromLocal() {
    const storedEventsJSON = localStorage.getItem('calendarEvents');
    if (storedEventsJSON) {
        const storedEvents = JSON.parse(storedEventsJSON);
        return storedEvents.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.allDay ? new Date(new Date(event.end).getTime() + 86400000).toISOString() : event.end,
            allDay: event.allDay
        }));
    }
    return []; // Return an empty array if no events are stored
}


function loadTasksAsEvents() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks.map(task => {
        // Parse the date and time from the dueDate string
        const dateTime = new Date(task.dueDate);
        const hasTime = task.dueDate.includes("T");

        let event = {
            id: `task-${task.id}`,
            title: task.description,
            start: dateTime.toISOString().slice(0, 10), // Use only the date part of the ISO string
            allDay: !hasTime, // Determine all-day based on the presence of a time component
            isTask: true // Flag to indicate the event is a task
        };

        // Add the time part separately if it's not an all-day event
        if (!event.allDay) {
            const timezoneOffset = dateTime.getTimezoneOffset();
            const adjustedDateTime = new Date(dateTime.getTime() - timezoneOffset * 60000);
            event.start += 'T' + adjustedDateTime.toISOString().slice(11, 19);
        }

        // Handle recurrence if applicable
        if (task.recurrence && task.recurrence !== "NONE") {
            const rrule = {
                freq: task.recurrence.toUpperCase(), // DAILY, WEEKLY, MONTHLY
                dtstart: event.start,
                until: '2025-01-01' // Specify the end date of the recurrence
            };
            event.rrule = rrule;
        }

        return event;
    });
}



function generateRecurrenceRule(recurrence, task) {
    const rruleOptions = {
        freq: RRule[recurrence.toUpperCase()],
        dtstart: new Date(task.dueDate),
        until: new Date('2024-12-31') // Specify an end date for the recurrence
    };

    if (recurrence === 'weekly') {
        rruleOptions.byweekday = [RRule[new Date(task.dueDate).getDay()]];
    } else if (recurrence === 'monthly') {
        rruleOptions.bymonthday = new Date(task.dueDate).getDate();
    }

    return rruleOptions;
}

function openModal() {
    document.getElementById('eventModal').style.display = 'block';
    document.getElementById('deleteEventButton').style.display = 'none'; // Hide delete button for new events
    resetModal();  // Reset form and set correct field visibility
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('editEventModal').style.display = 'none';
}

function closeEditModal() {
    document.getElementById('editEventModal').style.display = 'none'; // Ensures the edit modal is hidden properly
}

function updateEvent(event) {
    if (event.extendedProps.isTask) {  // Check if the event is a task
        alert('This event is a task. Please update in the Task page');
        return;
    }

    const newName = document.getElementById('editEventName').value;
    const newStartDate = document.getElementById('editEventStartDate').value;
    const newEndDate = document.getElementById('editEventEndDate').value;
    const newStartTime = document.getElementById('editEventStartTime').value;
    const newEndTime = document.getElementById('editEventEndTime').value;
    const allDay = document.getElementById('editAllDayEvent').checked;

    let startDateTime = newStartDate;
    let endDateTime = newEndDate;

    if (allDay) {
        endDateTime = new Date(new Date(newEndDate).getTime() + 86400000).toISOString().slice(0, 10);
    } else {
        startDateTime += 'T' + (newStartTime || '00:00:00');
        endDateTime += 'T' + (newEndTime || '23:59:59');
    }

    if (!allDay && new Date(endDateTime) <= new Date(startDateTime)) {
        alert('End time/date must be after start time/date.');
        return;
    }

    let updatedEvent = {
        id: currentEvent.id,
        title: newName,
        start: startDateTime,
        end: endDateTime,
        allDay: allDay
    };

    // Remove the old event and add the updated event
    currentEvent.remove();
    calendar.addEvent(updatedEvent);

    saveEventsToLocal();
    closeModal();
}


function deleteEvent(event) {
    if (event.extendedProps.isTask) {  // Check if the event is a task
        alert('This event is a task. Please update in the Task page') 
        return;  // Do not proceed with deletion if user cancels
    } else {
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
    }

    if (event) {
        event.remove();  // Remove the event from the calendar
        saveEventsToLocal();  // Update local storage
        closeModal();  // Close any open modal windows
    } else {
        console.error("No event selected or found for deletion.");
    }
}


function toggleAllDay() {
    const isAllDay = document.getElementById('allDayEvent').checked;
    const timeInputs = [document.getElementById('eventTime'), document.getElementById('eventEndTime')];
    
    timeInputs.forEach(input => {
        input.disabled = isAllDay;  // Disable time inputs when 'All Day' is checked
        if (isAllDay) {
            input.required = false;  // Make input not required when it's disabled
            input.value = '';        // Clear value to ensure no invalid state
        } else {
            input.required = true;   // Ensure input is required when it's enabled
        }
    });
}

function resetModal() {
    document.getElementById('eventForm').reset();
    toggleAllDay(); // Ensure correct state of the form elements based on all day status
}

document.addEventListener('taskAdded', function(event) {
    if (calendar) {
        initializeCalendarEvents();
    }
});

window.addEventListener('taskDeleted', function(event) {
    if (calendar) {
        initializeCalendarEvents();
    }
});

window.addEventListener('taskUpdated', function(event) {
    if (calendar) {
        initializeCalendarEvents();
    }
});


function fetchEvents(fetchInfo, successCallback, failureCallback) {
    // Clear existing task events
    calendar.getEvents().forEach(event => {
        if (event.id.startsWith('task-')) {
            event.remove();
        }
    });

    // Fetch updated events
    const events = loadEventsFromLocal().concat(loadTasksAsEvents());
    successCallback(events);
}



