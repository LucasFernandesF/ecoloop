import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, addDoc, collection, serverTimestamp, getDocs, query, where, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const btnAdicionarEventos = document.getElementById("btn-eventos");
console.log(btnAdicionarEventos);

btnAdicionarEventos.style.display = "none";

const eventosContainer = document.getElementById("eventosContainer");


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
                console.log("Usuário é uma ONG.");
                
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
        showAlertNok("Por favor, preencha todos os campos.");
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

        const modalElement = document.getElementById("eventos-novo");
        modalElement.style.display = "none";
        showAlertOk("Evento adicionado com sucesso!");
        carregarEventos();

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
        showAlertNok("Erro ao adicionar evento: " + error.message);
    }
}

async function carregarEventos() {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera o horário para comparação correta

        // Query para filtrar eventos com data >= hoje e ordenar por data
        const eventosQuery = query(
            collection(db, "events"),
            where("date", ">=", hoje), // Continua usando a data diretamente
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
            button.addEventListener('click', (event) => {
                abrirModalEvento(event.target.getAttribute('data-id'));
            });
        });
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
    }
}

async function abrirModalEvento(eventId) {
    try {
        const eventDoc = await getDoc(doc(db, "events", eventId));

        if (eventDoc.exists()) {
            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    showAlertNok("Você precisa estar logado para visualizar mais detalhes.");
                    return;
                }

                const evento = eventDoc.data();

                // Preenche os dados no modal
                document.getElementById('user-id').value = user.uid;
                document.getElementById('event-id').value = eventId;
                document.getElementById('modalImage').src = evento.img_link;
                document.getElementById('modalImage').alt = evento.title;
                document.getElementById('modalTitle').textContent = evento.title;
                document.getElementById('modalDescription').textContent = evento.description;
                document.getElementById('modalDate').textContent = `Data: ${new Date(evento.date.toDate()).toLocaleDateString()}`;

                const modal = new bootstrap.Modal(document.getElementById('infoModal'));
                modal.show();

                await verificarInscricao(user.uid, eventId);

                // Adiciona o evento ao botão de desinscrição após abrir o modal
                const desinscreverButton = document.getElementById("desinscreverButton");

                if (desinscreverButton) {
                    desinscreverButton.removeEventListener('click', desinscreverEvento); // Remove event listener anterior
                    desinscreverButton.addEventListener('click', desinscreverEvento); // Adiciona evento de desinscrição
                }
            });
        } else {
            console.error("Evento não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao abrir detalhes do evento:", error);
    }
}

async function verificarInscricao(userId, eventId) {
    const inscreverButton = document.getElementById("inscreverButton");
    const desinscreverButton = document.getElementById("desinscreverButton");
    console.log(userId, eventId);


    const userEventQuery = query(
        collection(db, "user_events"),
        where("user_uid", "==", userId),
        where("event_uid", "==", eventId)
    );

    const querySnapshot = await getDocs(userEventQuery);
    console.log(querySnapshot);

    const isSubscribed = !querySnapshot.empty;

    if (isSubscribed) {
        inscreverButton.style.display = "none";
        desinscreverButton.style.display = "inline-block";
    } else {
        inscreverButton.style.display = "inline-block";
        desinscreverButton.style.display = "none";
    }
}


export async function inscreverEvento() {
    const userId = document.getElementById("user-id").value;
    const eventId = document.getElementById("event-id").value;

    console.log(userId, eventId);


    try {
        await addDoc(collection(db, "user_events"), {
            user_uid: userId,
            event_uid: eventId,
            date: serverTimestamp(),
        });

        $('#infoModal').modal('hide');
        showAlertOk("Inscrito com sucesso!");
        document.getElementById("inscricao-form").reset();
    } catch (error) {
        console.error("Erro ao adicionar evento:", error.message);
        showAlertNok("Erro ao adicionar evento: " + error.message);
    }
}

export async function desinscreverEvento() {
    const userId = document.getElementById("user-id").value;
    const eventId = document.getElementById("event-id").value;

    try {
        // Consulta para encontrar o documento de inscrição
        const userEventQuery = query(
            collection(db, "user_events"),
            where("user_uid", "==", userId),
            where("event_uid", "==", eventId)
        );

        const querySnapshot = await getDocs(userEventQuery);

        if (!querySnapshot.empty) {
            // Deleta cada documento encontrado (assumindo um documento único, mas preparado para múltiplos)
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, "user_events", docSnapshot.id));
            });

            $('#infoModal').modal('hide');
            showAlertOk("Desinscrito com sucesso!");
        } else {
            showAlertNok("Inscrição não encontrada.");
        }
    } catch (error) {
        console.error("Erro ao desinscrever evento:", error.message);
        showAlertOk("Erro ao desinscrever evento: " + error.message);
    }
}

// Chamar a função para carregar eventos na inicialização da página
carregarEventos();

document.getElementById("form-adicionar-evento").addEventListener("submit", (e) => {
    e.preventDefault();
    adicionarEvento();
});

document.getElementById("inscricao-form").addEventListener("submit", (e) => {
    e.preventDefault();
    inscreverEvento();
});




document.addEventListener("DOMContentLoaded", carregarEventos);

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


document.addEventListener("DOMContentLoaded", () => {
    const modalElement = document.getElementById("eventos-novo");
    const closeModal = document.getElementById("close-modal");

    closeModal.addEventListener("click", () => {
        modalElement.style.display = "none";
    });

    if (btnAdicionarEventos && modalElement) {
        btnAdicionarEventos.addEventListener("click", function () {
            console.log("Botão de eventos clicado!");
            modalElement.style.display = "flex";
        });
    } else {
        console.error("Botão de eventos ou modal não encontrado!");
    }
});


