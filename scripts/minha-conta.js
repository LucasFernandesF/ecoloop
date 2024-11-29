import { auth, db } from './firebase.js';
import { onAuthStateChanged, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, deleteDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elementos do DOM
const emailLogado = document.querySelector('.email-logado');
const senhaLogada = document.querySelector('.senha-logada');
const editarLink = document.querySelector('.editar-link');
const botaoSalvar = document.getElementById('btn-salvar-info');
const imgPerfil = document.querySelector('.img-perfil');

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

// Verificar usuário logado e buscar informações no Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                preencherCampos(userDoc.data());
                carregarEventosUsuario(user.uid);
            } else {
                console.error("Usuário não encontrado no Firestore.");
            }
        } catch (error) {
            console.error("Erro ao buscar informações do usuário:", error);
        }
    } else {
        console.log("Nenhum usuário logado.");
    }
});

// Preencher os campos com informações do Firestore
function preencherCampos(data) {
    emailLogado.textContent = data.email || "Email não disponível";
    senhaLogada.textContent = "***********";
    imgPerfil.src = data.img || '../imgs/user_profile.png';
}


async function carregarEventosUsuario(userUid) {
    console.log(userUid);

    try {
        // Passo 1: Buscar os eventos vinculados ao usuário
        const userEventsQuery = query(
            collection(db, "user_events"),
            where("user_uid", "==", userUid)
        );

        const userEventsSnapshot = await getDocs(userEventsQuery);
        if (userEventsSnapshot.empty) {
            document.querySelector("#events-user").innerHTML = "<p>Nenhum evento encontrado.</p>";
            return;
        }

        // Passo 2: Obter detalhes dos eventos da coleção 'events'
        const eventIds = userEventsSnapshot.docs.map(doc => doc.data().event_uid);
        const eventPromises = eventIds.map(eventId => getDoc(doc(db, "events", eventId)));
        const eventDocs = await Promise.all(eventPromises);

        // Limpa o container antes de adicionar novos eventos
        const eventsUserContainer = document.querySelector("#events-user");
        eventsUserContainer.innerHTML = "";

        eventDocs.forEach(eventDoc => {
            if (eventDoc.exists()) {
                const evento = eventDoc.data();
                const cardHTML = `
                    <div class="card-custom">
                        <img src="${evento.img_link}" class="card-custom-img" alt="${evento.title}">
                        <div class="card-custom-body">
                            <h5 class="card-custom-title">${evento.title}</h5>
                            <p class="card-custom-text">${evento.description}</p>
                            <p class="card-custom-date">Data: ${new Date(evento.date.toDate()).toLocaleDateString()}</p>
                            <button id="saiba-mais-conta" class="btn-custom-saiba-mais" data-id="${eventDoc.id}">Saiba Mais</button>
                        </div>
                    </div>
                `;
                eventsUserContainer.innerHTML += cardHTML;
            }
        });

        // Passo 3: Adicionar evento de clique aos botões "Saiba Mais"
        document.querySelectorAll('.saiba-mais').forEach(button => {
            button.addEventListener('click', (event) => {
                abrirModalEvento(event.target.getAttribute('data-id'));
            });
        });

    } catch (error) {
        console.error("Erro ao carregar eventos do usuário:", error);
    }
}

document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'saiba-mais-conta') {
        const id = event.target.getAttribute('data-id');
        console.log('Botão Saiba Mais clicado! ID:', id);
        abrirSaibaMaisEvento(id);
    }
});

async function abrirSaibaMaisEvento(eventId) {
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
                document.getElementById('user-id-saiba').value = user.uid;
                document.getElementById('event-id-saiba').value = eventId;
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

export async function desinscreverEvento() {
    const userId = document.getElementById("user-id-saiba").value;
    const eventId = document.getElementById("event-id-saiba").value;

    console.log(userId, eventId);
    
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
                console.log(docSnapshot.id);
                await deleteDoc(doc(db, "user_events", docSnapshot.id));
            });

            $('#infoModal').modal('hide');
            carregarEventosUsuario(userId);
            showAlertOk("Desinscrito com sucesso!");
        } else {
            $('#infoModal').modal('hide');
            showAlertNok("Inscrição não encontrada.");
        }
    } catch (error) {
        console.error("Erro ao desinscrever evento:", error.message);
        showAlertNok("Erro ao desinscrever evento: " + error.message);
    }
}
