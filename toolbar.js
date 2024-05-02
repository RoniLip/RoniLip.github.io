class Toolbar {
    constructor() {
        this.toolbar = document.getElementById('toolbar');
        this.openButton = document.getElementById('toggleButton');
        this.openToolbarButton = document.getElementById('openToolbarButton');

        this.openButton.addEventListener('click', () => this.toggleToolbar());
        this.openToolbarButton.addEventListener('click', () => this.openToolbar());
    }

    toggleToolbar() {
        this.toolbar.classList.toggle('closed');
    }

    openToolbar() {
        this.toolbar.classList.remove('closed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toolbar = new Toolbar();
});

