import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const btnAdicionarEventos = document.getElementById("btn-eventos");

btnAdicionarEventos.style.display = "none";

async function verificarUsuarioOng(user) {
    if (!user) {
        console.log("Nenhum usuário logado.");
        return;
    }

    try {

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.isOng) {
                btnAdicionarEventos.style.display = "block"; 
            } else {
                console.log("Usuário não é uma ONG.");
            }
        } else {
            console.log("Usuário não encontrado no Firestore.");
        }
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        verificarUsuarioOng(user); 
    } else {
        console.log("Usuário deslogado.");
    }
});

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
