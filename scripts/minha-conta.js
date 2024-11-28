import { auth, db } from './firebase.js';
import { onAuthStateChanged, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Elementos do DOM
const emailLogado = document.querySelector('.email-logado');
const senhaLogada = document.querySelector('.senha-logada');
const editarLink = document.querySelector('.editar-link');
const botaoSalvar = document.getElementById('btn-salvar-info');
const imgPerfil = document.querySelector('.img-perfil');

// Verificar usuário logado e buscar informações no Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                preencherCampos(userDoc.data());
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

// Ativar edição dos campos e alternar botões
editarLink.addEventListener('click', (e) => {
    e.preventDefault();
    habilitarEdicao();
    editarLink.classList.add('d-none'); // Oculta o link de edição
    botaoSalvar.classList.remove('d-none'); // Exibe o botão salvar
});

botaoSalvar.addEventListener('click', salvarAlteracoes);

function habilitarEdicao() {
    emailLogado.contentEditable = true;
    emailLogado.style.border = "1px solid #ccc";

    senhaLogada.textContent = "";
    senhaLogada.contentEditable = true;
    senhaLogada.style.border = "1px solid #ccc";
}

// Salvar alterações no Firebase
async function salvarAlteracoes() {
    const user = auth.currentUser;
    if (user) {
        try {
            const updatedEmail = emailLogado.textContent.trim();
            const updatedPassword = senhaLogada.textContent.trim();

            // Atualizar e-mail no Firebase Authentication
            if (updatedEmail) {
                await updateEmail(user, updatedEmail); // Atualiza diretamente o email no Firebase Authentication
            }

            // Atualizar senha se necessário
            if (updatedPassword && updatedPassword.length >= 6) {
                await updatePassword(user, updatedPassword);
            } else if (updatedPassword) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            // Atualizar dados no Firestore
            await updateDoc(doc(db, "users", user.uid), { email: updatedEmail });

            alert("Informações atualizadas com sucesso!");
            desabilitarEdicao();
        } catch (error) {
            console.error("Erro ao salvar informações:", error);
            alert("Erro ao salvar as alterações: " + error.message);
        }
    }
}

function desabilitarEdicao() {
    emailLogado.contentEditable = false;
    senhaLogada.contentEditable = false;

    emailLogado.style.border = "none";
    senhaLogada.style.border = "none";

    editarLink.classList.remove('d-none'); // Exibe o link de edição novamente
    botaoSalvar.classList.add('d-none'); // Oculta o botão salvar
}
