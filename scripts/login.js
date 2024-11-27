import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export async function loginEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        showAlert("Login realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        alert("Erro ao logar: " + error.message);
    }
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loginEmail();
});

// Função para abrir o modal
function showAlert(message) {
    $('#modal-message').text(message); // Atualiza a mensagem do modal
    $('#custom-modal').modal('show'); // Abre o modal
}

// Função para fechar o modal ao clicar no botão ou no 'X'
$('#modal-close-btn, #modal-close').on('click', function () {
    setTimeout(() => {
        window.location.href = '../html/minha-conta.html';
    }, 2000);
});

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
});