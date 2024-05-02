document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('noteForm');
    const notesList = document.getElementById('notesList');
    const noteInput = document.getElementById('noteInput');
    const submitButton = document.getElementById('submitButton'); // Get the submit button
    const addCategoryButton = document.getElementById('addCategoryButton');
  

    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', addNewCategory);
    } else {
        console.error("Add Category button not found!");
    }
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterNotesByCategory);
    }
    
    let editingIndex = -1; // Global variable to track the index of the note being edited

    displayNotes();
    initializeCategories();
    updateCategoryDropdown();
    updateFilterDropdown();
    filterNotesByCategory();

    noteForm.addEventListener('submit', event => {
        event.preventDefault();
        const noteText = noteInput.value.trim();
        if (noteText) {
            saveOrUpdateNote(noteText);
        }
    });

    function saveOrUpdateNote(noteText) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const dateTime = new Date().toLocaleString();
        const category = document.getElementById('noteCategory').value; // Get the selected category
    
        const noteData = {
            text: noteText,
            dateTime: dateTime,
            category: category
        };
    
        if (editingIndex === -1) {
            notes.push(noteData);
        } else {
            notes[editingIndex] = noteData;
            editingIndex = -1; // Reset editing index after update
        }
    
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
        noteInput.value = '';
        document.getElementById('submitButton').textContent = 'Add Note'; // Reset button text
    }
    
    

    function editNote(index, text) {
        noteInput.value = text;
        editingIndex = index;
        submitButton.textContent = 'Save'; // Change the button text to 'Save'
    }

    function displayNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notesList.innerHTML = '';
        notes.forEach((note, index) => {
            addNoteToList(note, index);
        });
    }

    function addNoteToList(note, index) {
        const listItem = document.createElement('li');

        // Note text
        const noteTextElement = document.createElement('span');
        noteTextElement.innerHTML = note.text.replace(/\n/g, '<br>');
        listItem.appendChild(noteTextElement);
    
        // Category
        const categoryElement = document.createElement('span');
        categoryElement.textContent = `Category: ${note.category}`;
        categoryElement.className = 'category';  // Ensure class name is assigned
        listItem.appendChild(categoryElement);
    
        // Date and time
        const dateTimeElement = document.createElement('div');
        dateTimeElement.textContent = note.dateTime;
        dateTimeElement.className = 'dateTime';  // Ensure class name is assigned
        listItem.appendChild(dateTimeElement);
    
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteNote(index);
    
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editNote(index, note.text);
    
        listItem.appendChild(deleteBtn);
        listItem.appendChild(editBtn);
    
        notesList.appendChild(listItem);
    }
    

    function deleteNote(index) {
        if (confirm('Are you sure you want to delete this note?')) {
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            displayNotes();
            if (editingIndex === index) {
                editingIndex = -1; // Reset editing index if deleting the currently edited note
                submitButton.textContent = 'Add Note'; // Reset button text
            }
        } else {
        // If cancelled, indicate the task was not deleted.
        }
    }

    function initializeCategories() {
        const defaultCategories = ['Personal', 'Work', 'Ideas', 'Other'];
        if (!localStorage.getItem('categories')) {
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
    }

    function updateCategoryDropdown() {
        const categories = JSON.parse(localStorage.getItem('categories'));
        const categoryDropdown = document.getElementById('noteCategory');
        categoryDropdown.innerHTML = ''; // Clear existing options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
        });
    }

    function addNewCategory() {
        console.log("Attempting to add a new category...");  // Check if function is called
        const newCategoryInput = document.getElementById('newCategoryInput');
        const newCategory = newCategoryInput.value.trim();
        console.log("New category:", newCategory);  // What is the input value?
        
        if (newCategory) {
            const categories = JSON.parse(localStorage.getItem('categories')) || [];
            console.log("Existing categories:", categories);
            
            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                localStorage.setItem('categories', JSON.stringify(categories));
                updateCategoryDropdown();
                newCategoryInput.value = '';
                console.log("Category added successfully.");
            } else {
                console.log("Category already exists.");
                alert('This category already exists.');
            }
        } else {
            console.log("No category name entered.");
            alert('Please enter a category name.');
        }
    }
    
    function updateFilterDropdown() {
        const categories = JSON.parse(localStorage.getItem('categories'));
        const filterDropdown = document.getElementById('categoryFilter');
        filterDropdown.innerHTML = '<option value="All">All</option>';  // Start with the 'All' option
    
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterDropdown.appendChild(option);
        });
    }
    
    function filterNotesByCategory() {
        const selectedCategory = document.getElementById('categoryFilter').value;
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
        const filteredNotes = selectedCategory === 'All' ? notes : notes.filter(note => note.category === selectedCategory);
    
        notesList.innerHTML = ''; // Clear the list
        filteredNotes.forEach((note, index) => {
            addNoteToList(note, index);
        });
    }
    
    

    

});
