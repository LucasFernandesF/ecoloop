const menuButton = document.querySelector('.menu-button');
const menuContainer = document.querySelector('.menu-container');

menuButton.addEventListener('click', () => {
    menuContainer.classList.toggle('active');
});

document.addEventListener('click', (event) => {
    if (!menuContainer.contains(event.target)) {
        menuContainer.classList.remove('active');
    }
});

