document.addEventListener('DOMContentLoaded', () => {
    


    const toggleButton = document.getElementById('toggleButton');
    const toolbar = document.getElementById('toolbar');
    const openToolbarButton = document.getElementById('openToolbarButton');

    toggleButton.addEventListener('click', () => {
        toolbar.classList.toggle('open');
        openToolbarButton.classList.toggle('hidden'); // Toggle the hidden class
    });

    openToolbarButton.addEventListener('click', () => {
        toolbar.classList.add('open');
        openToolbarButton.classList.add('hidden'); // Hide the open button
    });
});

