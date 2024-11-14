import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export async function loginEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        alert("Login realizado com sucesso!");

        setTimeout(() => {
            window.location.href = "../html/minha-conta.html";
        }, 2000);
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        alert("Erro ao logar: " + error.message);
    }
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loginEmail();
});
