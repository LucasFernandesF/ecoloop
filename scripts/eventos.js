import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, addDoc, collection, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const btnAdicionarEventos = document.getElementById("btn-eventos");
const eventosContainer = document.getElementById("eventosContainer");

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
        console.log("Usuário deslogado");
    }
});

export async function adicionarEvento() {
    const title = document.getElementById("card-title").value;
    const imgLink = document.getElementById("card-img-top").value;
    const description = document.getElementById("card-text").value;
    const date = document.getElementById("card-date").value;

    if (!title || !imgLink || !description || !date) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            img_link: imgLink,
            description: description,
            date: new Date(date),
            createdAt: serverTimestamp(),
        });

        alert("Evento adicionado com sucesso!");

        const cardHTML = `
            <div class="col-md-4 col-sm-6">
                <div class="card mb-4 card-info evento-card">
                    <img src="${imgLink}" class="card-img-top" alt="${title}">
                    <div class="card-body evento-info">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${description}</p>
                        <p class="card-date data">Data: ${new Date(date).toLocaleDateString()}</p>
                        <a href="#" target="_blank" class="btn cadastro">Saiba Mais</a>
                    </div>
                </div>
            </div>
        `;
        eventosContainer.innerHTML += cardHTML;
        document.getElementById("form-adicionar-evento").reset();
    } catch (error) {
        console.error("Erro ao adicionar evento:", error.message);
        alert("Erro ao adicionar evento: " + error.message);
    }
}

async function carregarEventos() {
    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        querySnapshot.forEach((doc) => {
            const evento = doc.data();
            const cardHTML = `
                <div class="col-md-4 col-sm-6">
                    <div class="card mb-4 card-info evento-card">
                        <img src="${evento.img_link}" class="card-img-top" alt="${evento.title}">
                        <div class="card-body evento-info">
                            <h5 class="card-title">${evento.title}</h5>
                            <p class="card-text">${evento.description}</p>
                            <p class="card-date data">Data: ${new Date(evento.date.toDate()).toLocaleDateString()}</p>
                            <a href="#" target="_blank" class="btn cadastro">Saiba Mais</a>
                        </div>
                    </div>
                </div>
            `;
            eventosContainer.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error("Erro ao carregar eventos:", error.message);
    }
}

document.getElementById("form-adicionar-evento").addEventListener("submit", (e) => {
    e.preventDefault();
    adicionarEvento();
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

document.addEventListener("DOMContentLoaded", carregarEventos);