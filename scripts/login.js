import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
    fetch('../layouts/alerta.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('alerta').innerHTML = data;
        })
        .catch(error => console.error(error));
    fetch('../layouts/esqueci-senha.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('esqueci-senha').innerHTML = data;
            $(document).ready(function () {
                // Abrir o modal de redefinição de senha ao clicar no link "Esqueceu sua senha?"
                $('#forgot-password-link').click(function (e) {
                    e.preventDefault();
                    $('#reset-password-modal').modal('show');
                    console.log("Modal de redefinir senha aberto");
                });

                // Manipular o evento de clique no botão "Enviar Token"
                $('#reset-password-btn').click(function (e) {
                    e.preventDefault();  // Impede o comportamento padrão de navegação

                    // Chamar a função para enviar o token de redefinição
                    sendResetEmail();
                });
            });
        })
        .catch(error => console.error(error));
});

export async function loginEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        showAlertOk("Login realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        if (error.code === 'auth/invalid-credential') {
            showAlertNok("Usuário ou senha incorretos.");
        } else {
            showAlertNok("Erro ao logar: " + error.message);
        }

    }
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loginEmail();
});

document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            $('#modal-close-btn, #modal-close').on('click', function () {
                window.location.href = '../html/minha-conta.html';
            });
        }
    });
});

const authProvider = getAuth();

async function loginWithProvider(provider) {
    try {
        const result = await signInWithPopup(authProvider, provider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            provider: user.providerData[0].providerId,
            createdAt: serverTimestamp()
        });

        showAlertOk("Login realizado com sucesso!");
        $('#modal-close-btn, #modal-close').on('click', function () {
            window.location.href = "/minhaconta";
        });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        showAlertNok("Erro ao fazer login: " + error.message);
    }
}

document.getElementById("login-google").addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    loginWithProvider(provider);
});



function sendResetEmail() {
    // Capturar o e-mail inserido pelo usuário
    var email = $('#reset-email').val();
    console.log("E-mail inserido:", email);

    // Validar se o e-mail não está vazio
    if (email === "") {
        $('#reset-password-message').text('Por favor, insira seu e-mail.');
        console.log("Por favor, insira seu e-mail.");
        return;
    }

    // Enviar e-mail de redefinição de senha para o Firebase
    sendPasswordResetEmail(auth, email)
        .then(() => {
            // Exibir mensagem de sucesso
            $('#reset-password-message').text('Um e-mail com o link de redefinição foi enviado para ' + email + '.');
            console.log("E-mail de redefinição enviado para:", email);

            // Fechar o modal após o envio
            $('#reset-password-modal').modal('hide');
        })
        .catch((error) => {
            // Capturar e exibir erros
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Erro ao enviar e-mail:", errorMessage);

            if (errorCode === 'auth/user-not-found') {
                $('#reset-password-message').text('Não encontramos um usuário com esse e-mail.');
            } else if (errorCode === 'auth/invalid-email') {
                $('#reset-password-message').text('E-mail inválido.');
            } else {
                $('#reset-password-message').text('Ocorreu um erro: ' + errorMessage);
            }
        });
}

