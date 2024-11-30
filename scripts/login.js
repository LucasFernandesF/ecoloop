import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

export async function loginEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        showAlertOk("Login realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        showAlertNok("Erro ao logar: " + error.message);
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