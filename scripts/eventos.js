const modal = document.getElementById("modal");
const btnEventos = document.getElementById("btn-eventos");
const closeModal = document.getElementById("close-modal");

btnEventos.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
