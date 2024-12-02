import { auth, db } from './firebase.js';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, deleteDoc, query, collection, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const emailLogado = document.querySelector('.email-logado');
const ongLogada = document.querySelector('.ong-logado');
const userLogado = document.querySelector('.user-logado');
const editarLink = document.querySelector('.editar-link');
const botaoSalvar = document.getElementById('btn-salvar-info');
const imgPerfil = document.querySelector('.img-perfil');
const cnpjLogado = document.querySelector('.cnpj-logado');
const providerLogado = document.querySelector('.provider-logado');
const btnSenhaProvider = document.getElementById('btn-senha-provider');

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
    fetch('../layouts/conta-editar.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo conta-editar.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('conta-editar').innerHTML = data;
            document.getElementById('saveProfileChanges').addEventListener('click', atualizarPerfil);
        })
        .catch(error => console.error(error));
    fetch('../layouts/conta-alterar-senha.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo conta-alterar-senha.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('conta-alterar-senha').innerHTML = data;
            document.getElementById('alterarSenhaForm').addEventListener('submit', alterarSenhaPerfil);
        })
        .catch(error => console.error(error));
});

function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, ''); // Remove qualquer caractere não numérico

    if (cnpj.length === 14) {
        return cnpj.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            '$1.$2.$3/$4-$5'
        );
    }

    return cnpj; // Retorna o valor sem formatação caso não tenha 14 dígitos
}

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
    console.log(data);

    userLogado.textContent = data.name || "Nome não disponível";
    ongLogada.textContent = data.ongName || " ";
    emailLogado.textContent = data.email || "Email não disponível";
    imgPerfil.src = data.img || '../imgs/user_profile.png';
    cnpjLogado.textContent = data.isOng ? (formatarCNPJ(data.cnpj) || "CNPJ não disponível") : cnpjLogado.textContent;
    providerLogado.textContent = data.provider || null;
    btnSenhaProvider.style.display = data.provider ? "none" : "block";

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

        // Passo 2: Obter detalhes dos eventos da coleção 'events' e filtrar pela data
        const eventIds = userEventsSnapshot.docs.map(doc => doc.data().event_uid);
        const eventPromises = eventIds.map(eventId => getDoc(doc(db, "events", eventId)));
        const eventDocs = await Promise.all(eventPromises);

        // Data de hoje para comparação
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Garante que a comparação seja feita a partir de meia-noite

        // Limpa o container antes de adicionar novos eventos
        const eventsUserContainer = document.querySelector("#events-user");
        eventsUserContainer.innerHTML = "";

        // Variável para verificar se há eventos para exibir
        let eventosExibidos = false;

        eventDocs.forEach(eventDoc => {
            if (eventDoc.exists()) {
                const evento = eventDoc.data();

                // Verifica se a data do evento é maior ou igual a hoje
                const eventDate = evento.date.toDate();
                eventDate.setHours(0, 0, 0, 0); // Garante que a comparação seja feita com a data sem hora

                if (eventDate >= today) {
                    eventosExibidos = true;
                    const cardHTML = `
                        <div class="card-custom">
                            <img src="${evento.img_link}" class="card-custom-img" alt="${evento.title}">
                            <div class="card-custom-body">
                                <h5 class="card-custom-title">${evento.title}</h5>
                                <p class="card-custom-text">${evento.description}</p>
                                <p class="card-custom-date">Data: ${eventDate.toLocaleDateString()}</p>
                                <button id="saiba-mais-conta" class="btn-custom-saiba-mais" data-id="${eventDoc.id}">Saiba Mais</button>
                            </div>
                        </div>
                    `;
                    eventsUserContainer.innerHTML += cardHTML;
                }
            }
        });

        // Se não houver eventos, exibe uma mensagem
        if (!eventosExibidos) {
            eventsUserContainer.innerHTML = `
                <p>Não há eventos futuros para este usuário. Vá para a <a href="/html/eventos.html" target="_blank">página de eventos</a> e se inscreva em algum!</p>
            `;
        }

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


document.querySelector('.btn-edit').addEventListener('click', function () {
    // Pega os valores do HTML para preencher o modal
    const email = document.querySelector('#email-logado-conta').textContent.trim();
    const nome = document.querySelector('.user-logado').textContent.trim();
    const ongNome = document.querySelector('.ong-logado').textContent.trim();
    const imgSrc = document.querySelector('.profile-image').src;
    const cnpj = document.querySelector('.cnpj-logado').textContent.trim();
    const provider = document.querySelector('.provider-logado').textContent.trim();

    preencherCamposModal({ email, nome, ongNome, img: imgSrc, cnpj, provider });

    // Exibe/oculta campos da ONG baseado na existência de cnpj
    const cnpjField = document.getElementById('ong-atualizarCnpj');
    const nomeOngField = document.getElementById('ong-atualizarNome');
    const nameField = document.getElementById('nome');
    const emailField = document.getElementById('email');
    console.log(provider);

    if (provider) {
        nameField.style.display = 'none';
        emailField.style.display = 'none';
    } else {
        nameField.style.display = 'block';
        emailField.style.display = 'block';
    }

    if (cnpj) { // Se o CNPJ estiver disponível, mostrar campos
        cnpjField.style.display = 'block';
        nomeOngField.style.display = 'block';
        document.getElementById('modal-cnpj').value = formatarCNPJ(cnpj) || "CNPJ não disponível";
        document.getElementById('modal-nome-ong').value = ongNome;
    } else { // Caso contrário, esconder campos
        cnpjField.style.display = 'none';
        nomeOngField.style.display = 'none';
    }

    // Exibir o modal
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();
});


