import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, addDoc, collection, serverTimestamp, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Define a data de hoje sem horário para comparação

        // Query para filtrar eventos com data >= hoje e ordenar por data
        const eventosQuery = query(
            collection(db, "events"),
            where("date", ">=", hoje),
            orderBy("date", "asc")
        );

        const querySnapshot = await getDocs(eventosQuery);

        // Limpa o container antes de adicionar novos eventos
        eventosContainer.innerHTML = "";

        if (querySnapshot.empty) {
            eventosContainer.innerHTML = "<p>Nenhum evento disponível no momento.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const evento = doc.data();
            const cardHTML = `
                <div class="col-lg-4 col-md-6 col-sm-12">
                    <div class="card mb-4 card-info evento-card">
                        <img src="${evento.img_link}" class="card-img-top" alt="${evento.title}">
                        <div class="card-body evento-info">
                            <h5 class="card-title">${evento.title}</h5>
                            <p class="card-text">${evento.description}</p>
                            <p class="card-date data">Data: ${new Date(evento.date.toDate()).toLocaleDateString()}</p>
                            <button class="btn cadastro saiba-mais" data-id="${doc.id}">Saiba Mais</button>
                        </div>
                    </div>
                </div>
            `;
            eventosContainer.innerHTML += cardHTML;
        });

        // Adicionar evento de clique aos botões "Saiba Mais"
        document.querySelectorAll('.saiba-mais').forEach(button => {
            button.addEventListener('click', async (event) => {
                const eventId = event.target.getAttribute('data-id');
                const eventDoc = await getDoc(doc(db, "events", eventId));

                if (eventDoc.exists()) {
                    const evento = eventDoc.data();
                    document.getElementById('modalImage').src = evento.img_link;
                    document.getElementById('modalImage').alt = evento.title;
                    document.getElementById('modalTitle').textContent = evento.title;
                    document.getElementById('modalDescription').textContent = evento.description;
                    document.getElementById('modalDate').textContent = `Data: ${new Date(evento.date.toDate()).toLocaleDateString()}`;

                    // Abrir o modal
                    const modal = new bootstrap.Modal(document.getElementById('infoModal'));
                    modal.show();
                } else {
                    console.error("Evento não encontrado");
                }
            });
        });
    } catch (error) {
        console.error("Erro ao carregar eventos:", error.message);
    }
}

// Chamar a função para carregar eventos na inicialização da página
carregarEventos();



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

document.addEventListener("DOMContentLoaded", function () {
    fetch('../layouts/eventos-info.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo header.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('saiba-mais').innerHTML = data;
        })
        .catch(error => console.error(error));
});

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        const observer = new MutationObserver(() => {
            const InscButton = document.getElementById('info-eventos-inscricao');
            if (InscButton) {
                observer.disconnect(); // Parar de observar quando o elemento for encontrado
                InscButton.style.display = user ? "block" : "none";
            }
        });

        // Observar mudanças no body
        observer.observe(document.body, { childList: true, subtree: true });
    });
});