document.querySelector('.btn-alterar-senha').addEventListener('click', function () {
    // Exibir o modal
    const alterarSenhaModal = new bootstrap.Modal(document.getElementById('alterarSenhaModal'));
    alterarSenhaModal.show();
});

function preencherCamposModal(data) {
    // Preenche os campos com os dados fornecidos
    document.getElementById('modal-email').value = data.email || "Email não disponível";
    document.getElementById('modal-nome').value = data.nome || "Nome não disponível";
    document.getElementById('modal-nome-ong').value = data.ongNome || ""; // Caso não tenha, fica vazio
    document.getElementById('modal-img').value = data.img || '../imgs/user_profile.png'; // Imagem de perfil
    document.getElementById('modal-cnpj').value = data.cnpj || 'CNPJ não disponível'; // CNPJ
}

async function atualizarPerfil() {
    const email = document.getElementById('modal-email').value;
    const nome = document.getElementById('modal-nome').value;
    const ongNome = document.getElementById('modal-nome-ong').value;
    const img = document.getElementById('modal-img').value;
    const cnpj = document.getElementById('modal-cnpj').value;

    // Vamos armazenar os campos alterados para mostrar depois
    let camposAlterados = [];

    // Pega o usuário atual
    const user = auth.currentUser;

    // Referência ao documento do usuário no Firestore
    const userDocRef = doc(db, 'users', user.uid); // 'users' é a coleção no Firestore

    try {
        // Obter os dados atuais do Firestore
        const userSnapshot = await getDoc(userDocRef);
        if (!userSnapshot.exists()) {
            ShowAlertNok('Usuário não encontrado no Firestore');
            return;
        }

        const userData = userSnapshot.data();

        // Comparando e atualizando os campos
        const updates = {};

        if (email !== userData.email) {
            updates.email = email;
            camposAlterados.push("Email");
        }

        if (nome !== userData.name) {
            updates.name = nome;
            camposAlterados.push("Nome");
        }

        if (ongNome !== userData.ongName) {
            updates.ongName = ongNome;
            camposAlterados.push("Nome da ONG");
        }

        if (img !== userData.img) {
            updates.img = img;
            camposAlterados.push("Foto de Perfil");
        }

        if (cnpj !== userData.cnpj) {
            updates.cnpj = cnpj;
            camposAlterados.push("CNPJ");
        }

        // Se houve alterações, faça o update no Firestore
        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);

            $('#editProfileModal').modal('hide');
            showAlertOk('Dados atualizados com sucesso! Campos alterados: ' + camposAlterados.join(', '));
        } else {
            $('#editProfileModal').modal('hide');
            showAlertOk('Nenhuma alteração foi feita.');
        }

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        ShowAlertNok('Erro ao atualizar perfil: ' + error.message);
    }
};

async function alterarSenhaPerfil(e) {
    e.preventDefault();

    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    // Validação de senhas
    if (novaSenha !== confirmarSenha) {
        showAlertNok('As senhas não coincidem.');
        return;
    }

    if (novaSenha.length < 6) {  // Por exemplo, você pode querer que a nova senha tenha pelo menos 6 caracteres
        showAlertNok('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }

    try {
        const user = auth.currentUser;

        if (!user) {
            showAlertNok('Usuário não está logado.');
            return;
        }

        // Reautenticação do usuário com a senha atual
        const credentials = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, credentials);

        // Atualização da senha
        await updatePassword(user, novaSenha);

        // Fechar o modal de alterar senha
        $('#alterarSenhaModal').modal('hide');
        document.getElementById("alterarSenhaForm").reset();
        showAlertOk('Senha atualizada com sucesso!');

    } catch (error) {
        console.error('Erro ao alterar a senha:', error);

        // Caso a senha atual esteja incorreta
        $('#alterarSenhaModal').modal('hide');
        document.getElementById("alterarSenhaForm").reset();

        if (error.code === 'auth/invalid-credential') {
            showAlertNok('A senha atual está incorreta.');
        } else {
            showAlertNok('Erro ao alterar a senha: ' + error.message);
        }
    }
}